import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings/my-bookings');
      setBookings(response.data.data);
    } catch (error) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      await api.put(`/bookings/${bookingId}/cancel`);
      toast.success('Booking cancelled successfully');
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to cancel booking');
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'pending': 'warning',
      'confirmed': 'success',
      'cancelled': 'danger',
      'completed': 'info'
    };
    return `badge bg-${statusMap[status] || 'secondary'}`;
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
          <h2>My Bookings</h2>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center mt-5">
          <i className="fas fa-calendar-times fa-3x text-muted mb-3"></i>
          <p className="text-muted">No bookings found</p>
          <a href="/classes" className="btn btn-primary">
            Browse Classes
          </a>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Class</th>
                <th>Trainer</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(booking => (
                <tr key={booking._id}>
                  <td>
                    <strong>{booking.classId?.name}</strong>
                    <br />
                    <small className="text-muted">{booking.classId?.type}</small>
                  </td>
                  <td>{booking.classId?.trainerId?.userId?.name || 'N/A'}</td>
                  <td>{new Date(booking.bookingDate).toLocaleDateString()}</td>
                  <td>${booking.amount}</td>
                  <td>
                    <span className={getStatusBadge(booking.status)}>
                      {booking.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleCancelBooking(booking._id)}
                      >
                        <i className="fas fa-times me-1"></i>
                        Cancel
                      </button>
                    )}
                    {booking.status === 'completed' && (
                      <span className="text-success">
                        <i className="fas fa-check-circle me-1"></i>
                        Completed
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
