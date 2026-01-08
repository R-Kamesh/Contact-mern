import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

function App() {
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    notes: ""
  });

  // Fetch contacts
  const fetchContacts = async () => {
    try {
      const res = await axios.get(`${API_URL}/contacts`);
      setContacts(res.data);
    } catch (err) {
      alert("Failed to fetch contacts. Make sure backend is running!");
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  // Handle input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add contact
  const addContact = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/contacts`, form);
      setForm({ name: "", email: "", phone: "", address: "", notes: "" });
      fetchContacts();
    } catch (err) {
      alert("Error adding contact");
    }
  };

  // Delete contact
  const deleteContact = async (id) => {
    try {
      await axios.delete(`${API_URL}/contacts/${id}`);
      fetchContacts();
    } catch (err) {
      alert("Error deleting contact");
    }
  };

  // Search
  const filtered = contacts.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  return (
    <div className="app">
      <aside className="sidebar">
        <h2>Contact Manager</h2>
        <p>MERN Stack App</p>
        <button className="add-btn">+ Add Contact</button>
      </aside>

      <main className="main">
        <div className="header">
          <h1>Contacts</h1>
          <button className="add-btn">+ Add Contact</button>
        </div>

        <input
          className="search"
          placeholder="Search contacts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="table">
          <div className="row head">
            <span>Name</span>
            <span>Email</span>
            <span>Phone</span>
            <span>Actions</span>
          </div>

          {filtered.map((c) => (
            <div className="row" key={c._id}>
              <span>{c.name}</span>
              <span>{c.email}</span>
              <span>{c.phone}</span>
              <span>
                <button className="del" onClick={() => deleteContact(c._id)}>
                  🗑
                </button>
              </span>
            </div>
          ))}
        </div>

        <form className="form" onSubmit={addContact}>
          <h3>Add New Contact</h3>
          <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
          <input name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
          <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} required />
          <input name="address" placeholder="Address" value={form.address} onChange={handleChange} />
          <textarea name="notes" placeholder="Notes" value={form.notes} onChange={handleChange} />
          <button type="submit">Add Contact</button>
        </form>
      </main>
    </div>
  );
}

export default App;
