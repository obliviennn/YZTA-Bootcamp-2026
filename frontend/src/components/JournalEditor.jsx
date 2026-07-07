import React, { useState } from 'react';
import { PenTool, Sparkles, Loader2 } from 'lucide-react';

export default function JournalEditor({ onSubmit, isLoading }) {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (content.trim().length < 15) {
      setError('Lütfen analiz için en az 15 karakter içeren anlamlı bir günlük yazın.');
      return;
    }
    setError('');
    onSubmit(content);
    setContent('');
  };

  return (
    <div className="glass-card animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
          padding: '8px',
          borderRadius: '8px',
          color: 'white'
        }}>
          <PenTool size={20} />
        </div>
        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Bugün Neler Oldu?</h2>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ position: 'relative' }}>
          <textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (e.target.value.trim().length >= 15) setError('');
            }}
            placeholder="Bugünkü düşüncelerini, hislerini ve yaşadıklarını buraya yaz..."
            rows={8}
            disabled={isLoading}
            style={{
              width: '100%',
              resize: 'vertical',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {error && (
          <div style={{
            color: 'var(--accent)',
            fontSize: '0.875rem',
            background: 'rgba(244, 63, 94, 0.1)',
            padding: '10px 14px',
            borderRadius: '8px',
            border: '1px solid rgba(244, 63, 94, 0.2)'
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
            {content.length} karakter
          </span>
          <button
            type="submit"
            disabled={isLoading || content.trim().length < 5}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                <span>Ajanlar Analiz Ediyor...</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>Günlüğü Gönder</span>
              </>
            )}
          </button>
        </div>
      </form>
      
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
