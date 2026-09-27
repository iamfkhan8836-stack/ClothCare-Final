import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

function MyPickups() {
  const navigate = useNavigate()

  const [pickups, setPickups] = useState([])
  const [loading, setLoading] = useState(true)

  const token = localStorage.getItem('clothcareToken')

  useEffect(() => {
    fetchPickups()
  }, [])

  const fetchPickups = async () => {
    if (!token) {
      navigate('/login')
      return
    }

    try {
      const response = await fetch(
        'https://clothcare.onrender.com/pickups',
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

      setPickups(
        Array.isArray(data)
          ? data
          : data.pickups || []
      )

    } catch (error) {
      console.error(error)

      alert(
        'Cannot connect to ClothCare server.'
      )

    } finally {
      setLoading(false)
    }
  }

  const deletePickup = async (id) => {
    if (
      !window.confirm(
        'Are you sure you want to delete this pickup request?'
      )
    ) {
      return
    }

    try {
      const response = await fetch(
        `https://clothcare.onrender.com/pickups/${id}`,
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
          'Failed to delete pickup.'
        )

        return
      }

      setPickups(
        currentPickups =>
          currentPickups.filter(
            pickup => pickup.id !== id
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
    <div className="page-container">

      <div
        className="page-header"
        style={{
          textAlign: 'center',
          width: '100%',
          margin: '0 auto 30px',
        }}
      >

        <p className="section-label">
          COLLECTION REQUESTS
        </p>

        <h1>
          My Pickup Requests
        </h1>

        <p>
          View and track your clothing pickup requests.
        </p>

      </div>

      <div
        className="content-card"
        style={{
          width: '100%',
          maxWidth: '1100px',
          margin: '0 auto',
        }}
      >

        {loading ? (

          <p style={{ textAlign: 'center' }}>
            Loading pickup requests...
          </p>

        ) : pickups.length === 0 ? (

          <p style={{ textAlign: 'center' }}>
            No pickup requests found.
          </p>

        ) : (

          <div
            className="pickup-list"
            style={{
              width: '100%',
              maxWidth: '1100px',
              margin: '0 auto',
            }}
          >

            {pickups.map((pickup) => (

              <div
                className="pickup-card"
                key={pickup.id}
              >

                <h3>
                  Pickup Request #{pickup.id}
                </h3>

                <p>
                  <strong>Address:</strong>{' '}
                  {pickup.address}
                </p>

                <p>
                  <strong>Phone:</strong>{' '}
                  {pickup.phone}
                </p>

                <p>
                  <strong>Pickup Date:</strong>{' '}
                  {formatDate(pickup.pickup_date)}
                </p>

                <p>
                  <strong>Status:</strong>{' '}
                  {pickup.status}
                </p>

                {pickup.status === 'Pending' && (

                  <button
                    onClick={() =>
                      deletePickup(pickup.id)
                    }
                    className="delete-btn"
                  >
                    Delete Request
                  </button>

                )}

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  )
}

export default MyPickups