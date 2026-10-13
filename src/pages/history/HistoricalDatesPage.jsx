import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const HISTORICAL_DATES = [
  { date: '१९ फेब्रुवारी १६३०', title: 'छत्रपती शिवाजी महाराज जयंती', place: 'किल्ले शिवनेरी', desc: 'हिंदवी स्वराज्याचे संस्थापक छत्रपती शिवाजी महाराजांचा शिवनेरी गडावर जन्म.', tag: 'शिवजयंती' },
  { date: '१४ मे १६५७', title: 'छत्रपती संभाजी महाराज जयंती', place: 'किल्ले पुरंदर', desc: 'धर्मवीर छत्रपती संभाजी महाराजांचा पुरंदर किल्ल्यावर जन्म.', tag: 'शंभू जयंती' },
  { date: '६ जून १६७४', title: 'शिवराज्याभिषेक दिन (ज्येष्ठ शुद्ध त्रयोदशी)', place: 'किल्ले रायगड', desc: 'छत्रपती शिवाजी महाराजांचा रायगडावर भव्य वैदिक राज्याभिषेक सोहळा संपन्न होऊन शिवराज्याभिषेक शक सुरू झाला.', tag: 'राज्याभिषेक' },
  { date: '२६ एप्रिल १६४५', title: 'स्वराज्याची शपथ', place: 'रायरेश्वर मंदिर', desc: 'सोळाव्या वर्षी रायरेश्वराच्या साक्षीने शिवरायांनी सवंगड्यांसह हिंदवी स्वराज्य स्थापनेची प्रतिज्ञा घेतली.', tag: 'शपथ' },
  { date: '१० नोव्हेंबर १६५९', title: 'प्रतापगड युद्ध व अफझलखान वध', place: 'किल्ले प्रतापगड', desc: 'जावळीच्या खोऱ्यात अफझलखानाचा वध करून शिवरायांनी विजापूरच्या सेनेचा धुव्वा उडवला.', tag: 'विजय' },
  { date: '१३ जुलै १६६०', title: 'पावनखिंडीचा अमर लढा', place: 'घोडखिंड (पावनखिंड)', desc: 'वीर बाजीप्रभू देशपांडे व ३०० बांदल मावळ्यांचे सर्वोच्च बलिदान.', tag: 'बलिदान' },
  { date: '४ फेब्रुवारी १६७०', title: 'सिंहगड पुनर्जय मोहीम', place: 'किल्ले सिंहगड', desc: 'सुभेदार तानाजी मालुसरेंचा अद्वितीय पराक्रम व बलिदान — "गड आला पण सिंह गेला!"', tag: 'शौर्य' },
  { date: '३ एप्रिल १६८०', title: 'छत्रपती शिवाजी महाराज महापरिनिर्वाण', place: 'किल्ले रायगड', desc: 'हिंदवी स्वराज्याच्या महासंस्थापकांचे रायगडावर निर्वाण.', tag: 'पुण्यतिथी' },
  { date: '११ मार्च १६८९', title: 'छत्रपती संभाजी महाराज बलिदान दिन', place: 'तुळापूर / वधू बुद्रुक', desc: 'औरंगजेबाच्या अमानुष छळाला न झुकता मातृभूमी व धर्मासाठी सर्वोच्च आत्मबलिदान.', tag: 'बलिदान' },
  { date: '२८ फेब्रुवारी १७२८', title: 'पालखेड विजय', place: 'पालखेड, नाशिक', desc: 'श्रीमंत बाजीराव पेशव्यांची निजामाविरुद्ध गनिमी काव्याची जागतिक कीर्तीची रणनीती.', tag: 'पेशवे' }
];

export default function HistoricalDatesPage() {
  const [filter, setFilter] = useState('');

  const filtered = HISTORICAL_DATES.filter(d =>
    d.title.toLowerCase().includes(filter.toLowerCase()) ||
    d.date.toLowerCase().includes(filter.toLowerCase()) ||
    d.desc.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div style={{ background: '#F8F5F0', minHeight: 'calc(100vh - 120px)', padding: '36px 16px' }}>
      <div style={{ maxWidth: '1040px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #3D0D0D 0%, #5C1414 100%)',
          borderRadius: '20px',
          padding: '36px 28px',
          color: '#FFF',
          border: '2px solid #DD8A2E',
          marginBottom: '28px',
          boxShadow: '0 16px 40px rgba(61,13,13,0.3)'
        }}>
          <span style={{
            background: '#DD8A2E',
            color: '#3D0D0D',
            padding: '4px 12px',
            borderRadius: '16px',
            fontSize: '0.8rem',
            fontWeight: 800,
            textTransform: 'uppercase'
          }}>
            📅 इतिहास कालदर्शिका
          </span>
          <h1 style={{
            fontFamily: "'Baloo 2', 'Noto Sans Devanagari', sans-serif",
            fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
            fontWeight: 800,
            margin: '10px 0 6px',
            color: '#FFF'
          }}>
            ऐतिहासिक दिनविशेष व शिवकालपट
          </h1>
          <p style={{ color: '#E6DDCE', fontSize: '0.95rem', maxWidth: '640px', margin: 0 }}>
            शिवजन्मापासून शिवराज्याभिषेक आणि मराठा साम्राज्याच्या देदीप्यमान विजयांचे महत्त्वाचे ऐतिहासिक दिवस.
          </p>
        </div>

        {/* Filter Input */}
        <div style={{ marginBottom: '24px' }}>
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="🔍 तारीख किंवा घटना शोधा (उदा. राज्याभिषेक, शिवजयंती, प्रतापगड)..."
            style={{
              width: '100%',
              padding: '12px 18px',
              borderRadius: '12px',
              border: '2px solid #DD8A2E',
              fontSize: '0.95rem',
              outline: 'none',
              background: '#FFF',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Dates Timeline List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filtered.map((item, idx) => (
            <div
              key={idx}
              style={{
                background: '#FFF',
                borderRadius: '14px',
                padding: '20px 24px',
                border: '1px solid #E6DDCE',
                boxShadow: '0 4px 14px rgba(199,56,0,0.04)',
                display: 'flex',
                gap: '18px',
                alignItems: 'flex-start'
              }}>
              <div style={{
                background: '#FDF3E6',
                border: '1.5px solid #DD8A2E',
                borderRadius: '12px',
                padding: '10px 14px',
                textAlign: 'center',
                minWidth: '120px',
                flexShrink: 0
              }}>
                <div style={{ fontSize: '0.8rem', color: '#7A1C1C', fontWeight: 800 }}>{item.date.split(' ')[0]} {item.date.split(' ')[1]}</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#3D0D0D' }}>{item.date.split(' ')[2]}</div>
                <span style={{ fontSize: '0.72rem', background: '#DD8A2E', color: '#FFF', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                  {item.tag}
                </span>
              </div>

              <div>
                <h3 style={{
                  fontFamily: "'Baloo 2', 'Noto Sans Devanagari', sans-serif",
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: '#3D0D0D',
                  margin: '0 0 4px'
                }}>
                  {item.title}
                </h3>
                <div style={{ fontSize: '0.82rem', color: '#DD8A2E', fontWeight: 700, marginBottom: '6px' }}>
                  📍 {item.place}
                </div>
                <p style={{ fontSize: '0.88rem', color: '#5C534B', lineHeight: 1.55, margin: 0 }}>
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
