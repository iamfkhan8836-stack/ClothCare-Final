import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

function AdminDashboard() {
  const navigate = useNavigate()

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDonations: 0,
    totalClothes: 0,
    totalPickups: 0,
  })

  const [users, setUsers] = useState([])
  const [donations, setDonations] = useState([])
  const [pickups, setPickups] = useState([])
  const [distributions, setDistributions] = useState([])

  const [loading, setLoading] = useState(true)
  const [distributionLoading, setDistributionLoading] =
    useState(false)

  const [distributionForm, setDistributionForm] = useState({
    donation_id: '',
    quantity: '',
    recipient: '',
    distribution_date: '',
    notes: '',
  })

  const token = localStorage.getItem('clothcareToken')

  useEffect(() => {
    const user = JSON.parse(
      localStorage.getItem('clothcareUser')
    )

    if (!token || !user || user.role !== 'admin') {
      navigate('/dashboard', {
        replace: true,
      })
      return
    }

    const fetchAdminData = async () => {
      try {
        const headers = {
          Authorization: `Bearer ${token}`,
        }

        const [
          dashboardResponse,
          usersResponse,
          donationsResponse,
          pickupsResponse,
          distributionsResponse,
        ] = await Promise.all([
          fetch(
            'http://localhost:5000/admin/dashboard',
            { headers }
          ),

          fetch(
            'http://localhost:5000/admin/users',
            { headers }
          ),

          fetch(
            'http://localhost:5000/admin/donations',
            { headers }
          ),

          fetch(
            'http://localhost:5000/admin/pickups',
            { headers }
          ),

          fetch(
            'http://localhost:5000/admin/distributions',
            { headers }
          ),
        ])

        const dashboardData =
          await dashboardResponse.json()

        const usersData =
          await usersResponse.json()

        const donationsData =
          await donationsResponse.json()

        const pickupsData =
          await pickupsResponse.json()

        const distributionsData =
          await distributionsResponse.json()

        if (
          dashboardResponse.status === 401 ||
          dashboardResponse.status === 403
        ) {
          navigate('/dashboard', {
            replace: true,
          })
          return
        }

        setStats(dashboardData)
        setUsers(usersData)
        setDonations(donationsData)
        setPickups(pickupsData)

        if (distributionsResponse.ok) {
          setDistributions(distributionsData)
        }
      } catch (error) {
        console.error(
          'Admin dashboard error:',
          error
        )
      } finally {
        setLoading(false)
      }
    }

    fetchAdminData()
  }, [navigate, token])

  /* =========================
     UPDATE PICKUP STATUS
     ========================= */

  const updatePickupStatus = async (id, status) => {
    try {
      const response = await fetch(
        `http://localhost:5000/admin/pickups/${id}/status`,
        {
          method: 'PUT',

          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            status,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        alert(
          data.message ||
          'Failed to update status.'
        )
        return
      }

      setPickups((currentPickups) =>
        currentPickups.map((pickup) =>
          pickup.id === id
            ? {
                ...pickup,
                status: status,
              }
            : pickup
        )
      )
    } catch (error) {
      console.error(error)

      alert(
        'Cannot connect to ClothCare server.'
      )
    }
  }

  /* =========================
     DISTRIBUTION FORM
     ========================= */

  const handleDistributionChange = (e) => {
    const {
      name,
      value,
    } = e.target

    setDistributionForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }))
  }

  /* =========================
     RECORD DISTRIBUTION
     ========================= */

  const handleDistributionSubmit = async (e) => {
    e.preventDefault()

    const {
      donation_id,
      quantity,
      recipient,
      distribution_date,
      notes,
    } = distributionForm

    if (
      !donation_id ||
      !quantity ||
      !recipient ||
      !distribution_date
    ) {
      alert(
        'Please fill all required fields.'
      )
      return
    }

    const selectedDonation =
      donations.find(
        (donation) =>
          donation.id === Number(donation_id)
      )

    if (!selectedDonation) {
      alert('Please select a valid donation.')
      return
    }

    if (
      Number(quantity) <= 0 ||
      Number(quantity) >
        Number(selectedDonation.quantity)
    ) {
      alert(
        `Quantity cannot exceed ${selectedDonation.quantity} items.`
      )
      return
    }

    try {
      setDistributionLoading(true)

      const response = await fetch(
        'http://localhost:5000/admin/distributions',
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            donation_id: Number(donation_id),
            quantity: Number(quantity),
            recipient: recipient.trim(),
            distribution_date,
            notes: notes.trim(),
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        alert(
          data.message ||
          'Failed to record distribution.'
        )
        return
      }

      /* Refresh distribution records */

      const distributionsResponse =
        await fetch(
          'http://localhost:5000/admin/distributions',
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        )

      const distributionsData =
        await distributionsResponse.json()

      if (distributionsResponse.ok) {
        setDistributions(
          distributionsData
        )
      }

      /* Clear form */

      setDistributionForm({
        donation_id: '',
        quantity: '',
        recipient: '',
        distribution_date: '',
        notes: '',
      })

    } catch (error) {
      console.error(error)

      alert(
        'Cannot connect to ClothCare server.'
      )
    } finally {
      setDistributionLoading(false)
    }
  }

  /* =========================
     FORMAT DATE
     ========================= */

  const formatDate = (date) => {
    if (!date) {
      return 'N/A'
    }

    return new Date(date).toLocaleDateString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }
    )
  }

  /* =========================
     LOADING
     ========================= */

  if (loading) {
    return (
      <div className="form-page">
        <div className="empty-donations">
          <p>
            Loading admin dashboard...
          </p>
        </div>
      </div>
    )
  }

  /* =========================
     PAGE
     ========================= */

  return (
    <div className="form-page">

      <div className="form-container dashboard-page">

        {/* HEADER */}

        <div className="dashboard-header">

          <span className="dashboard-label">
            ADMINISTRATION
          </span>

          <h1>
            Admin Dashboard
          </h1>

          <p>
            Manage ClothCare users,
            donations, pickup requests
            and distributions.
          </p>

        </div>

        {/* STATISTICS */}

        <div className="dashboard-stats">

          <div className="stat-card">

            <span>
              USERS
            </span>

            <strong>
              {stats.totalUsers}
            </strong>

            <p>
              Registered users
            </p>

          </div>

          <div className="stat-card">

            <span>
              DONATIONS
            </span>

            <strong>
              {stats.totalDonations}
            </strong>

            <p>
              Total donations
            </p>

          </div>

          <div className="stat-card">

            <span>
              CLOTHES
            </span>

            <strong>
              {stats.totalClothes}
            </strong>

            <p>
              Items donated
            </p>

          </div>

          <div className="stat-card">

            <span>
              PICKUPS
            </span>

            <strong>
              {stats.totalPickups}
            </strong>

            <p>
              Pickup requests
            </p>

          </div>

        </div>

        {/* USERS */}

        <section className="admin-section">

          <div className="admin-section-header">

            <span>
              REGISTERED USERS
            </span>

            <h2>
              Users
            </h2>

          </div>

          <div className="admin-table-wrapper">

            <table className="admin-table">

              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                </tr>
              </thead>

              <tbody>

                {users.map((user) => (

                  <tr key={user.id}>

                    <td>
                      #{user.id}
                    </td>

                    <td>
                      {user.name}
                    </td>

                    <td>
                      {user.email}
                    </td>

                    <td>

                      <span
                        className={
                          user.role === 'admin'
                            ? 'admin-badge'
                            : 'user-badge'
                        }
                      >
                        {user.role}
                      </span>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </section>

        {/* DONATIONS */}

        <section className="admin-section">

          <div className="admin-section-header">

            <span>
              DONATION RECORDS
            </span>

            <h2>
              All Donations
            </h2>

          </div>

          <div className="admin-table-wrapper">

            <table className="admin-table">

              <thead>
                <tr>
                  <th>ID</th>
                  <th>User</th>
                  <th>Clothing</th>
                  <th>Quantity</th>
                  <th>Condition</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>

                {donations.map((donation) => (

                  <tr key={donation.id}>

                    <td>
                      #{donation.id}
                    </td>

                    <td>

                      <strong>
                        {donation.user_name}
                      </strong>

                      <small>
                        {donation.user_email}
                      </small>

                    </td>

                    <td>
                      {donation.clothing_type}
                    </td>

                    <td>
                      {donation.quantity}
                    </td>

                    <td>
                      {donation.condition_type}
                    </td>

                    <td>
                      {formatDate(
                        donation.donation_date
                      )}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </section>

        {/* PICKUPS */}

        <section className="admin-section">

          <div className="admin-section-header">

            <span>
              COLLECTION REQUESTS
            </span>

            <h2>
              Pickup Requests
            </h2>

          </div>

          <div className="admin-table-wrapper">

            <table className="admin-table">

              <thead>
                <tr>
                  <th>ID</th>
                  <th>User</th>
                  <th>Address</th>
                  <th>Phone</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>

                {pickups.map((pickup) => (

                  <tr key={pickup.id}>

                    <td>
                      #{pickup.id}
                    </td>

                    <td>

                      <strong>
                        {pickup.user_name}
                      </strong>

                      <small>
                        {pickup.user_email}
                      </small>

                    </td>

                    <td>
                      {pickup.address}
                    </td>

                    <td>
                      {pickup.phone}
                    </td>

                    <td>
                      {formatDate(
                        pickup.pickup_date
                      )}
                    </td>

                    <td>

                      <select
                        value={pickup.status}
                        onChange={(e) =>
                          updatePickupStatus(
                            pickup.id,
                            e.target.value
                          )
                        }
                        className="status-select"
                      >

                        <option value="Pending">
                          Pending
                        </option>

                        <option value="Confirmed">
                          Confirmed
                        </option>

                        <option value="Picked Up">
                          Picked Up
                        </option>

                        <option value="Completed">
                          Completed
                        </option>

                        <option value="Cancelled">
                          Cancelled
                        </option>

                      </select>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </section>

        {/* DISTRIBUTION */}

        <section className="admin-section">

          <div className="admin-section-header">

            <span>
              CLOTHING DISTRIBUTION
            </span>

            <h2>
              Manage Distribution
            </h2>

          </div>

          {/* Distribution Form */}

          <div className="distribution-form-card">

            <form
              onSubmit={
                handleDistributionSubmit
              }
            >

              <div className="distribution-form-grid">

                <div className="input-group">

                  <label>
                    Select Donation
                  </label>

                  <select
                    name="donation_id"
                    value={
                      distributionForm.donation_id
                    }
                    onChange={
                      handleDistributionChange
                    }
                    required
                  >

                    <option value="">
                      Select a donation
                    </option>

                    {donations.map(
                      (donation) => (

                        <option
                          key={donation.id}
                          value={donation.id}
                        >
                          #{donation.id} -{' '}
                          {donation.clothing_type}{' '}
                          (
                          {donation.quantity}
                          {' '}items)
                        </option>

                      )
                    )}

                  </select>

                </div>

                <div className="input-group">

                  <label>
                    Quantity Distributed
                  </label>

                  <input
                    type="number"
                    name="quantity"
                    min="1"
                    value={
                      distributionForm.quantity
                    }
                    onChange={
                      handleDistributionChange
                    }
                    placeholder="Enter quantity"
                    required
                  />

                </div>

                <div className="input-group">

                  <label>
                    Recipient / Organization
                  </label>

                  <input
                    type="text"
                    name="recipient"
                    value={
                      distributionForm.recipient
                    }
                    onChange={
                      handleDistributionChange
                    }
                    placeholder="Enter recipient"
                    required
                  />

                </div>

                <div className="input-group">

                  <label>
                    Distribution Date
                  </label>

                  <input
                    type="date"
                    name="distribution_date"
                    value={
                      distributionForm.distribution_date
                    }
                    onChange={
                      handleDistributionChange
                    }
                    required
                  />

                </div>

              </div>

              <div className="input-group">

                <label>
                  Notes
                </label>

                <textarea
                  name="notes"
                  value={
                    distributionForm.notes
                  }
                  onChange={
                    handleDistributionChange
                  }
                  placeholder="Add distribution notes (optional)"
                  rows="4"
                />

              </div>

              <button
                type="submit"
                className="form-submit-button"
                disabled={
                  distributionLoading
                }
              >
                {distributionLoading
                  ? 'Recording...'
                  : 'Record Distribution'}
              </button>

            </form>

          </div>

          {/* Distribution Records */}

          <div className="admin-table-wrapper distribution-table-wrapper">

            <table className="admin-table">

              <thead>

                <tr>
                  <th>ID</th>
                  <th>Donation</th>
                  <th>User</th>
                  <th>Quantity</th>
                  <th>Recipient</th>
                  <th>Date</th>
                  <th>Notes</th>
                </tr>

              </thead>

              <tbody>

                {distributions.length === 0 ? (

                  <tr>

                    <td
                      colSpan="7"
                      style={{
                        textAlign: 'center',
                      }}
                    >
                      No distribution
                      records yet.
                    </td>

                  </tr>

                ) : (

                  distributions.map(
                    (distribution) => (

                      <tr
                        key={distribution.id}
                      >

                        <td>
                          #{distribution.id}
                        </td>

                        <td>
                          #{distribution.donation_id}
                          {' - '}
                          {distribution.clothing_type}
                        </td>

                        <td>

                          <strong>
                            {distribution.user_name}
                          </strong>

                          <small>
                            {distribution.user_email}
                          </small>

                        </td>

                        <td>
                          {distribution.quantity}
                        </td>

                        <td>
                          {distribution.recipient}
                        </td>

                        <td>
                          {formatDate(
                            distribution.distribution_date
                          )}
                        </td>

                        <td>
                          {distribution.notes ||
                            '—'}
                        </td>

                      </tr>

                    )
                  )

                )}

              </tbody>

            </table>

          </div>

        </section>

      </div>

    </div>
  )
}

export default AdminDashboard