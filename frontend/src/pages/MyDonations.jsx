import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

function MyDonations() {
  const navigate = useNavigate()

  const [donations, setDonations] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchDonations = async () => {
    const token = localStorage.getItem('clothcareToken')

    if (!token) {
      navigate('/login')
      return
    }

    try {
      const response = await fetch(
        'https://clothcare.onrender.com/donations',
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
          'Failed to load donations.'
        )

        return
      }

      setDonations(data)

    } catch (error) {
      console.error(error)

      alert(
        'Cannot connect to ClothCare server.'
      )

    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDonations()
  }, [])

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this donation?'
    )

    if (!confirmDelete) return

    const token = localStorage.getItem('clothcareToken')

    if (!token) {
      navigate('/login')
      return
    }

    try {
      const response = await fetch(
        `https://clothcare.onrender.com/donations/${id}`,
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
          'Failed to delete donation.'
        )

        return
      }

      setDonations((currentDonations) =>
        currentDonations.filter(
          (donation) =>
            donation.id !== id
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

      <div className="form-container donations-page">

        <div className="form-header">

          <span>YOUR CONTRIBUTION</span>

          <h1>
            My Donations
          </h1>

          <p>
            View and manage the clothes you have
            donated through ClothCare.
          </p>

        </div>

        {loading ? (

          <div className="empty-donations">
            <p>
              Loading donations...
            </p>
          </div>

        ) : donations.length === 0 ? (

          <div className="empty-donations">

            <div className="empty-icon">
              ♻
            </div>

            <h3>
              No donations yet
            </h3>

            <p>
              Start making a difference by donating
              clothes you no longer need.
            </p>

            <button
              className="form-submit-button"
              onClick={() =>
                navigate('/donate')
              }
            >
              Donate Clothes →
            </button>

          </div>

        ) : (

          <div className="donations-grid">

            {donations.map((donation) => (

              <div
                className="donation-item"
                key={donation.id}
              >

                <div className="donation-top">

                  <div className="donation-icon">
                    👕
                  </div>

                  <div>
                    <span className="donation-number">
                      DONATION #{donation.id}
                    </span>

                    <h3>
                      {donation.clothing_type}
                    </h3>
                  </div>

                </div>

                <div className="donation-details">

                  <div className="donation-detail">
                    <span>
                      Quantity
                    </span>

                    <strong>
                      {donation.quantity} items
                    </strong>
                  </div>

                  <div className="donation-detail">
                    <span>
                      Condition
                    </span>

                    <strong>
                      {donation.condition_type}
                    </strong>
                  </div>

                  <div className="donation-detail">
                    <span>
                      Date
                    </span>

                    <strong>
                      {formatDate(
                        donation.donation_date
                      )}
                    </strong>
                  </div>

                </div>

                {donation.description && (

                  <div className="donation-description">

                    <span>
                      Description
                    </span>

                    <p>
                      {donation.description}
                    </p>

                  </div>

                )}

                <button
                  className="donation-delete"
                  onClick={() =>
                    handleDelete(donation.id)
                  }
                >
                  Delete Donation
                </button>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  )
}

export default MyDonations