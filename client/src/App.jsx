
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';

import Menu from './pages/Menu';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';

import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-background text-secondary font-sans antialiased">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/profile" element={<Profile />} />
              {/* Future routes will go here */}
            </Routes>
          </main>

          {/* Simple Footer */}
          <footer className="bg-secondary p-8 text-center text-white/50 text-sm">
            <p>&copy; {new Date().getFullYear()} Coffee Shop. All rights reserved.</p>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
