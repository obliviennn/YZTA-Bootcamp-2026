import React, { useState, useEffect } from 'react';
import { Sparkles, History, ServerOff, Server, Info, Brain } from 'lucide-react';
import JournalEditor from './components/JournalEditor';
import MoodCharts from './components/MoodCharts';
import CoachPanel from './components/CoachPanel';
import './App.css';

const API_BASE_URL = 'http://localhost:8000/api/journal';

// Geliştirme/Offline Ortamı için Zengin Mock Veri Seti
const mockEntries = [
  {
    id: 101,
    date: '2026-07-02',
    created_at: '2026-07-02T10:00:00',
    content: 'Bugün proje ekibiyle toplandık ve çok iyi anlaştık. Projenin gidişatı harika görünüyor.',
    sentiment_score: 0.85,
    summary: 'Ekip toplantısı verimli geçti ve proje konusunda motivasyon yüksek.',
    is_anomaly: false,
    joy: 0.8, trust: 0.9, fear: 0.1, surprise: 0.2, sadness: 0.0, disgust: 0.0, anger: 0.0, anticipation: 0.7,
    sentiment_metrics: { joy: 0.8, trust: 0.9, fear: 0.1, surprise: 0.2, sadness: 0.0, disgust: 0.0, anger: 0.0, anticipation: 0.7 },
    topics: [{ topic: 'Ekip', score: 0.9 }, { topic: 'Proje', score: 0.8 }],
    insight: 'Harika bir başlangıç! Ekip içindeki güçlü güven duygusu, ortak hedeflere ulaşmanızı kolaylaştıracaktır. Motivasyonunu korumak için bu enerjiyi koru.'
  },
  {
    id: 102,
    date: '2026-07-03',
    created_at: '2026-07-03T10:00:00',
    content: 'İşler biraz birikti, yetiştirmekte zorlanıyorum. Kendimi çok yorgun ve kaygılı hissediyorum.',
    sentiment_score: 0.35,
    summary: 'İş yükünün artması ve zaman baskısı nedeniyle stres ve kaygı hissediliyor.',
    is_anomaly: false,
    joy: 0.1, trust: 0.4, fear: 0.7, surprise: 0.1, sadness: 0.5, disgust: 0.1, anger: 0.2, anticipation: 0.3,
    sentiment_metrics: { joy: 0.1, trust: 0.4, fear: 0.7, surprise: 0.1, sadness: 0.5, disgust: 0.1, anger: 0.2, anticipation: 0.3 },
    topics: [{ topic: 'İş', score: 0.95 }, { topic: 'Zaman', score: 0.7 }],
    insight: 'İş yükünün getirdiği baskıyı yönetmek zor olabilir. Kaygını azaltmak için işlerini küçük adımlara bölmeyi ve kendine 5 dakikalık nefes molaları vermeyi dene.'
  },
  {
    id: 103,
    date: '2026-07-04',
    created_at: '2026-07-04T10:00:00',
    content: 'Bugün hava çok güzeldi. Akşam üstü sahilde uzun bir yürüyüş yaptım ve kafamı dağıttım. İyi geldi.',
    sentiment_score: 0.75,
    summary: 'Sahilde yapılan yürüyüş zihni rahatlattı ve duygu durumunu olumlu etkiledi.',
    is_anomaly: false,
    joy: 0.7, trust: 0.6, fear: 0.1, surprise: 0.3, sadness: 0.1, disgust: 0.0, anger: 0.0, anticipation: 0.4,
    sentiment_metrics: { joy: 0.7, trust: 0.6, fear: 0.1, surprise: 0.3, sadness: 0.1, disgust: 0.0, anger: 0.0, anticipation: 0.4 },
    topics: [{ topic: 'Doğa', score: 0.8 }, { topic: 'Sağlık', score: 0.7 }],
    insight: 'Doğa yürüyüşlerinin zihni sıfırlamadaki gücü büyüktür. Stresli günlerin ardından kendine bu tarz kaçış alanları yaratman harika bir öz-bakım (self-care) örneğidir.'
  },
  {
    id: 104,
    date: '2026-07-05',
    created_at: '2026-07-05T10:00:00',
    content: 'Sınav sonuçları açıklandı ve beklediğimden çok daha düşük geldi. Bütün haftam berbat oldu sanki.',
    sentiment_score: 0.15,
    summary: 'Düşük sınav notu hayal kırıklığı ve yoğun üzüntüye neden oldu.',
    is_anomaly: true, // Z-skoru anomali günü
    joy: 0.0, trust: 0.2, fear: 0.5, surprise: 0.6, sadness: 0.8, disgust: 0.2, anger: 0.6, anticipation: 0.1,
    sentiment_metrics: { joy: 0.0, trust: 0.2, fear: 0.5, surprise: 0.6, sadness: 0.8, disgust: 0.2, anger: 0.6, anticipation: 0.1 },
    topics: [{ topic: 'Sınav', score: 0.9 }, { topic: 'Okul', score: 0.85 }],
    insight: 'Beklentinin altında kalan bir not almak hayal kırıklığı yaratabilir ve bu his çok doğaldır. Ancak unutma ki bu sadece tek bir sınav; akademik değerin veya zekan bu notla ölçülemez. Kendine bugün şefkat göster.'
  },
  {
    id: 105,
    date: '2026-07-06',
    created_at: '2026-07-06T10:00:00',
    content: 'Dünkü üzüntüden sonra bugün kendimi biraz daha toparladım. Betül ile konuştuk, bana destek oldu. Projeye odaklanacağım.',
    sentiment_score: 0.60,
    summary: 'Arkadaş desteğiyle toparlanma ve hedeflere odaklanma isteği var.',
    is_anomaly: false,
    joy: 0.4, trust: 0.8, fear: 0.2, surprise: 0.2, sadness: 0.3, disgust: 0.0, anger: 0.1, anticipation: 0.6,
    sentiment_metrics: { joy: 0.4, trust: 0.8, fear: 0.2, surprise: 0.2, sadness: 0.3, disgust: 0.0, anger: 0.1, anticipation: 0.6 },
    topics: [{ topic: 'Arkadaşlar', score: 0.85 }, { topic: 'Proje', score: 0.75 }],
    insight: 'Sosyal desteğin iyileştirici gücünü kullanman çok değerli. Zor zamanlarda yardım istemek bir zayıflık değil, olgunluk göstergesidir. Projeye odaklanmak zihnini meşgul tutacaktır.'
  }
];

