import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const DIVISIONS = [
  {
    id: 'pune',
    name: 'पुणे विभाग (पश्चिम महाराष्ट्र)',
    districts: ['पुणे', 'सातारा', 'कोल्हापूर', 'सांगली', 'सोलापूर'],
    totalMembers: '१,८५,०००+',
    chapters: '६२',
    desc: 'शिवछत्रपतींच्या राजधानीचा आणि मराठा साम्राज्य उगम क्षेत्राचा बालेकिल्ला.'
  },
  {
    id: 'kokan',
    name: 'कोकण विभाग',
    districts: ['मुंबई शहर', 'मुंबई उपनगर', 'ठाणे', 'पालघर', 'रायगड', 'रत्नागिरी', 'सिंधुदुर्ग'],
    totalMembers: '१,४०,०००+',
    chapters: '४८',
    desc: 'सागरी किल्ले, मराठा आरमार आणि जागतिक व्यापारी केंद्राचा परिसर.'
  },
  {
    id: 'sambhajinagar',
    name: 'छत्रपती संभाजीनगर विभाग (मराठवाडा)',
    districts: ['छत्रपती संभाजीनगर', 'जालना', 'परभणी', 'हिंगोली', 'नांदेड', 'बीड', 'लातूर', 'धाराशिव'],
    totalMembers: '९५,०००+',
    chapters: '३४',
    desc: 'संतांची भूमी आणि मराठवाडा मुक्तीसंग्रामाचा दैदीप्यमान इतिहास.'
  },
  {
    id: 'nashik',
    name: 'नाशिक विभाग (उत्तर महाराष्ट्र)',
    districts: ['नाशिक', 'अहिल्यानगर', 'धुळे', 'जळगाव', 'नंदुरबार'],
    totalMembers: '७०,०००+',
    chapters: '२४',
    desc: 'कृषी क्रांती, द्राक्ष-कांदा पट्टा आणि सह्याद्रीच्या उत्तर रांगा.'
  },
  {
    id: 'nagpur',
    name: 'नागपूर विभाग (पूर्व विदर्भ)',
    districts: ['नागपूर', 'वर्धा', 'भंडारा', 'गोंदिया', 'चंद्रपूर', 'गडचिरोली'],
    totalMembers: '२८,०००+',
    chapters: '१०',
    desc: 'रघूजीराजे भोसले यांच्या पराक्रमाचा आणि मध्य भारत विस्ताराचा केंद्रबिंदू.'
  },
  {
    id: 'amravati',
    name: 'अमरावती विभाग (पश्चिम विदर्भ)',
    districts: ['अमरावती', 'अकोला', 'बुलढाणा', 'वाशीम', 'यवतमाळ'],
    totalMembers: '२२,०००+',
    chapters: '६',
    desc: 'राजमाता जिजाऊंचे जन्मस्थान सिंदखेड राजा आणि कापूस पट्टा.'
  }
];

export default function MaharashtraNetworkPage() {
  const [selectedDiv, setSelectedDiv] = useState('pune');

  const current = DIVISIONS.find(d => d.id === selectedDiv) || DIVISIONS[0];

  return (
    <div className="container py-5" style={{ padding: '40px 16px' }}>
      <div className="text-center mb-5" style={{ textAlign: 'center', marginBottom: '36px' }}>
        <span style={{ background: '#FFF3E0', color: 'var(--maroon-900)', padding: '4px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700 }}>
          🗺️ ३६ जिल्हे • ३५८ तालुके
        </span>
        <h1 style={{ fontSize: '2.4rem', color: 'var(--maroon-900, #D84315)', margin: '12px 0 8px' }}>
          महाराष्ट्र राज्य नेटवर्क (६ विभाग व ३६ जिल्हे)
        </h1>
        <p style={{ color: '#666', maxWidth: '650px', margin: '0 auto', fontSize: '1rem', lineHeight: 1.6 }}>
          अखिल भारतीय मराठा महासंघाची राज्यभरातील सक्रिय शाखा, जिल्हा कार्यकारिणी आणि व्यवसाय मंडळ रचना.
        </p>
      </div>

      {/* Division Selector Tabs */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '28px' }}>
        {DIVISIONS.map(d => (
          <button
            key={d.id}
            onClick={() => setSelectedDiv(d.id)}
            style={{
              padding: '10px 18px',
              borderRadius: '24px',
              border: selectedDiv === d.id ? '2px solid var(--saffron-500, #F4511E)' : '1px solid #DDD',
              background: selectedDiv === d.id ? '#FFF3E0' : '#FFF',
              color: selectedDiv === d.id ? 'var(--maroon-900)' : '#555',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '0.9rem',
              whiteSpace: 'nowrap'
            }}>
            {d.name.split(' (')[0]}
          </button>
        ))}
      </div>

      {/* Division Highlight Box */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E0E0E0', borderRadius: '16px', padding: '32px', boxShadow: '0 6px 20px rgba(0,0,0,0.04)', marginBottom: '36px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px', borderBottom: '1px solid #EEE', paddingBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.6rem', color: 'var(--maroon-900)', margin: '0 0 4px' }}>{current.name}</h2>
            <p style={{ color: '#666', fontSize: '0.95rem', margin: 0 }}>{current.desc}</p>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ textAlign: 'center', background: '#F9F9F9', padding: '8px 16px', borderRadius: '8px' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--maroon-900)' }}>{current.totalMembers}</div>
              <div style={{ fontSize: '0.75rem', color: '#666' }}>सदस्य</div>
            </div>
            <div style={{ textAlign: 'center', background: '#F9F9F9', padding: '8px 16px', borderRadius: '8px' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#2E7D32' }}>{current.chapters}</div>
              <div style={{ fontSize: '0.75rem', color: '#666' }}>मंडळे</div>
            </div>
          </div>
        </div>

        {/* District Badges */}
        <div>
          <h4 style={{ fontSize: '1rem', color: '#333', marginBottom: '12px' }}>या विभागातील समाविष्ट जिल्हे:</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {current.districts.map(dist => (
              <div key={dist} style={{ background: '#FFF3E0', border: '1px solid #FFE0B2', borderRadius: '8px', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📍</span>
                <strong style={{ color: 'var(--maroon-900)' }}>{dist} जिल्हा</strong>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
          <Link to="/directory" className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '0.88rem' }}>
            या भागातील सदस्य शोधा →
          </Link>
          <Link to="/contact" className="btn btn-outline" style={{ padding: '8px 18px', fontSize: '0.88rem' }}>
            जिल्हा कार्यकारिणी संपर्क
          </Link>
        </div>
      </div>
    </div>
  );
}
