import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        // Save the token so the user stays logged in
        localStorage.setItem('token', data.access_token);
        alert('Log masuk berjaya!');
        navigate('/dashboard'); // Redirect to a dashboard later
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Gagal menyambung ke server.');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '10px' }}>
      <h2 style={{ textAlign: 'center' }}>Log Masuk BANDA+</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input type="email" name="email" placeholder="Emel" onChange={handleChange} required style={{ padding: '10px' }} />
        <input type="password" name="password" placeholder="Kata Laluan" onChange={handleChange} required style={{ padding: '10px' }} />
        <button type="submit" style={{ padding: '10px', backgroundColor: '#000', color: '#fff' }}>Masuk</button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '10px' }}>
        Belum ada akaun? <a href="/register" onClick={(e) => { e.preventDefault(); navigate('/register'); }}>Daftar di sini</a>
      </p>
    </div>
  );
};

export default Login;