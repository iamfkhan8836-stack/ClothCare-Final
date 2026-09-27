const express = require('express')
const cors = require('cors')
const mysql = require('mysql2/promise')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const fs = require('fs')
require('dotenv').config()

const app = express()

app.use(cors())
app.use(express.json())


/* =========================
   DATABASE
   ========================= */

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: {
  minVersion: 'TLSv1.2',
},
})

/* =========================
   JWT
   ========================= */

const JWT_SECRET = process.env.JWT_SECRET


/* =========================
   AUTHENTICATION
   ========================= */

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return res.status(401).json({
      message: 'Access denied. Please login.',
    })
  }

  const token = authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({
      message: 'Access denied. Invalid token.',
    })
  }

  try {
    const decoded = jwt.verify(
      token,
      JWT_SECRET
    )

    req.user = decoded

    next()

  } catch (error) {
    return res.status(403).json({
      message: 'Invalid or expired token.',
    })
  }
}


/* =========================
   ADMIN AUTHENTICATION
   ========================= */

function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      message: 'Admin access required.',
    })
  }

  next()
}


/* =========================
   HOME
   ========================= */

app.get('/', (req, res) => {
  res.send('ClothCare Backend is running!')
})


/* =========================
   TEST DATABASE
   ========================= */

app.get('/test-db', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT 1 AS result'
    )

    res.json({
      message: 'MySQL connected successfully!',
      data: rows,
    })

  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'MySQL connection failed',
    })
  }
})


/* =========================
   REGISTER
   ========================= */

app.post('/register', async (req, res) => {
  try {
    const {
      name,
      email,
      password
    } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'All fields are required.',
      })
    }

    const [existingUser] = await db.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    )

    if (existingUser.length > 0) {
      return res.status(409).json({
        message: 'Email already registered.',
      })
    }

    const hashedPassword =
      await bcrypt.hash(password, 10)

    await db.query(
      `INSERT INTO users
      (name, email, password)
      VALUES (?, ?, ?)`,
      [
        name,
        email,
        hashedPassword
      ]
    )

    res.status(201).json({
      message: 'Account created successfully!',
    })

  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Registration failed.',
    })
  }
})


/* =========================
   LOGIN
   ========================= */

app.post('/login', async (req, res) => {
  try {
    const {
      email,
      password
    } = req.body

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required.',
      })
    }

    const [users] = await db.query(
      `SELECT
        id,
        name,
        email,
        password,
        role
       FROM users
       WHERE email = ?`,
      [email]
    )

    if (users.length === 0) {
      return res.status(401).json({
        message: 'Invalid email or password.',
      })
    }

    const user = users[0]

    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password
      )

    if (!passwordMatch) {
      return res.status(401).json({
        message: 'Invalid email or password.',
      })
    }


    /* Create JWT token */

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      {
        expiresIn: '1d',
      }
    )


    res.json({
      message: 'Login successful!',

      token,

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })

  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Login failed.',
    })
  }
})


/* =========================
   USER DASHBOARD
   ========================= */

app.get(
  '/dashboard',
  authenticateToken,
  async (req, res) => {
    try {
      const userId = req.user.id


      /* Total donated clothing quantity */

      const [donationTotal] = await db.query(
        `SELECT
          COALESCE(SUM(quantity), 0) AS total_donations
         FROM donations
         WHERE user_id = ?`,
        [userId]
      )


      /* Number of donation records */

      const [donationRecords] = await db.query(
        `SELECT
          COUNT(*) AS donation_records
         FROM donations
         WHERE user_id = ?`,
        [userId]
      )


      /* Number of pickup requests */

      const [pickupRequests] = await db.query(
        `SELECT
          COUNT(*) AS pickup_requests
         FROM pickups
         WHERE user_id = ?`,
        [userId]
      )


      /* Latest pickup status */

      const [latestPickup] = await db.query(
        `SELECT
          status
         FROM pickups
         WHERE user_id = ?
         ORDER BY id DESC
         LIMIT 1`,
        [userId]
      )


      res.json({

        totalDonations:
          donationTotal[0].total_donations,

        donationRecords:
          donationRecords[0].donation_records,

        pickupRequests:
          pickupRequests[0].pickup_requests,

        pickupStatus:
          latestPickup.length > 0
            ? latestPickup[0].status
            : 'None',

      })

    } catch (error) {
      console.error(error)

      res.status(500).json({
        message: 'Failed to load dashboard.',
      })
    }
  }
)


/* =========================
   ADD DONATION
   ========================= */

