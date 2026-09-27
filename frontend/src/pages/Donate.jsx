import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Donate() {
  const [clothingType, setClothingType] = useState('')
  const [quantity, setQuantity] = useState('')
  const [condition, setCondition] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    const token = localStorage.getItem('clothcareToken')

    if (!token) {
      alert('Please login first.')
      navigate('/login')
      return
    }

    if (!clothingType || !quantity || !condition) {
      alert('Please fill all required fields.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(
        'http://localhost:5000/donations',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            clothing_type: clothingType,
            quantity: Number(quantity),
            condition: condition,
            description: description,
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
          'Failed to submit donation.'
        )

        return
      }

      setClothingType('')
      setQuantity('')
      setCondition('')
      setDescription('')

      navigate('/my-donations')

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

          <span>MAKE AN IMPACT</span>

          <h1>
            Donate Clothes
          </h1>

          <p>
            Give your unused clothes a second life
            and help someone in need.
          </p>

        </div>

        <div className="form-card">

          <form onSubmit={handleSubmit}>

            <div className="input-group">

              <label>
                Clothing Type
              </label>

              <select
                value={clothingType}
                onChange={(e) =>
                  setClothingType(e.target.value)
                }
                required
              >
                <option value="">
                  Select clothing type
                </option>

                <option value="Shirts">
                  Shirts
                </option>

                <option value="Pants">
                  Pants
                </option>

                <option value="Dresses">
                  Dresses
                </option>

                <option value="Jackets">
                  Jackets
                </option>

                <option value="Kids Clothes">
                  Kids Clothes
                </option>

                <option value="Other">
                  Other
                </option>
              </select>

            </div>

            <div className="input-group">

              <label>
                Quantity
              </label>

              <input
                type="number"
                min="1"
                placeholder="Number of clothing items"
                value={quantity}
                onChange={(e) =>
                  setQuantity(e.target.value)
                }
                required
              />

            </div>

            <div className="input-group">

              <label>
                Condition
              </label>

              <select
                value={condition}
                onChange={(e) =>
                  setCondition(e.target.value)
                }
                required
              >
                <option value="">
                  Select condition
                </option>

                <option value="Excellent">
                  Excellent
                </option>

                <option value="Good">
                  Good
                </option>

                <option value="Fair">
                  Fair
                </option>
              </select>

            </div>

            <div className="input-group">

              <label>
                Description
              </label>

              <textarea
                placeholder="Tell us anything important about the donation..."
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                rows="5"
              />

            </div>

            <button
              className="form-submit-button"
              type="submit"
              disabled={loading}
            >
              {loading
                ? 'Submitting Donation...'
                : 'Submit Donation →'}
            </button>

          </form>

        </div>

      </div>

    </div>
  )
}

export default Donate