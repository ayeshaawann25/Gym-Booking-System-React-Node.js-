import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const ClassList = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ type: '', difficulty: '', search: '' });
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchClasses();
  }, [filters]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams(filters);
      const response = await api.get(`/classes?${params}`);
      setClasses(response.data.data);
    } catch (error) {
      toast.error('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const handleBookClass = async (classId) => {
    if (!isAuthenticated) {
      toast.error('Please login first');
      return;
    }

    try {
      await api.post('/bookings', { classId });
      toast.success('Class booked successfully!');
      fetchClasses(); // Refresh the list
    } catch (error) {
      toast.error(error.response?.data?.error || 'Booking failed');
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
          <h2>Fitness Classes</h2>
        </div>
      </div>

      {/* Filters */}
      <div className="row mb-4">
        <div className="col-md-3">
          <select 
            className="form-select"
            value={filters.type}
            onChange={(e) => setFilters({...filters, type: e.target.value})}
          >
            <option value="">All Types</option>
            <option value="Yoga">Yoga</option>
            <option value="Zumba">Zumba</option>
            <option value="Weight Training">Weight Training</option>
            <option value="Cardio">Cardio</option>
            <option value="Pilates">Pilates</option>
            <option value="CrossFit">CrossFit</option>
            <option value="HIIT">HIIT</option>
          </select>
        </div>
        <div className="col-md-3">
          <select 
            className="form-select"
            value={filters.difficulty}
            onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
          >
            <option value="">All Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
        <div className="col-md-6">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Search classes..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
            />
            <button className="btn btn-primary" onClick={() => fetchClasses()}>
              <i className="fas fa-search"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Class Cards */}
      <div className="row">
        {classes.length === 0 ? (
          <div className="col-12 text-center">
            <p className="text-muted">No classes found</p>
          </div>
        ) : (
          classes.map(cls => (
            <div className="col-md-4 mb-4" key={cls._id}>
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">{cls.name}</h5>
                  <span className="badge bg-primary mb-2">{cls.type}</span>
                  <span className="badge bg-info ms-2 mb-2">{cls.difficulty}</span>
                  <p className="card-text text-muted">{cls.description.substring(0, 100)}...</p>
                  <ul className="list-unstyled">
                    <li><i className="fas fa-user me-2"></i>Trainer: {cls.trainerId?.userId?.name || 'N/A'}</li>
                    <li><i className="fas fa-clock me-2"></i>{cls.schedule}</li>
                    <li><i className="fas fa-dollar-sign me-2"></i>${cls.price}</li>
                    <li><i className="fas fa-users me-2"></i>{cls.maxCapacity} spots</li>
                  </ul>
                  <button
                    className="btn btn-primary w-100"
                    onClick={() => handleBookClass(cls._id)}
                  >
                    <i className="fas fa-calendar-plus me-2"></i>
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ClassList;
