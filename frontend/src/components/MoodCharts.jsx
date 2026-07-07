import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceDot,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { BarChart3, TrendingUp, AlertTriangle } from 'lucide-react';

export default function MoodCharts({ trendsData, selectedEntry }) {
  // Radar grafiği verisi hazırlığı (Seçilen günlük veya en son günlük için)
  const getRadarData = () => {
    const entry = selectedEntry || (trendsData && trendsData[trendsData.length - 1]);
    if (!entry) return [];

    return [
      { subject: 'Neşe (Joy)', value: entry.joy * 100, fullMark: 100 },
      { subject: 'Güven (Trust)', value: entry.trust * 100, fullMark: 100 },
      { subject: 'Korku (Fear)', value: entry.fear * 100, fullMark: 100 },
      { subject: 'Şaşkınlık (Surprise)', value: entry.surprise * 100, fullMark: 100 },
      { subject: 'Üzüntü (Sadness)', value: entry.sadness * 100, fullMark: 100 },
      { subject: 'İğrenme (Disgust)', value: entry.disgust * 100, fullMark: 100 },
      { subject: 'Öfke (Anger)', value: entry.anger * 100, fullMark: 100 },
      { subject: 'Beklenti (Antic.)', value: entry.anticipation * 100, fullMark: 100 },
    ];
  };

  const radarData = getRadarData();
  const activeEntryName = selectedEntry ? `${selectedEntry.date} Tarihli Günlük` : 'Son Günlük Durumu';

  // Anomali noktalarını bulalım (Zaman serisinde ReferenceDot eklemek için)
  const anomalies = trendsData ? trendsData.filter(d => d.is_anomaly) : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }} className="animate-fade-in">
      
      {/* 1. Grafik: Zaman Serisi & Trendler */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              padding: '8px',
              borderRadius: '8px',
              color: 'white'
            }}>
              <TrendingUp size={20} />
            </div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Duygu Durum Trendi ve Anomaliler</h2>
          </div>
          {anomalies.length > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.8rem',
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#fca5a5',
              padding: '4px 8px',
              borderRadius: '6px',
              border: '1px solid rgba(239, 68, 68, 0.3)'
            }}>
              <AlertTriangle size={14} />
              <span>{anomalies.length} Anomali Tespit Edildi</span>
            </div>
          )}
        </div>

        <div style={{ width: '100%', height: 300 }}>
          {trendsData && trendsData.length > 0 ? (
            <ResponsiveContainer>
              <LineChart data={trendsData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis domain={[0, 1]} stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: '#111827',
                    border: '1px solid var(--card-border)',
                    borderRadius: '12px',
                    color: '#f8fafc'
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                
                {/* Asıl Duygu Skor Çizgisi */}
                <Line
                  type="monotone"
                  dataKey="sentiment_score"
                  name="Günlük Duygu Skoru"
                  stroke="url(#sentimentGrad)"
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 0, fill: '#6366f1' }}
                  activeDot={{ r: 6 }}
                />
                
                {/* 3 Günlük Hareketli Ortalama (Trend) */}
                <Line
                  type="monotone"
                  dataKey="rolling_sentiment"
                  name="Haftalık Trend (3G Hareketli Ort.)"
                  stroke="#a855f7"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  dot={false}
                />

                {/* Anomali Noktalarını Kırmızı Halka Olarak İşaretle */}
                {anomalies.map((anom, idx) => (
                  <ReferenceDot
                    key={idx}
                    x={anom.date}
                    y={anom.sentiment_score}
                    r={8}
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth={2}
                    alwaysShow
                  />
                ))}

                {/* Degrade Tanımları */}
                <defs>
                  <linearGradient id="sentimentGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#f43f5e" />
                  </linearGradient>
                </defs>
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{
              display: 'flex',
              height: '100%',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8'
            }}>
              Grafik için yeterli veri yok. İlk günlüğünü yazmaya başla!
            </div>
          )}
        </div>
      </div>

      {/* 2. Grafik: Plutchik Duygu Çemberi Modeli (Radar) */}
      {trendsData && trendsData.length > 0 && (
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              padding: '8px',
              borderRadius: '8px',
              color: 'white'
            }}>
              <BarChart3 size={20} />
            </div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
              {activeEntryName} - Duygu Profili (Plutchik)
            </h2>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', width: '100%', height: 320 }}>
            <ResponsiveContainer>
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={11} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="rgba(255,255,255,0.2)" fontSize={10} />
                <Radar
                  name="Duygu Ağırlığı"
                  dataKey="value"
                  stroke="#6366f1"
                  fill="#6366f1"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
