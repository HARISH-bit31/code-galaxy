import { useState, useEffect } from 'react';
import { Folder, FileText, ArrowLeft, Download, Copy, Check, Star, AlertCircle, Trash2, Plus } from 'lucide-react';
import CodeViewer from './CodeViewer';

export default function MainContent({ activeSubject, onBackToOverview, user }) {
  const [overview, setOverview] = useState(null);
  const [folders, setFolders] = useState([]);
  const [activeFolder, setActiveFolder] = useState(null);
  const [files, setFiles] = useState([]);
  const [subjectFiles, setSubjectFiles] = useState([]);
  const [copied, setCopied] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [filter, setFilter] = useState('all');
  const [creating, setCreating] = useState(false);
  const [createName, setCreateName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [subFolders, setSubFolders] = useState([]);
  const [depth, setDepth] = useState(0);

  // fetch overview
  useEffect(() => {
    if (!activeSubject) {
      fetch('https://code-galaxy-backend1.onrender.com/api/overview')
        .then(res => res.json())
        .then(data => setOverview(data));
      setActiveFolder(null);
    }
  }, [activeSubject]);

  // fetch folders on subject change
  useEffect(() => {
    if (activeSubject) {
      setActiveFolder(null);
      setFilter('all');
      fetch(`https://code-galaxy-backend1.onrender.com/api/folders/${activeSubject.id}?userId=${user?.id || ''}`)
        .then(res => res.json())
        .then(data => setFolders(data));
      fetch(`https://code-galaxy-backend1.onrender.com/api/subject-files/${activeSubject.id}?userId=${user?.id || ''}`)
        .then(res => res.json())
        .then(data => setSubjectFiles(data));
    }
  }, [activeSubject]);

  // fetch files on folder change
  useEffect(() => {
    setCreating(false);
    setErrorMsg('');
    setCreateName('');
    
    if (activeFolder) {
      fetch(`https://code-galaxy-backend1.onrender.com/api/files/${activeFolder.id}?userId=${user?.id || ''}`)
        .then(res => res.json())
        .then(data => setFiles(data));
      fetch(`https://code-galaxy-backend1.onrender.com/api/folders/${activeFolder.id}?userId=${user?.id || ''}`)
        .then(res => res.json())
        .then(data => setSubFolders(data));
      if (activeSubject?.name === 'FST') {
        fetch(`https://code-galaxy-backend1.onrender.com/api/folder-depth/${activeFolder.id}`)
          .then(res => res.json())
          .then(data => setDepth(data.depth));
      } else {
        setDepth(0);
      }
    } else {
      setSubFolders([]);
      setDepth(0);
    }
  }, [activeFolder]);

  const toggle = async (id, param) => {
    const prop = param === 'favorite' ? 'isFavorite' : 'isImportant';
    setFiles(prev => prev.map(f => f.id === id ? { ...f, [prop]: !f[prop] } : f));
    setSubjectFiles(prev => prev.map(f => f.id === id ? { ...f, [prop]: !f[prop] } : f));
    await fetch(`https://code-galaxy-backend1.onrender.com/api/files/${id}/${param}`, { method: 'PATCH' });
  };

  const doDelete = async () => {
    if (!deleting) return;
    const { type, id } = deleting;
    await fetch(`https://code-galaxy-backend1.onrender.com/api/${type}s/${id}`, { method: 'DELETE' });
    setDeleting(null);
    if (type === 'folder') {
      if (activeFolder) {
        fetch(`https://code-galaxy-backend1.onrender.com/api/folders/${activeFolder.id}?userId=${user?.id || ''}`).then(r => r.json()).then(setSubFolders);
      } else {
        fetch(`https://code-galaxy-backend1.onrender.com/api/folders/${activeSubject.id}?userId=${user?.id || ''}`).then(r => r.json()).then(setFolders);
      }
    } else {
      if (activeFolder) fetch(`https://code-galaxy-backend1.onrender.com/api/files/${activeFolder.id}?userId=${user?.id || ''}`).then(r => r.json()).then(setFiles);
      if (activeSubject && !activeFolder) fetch(`https://code-galaxy-backend1.onrender.com/api/subject-files/${activeSubject.id}?userId=${user?.id || ''}`).then(r => r.json()).then(setSubjectFiles);
    }
  };

  const create = async (type) => {
    if (!createName.trim()) {
      setErrorMsg("Name cannot be empty");
      return;
    }
    setErrorMsg('');

    if (type === 'folder') {
      const parentId = activeFolder ? activeFolder.id : activeSubject.id;
      const res = await fetch('https://code-galaxy-backend1.onrender.com/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: createName, parentId, userId: user?.id })
      });
      const newFolder = await res.json();
      if (activeFolder) {
        setSubFolders(prev => [...prev, newFolder]);
      } else {
        setFolders(prev => [...prev, newFolder]);
      }
    } else if (type === 'file') {
      const res = await fetch('https://code-galaxy-backend1.onrender.com/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: createName, folderId: activeFolder.id, userId: user?.id })
      });
      const newFile = await res.json();
      setFiles(prev => [...prev, newFile]);
      setSubjectFiles(prev => [...prev, newFile]);
    }
    
    setCreating(false);
    setCreateName('');
  };

  const copyText = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const download = (file) => {
    const blob = new Blob([file.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const goBack = () => {
    if (activeFolder) {
      setActiveFolder(null);
    } else {
      onBackToOverview();
    }
  };

  const deleteFromViewer = async (file) => {
    await fetch(`https://code-galaxy-backend1.onrender.com/api/files/${file.id}`, { method: 'DELETE' });
    setViewing(null);
    if (activeFolder) fetch(`https://code-galaxy-backend1.onrender.com/api/files/${activeFolder.id}?userId=${user?.id || ''}`).then(r => r.json()).then(setFiles);
    if (activeSubject) fetch(`https://code-galaxy-backend1.onrender.com/api/subject-files/${activeSubject.id}?userId=${user?.id || ''}`).then(r => r.json()).then(setSubjectFiles);
  };

  const saveFile = (fileId, newContent) => {
    setFiles(prev => prev.map(f => f.id === fileId ? { ...f, content: newContent } : f));
    setSubjectFiles(prev => prev.map(f => f.id === fileId ? { ...f, content: newContent } : f));
    setViewing(prev => prev && prev.id === fileId ? { ...prev, content: newContent } : prev);
  };

  const modals = () => (
    <>
      {creating && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }} onClick={() => setCreating(false)}>
          <div className="glass-panel animate-scale-up" style={{ padding: '32px', width: '400px', display: 'flex', flexDirection: 'column', gap: '24px' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Create New</h2>
            
            <div>
              <input 
                type="text" 
                placeholder="Enter name" 
                value={createName} 
                onChange={e => setCreateName(e.target.value)}
                style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '1rem', outline: 'none', width: '100%', boxSizing: 'border-box' }}
                autoFocus
              />
              {errorMsg && <p style={{ color: '#FF6B6B', fontSize: '0.85rem', marginTop: '8px', marginBottom: 0 }}>{errorMsg}</p>}
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button 
                onClick={() => setCreating(false)}
                style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', padding: '10px 20px', borderRadius: '8px', color: '#fff', cursor: 'pointer' }}
              >
                Cancel
              </button>

              {!activeFolder && (
                <button className="btn-gradient" onClick={() => create('folder')} style={{ padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Folder size={18} /> Create Folder
                </button>
              )}

              {activeFolder && activeSubject?.name !== 'FST' && (
                <button className="btn-gradient" onClick={() => create('file')} style={{ padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={18} /> Create File
                </button>
              )}

              {activeFolder && activeSubject?.name === 'FST' && (
                <>
                  {depth < 2 && (
                    <button onClick={() => create('folder')} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', padding: '10px 20px', borderRadius: '8px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Folder size={18} /> Folder
                    </button>
                  )}
                  <button className="btn-gradient" onClick={() => create('file')} style={{ padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={18} /> File
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {deleting && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-panel animate-scale-fade" style={{ padding: '32px', textAlign: 'center', maxWidth: '400px' }}>
            <AlertCircle size={48} color="var(--accent)" style={{ margin: '0 auto 16px auto' }} />
            <h3 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>Are you sure you want to delete this item?</h3>
            <p style={{ color: 'var(--text-grey)', marginBottom: '32px' }}>"{deleting.name}" will be permanently deleted.</p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <button onClick={() => setDeleting(null)} style={{ background: 'transparent', border: '1px solid var(--text-grey)', color: 'white', padding: '12px 24px', borderRadius: 'var(--border-radius-item)', cursor: 'pointer' }}>Cancel</button>
              <button onClick={doDelete} className="btn-gradient" style={{ background: 'var(--accent)', boxShadow: '0 4px 15px rgba(255, 107, 107, 0.4)', border: 'none' }}>Confirm Delete</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ position: 'fixed', bottom: '40px', right: '40px', zIndex: 9999 }}>
        <button 
          className="btn-gradient"
          onClick={() => { setErrorMsg(''); setCreateName(''); setCreating(true); }}
          style={{ 
            width: '64px', height: '64px', borderRadius: '50%', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(108, 99, 255, 0.4)',
            transition: 'all 0.3s ease',
            padding: 0
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(108, 99, 255, 0.6)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(108, 99, 255, 0.4)'; }}
        >
          <Plus size={32} color="#fff" />
        </button>
      </div>
    </>
  );

  // code viewer (full page)
  if (viewing) {
    const liveFile = files.find(f => f.id === viewing.id) || subjectFiles.find(f => f.id === viewing.id) || viewing;
    return (
      <CodeViewer
        file={liveFile}
        onBack={() => setViewing(null)}
        onToggle={toggle}
        onDelete={deleteFromViewer}
        onSave={saveFile}
      />
    );
  }

  // overview screen
  if (!activeSubject) {
    if (!overview) return <div className="animate-fade-in">Loading Overview...</div>;
    return (
      <div className="glass-panel animate-scale-fade" style={{ padding: '40px' }}>
        <h1 className="animated-gradient-text" style={{ fontSize: '2.5rem', marginBottom: '16px' }}>{overview.title}</h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-light)', lineHeight: '1.6', marginBottom: '24px' }}>
          {overview.description}
        </p>
        <div style={{
          background: 'rgba(0,0,0,0.2)',
          borderRadius: 'var(--border-radius-item)',
          padding: '24px'
        }}>
          <h3 style={{ marginBottom: '16px', color: 'var(--secondary)' }}>How it Works & Restrictions</h3>
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {overview.features.map((feature, i) => (
              <li key={i} style={{ 
                marginBottom: '12px', 
                display: 'flex', 
                alignItems: 'flex-start',
                gap: '12px',
                color: 'var(--text-light)'
              }}>
                <div style={{ marginTop: '4px', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', flexShrink: 0 }}></div>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  // folder list screen
  if (!activeFolder) {
    const favFiles = subjectFiles.filter(f => f.isFavorite);
    const impFiles = subjectFiles.filter(f => f.isImportant);

    return (
      <div className="animate-fade-in">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '2rem' }}>{activeSubject.name} <span style={{ color: 'var(--text-grey)', fontSize: '1.2rem', fontWeight: '400' }}>({activeSubject.description})</span></h2>
        </div>

        {/* favorites */}
        {(filter === 'all' || filter === 'favorites') && (
          <div style={{ marginBottom: filter === 'favorites' ? '40px' : '20px' }} className={filter === 'favorites' ? "animate-fade-in" : ""}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: filter === 'favorites' || favFiles.length === 0 ? '16px' : '0' }}>
              <h3 style={{ fontSize: '1.4rem', color: '#FFD700', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <Star size={24} fill="#FFD700" /> Favorites
              </h3>
              {filter === 'all' && favFiles.length > 0 && (
                <button className="btn-gradient" onClick={() => setFilter('favorites')} style={{ background: 'linear-gradient(135deg, #FFD700, #FDB931)', padding: '6px 16px', borderRadius: '20px', fontSize: '0.85rem', color: '#000', fontWeight: 'bold' }}>
                  View Favorites
                </button>
              )}
              {filter === 'favorites' && (
                <button className="btn-gradient" onClick={() => setFilter('all')} style={{ padding: '6px 16px', borderRadius: '20px', fontSize: '0.85rem' }}>
                  Show All
                </button>
              )}
            </div>
            {favFiles.length === 0 && (
              <p style={{ color: 'var(--text-grey)' }}>No favorite files yet</p>
            )}
            {filter === 'favorites' && favFiles.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {favFiles.map(file => (
                  <div key={'fav-'+file.id} className="glass-panel" onClick={() => setViewing(file)}
                       style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: 'rgba(255, 215, 0, 0.05)', borderLeft: '4px solid #FFD700', transition: 'var(--transition-smooth)' }}
                       onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.background = 'rgba(255, 215, 0, 0.1)'; }}
                       onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = 'rgba(255, 215, 0, 0.05)'; }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <FileText color="#FFD700" size={24} />
                      <span style={{ fontSize: '1.2rem', fontWeight: '500' }}>{file.name}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} onClick={e => e.stopPropagation()}>
                      <button onClick={(e) => { e.stopPropagation(); toggle(file.id, 'favorite'); }} style={{ background: 'transparent', border: 'none', color: file.isFavorite ? '#FFD700' : 'var(--text-grey)', cursor: 'pointer', padding: '6px' }} title="Favorite">
                        <Star size={20} fill={file.isFavorite ? "#FFD700" : "none"} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); toggle(file.id, 'important'); }} style={{ background: 'transparent', border: 'none', color: file.isImportant ? '#FF4500' : 'var(--text-grey)', cursor: 'pointer', padding: '6px' }} title="Important">
                        <AlertCircle size={20} fill={file.isImportant ? "#FF4500" : "none"} />
                      </button>
                      <div style={{ width: '1px', height: '24px', background: 'var(--glass-border)', margin: '0 8px' }}></div>
                      <button onClick={(e) => { e.stopPropagation(); download(file); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-light)', cursor: 'pointer', padding: '6px' }} title="Download">
                        <Download size={20} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setDeleting({ type: 'file', id: file.id, name: file.name }); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-grey)', cursor: 'pointer', padding: '6px' }} title="Delete">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* important */}
        {(filter === 'all' || filter === 'important') && (
          <div style={{ marginBottom: filter === 'important' ? '40px' : '20px' }} className={filter === 'important' ? "animate-fade-in" : ""}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: filter === 'important' || impFiles.length === 0 ? '16px' : '0' }}>
              <h3 style={{ fontSize: '1.4rem', color: '#FF4500', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <AlertCircle size={24} fill="#FF4500" /> Important
              </h3>
              {filter === 'all' && impFiles.length > 0 && (
                <button className="btn-gradient" onClick={() => setFilter('important')} style={{ background: 'linear-gradient(135deg, #FF4500, #FF8C00)', padding: '6px 16px', borderRadius: '20px', fontSize: '0.85rem', color: '#fff', fontWeight: 'bold' }}>
                  View Important
                </button>
              )}
              {filter === 'important' && (
                <button className="btn-gradient" onClick={() => setFilter('all')} style={{ padding: '6px 16px', borderRadius: '20px', fontSize: '0.85rem' }}>
                  Show All
                </button>
              )}
            </div>
            {impFiles.length === 0 && (
              <p style={{ color: 'var(--text-grey)' }}>No important files yet</p>
            )}
            {filter === 'important' && impFiles.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {impFiles.map(file => (
                  <div key={'imp-'+file.id} className="glass-panel" onClick={() => setViewing(file)}
                       style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: 'rgba(255, 69, 0, 0.05)', borderLeft: '4px solid #FF4500', transition: 'var(--transition-smooth)' }}
                       onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.background = 'rgba(255, 69, 0, 0.1)'; }}
                       onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = 'rgba(255, 69, 0, 0.05)'; }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <FileText color="#FF4500" size={24} />
                      <span style={{ fontSize: '1.2rem', fontWeight: '500' }}>{file.name}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} onClick={e => e.stopPropagation()}>
                      <button onClick={(e) => { e.stopPropagation(); toggle(file.id, 'favorite'); }} style={{ background: 'transparent', border: 'none', color: file.isFavorite ? '#FFD700' : 'var(--text-grey)', cursor: 'pointer', padding: '6px' }} title="Favorite">
                        <Star size={20} fill={file.isFavorite ? "#FFD700" : "none"} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); toggle(file.id, 'important'); }} style={{ background: 'transparent', border: 'none', color: file.isImportant ? '#FF4500' : 'var(--text-grey)', cursor: 'pointer', padding: '6px' }} title="Important">
                        <AlertCircle size={20} fill={file.isImportant ? "#FF4500" : "none"} />
                      </button>
                      <div style={{ width: '1px', height: '24px', background: 'var(--glass-border)', margin: '0 8px' }}></div>
                      <button onClick={(e) => { e.stopPropagation(); download(file); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-light)', cursor: 'pointer', padding: '6px' }} title="Download">
                        <Download size={20} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setDeleting({ type: 'file', id: file.id, name: file.name }); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-grey)', cursor: 'pointer', padding: '6px' }} title="Delete">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* folders */}
        {filter === 'all' && (
          <div className="animate-fade-in">
            <h3 style={{ fontSize: '1.4rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Folder size={24} color="var(--primary)" /> All Folders
            </h3>
            {folders.length === 0 ? (
              <p style={{ color: 'var(--text-grey)' }}>No folders found in this subject.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                {folders.map(folder => (
                  <div 
                    key={'fld-'+folder.id} 
                    className="glass-panel"
                    onClick={() => { setCreating(false); setErrorMsg(''); setCreateName(''); setActiveFolder(folder); }}
                    style={{ 
                      padding: '24px', 
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px'
                    }}
                  >
                    <div style={{ 
                      background: 'linear-gradient(135deg, var(--secondary), var(--primary))',
                      padding: '12px',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Folder size={32} color="white" />
                    </div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '600', flex: 1 }}>{folder.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} onClick={e => e.stopPropagation()}>
                      <button onClick={(e) => { e.stopPropagation(); setDeleting({ type: 'folder', id: folder.id, name: folder.name }); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-grey)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '6px' }} title="Delete">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {modals()}
        
        <button 
          onClick={goBack}
          className="btn-gradient"
          style={{
            position: 'fixed', bottom: '24px', left: '24px', zIndex: 1000,
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '12px 24px', borderRadius: 'var(--border-radius-item)',
            boxShadow: 'var(--glass-shadow-hover)'
          }}
        >
          <ArrowLeft size={20} /> Back
        </button>
      </div>
    );
  }

  // file list screen
  return (
    <div className="animate-fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {modals()}

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.8rem' }}>{activeFolder.name}</h2>
      </div>

      {subFolders.length > 0 && (
        <div className="animate-fade-in" style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-light)' }}>
            <Folder size={20} color="var(--secondary)" /> Sub Folders
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
            {subFolders.map(folder => (
              <div key={'sub-'+folder.id} className="glass-panel" onClick={() => { setCreating(false); setErrorMsg(''); setCreateName(''); setActiveFolder(folder); }} style={{ padding: '16px 24px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ background: 'linear-gradient(135deg, var(--secondary), var(--primary))', padding: '10px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Folder size={24} color="white" />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '500', flex: 1 }}>{folder.name}</h3>
                <button onClick={(e) => { e.stopPropagation(); setDeleting({ type: 'folder', id: folder.id, name: folder.name }); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-grey)', cursor: 'pointer', padding: '6px' }} title="Delete">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {files.length === 0 ? (
        <p style={{ color: 'var(--text-grey)' }}>No files found in this folder.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {files.map(file => (
            <div 
              key={file.id} 
              className="glass-panel" 
              onClick={() => { setCreating(false); setViewing(file); }}
              style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', borderLeft: '4px solid var(--primary)', transition: 'var(--transition-smooth)' }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = 'var(--glass-bg)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <FileText color="var(--primary)" size={24} />
                <span style={{ fontSize: '1.2rem', fontWeight: '500' }}>{file.name}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} onClick={e => e.stopPropagation()}>
                <button onClick={(e) => { e.stopPropagation(); toggle(file.id, 'favorite'); }} style={{ background: 'transparent', border: 'none', color: file.isFavorite ? '#FFD700' : 'var(--text-grey)', cursor: 'pointer', padding: '6px' }} title="Favorite">
                  <Star size={20} fill={file.isFavorite ? "#FFD700" : "none"} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); toggle(file.id, 'important'); }} style={{ background: 'transparent', border: 'none', color: file.isImportant ? '#FF4500' : 'var(--text-grey)', cursor: 'pointer', padding: '6px' }} title="Important">
                  <AlertCircle size={20} fill={file.isImportant ? "#FF4500" : "none"} />
                </button>
                <div style={{ width: '1px', height: '24px', background: 'var(--glass-border)', margin: '0 8px' }}></div>
                <button onClick={(e) => { e.stopPropagation(); download(file); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-light)', cursor: 'pointer', padding: '6px' }} title="Download">
                  <Download size={20} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); setDeleting({ type: 'file', id: file.id, name: file.name }); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-grey)', cursor: 'pointer', padding: '6px' }} title="Delete">
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button 
        onClick={() => setActiveFolder(null)}
        className="btn-gradient"
        style={{
          position: 'fixed', bottom: '24px', left: '24px', zIndex: 1000,
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '12px 24px', borderRadius: 'var(--border-radius-item)',
          boxShadow: 'var(--glass-shadow-hover)'
        }}
      >
        <ArrowLeft size={20} /> Back
      </button>
    </div>
  );
}
