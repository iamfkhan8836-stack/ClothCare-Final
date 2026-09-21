import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function Login() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()

    if (!email || !password) return

    setLoading(true)

    try {
      const response = await fetch(
        'http://192.168.0.104:5000/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        alert(data.message || 'Login failed')
        setLoading(false)
        return
      }

      localStorage.setItem(
        'clothcareUser',
        JSON.stringify(data.user)
      )

      localStorage.setItem(
        'clothcareToken',
        data.token
      )

      localStorage.setItem(
        'clothcareLoggedIn',
        'true'
      )

      setLoading(false)

      navigate('/dashboard', {
        replace: true,
      })

    } catch (error) {
      console.error('Login error:', error)
      alert('Cannot connect to ClothCare server.')
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">

      <div className="auth-container">

        <div className="auth-header">
          <h1>Welcome Back</h1>
          <p>Login to your ClothCare account</p>
        </div>

        <form
          className="auth-card"
          onSubmit={handleLogin}
        >

          <div className="input-group">
            <label>Email</label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
            />
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading
              ? 'Logging in...'
              : 'Login'}
          </button>

        </form>

        <p className="auth-footer">
          Don't have an account?{' '}
          <Link to="/register">
            Register
          </Link>
        </p>

      </div>

    </div>
  )
}

export default Login