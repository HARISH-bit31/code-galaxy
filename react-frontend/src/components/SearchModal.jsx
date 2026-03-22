import { useState, useEffect } from 'react';
import { Search, X, Folder, FileText, Book } from 'lucide-react';

export default function SearchModal({ onClose, user }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ subjects: [], folders: [], files: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.trim() === '') {
      setResults({ subjects: [], folders: [], files: [] });
      return;
    }

    const timer = setTimeout(() => {
      setLoading(true);
      fetch(`http://localhost:5000/api/search?q=${encodeURIComponent(query)}&userId=${user?.id || ''}`)
        .then(res => res.json())
        .then(data => {
          setResults(data);
          setLoading(false);
        });
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="animate-fade-in" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(5px)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      padding: '10vh 20px 20px 20px',
      overflowY: 'auto'
    }}>
      <div className="glass-panel animate-scale-fade" style={{
        width: '100%',
        maxWidth: '800px',
        background: 'linear-gradient(135deg, rgba(30,30,47,0.9), rgba(42,42,64,0.9))',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        maxHeight: '80vh'
      }}>
        <div style={{
          padding: '24px',
          borderBottom: 'var(--glass-border)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <Search size={24} color="var(--primary)" />
          <input 
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search subjects, folders, files..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '1.2rem',
              outline: 'none',
              fontFamily: 'inherit'
            }}
          />
          <button 
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              color: 'white',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'var(--transition-smooth)'
            }}
            onMouseEnter={e => e.target.style.background = 'rgba(255,107,107,0.8)'}
            onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.1)'}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {query.trim() === '' ? (
            <p style={{ textAlign: 'center', color: 'var(--text-grey)', padding: '40px 0' }}>
              Type to start searching...
            </p>
          ) : loading ? (
            <p style={{ textAlign: 'center', color: 'var(--text-grey)', padding: '40px 0' }}>
              Searching...
            </p>
          ) : results.subjects.length === 0 && results.folders.length === 0 && results.files.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-grey)', padding: '40px 0' }}>
              No results found for "{query}"
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              
              {results.subjects.length > 0 && (
                <div>
                  <h4 style={{ color: 'var(--text-grey)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem' }}>Subjects</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {results.subjects.map(sub => (
                      <div key={sub.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px', cursor: 'pointer', transition: 'var(--transition-smooth)' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.2)'} onClick={onClose}>
                        <Book color="var(--primary)" size={24} />
                        <div>
                          <div style={{ fontWeight: '600' }}>{sub.name}</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-grey)' }}>{sub.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {results.folders.length > 0 && (
                <div>
                  <h4 style={{ color: 'var(--text-grey)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem' }}>Folders</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {results.folders.map(fol => (
                      <div key={fol.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px', cursor: 'pointer', transition: 'var(--transition-smooth)' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.2)'} onClick={onClose}>
                        <Folder color="var(--secondary)" size={24} />
                        <div>
                          <div style={{ fontWeight: '600' }}>{fol.name}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {results.files.length > 0 && (
                <div>
                  <h4 style={{ color: 'var(--text-grey)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem' }}>Files</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {results.files.map(file => (
                      <div key={file.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px', cursor: 'pointer', transition: 'var(--transition-smooth)' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.2)'} onClick={onClose}>
                        <FileText color="var(--accent)" size={24} />
                        <div>
                          <div style={{ fontWeight: '600' }}>{file.name}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
