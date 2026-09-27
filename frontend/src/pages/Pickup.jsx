import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Pickup() {
  const navigate = useNavigate()

  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [pickupDate, setPickupDate] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    const token = localStorage.getItem('clothcareToken')

    if (!token) {
      alert('Please login first.')
      navigate('/login')
      return
    }

    if (!address.trim() || !phone.trim() || !pickupDate) {
      alert('Please fill all required fields.')
      return
    }

    if (phone.trim().length < 10) {
      alert('Please enter a valid phone number.')
      return
    }

    try {
      setLoading(true)

      const response = await fetch(
        'http://localhost:5000/pickups',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            address: address.trim(),
            phone: phone.trim(),
            pickup_date: pickupDate,
          }),
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
          'Failed to request pickup.'
        )

        return
      }

      setAddress('')
      setPhone('')
      setPickupDate('')

      navigate('/my-pickups')

    } catch (error) {
      console.error(error)

      alert(
        'Cannot connect to ClothCare server.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="form-page">

      <div className="form-container">

        <div className="form-header">

          <h1>
            Request Pickup 🚚
          </h1>

          <p>
            Enter your details and we will collect
            your donation.
          </p>

        </div>

        <div className="form-card">

          <form onSubmit={handleSubmit}>

            <div className="input-group">

              <label>
                Address
              </label>

              <textarea
                value={address}
                onChange={(e) =>
                  setAddress(e.target.value)
                }
                placeholder="Enter your pickup address"
                required
              />

            </div>

            <div className="input-group">

              <label>
                Phone Number
              </label>

              <input
                type="tel"
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value)
                }
                placeholder="Enter your phone number"
                required
              />

            </div>

            <div className="input-group">

              <label>
                Pickup Date
              </label>

              <input
                type="date"
                value={pickupDate}
                onChange={(e) =>
                  setPickupDate(e.target.value)
                }
                required
              />

            </div>

            <button
              type="submit"
              className="form-submit-button"
              disabled={loading}
            >
              {loading
                ? 'Submitting...'
                : 'Request Pickup'}
            </button>

          </form>

        </div>

      </div>

    </div>
  )
}

export default Pickup