import React, { useState } from 'react';

const Register = () => {
  const [formData, setFormData] = useState({
    namaPenuh: '',
    noTelefon: '',
    emel: '',
    kataLaluan: ''
  });

  const [status, setStatus] = useState({ type: '', message: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });

    // Map React state to Laravel database columns
    const payload = {
      name: formData.namaPenuh,
      no_telefon: formData.noTelefon,
      email: formData.emel,
      password: formData.kataLaluan
    };

    try {
      const response = await fetch('http://localhost:8000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', message: 'Pendaftaran berjaya!' });
        // Clear the form after success
        setFormData({ namaPenuh: '', noTelefon: '', emel: '', kataLaluan: '' });
      } else {
        setStatus({ type: 'error', message: data.message || 'Ralat berlaku. Sila cuba lagi.' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Gagal menyambung ke pangkalan data.' });
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '40px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', fontFamily: 'sans-serif' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Daftar Akaun BANDA+</h2>

      {status.message && (
        <div style={{ 
          padding: '10px', 
          marginBottom: '15px', 
          borderRadius: '5px',
          backgroundColor: status.type === 'success' ? '#d4edda' : '#f8d7da',
          color: status.type === 'success' ? '#155724' : '#721c24'
        }}>
          {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Nama Penuh</label>
          <input
            type="text"
            name="namaPenuh"
            value={formData.namaPenuh}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>No. Telefon</label>
          <input
            type="tel"
            name="noTelefon"
            value={formData.noTelefon}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Emel</label>
          <input
            type="email"
            name="emel"
            value={formData.emel}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Kata Laluan</label>
          <input
            type="password"
            name="kataLaluan"
            value={formData.kataLaluan}
            onChange={handleChange}
            required
            minLength="8"
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        <button 
          type="submit"
          style={{
            marginTop: '10px',
            padding: '12px',
            backgroundColor: '#000',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Daftar
        </button>
      </form>
    </div>
  );
};

export default Register;