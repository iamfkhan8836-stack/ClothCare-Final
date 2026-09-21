import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Dashboard() {
  const navigate = useNavigate()

  const [user, setUser] = useState(null)
  const [dashboard, setDashboard] = useState({
    totalDonations: 0,
    donationRecords: 0,
    pickupRequests: 0,
    pickupStatus: 'None',
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem(
      'clothcareUser'
    )

    const token = localStorage.getItem(
      'clothcareToken'
    )

    if (!storedUser || !token) {
      navigate('/login')
      return
    }

    setUser(JSON.parse(storedUser))

    const fetchDashboard = async () => {
      try {
        const response = await fetch(
          'http://localhost:5000/dashboard',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        const data = await response.json()

        if (!response.ok) {
          if (
            response.status === 401 ||
            response.status === 403
          ) {
            localStorage.removeItem(
              'clothcareToken'
            )

            localStorage.removeItem(
              'clothcareUser'
            )

            localStorage.removeItem(
              'clothcareLoggedIn'
            )

            navigate('/login')
            return
          }

          console.error(data.message)
          return
        }

        setDashboard(data)

      } catch (error) {
        console.error(
          'Dashboard error:',
          error
        )
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [navigate])

  if (loading) {
    return (
      <div className="dashboard-page">
        <h2>Loading dashboard...</h2>
      </div>
    )
  }

  return (
    <div className="dashboard-page">

      <div className="dashboard-container">

        <div className="dashboard-header">

          <p className="dashboard-label">
            CLOTHCARE DASHBOARD
          </p>

          <h1>
            Welcome back{' '}
            {user?.name || 'User'} 👋
          </h1>

          <p>
            Here's an overview of your
            contributions.
          </p>

        </div>

        <div className="dashboard-stats">

          <div className="stat-card">
            <h3>
              Total Clothes Donated
            </h3>

            <strong>
              {dashboard.totalDonations}
            </strong>

            <p>
              clothing items
            </p>
          </div>

          <div className="stat-card">
            <h3>
              Donation Records
            </h3>

            <strong>
              {dashboard.donationRecords}
            </strong>

            <p>
              donations made
            </p>
          </div>

          <div className="stat-card">
            <h3>
              Pickup Requests
            </h3>

            <strong>
              {dashboard.pickupRequests}
            </strong>

            <p>
              requests submitted
            </p>
          </div>

          <div className="stat-card">
            <h3>
              Latest Pickup
            </h3>

            <strong>
              {dashboard.pickupStatus}
            </strong>

            <p>
              current status
            </p>
          </div>

        </div>

      </div>

    </div>
  )
}

export default Dashboard