app.post(
  '/donations',
  authenticateToken,
  async (req, res) => {
    try {
      const {
        clothing_type,
        quantity,
        condition,
        description
      } = req.body

      if (
        !clothing_type ||
        !quantity ||
        !condition
      ) {
        return res.status(400).json({
          message: 'Please fill all required fields.',
        })
      }

      const userId = req.user.id

      await db.query(
        `INSERT INTO donations
        (
          user_id,
          clothing_type,
          quantity,
          condition_type,
          description,
          donation_date
        )
        VALUES (?, ?, ?, ?, ?, CURDATE())`,
        [
          userId,
          clothing_type,
          quantity,
          condition,
          description || ''
        ]
      )

      res.status(201).json({
        message: 'Donation submitted successfully!',
      })

    } catch (error) {
      console.error(error)

      res.status(500).json({
        message: 'Failed to submit donation.',
      })
    }
  }
)


/* =========================
   GET USER DONATIONS
   ========================= */

app.get(
  '/donations',
  authenticateToken,
  async (req, res) => {
    try {
      const userId = req.user.id

      const [donations] = await db.query(
        `SELECT
          id,
          clothing_type,
          quantity,
          condition_type,
          description,
          donation_date
         FROM donations
         WHERE user_id = ?
         ORDER BY id DESC`,
        [userId]
      )

      res.json(donations)

    } catch (error) {
      console.error(error)

      res.status(500).json({
        message: 'Failed to load donations.',
      })
    }
  }
)


/* =========================
   DELETE DONATION
   ========================= */

app.delete(
  '/donations/:id',
  authenticateToken,
  async (req, res) => {
    try {
      const donationId = req.params.id
      const userId = req.user.id

      await db.query(
        `DELETE FROM donations
         WHERE id = ?
         AND user_id = ?`,
        [
          donationId,
          userId
        ]
      )

      res.json({
        message: 'Donation deleted successfully!',
      })

    } catch (error) {
      console.error(error)

      res.status(500).json({
        message: 'Failed to delete donation.',
      })
    }
  }
)


/* =========================
   CREATE PICKUP
   ========================= */

app.post(
  '/pickups',
  authenticateToken,
  async (req, res) => {
    try {
      const {
        address,
        phone,
        pickup_date
      } = req.body

      if (
        !address ||
        !phone ||
        !pickup_date
      ) {
        return res.status(400).json({
          message: 'Please fill all required fields.',
        })
      }

      const userId = req.user.id

      await db.query(
        `INSERT INTO pickups
        (
          user_id,
          address,
          phone,
          pickup_date,
          status
        )
        VALUES (?, ?, ?, ?, 'Pending')`,
        [
          userId,
          address,
          phone,
          pickup_date
        ]
      )

      res.status(201).json({
        message:
          'Pickup request submitted successfully!',
      })

    } catch (error) {
      console.error(error)

      res.status(500).json({
        message:
          'Failed to submit pickup request.',
      })
    }
  }
)


/* =========================
   GET USER PICKUPS
   ========================= */

app.get(
  '/pickups',
  authenticateToken,
  async (req, res) => {
    try {
      const userId = req.user.id

      const [pickups] = await db.query(
        `SELECT
          id,
          address,
          phone,
          pickup_date,
          status
         FROM pickups
         WHERE user_id = ?
         ORDER BY id DESC`,
        [userId]
      )

      res.json(pickups)

    } catch (error) {
      console.error(error)

      res.status(500).json({
        message:
          'Failed to load pickup requests.',
      })
    }
  }
)


/* =========================
   DELETE PICKUP
   ========================= */

app.delete(
  '/pickups/:id',
  authenticateToken,
  async (req, res) => {
    try {
      const pickupId = req.params.id
      const userId = req.user.id

      await db.query(
        `DELETE FROM pickups
         WHERE id = ?
         AND user_id = ?`,
        [
          pickupId,
          userId
        ]
      )

      res.json({
        message:
          'Pickup request deleted successfully!',
      })

    } catch (error) {
      console.error(error)

      res.status(500).json({
        message:
          'Failed to delete pickup request.',
      })
    }
  }
)


/* =========================
   ADMIN DASHBOARD
   ========================= */

app.get(
  '/admin/dashboard',
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {

      const [users] = await db.query(
        `SELECT COUNT(*) AS total_users
         FROM users`
      )

      const [donations] = await db.query(
        `SELECT COUNT(*) AS total_donations
         FROM donations`
      )

      const [clothes] = await db.query(
        `SELECT COALESCE(SUM(quantity), 0)
         AS total_clothes
         FROM donations`
      )

      const [pickups] = await db.query(
        `SELECT COUNT(*) AS total_pickups
         FROM pickups`
      )


      res.json({

        totalUsers:
          users[0].total_users,

        totalDonations:
          donations[0].total_donations,

        totalClothes:
          clothes[0].total_clothes,

        totalPickups:
          pickups[0].total_pickups,

      })

    } catch (error) {
      console.error(error)

      res.status(500).json({
        message:
          'Failed to load admin dashboard.',
      })
    }
  }
)


/* =========================
   ADMIN USERS
   ========================= */

