import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function App() {
  const [contacts, setContacts] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/contacts`);
      setContacts(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch contacts. Make sure backend is running!');
      console.error(err);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (editingId) {
        await axios.put(`${API_URL}/contacts/${editingId}`, formData);
      } else {
        await axios.post(`${API_URL}/contacts`, formData);
      }
      
      setFormData({ name: '', email: '', phone: '', address: '', notes: '' });
      setEditingId(null);
      fetchContacts();
      setError('');
    } catch (err) {
      setError('Failed to save contact');
      console.error(err);
    }
    setLoading(false);
  };

  const handleEdit = (contact) => {
    setFormData({
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      address: contact.address || '',
      notes: contact.notes || ''
    });
    setEditingId(contact._id);
    // Scroll to form
    document.querySelector('.form-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      setLoading(true);
      try {
        await axios.delete(`${API_URL}/contacts/${id}`);
        fetchContacts();
        setError('');
      } catch (err) {
        setError('Failed to delete contact');
        console.error(err);
      }
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', email: '', phone: '', address: '', notes: '' });
    setEditingId(null);
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      fetchContacts();
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/contacts/search/${query}`);
      setContacts(response.data);
      setError('');
    } catch (err) {
      setError('Failed to search contacts');
      console.error(err);
    }
    setLoading(false);
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="App">
      <div className="container">
        <header className="app-header">
          <div className="header-content">
            <div className="logo">
              <div className="logo-icon">📇</div>
              <div>
                <h1>Contact Manager</h1>
                <p>Manage your contacts efficiently</p>
              </div>
            </div>
          </div>
        </header>

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        <div className="search-container">
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Search contacts by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
            {searchQuery && (
              <button 
                className="clear-search" 
                onClick={() => handleSearch('')}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="content-wrapper">
          <div className="form-section">
            <div className="form-header">
              <h2>{editingId ? '✏️ Edit Contact' : '➕ Add New Contact'}</h2>
              {editingId && (
                <button className="cancel-edit-btn" onClick={handleCancel}>
                  Cancel
                </button>
              )}
            </div>
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  id="email"
                  type="email"
                  placeholder="john.doe@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="phone">Phone Number *</label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="address">Address</label>
                <input
                  id="address"
                  type="text"
                  placeholder="123 Main St, City, State, ZIP"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="notes">Notes</label>
                <textarea
                  id="notes"
                  placeholder="Additional information about this contact..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="4"
                />
              </div>
              
              <button 
                type="submit" 
                className="submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <span className="btn-loading">
                    <span className="spinner"></span>
                    {editingId ? 'Updating...' : 'Adding...'}
                  </span>
                ) : (
                  editingId ? '✓ Update Contact' : '+ Add Contact'
                )}
              </button>
            </form>
          </div>

          <div className="contacts-section">
            <div className="contacts-header">
              <h2>
                <span className="contacts-icon">👥</span>
                Contacts
                <span className="contacts-count">({contacts.length})</span>
              </h2>
            </div>
            
            {loading && contacts.length === 0 && (
              <div className="loading-state">
                <div className="spinner-large"></div>
                <p>Loading contacts...</p>
              </div>
            )}
            
            {!loading && contacts.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <h3>No contacts yet</h3>
                <p>Start by adding your first contact using the form on the left</p>
              </div>
            )}

            {!loading && contacts.length > 0 && (
              <div className="contacts-grid">
                {contacts.map((contact) => (
                  <div key={contact._id} className="contact-card">
                    <div className="contact-avatar">
                      {getInitials(contact.name)}
                    </div>
                    <div className="contact-details">
                      <h3 className="contact-name">{contact.name}</h3>
                      <div className="contact-info-item">
                        <span className="info-icon">📧</span>
                        <a href={`mailto:${contact.email}`} className="contact-link">
                          {contact.email}
                        </a>
                      </div>
                      <div className="contact-info-item">
                        <span className="info-icon">📱</span>
                        <a href={`tel:${contact.phone}`} className="contact-link">
                          {contact.phone}
                        </a>
                      </div>
                      {contact.address && (
                        <div className="contact-info-item">
                          <span className="info-icon">📍</span>
                          <span>{contact.address}</span>
                        </div>
                      )}
                      {contact.notes && (
                        <div className="contact-notes">
                          <span className="notes-icon">📝</span>
                          <p>{contact.notes}</p>
                        </div>
                      )}
                    </div>
                    <div className="contact-actions">
                      <button 
                        onClick={() => handleEdit(contact)} 
                        className="action-btn edit-btn"
                        title="Edit contact"
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(contact._id)} 
                        className="action-btn delete-btn"
                        title="Delete contact"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;