import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import './login.css';

function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [contacts, setContacts] = useState([]);

  // Load contact submissions from Firestore on page load
  useEffect(() => {
    const loadContacts = async () => {
      const contactsQuery = query(collection(db, "contacts"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(contactsQuery);
      const contactsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setContacts(contactsList);
    };
    loadContacts();
  }, []);

  const handleChange = (e) => {
     setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addDoc(collection(db, "contacts"), {
        name: form.name,
        email: form.email,
        message: form.message,
        createdAt: new Date()
      });
      alert("Message sent successfully!");
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      console.error("Error sending message:", err);
      alert("Failed to send message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-bg">
      <div className="login-outer-block">
        <div className="login-title">Contact Us</div>
        <form className="login-form" onSubmit={handleSubmit}>
          <input
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            placeholder="Name"
            required
          />
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            required
          />
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            placeholder="Message"
            required
            style={{ minHeight: '100px', resize: 'vertical' }}
          />
          <button 
            type="submit" 
            disabled={submitting}
            style={{
              background: '#ffc107',
              color: '#111',
              border: 'none',
              borderRadius: '1rem',
              padding: '0.9rem 0',
              fontSize: '1.1rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
          >
            {submitting ? "Sending..." : "Send Message"}
          </button>
        </form>
        <div style={{marginTop: '1.5rem', width: '100%'}}>
          <h3 className="login-title" style={{fontSize: '1.2rem', marginBottom: '1rem'}}>Recent Messages</h3>
          {contacts.map((contact) => (
            <div key={contact.id} style={{background: '#f1f5ff', borderRadius: '1rem', padding: '0.7rem 1rem', marginBottom: '0.7rem'}}>
              <p style={{fontWeight: 600, color: '#6366f1'}}>{contact.name} <span style={{color: '#888', fontWeight: 400}}>({contact.email})</span></p>
              <p style={{color: '#3b3b6d'}}>{contact.message}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Contact;