app.get(
  '/admin/users',
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {

      const [users] = await db.query(
        `SELECT
          id,
          name,
          email,
          role
         FROM users
         ORDER BY id DESC`
      )

      res.json(users)

    } catch (error) {
      console.error(error)

      res.status(500).json({
        message:
          'Failed to load users.',
      })
    }
  }
)


/* =========================
   ADMIN DONATIONS
   ========================= */

app.get(
  '/admin/donations',
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {

      const [donations] = await db.query(
        `SELECT
          donations.id,
          donations.clothing_type,
          donations.quantity,
          donations.condition_type,
          donations.description,
          donations.donation_date,
          users.name AS user_name,
          users.email AS user_email
         FROM donations
         JOIN users
           ON donations.user_id = users.id
         ORDER BY donations.id DESC`
      )

      res.json(donations)

    } catch (error) {
      console.error(error)

      res.status(500).json({
        message:
          'Failed to load donations.',
      })
    }
  }
)


/* =========================
   ADMIN PICKUPS
   ========================= */

app.get(
  '/admin/pickups',
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {

      const [pickups] = await db.query(
        `SELECT
          pickups.id,
          pickups.address,
          pickups.phone,
          pickups.pickup_date,
          pickups.status,
          users.name AS user_name,
          users.email AS user_email
         FROM pickups
         JOIN users
           ON pickups.user_id = users.id
         ORDER BY pickups.id DESC`
      )

      res.json(pickups)

    } catch (error) {
      console.error(error)

      res.status(500).json({
        message:
          'Failed to load pickup requests.',
      })
    }
  }
)


/* =========================
   UPDATE PICKUP STATUS
   ========================= */

app.put(
  '/admin/pickups/:id/status',
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {

      const pickupId = req.params.id
      const { status } = req.body

      const allowedStatuses = [
        'Pending',
        'Confirmed',
        'Picked Up',
        'Completed',
        'Cancelled'
      ]

      if (
        !allowedStatuses.includes(status)
      ) {
        return res.status(400).json({
          message: 'Invalid pickup status.',
        })
      }

      const [result] = await db.query(
        `UPDATE pickups
         SET status = ?
         WHERE id = ?`,
        [
          status,
          pickupId
        ]
      )

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: 'Pickup request not found.',
        })
      }

      res.json({
        message:
          'Pickup status updated successfully!',
      })

    } catch (error) {
      console.error(error)

      res.status(500).json({
        message:
          'Failed to update pickup status.',
      })
    }
  }
)


/* =========================
   ADMIN DISTRIBUTIONS
   ========================= */

app.get(
  '/admin/distributions',
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {

      const [distributions] = await db.query(
        `SELECT
          distributions.id,
          distributions.donation_id,
          distributions.quantity,
          distributions.recipient,
          distributions.distribution_date,
          distributions.notes,
          donations.clothing_type,
          users.name AS user_name,
          users.email AS user_email
         FROM distributions
         JOIN donations
           ON distributions.donation_id =
              donations.id
         JOIN users
           ON donations.user_id =
              users.id
         ORDER BY distributions.id DESC`
      )

      res.json(distributions)

    } catch (error) {
      console.error(error)

      res.status(500).json({
        message:
          'Failed to load distributions.',
      })
    }
  }
)


/* =========================
   ADD DISTRIBUTION
   ========================= */

app.post(
  '/admin/distributions',
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {

      const {
        donation_id,
        quantity,
        recipient,
        distribution_date,
        notes
      } = req.body


      if (
        !donation_id ||
        !quantity ||
        !recipient ||
        !distribution_date
      ) {
        return res.status(400).json({
          message:
            'Please fill all required fields.',
        })
      }


      const [donation] = await db.query(
        `SELECT
          id,
          quantity
         FROM donations
         WHERE id = ?`,
        [donation_id]
      )


      if (donation.length === 0) {
        return res.status(404).json({
          message:
            'Donation not found.',
        })
      }


      if (
        Number(quantity) <= 0 ||
        Number(quantity) >
        Number(donation[0].quantity)
      ) {
        return res.status(400).json({
          message:
            'Distribution quantity cannot exceed donated quantity.',
        })
      }


      await db.query(
        `INSERT INTO distributions
        (
          donation_id,
          quantity,
          recipient,
          distribution_date,
          notes
        )
        VALUES (?, ?, ?, ?, ?)`,
        [
          donation_id,
          quantity,
          recipient,
          distribution_date,
          notes || ''
        ]
      )


      res.status(201).json({
        message:
          'Distribution recorded successfully!',
      })

    } catch (error) {
      console.error(error)

      res.status(500).json({
        message:
          'Failed to record distribution.',
      })
    }
  }
)


/* =========================
   START SERVER
   ========================= */

app.listen(
  process.env.PORT,
  () => {
    console.log(
      `ClothCare Backend running on port ${process.env.PORT}`
    )
  }
)