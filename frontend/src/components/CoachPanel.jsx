import React from 'react';
import { Sparkles, MessageCircle, Heart, Tag, Calendar, AlertTriangle } from 'lucide-react';

export default function CoachPanel({ selectedEntry, latestInsight }) {
  const entry = selectedEntry;
  const insightText = latestInsight || (entry && entry.insight);

  if (!entry) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
        <MessageCircle size={40} style={{ margin: '0 auto 16px', color: 'var(--primary)', opacity: 0.6 }} />
        <h3 style={{ color: 'white', margin: '0 0 8px' }}>Mental Analiz Odası</h3>
        <p style={{ margin: 0, fontSize: '0.9rem' }}>
          Günlüğünü yazdıktan sonra Aura AI Ajanları bu panelde sana özel bilişsel davranışçı öneriler ve duygu haritanı sunacak.
        </p>
      </div>
    );
  }

  // Sentiment skoruna göre durum rengi ve başlığı belirleme
  const getSentimentDetails = (score) => {
    if (score >= 0.7) return { label: 'Oldukça Olumlu', color: 'var(--color-trust)', bg: 'rgba(20, 184, 166, 0.1)' };
    if (score >= 0.4) return { label: 'Dengeli / Nötr', color: 'var(--color-surprise)', bg: 'rgba(6, 182, 212, 0.1)' };
    return { label: 'Duygusal Hassasiyet / Düşük', color: 'var(--color-anger)', bg: 'rgba(239, 68, 68, 0.1)' };
  };

  const sentiment = getSentimentDetails(entry.sentiment_score);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in">
      
      {/* Koç Geri Bildirimi */}
      <div className="glass-card" style={{
        position: 'relative',
        overflow: 'hidden',
        borderLeft: '4px solid var(--secondary)'
      }}>
        {/* Dekoratif Gradient Glow */}
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '150px',
          height: '150px',
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <Sparkles size={20} style={{ color: 'var(--secondary)' }} />
          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 600 }}>Aura AI Kişisel Koç Önerisi</h3>
        </div>

        {insightText ? (
          <p style={{
            margin: 0,
            fontSize: '1rem',
            lineHeight: '1.6',
            color: '#e2e8f0',
            fontStyle: 'italic'
          }}>
            "{insightText}"
          </p>
        ) : (
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>
            Analiz oluşturuluyor...
          </p>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '20px', fontSize: '0.8rem', color: '#94a3b8' }}>
          <Heart size={12} style={{ color: 'var(--accent)' }} />
          <span>Bilişsel Davranışçı Terapi (CBT) yaklaşımlı kişisel destek.</span>
        </div>
      </div>

      {/* Günlük Özeti & İstatistikler */}
      <div className="glass-card">
        <h3 style={{ margin: '0 0 16px', fontSize: '1.15rem', fontWeight: 600 }}>Analiz Detayları</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Tarih ve Durum */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.9rem' }}>
              <Calendar size={16} />
              <span>{entry.created_at ? new Date(entry.created_at).toLocaleDateString('tr-TR') : entry.date}</span>
            </div>
            <span style={{
              fontSize: '0.8rem',
              fontWeight: 600,
              color: sentiment.color,
              background: sentiment.bg,
              padding: '4px 10px',
              borderRadius: '20px',
              border: `1px solid ${sentiment.color}33`
            }}>
              {sentiment.label} ({Math.round(entry.sentiment_score * 100)}/100)
            </span>
          </div>

          {/* Anomali Uyarısı */}
          {entry.is_anomaly && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '12px',
              padding: '12px 16px',
              color: '#fca5a5'
            }}>
              <AlertTriangle size={18} style={{ color: 'var(--color-anger)', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ display: 'block', fontSize: '0.9rem', marginBottom: '2px' }}>İstatistiksel Sapma (Anomali)!</strong>
                <span style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>
                  Bu günün duygu seviyesi, son dönemdeki ortalamandan belirgin şekilde farklılık gösteriyor. Kendine zaman tanımak ve dinlenmek faydalı olabilir.
                </span>
              </div>
            </div>
          )}

          {/* Kısa Özet */}
          <div>
            <strong style={{ display: 'block', fontSize: '0.875rem', color: '#94a3b8', marginBottom: '6px' }}>Günlük Özeti:</strong>
            <p style={{ margin: 0, fontSize: '0.95rem', color: '#f1f5f9', lineHeight: '1.5' }}>
              {entry.summary || 'Özet hesaplanamadı.'}
            </p>
          </div>

          {/* Konu Etiketleri */}
          {entry.topics && entry.topics.length > 0 && (
            <div>
              <strong style={{ display: 'block', fontSize: '0.875rem', color: '#94a3b8', marginBottom: '8px' }}>
                Öne Çıkan Konular ve Etki Ağırlığı:
              </strong>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {entry.topics.map((t, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    padding: '4px 10px',
                    fontSize: '0.8rem',
                    color: '#cbd5e1'
                  }}>
                    <Tag size={12} style={{ color: 'var(--primary)' }} />
                    <span>{t.topic}</span>
                    <span style={{ opacity: 0.6, fontSize: '0.75rem' }}>({Math.round(t.score * 100)}%)</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
