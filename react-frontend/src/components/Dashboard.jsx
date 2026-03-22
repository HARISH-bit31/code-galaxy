import { useState } from 'react';
import Sidebar from './Sidebar';
import MainContent from './MainContent';
import SearchModal from './SearchModal';

export default function Dashboard({ user, onLogout }) {
  const [activeSubject, setActiveSubject] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      
      <Sidebar 
        activeSubject={activeSubject} 
        setActiveSubject={setActiveSubject} 
        onOpenSearch={() => setIsSearchOpen(true)}
        onLogout={onLogout}
        user={user}
      />

      <div style={{
        flex: 1,
        padding: '24px',
        overflowY: 'auto',
        transition: 'var(--transition-smooth)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', height: '100%' }}>
          <MainContent activeSubject={activeSubject} onBackToOverview={() => setActiveSubject(null)} user={user} />
        </div>
      </div>

      {isSearchOpen && <SearchModal onClose={() => setIsSearchOpen(false)} user={user} />}
    </div>
  );
}
