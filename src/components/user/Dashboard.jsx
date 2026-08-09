import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalBookings: 0,
    completedBookings: 0,
    upcomingBookings: []
  });
  const [membership, setMembership] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [bookingsRes, membershipRes] = await Promise.all([
        api.get('/bookings/my-bookings'),
        api.get('/membership/my-membership')
      ]);

      const bookings = bookingsRes.data.data;
      const confirmed = bookings.filter(b => b.status === 'confirmed');
      const completed = bookings.filter(b => b.status === 'completed');
      const upcoming = bookings.filter(b => 
        b.status === 'confirmed' && new Date(b.bookingDate) >= new Date()
      );

      setStats({
        totalBookings: confirmed.length,
        completedBookings: completed.length,
        upcomingBookings: upcoming.slice(0, 5)
      });

      if (membershipRes.data.success) {
        setMembership(membershipRes.data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="row mb-4">
        <div className="col-md-12">
          <h1>Welcome back, {user?.name}! 👋</h1>
          <p className="text-muted">Here's your fitness summary</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card text-white bg-primary">
            <div className="card-body">
              <h5 className="card-title">{stats.totalBookings}</h5>
              <p className="card-text">Total Bookings</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-white bg-success">
            <div className="card-body">
              <h5 className="card-title">{stats.completedBookings}</h5>
              <p className="card-text">Completed Classes</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-white bg-info">
            <div className="card-body">
              <h5 className="card-title">{membership ? 'Active' : 'Inactive'}</h5>
              <p className="card-text">Membership</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-white bg-warning">
            <div className="card-body">
              <h5 className="card-title">{membership?.remainingClasses || 0}</h5>
              <p className="card-text">Remaining Classes</p>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Upcoming Classes */}
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h5>Upcoming Classes</h5>
            </div>
            <div className="card-body">
              {stats.upcomingBookings.length === 0 ? (
                <p className="text-muted">No upcoming classes</p>
              ) : (
                <div className="list-group">
                  {stats.upcomingBookings.map(booking => (
                    <div className="list-group-item" key={booking._id}>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-1">{booking.classId?.name}</h6>
                          <small className="text-muted">
                            <i className="fas fa-user me-2"></i>
                            {booking.classId?.trainerId?.userId?.name}
                          </small>
                          <small className="text-muted ms-3">
                            <i className="fas fa-clock me-2"></i>
                            {new Date(booking.bookingDate).toLocaleDateString()}
                          </small>
                        </div>
                        <span className="badge bg-success">Confirmed</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-3">
                <Link to="/my-bookings" className="btn btn-outline-primary">
                  View All Bookings
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Membership Card */}
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h5>Membership</h5>
            </div>
            <div className="card-body">
              {membership ? (
                <>
                  <h6>{membership.plan} Plan</h6>
                  <p>Valid until: {new Date(membership.endDate).toLocaleDateString()}</p>
                  <p>Remaining classes: {membership.remainingClasses}</p>
                  <div className="progress">
                    <div 
                      className="progress-bar"
                      style={{ 
                        width: `${((membership.totalClasses - membership.remainingClasses) / membership.totalClasses) * 100}%` 
                      }}
                    >
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <p>No active membership</p>
                  <Link to="/membership" className="btn btn-primary">
                    <i className="fas fa-crown me-2"></i>
                    Get Membership
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
