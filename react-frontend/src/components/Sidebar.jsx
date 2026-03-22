import { useState, useEffect } from 'react';
import { Search, LogOut } from 'lucide-react';

export default function Sidebar({ activeSubject, setActiveSubject, onOpenSearch, onLogout, user }) {
  const [subjects, setSubjects] = useState([]);
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [confirmingLogout, setConfirmingLogout] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:5000/api/subjects?userId=${user?.id || ''}`)
      .then(res => res.json())
      .then(data => setSubjects(data));
  }, [user]);

  const navBar = (
    <div className="glass-panel" style={{
      width: '100%',
      background: 'var(--sidebar-gradient)',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 24px',
      borderRadius: '0',
      borderBottom: 'var(--glass-border)',
      zIndex: 100
    }}>
      <h2 style={{ 
        margin: '0', 
        fontSize: '1.5rem',
        whiteSpace: 'nowrap'
      }} className="animated-gradient-text">
        Code Galaxy
      </h2>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px', overflowX: 'auto', padding: '0 24px' }}>
        <button
          onClick={() => { setActiveSubject(null); setIsOpenMobile(false); }}
          style={{
            background: activeSubject === null ? 'var(--glass-bg)' : 'transparent',
            border: activeSubject === null ? 'var(--glass-border)' : '1px solid transparent',
            color: activeSubject === null ? 'white' : 'var(--text-grey)',
            padding: '10px 16px',
            borderRadius: 'var(--border-radius-item)',
            cursor: 'pointer',
            textAlign: 'center',
            fontWeight: '500',
            transition: 'var(--transition-smooth)',
            boxShadow: activeSubject === null ? 'var(--glass-shadow)' : 'none',
            borderBottom: activeSubject === null ? '4px solid var(--primary)' : '1px solid transparent',
            whiteSpace: 'nowrap'
          }}
        >
          Overview
        </button>
        
        <div style={{ width: '1px', height: '24px', background: 'var(--glass-border)', margin: '0 8px' }}></div>

        {subjects.map(sub => (
          <button
            key={sub.id}
            onClick={() => { setActiveSubject(sub); setIsOpenMobile(false); }}
            style={{
              background: activeSubject?.id === sub.id ? 'var(--glass-bg)' : 'transparent',
              border: '1px solid transparent',
              color: activeSubject?.id === sub.id ? 'white' : 'var(--text-grey)',
              padding: '10px 16px',
              borderRadius: 'var(--border-radius-item)',
              cursor: 'pointer',
              textAlign: 'center',
              fontWeight: '500',
              transition: 'var(--transition-smooth)',
              boxShadow: activeSubject?.id === sub.id ? 'var(--glass-shadow)' : 'none',
              borderBottom: activeSubject?.id === sub.id ? '4px solid var(--secondary)' : '1px solid transparent',
              whiteSpace: 'nowrap'
            }}
          >
            {sub.name}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'row', gap: '12px', alignItems: 'center' }}>
        <button 
          onClick={() => { onOpenSearch(); setIsOpenMobile(false); }}
          className="btn-gradient" 
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px 16px' }}
        >
          <Search size={18} /> <span className="hide-mobile">Search</span>
        </button>
        <button 
          onClick={() => setConfirmingLogout(true)}
          style={{ 
            background: 'rgba(255,107,107,0.1)', 
            color: 'var(--accent)', 
            border: '1px solid rgba(255,107,107,0.3)',
            padding: '10px 16px',
            borderRadius: 'var(--border-radius-item)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontWeight: '600',
            transition: 'var(--transition-smooth)'
          }}
        >
          <LogOut size={18} /> <span className="hide-mobile">Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        .topbar-container {
          width: 100%;
          flex-shrink: 0;
          transition: var(--transition-smooth);
        }
        @media (max-width: 768px) {
          .hide-mobile { display: none; }
        }
      `}</style>

      <div className="topbar-container">
        {navBar}
      </div>

      {confirmingLogout && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-panel animate-scale-fade" style={{ padding: '32px', textAlign: 'center', maxWidth: '400px' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>Are you sure you want to logout?</h3>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '32px' }}>
              <button onClick={() => setConfirmingLogout(false)} style={{ background: 'transparent', border: '1px solid var(--text-grey)', color: 'white', padding: '12px 24px', borderRadius: 'var(--border-radius-item)', cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => { setConfirmingLogout(false); onLogout(); }} className="btn-gradient" style={{ background: 'var(--accent)', boxShadow: '0 4px 15px rgba(255, 107, 107, 0.4)', border: 'none' }}>Confirm Logout</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
