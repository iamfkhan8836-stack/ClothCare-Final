import {
  Routes,
  Route,
  Link,
  Navigate,
  useNavigate
} from 'react-router-dom'

import Register from './pages/Register'
import Login from './pages/Login'
import Donate from './pages/Donate'
import MyDonations from './pages/MyDonations'
import Dashboard from './pages/Dashboard'
import Pickup from './pages/Pickup'
import MyPickups from './pages/MyPickups'
import AdminDashboard from './pages/AdminDashboard'


function Navbar() {
  const navigate = useNavigate()

  const user = JSON.parse(
    localStorage.getItem('clothcareUser')
  )

  const handleLogout = () => {
    localStorage.removeItem('clothcareLoggedIn')
    localStorage.removeItem('clothcareUser')
    localStorage.removeItem('clothcareToken')

    navigate('/login', {
      replace: true
    })
  }

  return (
    <nav>
      <h2>ClothCare</h2>

      <div>
        <Link to="/dashboard">
          Dashboard
        </Link>

        <Link to="/donate">
          Donate
        </Link>

        <Link to="/my-donations">
          My Donations
        </Link>

        <Link to="/pickup">
          Pickup
        </Link>

        <Link to="/my-pickups">
          My Pickups
        </Link>

        {user?.role === 'admin' && (
          <Link to="/admin">
            Admin Panel
          </Link>
        )}

        <button onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  )
}


function Home() {
  return (
    <div>

      <nav>
        <h2>ClothCare</h2>

        <div>
          <Link to="/">
            Home
          </Link>

          <Link to="/login">
            Login
          </Link>

          <Link to="/register">
            Register
          </Link>
        </div>
      </nav>


      <section className="hero">

        <div className="floating-clothes">
          <span>👕</span>
          <span>👖</span>
          <span>🧥</span>
          <span>👚</span>
        </div>

        <div className="hero-content">

          <h1>
            Give Your
            <br />
            Clothes a
            <br />
            <span>Second Life</span>
          </h1>

          <p>
            Donate clothes you no longer need and help provide
            them to people who need them.
          </p>

          <Link to="/register">
            <button>
              Donate Clothes
            </button>
          </Link>

        </div>

      </section>


      <section className="how-it-works">

        <h2>
          How It Works
        </h2>

        <div className="steps">

          <div className="step-card">
            <h3>1. Register</h3>
            <p>
              Create your ClothCare account and join our community.
            </p>
          </div>

          <div className="step-card">
            <h3>2. Donate</h3>
            <p>
              Add details about the clothes you want to donate.
            </p>
          </div>

          <div className="step-card">
            <h3>3. We Collect</h3>
            <p>
              Request a pickup and our team will collect the donation.
            </p>
          </div>

          <div className="step-card">
            <h3>4. Make a Difference</h3>
            <p>
              Your clothes reach people who need them.
            </p>
          </div>

        </div>

      </section>


      <section className="impact-section">

        <h2>
          Clothes for a Brighter Tomorrow
        </h2>

        <p>
          Together we can reduce waste and help communities
          through one donation at a time.
        </p>

        <div className="impact-items">

          <div className="impact-item">
            <span>♻️</span>
            <p>Reduce Waste</p>
          </div>

          <div className="impact-item">
            <span>♥</span>
            <p>Support Communities</p>
          </div>

          <div className="impact-item">
            <span>🌱</span>
            <p>Build a Greener Future</p>
          </div>

        </div>

      </section>


      <footer>

        <h3>
          ClothCare
        </h3>

        <p>
          Donate • Share • Make a Difference
        </p>

        <p>
          © 2026 ClothCare - Clothing Donation Management System
        </p>

      </footer>

    </div>
  )
}


function ProtectedRoute({ children }) {

  const loggedIn =
    localStorage.getItem('clothcareLoggedIn')

  if (!loggedIn) {
    return (
      <Navigate
        to="/login"
        replace
      />
    )
  }

  return (
    <>
      <Navbar />
      {children}
    </>
  )
}


function AdminRoute({ children }) {

  const loggedIn =
    localStorage.getItem('clothcareLoggedIn')

  const user = JSON.parse(
    localStorage.getItem('clothcareUser')
  )

  if (!loggedIn) {
    return (
      <Navigate
        to="/login"
        replace
      />
    )
  }

  if (!user || user.role !== 'admin') {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    )
  }

  return (
    <>
      <Navbar />
      {children}
    </>
  )
}


function App() {

  return (

    <Routes>

      <Route
        path="/"
        element={<Home />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />


      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/donate"
        element={
          <ProtectedRoute>
            <Donate />
          </ProtectedRoute>
        }
      />

      <Route
        path="/my-donations"
        element={
          <ProtectedRoute>
            <MyDonations />
          </ProtectedRoute>
        }
      />

      <Route
        path="/pickup"
        element={
          <ProtectedRoute>
            <Pickup />
          </ProtectedRoute>
        }
      />

      <Route
        path="/my-pickups"
        element={
          <ProtectedRoute>
            <MyPickups />
          </ProtectedRoute>
        }
      />


      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />

    </Routes>

  )
}

export default App