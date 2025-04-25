import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getToken } from '../util/auth';
import './LearningPlans.css';

const LearningPlans = () => {
  const [plans, setPlans] = useState([]);
  const [form, setForm] = useState({ title: '', subtitle: '', items: [''] });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) {
        setError('Please log in to view learning plans');
        setLoading(false);
        return;
      }

      const response = await axios.get('http://localhost:8080/api/plans', {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      
      if (response.data) {
        setPlans(response.data);
        setError(null);
      } else {
        setError('No plans found');
      }
    } catch (err) {
      console.error('Error fetching plans:', err);
      if (err.response?.status === 401) {
        setError('Please log in to view learning plans');
      } else {
        setError('Failed to load learning plans. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e, idx) => {
    const newItems = [...form.items];
    newItems[idx] = e.target.value;
    setForm({ ...form, items: newItems });
  };

  const addItemField = () => {
    setForm({ ...form, items: [...form.items, ''] });
  };

  const handleSubmit = async () => {
    try {
      const token = getToken();
      if (!token) {
        setError('Please log in to create or update plans');
        return;
      }

      const config = {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      };

      let response;
      if (isEditing) {
        response = await axios.put(`http://localhost:8080/api/plans/${editId}`, form, config);
      } else {
        response = await axios.post('http://localhost:8080/api/plans', form, config);
      }

      if (response.data) {
        await fetchPlans();
        setForm({ title: '', subtitle: '', items: [''] });
        setShowForm(false);
        setIsEditing(false);
        setEditId(null);
      } else {
        setError('Failed to save the plan. Please try again.');
      }
    } catch (err) {
      console.error('Error saving plan:', err);
      if (err.response?.status === 401) {
        setError('Please log in to create or update plans');
      } else {
        setError('Failed to save the plan. Please try again.');
      }
    }
  };

  const handleEdit = (plan) => {
    setForm(plan);
    setEditId(plan.id);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      const token = getToken();
      if (!token) {
        setError('Please log in to delete plans');
        return;
      }

      const config = {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      };

      const response = await axios.delete(`http://localhost:8080/api/plans/${id}`, config);
      if (response.status === 200) {
        await fetchPlans();
      } else {
        setError('Failed to delete the plan. Please try again.');
      }
    } catch (err) {
      console.error('Error deleting plan:', err);
      if (err.response?.status === 401) {
        setError('Please log in to delete plans');
      } else {
        setError('Failed to delete the plan. Please try again.');
      }
    }
  };

  const handleLogin = () => {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  };

  if (loading) {
    return (
      <div className="learning-container">
        <div className="loading">Loading learning plans...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="learning-container">
        <div className="error">{error}</div>
        {error.includes('Please log in') ? (
          <button onClick={handleLogin}>Login</button>
        ) : (
          <button onClick={fetchPlans}>Try Again</button>
        )}
      </div>
    );
  }

  return (
    <div className="learning-container">
      <div className="learning-header">
        <h1 className="page-title">Learning Plans</h1>
        <button className="add-btn" onClick={() => {
          setShowForm(true);
          setForm({ title: '', subtitle: '', items: [''] });
          setIsEditing(false);
          setEditId(null);
        }}>
          + Add Plan
        </button>
      </div>

      {showForm && (
        <div className="plan-form">
          <input
            type="text"
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <input
            type="text"
            placeholder="Subtitle"
            value={form.subtitle}
            onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
          />
          {form.items.map((item, idx) => (
            <input
              key={idx}
              type="text"
              placeholder={`Item ${idx + 1}`}
              value={item}
              onChange={(e) => handleChange(e, idx)}
            />
          ))}
          <button className="secondary-btn" onClick={addItemField}>+ Add Item</button>
          <div className="form-buttons">
            <button className="primary-btn" onClick={handleSubmit}>{isEditing ? 'Update' : 'Create'} Plan</button>
            <button className="secondary-btn" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="plans-grid">
        {plans.map((plan) => (
          <div key={plan.id} className="plan-card">
            <h2 className="plan-title">{plan.title}</h2>
            <h3 className="plan-subtitle">{plan.subtitle}</h3>
            <ul className="plan-items">
              {plan.items.map((item, i) => (
                <li key={i}><span className="checkmark">✔</span> {item}</li>
              ))}
            </ul>
            <div className="attachments">Resource Attachments 📁</div>
            <div className="card-buttons">
              <button className="edit-btn" onClick={() => handleEdit(plan)}>Edit</button>
              <button className="delete-btn" onClick={() => handleDelete(plan.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LearningPlans;

//Updated the frontend component