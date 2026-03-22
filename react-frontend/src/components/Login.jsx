import { useState } from 'react';
import { Mail, Lock, ArrowRight } from 'lucide-react';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('student@demo.com');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        onLogin(data.user);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Server connection failed. Make sure backend is running.');
    }
  };

  return (
    <div className="animate-fade-in" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="glass-panel animate-scale-fade" style={{
        maxWidth: '420px',
        width: '100%',
        padding: '40px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 className="animated-gradient-text" style={{ fontSize: '2rem', marginBottom: '8px' }}>
            Code Galaxy
          </h1>
          <p style={{ color: 'var(--text-grey)' }}>Student Portal Login (Normal Mode)</p>
        </div>

        {error && (
          <div style={{ padding: '10px', background: 'rgba(255,107,107,0.1)', color: 'var(--accent)', borderRadius: '8px', fontSize: '0.9rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ position: 'relative' }}>
            <Mail size={20} style={{ position: 'absolute', top: '12px', left: '16px', color: 'var(--text-grey)' }} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              style={{
                width: '100%',
                padding: '12px 16px 12px 48px',
                borderRadius: 'var(--border-radius-item)',
                border: 'var(--glass-border)',
                background: 'rgba(255,255,255,0.05)',
                color: 'white',
                outline: 'none',
                fontFamily: 'inherit',
                fontSize: '1rem',
                transition: 'var(--transition-smooth)'
              }}
              onFocus={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
              onBlur={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
            />
          </div>

          <div style={{ position: 'relative' }}>
            <Lock size={20} style={{ position: 'absolute', top: '12px', left: '16px', color: 'var(--text-grey)' }} />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              style={{
                width: '100%',
                padding: '12px 16px 12px 48px',
                borderRadius: 'var(--border-radius-item)',
                border: 'var(--glass-border)',
                background: 'rgba(255,255,255,0.05)',
                color: 'white',
                outline: 'none',
                fontFamily: 'inherit',
                fontSize: '1rem',
                transition: 'var(--transition-smooth)'
              }}
              onFocus={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
              onBlur={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
            />
          </div>

          <button type="submit" className="btn-gradient" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
            Login <ArrowRight size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
