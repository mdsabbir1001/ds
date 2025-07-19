import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../utils/api';
import { supabase } from '../utils/supabase';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Login successful!');
        localStorage.setItem('access_token', data.access_token);
        await supabase.auth.setSession({ access_token: data.access_token, refresh_token: data.refresh_token });
        navigate('/dashboard');
      } else {
        setMessage(data.detail || 'Login failed.');
      }
    } catch (error) {
      console.error('Error during login:', error);
      setMessage('Network error or server is down.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1877f2 0%, #42b883 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif'
    }}>
      <div className="fb-card" style={{ 
        padding: '40px', 
        width: '100%', 
        maxWidth: '400px',
        margin: '20px'
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: '#1877f2',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M17 18a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2"/>
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <path d="M12 8v4"/>
              <path d="M12 12h.01"/>
            </svg>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1c1e21', marginBottom: '8px' }}>
            Welcome Back
          </h1>
          <p style={{ color: '#65676b', fontSize: '16px' }}>
            Login to access your admin dashboard
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="fb-form-group">
            <label className="fb-label">Email Address</label>
            <input
              type="email"
              className="fb-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
            />
          </div>

          <div className="fb-form-group">
            <label className="fb-label">Password</label>
            <input
              type="password"
              className="fb-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="fb-btn"
            style={{ width: '100%', marginTop: '8px' }}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="fb-spinner" style={{ marginRight: '8px' }}></div>
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>

          {message && (
            <div style={{
              marginTop: '16px',
              padding: '12px',
              borderRadius: '6px',
              background: message.includes('successful') ? '#d4edda' : '#f8d7da',
              color: message.includes('successful') ? '#155724' : '#721c24',
              fontSize: '14px',
              textAlign: 'center'
            }}>
              {message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default LoginPage;