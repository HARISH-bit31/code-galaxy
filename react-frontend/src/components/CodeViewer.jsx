import { useState, useRef } from 'react';
import { ArrowLeft, Copy, Check, Download, Star, AlertCircle, Trash2, Clipboard, XCircle, Save } from 'lucide-react';

function getLang(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  const map = {
    c: 'c', h: 'c', cpp: 'cpp', cc: 'cpp', cxx: 'cpp', hpp: 'cpp',
    java: 'java', js: 'javascript', jsx: 'javascript', mjs: 'javascript',
    ts: 'typescript', tsx: 'typescript', py: 'python',
    html: 'html', htm: 'html', css: 'css', json: 'json',
    sql: 'sql', xml: 'xml', md: 'markdown', sh: 'bash', bat: 'bash', txt: 'plaintext'
  };
  return map[ext] || 'plaintext';
}

export default function CodeViewer({ file, onBack, onToggle, onDelete, onSave }) {
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [content, setContent] = useState(file.content);
  const [saved, setSaved] = useState(false);
  const editorRef = useRef(null);

  const lang = getLang(file.name);
  const lineCount = content.split('\n').length;

  const copy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const save = async () => {
    try {
      await fetch(`https://code-galaxy-backend1.onrender.com/api/files/${file.id}/content`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
      if (onSave) onSave(file.id, content);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Save failed', err);
    }
  };

  const paste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (editorRef.current) {
        const ta = editorRef.current;
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const updated = content.substring(0, start) + text + content.substring(end);
        setContent(updated);
        setTimeout(() => {
          ta.selectionStart = ta.selectionEnd = start + text.length;
          ta.focus();
        }, 0);
      }
    } catch (err) {
      console.error('Paste failed', err);
    }
  };

  const clear = () => {
    setContent('');
    if (editorRef.current) editorRef.current.focus();
  };

  const download = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const doDelete = () => {
    setDeleting(false);
    onDelete(file);
  };

  const btnStyle = {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#ccc',
    padding: '10px 18px',
    borderRadius: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.9rem',
    fontWeight: 500,
    transition: 'all 0.25s ease',
    backdropFilter: 'blur(8px)',
  };

  return (
    <div className="animate-fade-in" style={{ 
      display: 'flex', flexDirection: 'column', height: '100%', 
      animation: 'fadeZoomIn 0.4s ease-out'
    }}>

      {/* header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 0', marginBottom: '20px', flexWrap: 'wrap', gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div>
            <h2 className="animated-gradient-text" style={{ fontSize: '1.4rem', margin: 0 }}>Code Galaxy</h2>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-grey)' }}>{file.name} <span style={{ opacity: 0.5 }}>({lang})</span></p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={() => onToggle(file.id, 'favorite')}
            style={{
              ...btnStyle,
              background: file.isFavorite ? 'rgba(255, 215, 0, 0.15)' : btnStyle.background,
              borderColor: file.isFavorite ? '#FFD700' : btnStyle.borderColor,
              color: file.isFavorite ? '#FFD700' : '#ccc',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(255,215,0,0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <Star size={18} fill={file.isFavorite ? '#FFD700' : 'none'} />
            {file.isFavorite ? 'Favorited' : 'Add Favorite'}
          </button>
          <button
            onClick={() => onToggle(file.id, 'important')}
            style={{
              ...btnStyle,
              background: file.isImportant ? 'rgba(255, 69, 0, 0.15)' : btnStyle.background,
              borderColor: file.isImportant ? '#FF4500' : btnStyle.borderColor,
              color: file.isImportant ? '#FF4500' : '#ccc',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(255,69,0,0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <AlertCircle size={18} fill={file.isImportant ? '#FF4500' : 'none'} />
            {file.isImportant ? 'Important' : 'Mark Important'}
          </button>
        </div>
      </div>

      {/* editor + actions */}
      <div style={{ display: 'flex', gap: '16px', flex: 1, minHeight: 0 }}>
        
        {/* code editor */}
        <div style={{
          flex: 1,
          background: '#0d1117',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.06)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
        }}>
          {/* title bar */}
          <div style={{
            background: '#161b22',
            padding: '10px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FF5F56' }}></div>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FFBD2E' }}></div>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#27C93F' }}></div>
            <span style={{ color: 'var(--text-grey)', fontSize: '0.85rem', marginLeft: '12px', flex: 1 }}>{file.name}</span>
            <span style={{ color: '#484f58', fontSize: '0.75rem' }}>{lineCount} lines</span>
          </div>
          
          {/* editor area */}
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            {/* line numbers */}
            <div style={{
              padding: '16px 0',
              background: '#0d1117',
              borderRight: '1px solid rgba(255,255,255,0.04)',
              overflowY: 'hidden',
              minWidth: '52px',
              textAlign: 'right',
              fontFamily: "'Consolas', 'Fira Code', 'Courier New', monospace",
              fontSize: '0.9rem',
              lineHeight: '1.65',
              color: '#484f58',
              userSelect: 'none',
              paddingRight: '12px',
              paddingLeft: '12px',
            }}>
              {Array.from({ length: lineCount }, (_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
            <textarea
              ref={editorRef}
              value={content}
              onChange={e => setContent(e.target.value)}
              spellCheck={false}
              style={{
                flex: 1,
                background: 'transparent',
                color: '#e6edf3',
                border: 'none',
                outline: 'none',
                resize: 'none',
                padding: '16px 20px',
                fontFamily: "'Consolas', 'Fira Code', 'Courier New', monospace",
                fontSize: '0.9rem',
                lineHeight: '1.65',
                overflowY: 'auto',
                whiteSpace: 'pre',
                overflowWrap: 'normal',
                overflowX: 'auto',
                tabSize: 4,
              }}
            />
          </div>
        </div>

        {/* side actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '110px', maxWidth: '110px', overflowY: 'auto', alignSelf: 'stretch' }}>
          <button
            onClick={copy}
            style={{
              ...btnStyle,
              background: copied ? 'rgba(39,201,63,0.15)' : 'linear-gradient(135deg, rgba(108,99,255,0.15), rgba(0,201,167,0.15))',
              borderColor: copied ? '#27C93F' : 'rgba(108,99,255,0.3)',
              color: copied ? '#27C93F' : '#c5c5ff',
              flexDirection: 'column',
              padding: '10px 8px',
              textAlign: 'center',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(108,99,255,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
            <span style={{ fontSize: '0.75rem' }}>{copied ? 'Copied!' : 'Copy'}</span>
          </button>

          <button
            onClick={save}
            style={{
              ...btnStyle,
              background: saved ? 'rgba(39,201,63,0.2)' : 'linear-gradient(135deg, rgba(39,201,63,0.12), rgba(0,201,167,0.12))',
              borderColor: saved ? '#27C93F' : 'rgba(39,201,63,0.3)',
              color: saved ? '#27C93F' : '#6fdf8f',
              flexDirection: 'column',
              padding: '10px 8px',
              textAlign: 'center',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(39,201,63,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            {saved ? <Check size={18} /> : <Save size={18} />}
            <span style={{ fontSize: '0.75rem' }}>{saved ? 'Saved!' : 'Save'}</span>
          </button>

          <button
            onClick={paste}
            style={{
              ...btnStyle,
              flexDirection: 'column',
              padding: '10px 8px',
              textAlign: 'center',
              background: 'linear-gradient(135deg, rgba(0,201,167,0.1), rgba(108,99,255,0.1))',
              borderColor: 'rgba(0,201,167,0.2)',
              color: '#7ee8d2',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,201,167,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
            title="Paste from clipboard"
          >
            <Clipboard size={18} />
            <span style={{ fontSize: '0.75rem' }}>Paste</span>
          </button>

          <button
            onClick={clear}
            style={{
              ...btnStyle,
              flexDirection: 'column',
              padding: '10px 8px',
              textAlign: 'center',
              background: 'rgba(255,180,0,0.08)',
              borderColor: 'rgba(255,180,0,0.25)',
              color: '#ffcc57',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(255,180,0,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
            title="Clear editor"
          >
            <XCircle size={18} />
            <span style={{ fontSize: '0.75rem' }}>Clear</span>
          </button>

          <button
            onClick={() => setDeleting(true)}
            style={{
              ...btnStyle,
              flexDirection: 'column',
              padding: '10px 8px',
              textAlign: 'center',
              background: 'rgba(255,107,107,0.08)',
              borderColor: 'rgba(255,107,107,0.2)',
              color: '#ff8a8a',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(255,107,107,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <Trash2 size={18} />
            <span style={{ fontSize: '0.75rem' }}>Delete</span>
          </button>
        </div>
      </div>

      {/* bottom bar */}
      <div style={{ marginTop: '20px', paddingBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={onBack}
          className="btn-gradient"
          style={{
            padding: '12px 28px',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '1rem',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          <ArrowLeft size={20} /> Back
        </button>

        <button
          onClick={download}
          className="btn-gradient"
          style={{
            padding: '12px 28px',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '1rem',
            background: 'linear-gradient(135deg, #00C9A7, #6C63FF)',
            boxShadow: '0 6px 24px rgba(0,201,167,0.3)',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 32px rgba(0,201,167,0.5)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,201,167,0.3)'; }}
        >
          <Download size={20} /> Download
        </button>
      </div>

      {/* delete confirm */}
      {deleting && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-panel animate-scale-fade" style={{ padding: '32px', textAlign: 'center', maxWidth: '420px' }}>
            <AlertCircle size={48} color="#FF6B6B" style={{ margin: '0 auto 16px auto' }} />
            <h3 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>Delete "{file.name}"?</h3>
            <p style={{ color: 'var(--text-grey)', marginBottom: '28px' }}>This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <button onClick={() => setDeleting(false)} style={{ background: 'transparent', border: '1px solid var(--text-grey)', color: 'white', padding: '12px 24px', borderRadius: '12px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={doDelete} className="btn-gradient" style={{ background: '#FF6B6B', boxShadow: '0 4px 15px rgba(255, 107, 107, 0.4)', border: 'none', padding: '12px 24px', borderRadius: '12px' }}>Confirm Delete</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeZoomIn {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
