import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

function MyPickups() {
  const navigate = useNavigate()

  const [pickups, setPickups] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem(
      'clothcareToken'
    )

    if (!token) {
      navigate('/login')
      return
    }

    const fetchPickups = async () => {
      try {
        const response = await fetch(
          'http://localhost:5000/pickups',
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
            localStorage.removeItem('clothcareToken')
            localStorage.removeItem('clothcareUser')
            localStorage.removeItem('clothcareLoggedIn')

            navigate('/login')
            return
          }

          alert(
            data.message ||
            'Failed to load pickup requests.'
          )

          return
        }

        setPickups(data)

      } catch (error) {
        console.error(error)

        alert(
          'Cannot connect to ClothCare server.'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchPickups()
  }, [navigate])

  const deletePickup = async (id) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this pickup request?'
    )

    if (!confirmDelete) return

    const token = localStorage.getItem(
      'clothcareToken'
    )

    if (!token) {
      navigate('/login')
      return
    }

    try {
      const response = await fetch(
        `http://localhost:5000/pickups/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        alert(
          data.message ||
          'Failed to delete pickup request.'
        )
        return
      }

      setPickups((currentPickups) =>
        currentPickups.filter(
          (pickup) =>
            pickup.id !== id
        )
      )

    } catch (error) {
      console.error(error)

      alert(
        'Cannot connect to ClothCare server.'
      )
    }
  }

  const formatDate = (date) => {
    if (!date) return 'N/A'

    return new Date(date).toLocaleDateString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }
    )
  }

  return (
    <div className="form-page">

      <div className="form-container pickups-page">

        <div className="form-header">

          <span>
            COLLECTION REQUESTS
          </span>

          <h1>
            My Pickup Requests
          </h1>

          <p>
            View and track your clothing pickup requests.
          </p>

        </div>

        {loading ? (

          <div className="empty-donations">
            <p>
              Loading pickup requests...
            </p>
          </div>

        ) : pickups.length === 0 ? (

          <div className="empty-donations">

            <div className="empty-icon">
              🚚
            </div>

            <h3>
              No pickup requests yet
            </h3>

            <p>
              Request a pickup when you're ready
              to donate your clothes.
            </p>

            <button
              className="form-submit-button"
              onClick={() =>
                navigate('/pickup')
              }
            >
              Request Pickup →
            </button>

          </div>

        ) : (

          <div className="donations-grid">

            {pickups.map((pickup) => (

              <div
                className="donation-item pickup-item"
                key={pickup.id}
              >

                <div className="donation-top">

                  <div className="donation-icon pickup-icon">
                    🚚
                  </div>

                  <div>

                    <span className="donation-number">
                      PICKUP REQUEST #{pickup.id}
                    </span>

                    <h3>
                      Pickup Request
                    </h3>

                  </div>

                </div>

                <div className="donation-details">

                  <div className="donation-detail pickup-address">

                    <span>
                      Address
                    </span>

                    <strong>
                      {pickup.address}
                    </strong>

                  </div>

                  <div className="donation-detail">

                    <span>
                      Phone
                    </span>

                    <strong>
                      {pickup.phone}
                    </strong>

                  </div>

                  <div className="donation-detail">

                    <span>
                      Date
                    </span>

                    <strong>
                      {formatDate(
                        pickup.pickup_date
                      )}
                    </strong>

                  </div>

                </div>

                <div className="pickup-status">

                  <span>
                    STATUS
                  </span>

                  <strong>
                    {pickup.status}
                  </strong>

                </div>

                <button
                  className="donation-delete"
                  onClick={() =>
                    deletePickup(pickup.id)
                  }
                >
                  Delete Pickup Request
                </button>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  )
}

export default MyPickups