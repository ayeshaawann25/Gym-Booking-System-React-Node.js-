import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin, isTrainer } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand" to="/">
          <i className="fas fa-dumbbell me-2"></i>
          Gym Booking
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link" to="/admin/dashboard">Admin Dashboard</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/admin/users">Users</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/admin/trainers">Trainers</Link>
                    </li>
                  </>
                )}
                {isTrainer && (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link" to="/trainer/dashboard">Trainer Dashboard</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/trainer/create-class">Add Class</Link>
                    </li>
                  </>
                )}
                {!isAdmin && !isTrainer && (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link" to="/dashboard">Dashboard</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/my-bookings">My Bookings</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/membership">Membership</Link>
                    </li>
                  </>
                )}
                <li className="nav-item">
                  <Link className="nav-link" to="/classes">Classes</Link>
                </li>
                <li className="nav-item dropdown">
                  <button className="btn btn-link nav-link dropdown-toggle" data-bs-toggle="dropdown">
                    <i className="fas fa-user me-1"></i>
                    {user?.name}
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li>
                      <button className="dropdown-item" onClick={handleLogout}>
                        <i className="fas fa-sign-out-alt me-2"></i>
                        Logout
                      </button>
                    </li>
                  </ul>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">Login</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register">Register</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
