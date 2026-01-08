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

  return (
    <div className="App">
      <div className="container">
        <header>
          <h1>📇 Contact Manager</h1>
          <p>Manage your contacts efficiently</p>
        </header>

        {error && <div className="error">{error}</div>}

        <div className="search-bar">
          <input
            type="text"
            placeholder="🔍 Search contacts..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        <div className="content">
          <div className="form-section">
            <h2>{editingId ? 'Edit Contact' : 'Add New Contact'}</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Name *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <input
                type="email"
                placeholder="Email *"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <input
                type="tel"
                placeholder="Phone *"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
              <textarea
                placeholder="Notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows="3"
              />
              <div className="button-group">
                <button type="submit" disabled={loading}>
                  {editingId ? '✓ Update' : '+ Add Contact'}
                </button>
                {editingId && (
                  <button type="button" onClick={handleCancel} className="cancel-btn">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="contacts-section">
            <h2>Contacts ({contacts.length})</h2>
            {loading && <div className="loading">Loading...</div>}
            
            {!loading && contacts.length === 0 && (
              <div className="no-contacts">
                <p>No contacts found. Add your first contact!</p>
              </div>
            )}

            <div className="contacts-list">
              {contacts.map((contact) => (
                <div key={contact._id} className="contact-card">
                  <div className="contact-info">
                    <h3>{contact.name}</h3>
                    <p>📧 {contact.email}</p>
                    <p>📱 {contact.phone}</p>
                    {contact.address && <p>📍 {contact.address}</p>}
                    {contact.notes && <p className="notes">📝 {contact.notes}</p>}
                  </div>
                  <div className="contact-actions">
                    <button onClick={() => handleEdit(contact)} className="edit-btn">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(contact._id)} className="delete-btn">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;