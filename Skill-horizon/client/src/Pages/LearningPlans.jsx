import React, { useState } from 'react';
import './LearningPlans.css';

const initialPlans = [
  {
    title: "Learning Plan -1",
    subtitle: "Introduction to Python",
    items: ["Learn basics", "Practice foundational concepts", "Learn different loops"]
  },
  {
    title: "Learning Plan -2",
    subtitle: "Introduction to HTML",
    items: ["Learn basics of HTML", "Learn foundational concepts", "Learn different tags"]
  },
  {
    title: "Learning Plan -3",
    subtitle: "Introduction to PHP",
    items: ["Learn basics of Server side scripting", "Learn HTML-PHP relationships", "Learn advanced mechanisms"]
  }
];

const LearningPlans = () => {
  const [plans, setPlans] = useState(initialPlans);
  const [form, setForm] = useState({ title: '', subtitle: '', items: [''] });
  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const handleChange = (e, idx) => {
    const newItems = [...form.items];
    newItems[idx] = e.target.value;
    setForm({ ...form, items: newItems });
  };

  const addItemField = () => {
    setForm({ ...form, items: [...form.items, ''] });
  };

  const handleSubmit = () => {
    if (isEditing) {
      const updatedPlans = [...plans];
      updatedPlans[editIndex] = form;
      setPlans(updatedPlans);
      setIsEditing(false);
    } else {
      setPlans([...plans, form]);
    }
    setForm({ title: '', subtitle: '', items: [''] });
    setShowForm(false);
  };

  const handleEdit = (index) => {
    setForm(plans[index]);
    setEditIndex(index);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = (index) => {
    const updatedPlans = plans.filter((_, i) => i !== index);
    setPlans(updatedPlans);
  };

  return (
    <div className="learning-container">
      <div className="learning-header">
        <h1 className="page-title">Learning Plans</h1>
        <button className="add-btn" onClick={() => {
          setShowForm(true);
          setForm({ title: '', subtitle: '', items: [''] });
          setIsEditing(false);
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
        {plans.map((plan, index) => (
          <div key={index} className="plan-card">
            <h2 className="plan-title">{plan.title}</h2>
            <h3 className="plan-subtitle">{plan.subtitle}</h3>
            <ul className="plan-items">
              {plan.items.map((item, i) => (
                <li key={i}><span className="checkmark">✔</span> {item}</li>
              ))}
            </ul>
            <div className="attachments">Resource Attachments 📁</div>
            <div className="card-buttons">
              <button className="edit-btn" onClick={() => handleEdit(index)}>Edit</button>
              <button className="delete-btn" onClick={() => handleDelete(index)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      
    </div>
  );
};

export default LearningPlans;

//Updated the frontend component