export default function App() {
  const [entries, setEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [trends, setTrends] = useState([]);
  const [isMockMode, setIsMockMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // API'den verileri almayı deniyoruz
      const entriesRes = await fetch(`${API_BASE_URL}/entries/`);
      if (!entriesRes.ok) throw new Error('API hatası');
      const entriesData = await entriesRes.json();
      
      const analyticsRes = await fetch(`${API_BASE_URL}/analytics/`);
      const analyticsData = await analyticsRes.json();

      setEntries(entriesData);
      setTrends(analyticsData.trends);
      setIsMockMode(false);

      if (entriesData.length > 0 && !selectedEntry) {
        setSelectedEntry(entriesData[0]);
      }
    } catch (err) {
      console.log("Sunucu bağlantısı kurulamadı. Mock modda devam ediliyor.");
      // Sunucu çevrimdışı ise mock verileri set ediyoruz
      setIsMockMode(true);
      setEntries(mockEntries);
      setTrends(mockEntries.map(e => ({
        id: e.id,
        date: e.date,
        sentiment_score: e.sentiment_score,
        rolling_sentiment: e.id === 101 ? e.sentiment_score : (e.id === 102 ? 0.60 : 0.65),
        is_anomaly: e.is_anomaly,
        joy: e.sentiment_metrics.joy,
        trust: e.sentiment_metrics.trust,
        fear: e.sentiment_metrics.fear,
        surprise: e.sentiment_metrics.surprise,
        sadness: e.sentiment_metrics.sadness,
        disgust: e.sentiment_metrics.disgust,
        anger: e.sentiment_metrics.anger,
        anticipation: e.sentiment_metrics.anticipation,
        summary: e.summary
      })));
      if (!selectedEntry) {
        setSelectedEntry(mockEntries[0]);
      }
    }
  };

  const handleJournalSubmit = async (content) => {
    setIsLoading(true);
    try {
      if (isMockMode) {
        // Mock modda yeni giriş simülasyonu
        const newId = Date.now();
        const dateStr = new Date().toISOString().split('T')[0];
        
        // Rastgele duygu skorları simüle et
        const mockJoy = Math.random();
        const mockSadness = Math.random() * 0.4;
        const mockSentiment = (mockJoy + (1 - mockSadness)) / 2;

        const newMockEntry = {
          id: newId,
          date: dateStr,
          created_at: new Date().toISOString(),
          content: content,
          sentiment_score: mockSentiment,
          summary: 'Kullanıcının yazdığı yeni yazı simüle edilerek özetlendi.',
          is_anomaly: mockSentiment < 0.25 || mockSentiment > 0.85,
          sentiment_metrics: {
            joy: mockJoy, trust: 0.7, fear: 0.2, surprise: 0.1,
            sadness: mockSadness, disgust: 0.0, anger: 0.1, anticipation: 0.5
          },
          topics: [{ topic: 'Günlük', score: 0.9 }, { topic: 'Kişisel', score: 0.8 }],
          insight: 'Mock Mod: Gemini Ajanları yazını analiz etti! Kendini ifade etmen zihinsel sağlığın için harika bir adım.'
        };

        const updatedEntries = [newMockEntry, ...entries];
        setEntries(updatedEntries);
        setSelectedEntry(newMockEntry);
        
        // Trendleri güncelle
        const updatedTrends = [...trends, {
          id: newId,
          date: dateStr,
          sentiment_score: mockSentiment,
          rolling_sentiment: mockSentiment,
          is_anomaly: newMockEntry.is_anomaly,
          ...newMockEntry.sentiment_metrics,
          summary: newMockEntry.summary
        }];
        setTrends(updatedTrends);
      } else {
        // Sunucuya gerçek POST isteği gönder
        const response = await fetch(`${API_BASE_URL}/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content })
        });
        
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.detail || 'Gönderim başarısız.');
        }

        const newEntry = await response.json();
        setEntries([newEntry, ...entries]);
        setSelectedEntry(newEntry);
        
        // Verileri tekrar tazeleyelim
        await fetchData();
      }
    } catch (err) {
      alert(`Analiz hatası: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEntry = async (id) => {
    if (!window.confirm('Bu günlüğü silmek istediğinizden emin misiniz?')) return;

    if (isMockMode) {
      const filtered = entries.filter(e => e.id !== id);
      setEntries(filtered);
      setTrends(trends.filter(t => t.id !== id));
      if (selectedEntry && selectedEntry.id === id) {
        setSelectedEntry(filtered.length > 0 ? filtered[0] : null);
      }
    } else {
      try {
        const response = await fetch(`${API_BASE_URL}/entry/${id}/`, {
          method: 'DELETE'
        });
        if (!response.ok) throw new Error('Silme işlemi başarısız.');
        
        await fetchData();
        if (selectedEntry && selectedEntry.id === id) {
          setSelectedEntry(null);
        }
      } catch (err) {
        alert(err.message);
      }
    }
  };

  return (
    <div className="app-container">
      {/* Üst Header Bilgi Alanı */}
      <header className="app-header animate-fade-in">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '12px' }}>
          <Brain size={40} style={{ color: 'var(--secondary)' }} className="glow-text" />
          <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 700 }} className="gradient-text">Aura AI</h1>
        </div>
        <p style={{ color: '#94a3b8', margin: 0, fontSize: '1.1rem' }}>
          Yapay Zeka Destekli Çok Boyutlu Günlük Analitiği & Mental Koçluk Sistemi
        </p>

        {/* Mock/Offline Bildirim Banner'ı */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
          {isMockMode ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: '#fda4af',
              padding: '6px 16px',
              borderRadius: '20px',
              fontSize: '0.85rem'
            }}>
              <ServerOff size={14} />
              <span>Yerel API Çevrimdışı (Simülasyon Modu Aktif)</span>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(20, 184, 166, 0.12)',
              border: '1px solid rgba(20, 184, 166, 0.3)',
              color: '#99f6e4',
              padding: '6px 16px',
              borderRadius: '20px',
              fontSize: '0.85rem'
            }}>
              <Server size={14} />
              <span>Aura AI SQLite & Gemini Sunucusuna Bağlı</span>
            </div>
          )}
        </div>
      </header>

      {/* Ana Arayüz Grid Düzeni */}
      <div className="app-grid">
        
        {/* Sol Sütun: Günlük Yazma & Geçmiş Günlükler */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <JournalEditor onSubmit={handleJournalSubmit} isLoading={isLoading} />

          {/* Geçmiş Günlük Listesi */}
          <div className="glass-card animate-fade-in" style={{ flexGrow: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <History size={18} style={{ color: 'var(--primary)' }} />
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 600 }}>Günlük Geçmişi</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '450px', overflowY: 'auto', paddingRight: '4px' }}>
              {entries.length > 0 ? (
                entries.map((entry) => {
                  const isSelected = selectedEntry && selectedEntry.id === entry.id;
                  const dateObj = new Date(entry.created_at || entry.date);
                  
                  return (
                    <div
                      key={entry.id}
                      onClick={() => setSelectedEntry(entry)}
                      style={{
                        padding: '16px',
                        borderRadius: '12px',
                        background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                        border: isSelected ? '1px solid var(--primary)' : '1px solid rgba(255, 255, 255, 0.05)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        position: 'relative'
                      }}
                      className="entry-item"
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>
                          {dateObj.toLocaleDateString('tr-TR')}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: entry.sentiment_score >= 0.6 ? 'var(--color-trust)' : (entry.sentiment_score >= 0.4 ? 'var(--color-surprise)' : 'var(--color-anger)')
                          }}>
                            {Math.round(entry.sentiment_score * 100)}/100
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteEntry(entry.id);
                            }}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'rgba(255,255,255,0.3)',
                              padding: '2px',
                              cursor: 'pointer',
                              boxShadow: 'none',
                              fontSize: '0.75rem'
                            }}
                            onMouseOver={(e) => e.target.style.color = 'var(--accent)'}
                            onMouseOut={(e) => e.target.style.color = 'rgba(255,255,255,0.3)'}
                          >
                            Sil
                          </button>
                        </div>
                      </div>
                      <p style={{
                        margin: 0,
                        fontSize: '0.9rem',
                        color: '#cbd5e1',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {entry.content}
                      </p>
                    </div>
                  );
                })
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: '#64748b', fontSize: '0.9rem' }}>
                  Henüz bir günlük kaydı eklenmedi.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sağ Sütun: Grafikler & Mental Koç Paneli */}
        <div className="dashboard-section">
          <CoachPanel selectedEntry={selectedEntry} latestInsight={selectedEntry?.insight} />
          <MoodCharts trendsData={trends} selectedEntry={selectedEntry} />
        </div>

      </div>
    </div>
  );
}
