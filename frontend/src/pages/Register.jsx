import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

function Register() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      alert('Passwords do not match!')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(
        'http://http://192.168.0.104:5000/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: e.target.name.value,
            email: e.target.email.value,
            password: password,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        alert(data.message)
        return
      }

      alert('Account created successfully!')
      navigate('/login')
    } catch (error) {
      console.error(error)
      alert('Cannot connect to ClothCare server.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">

      <div className="auth-clothing clothing-one">
        👕
      </div>

      <div className="auth-clothing clothing-two">
        👖
      </div>

      <div className="auth-clothing clothing-three">
        🧥
      </div>

      <div className="auth-clothing clothing-four">
        👗
      </div>

      <div className="auth-container">

        <div className="auth-brand">

          <div className="brand-icon">
            C
          </div>

          <div>
            <h1>ClothCare</h1>
            <p>
              Clothing Donation Management
            </p>
          </div>

        </div>


        <div className="register-card">

          <div className="auth-heading">

            <span>
              GET STARTED
            </span>

            <h2>
              Create your account
            </h2>

            <p>
              Join ClothCare and give your clothes
              a second life.
            </p>

          </div>


          <form onSubmit={handleSubmit}>

            <div className="input-group">

              <label>
                Full Name
              </label>

              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                required
              />

            </div>


            <div className="input-group">

              <label>
                Email Address
              </label>

              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                required
              />

            </div>


            <div className="input-group">

              <label>
                Password
              </label>

              <input
                type="password"
                name="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
              />

            </div>


            <div className="input-group">

              <label>
                Confirm Password
              </label>

              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                required
              />

            </div>


            <button
              className="auth-button"
              type="submit"
              disabled={loading}
            >
              {loading
                ? 'Creating Account...'
                : 'Create Account'}
            </button>

          </form>


          <div className="auth-divider">

            <span></span>

            <p>OR</p>

            <span></span>

          </div>


          <p className="auth-register">

            Already have an account?

            <Link to="/login">
              Sign in
            </Link>

          </p>

        </div>


        <p className="auth-footer">
          © 2026 ClothCare · Give clothes a second life.
        </p>

      </div>

    </div>
  )
}

export default Register