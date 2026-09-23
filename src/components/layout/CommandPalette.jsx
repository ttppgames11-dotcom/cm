import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const SEARCHABLE_ITEMS = [
  { title: 'छत्रपती शिवाजी महाराज (चरित्र व कार्य)', path: '/history/shivaji-maharaj', category: 'इतिहास' },
  { title: 'छत्रपती संभाजी महाराज (बलिदान व पराक्रम)', path: '/history/sambhaji-maharaj', category: 'इतिहास' },
  { title: 'राजमाता जिजाऊ आऊसाहेब', path: '/history/rajmata-jijau', category: 'इतिहास' },
  { title: 'श्रीमंत बाजीराव पेशवे (रणसंग्राम व अजिंक्य सेनापती)', path: '/history/bajirao-peshwa', category: 'इतिहास' },
  { title: 'किल्ले रायगड (राजधानी)', path: '/forts/raigad', category: 'किल्ले' },
  { title: 'किल्ले राजगड (मराठा साम्राज्याची पहिली राजधानी)', path: '/forts/rajgad', category: 'किल्ले' },
  { title: 'किल्ले शिवनेरी (जन्मस्थान)', path: '/forts/shivneri', category: 'किल्ले' },
  { title: 'किल्ले प्रतापगड', path: '/forts/pratapgad', category: 'किल्ले' },
  { title: 'महाराष्ट्राचे ३५०+ किल्ले व सह्याद्री नकाशा', path: '/forts', category: 'किल्ले' },
  { title: 'महाराष्ट्र राज्य नेटवर्क (६ विभाग व ३६ जिल्हे)', path: '/network', category: 'नेटवर्क' },
  { title: 'व्यवसाय संगम व उद्योजक डिरेक्टरी', path: '/business/directory', category: 'व्यवसाय' },
  { title: 'संदर्भ देवाणघेवाण (Referral Pipeline)', path: '/referrals', category: 'व्यवसाय' },
  { title: 'नवीन संदर्भ नोंदवा (Create Referral)', path: '/referrals/create', category: 'व्यवसाय' },
  { title: '१-टू-१ विश्वास भेटी (One-to-One Meetings)', path: '/business/meetings', category: 'व्यवसाय' },
  { title: 'माझे व्यवसाय मंडळ (My Chapter)', path: '/business/mandal', category: 'व्यवसाय' },
  { title: 'डिजिटल स्मार्ट आयडी कार्ड', path: '/card', category: 'सदस्य' },
  { title: 'सदस्य नोंदणी व ऑनबोर्डिंग', path: '/register', category: 'सदस्य' },
  { title: 'सदस्य लॉगिन', path: '/login', category: 'सदस्य' },
  { title: 'सदस्य डॅशबोर्ड', path: '/dashboard', category: 'सदस्य' },
  { title: 'दुर्ग संवर्धन निधी (Donation)', path: '/donation', category: 'सेवा' },
  { title: 'अ‍ॅडमिन ईआरपी कन्सोल', path: '/admin', category: 'प्रशासन' },
  { title: 'स्वराज्य इतिहास महाक्विझ (Maratha History Quiz)', path: '/quiz', category: 'इतिहास' },
  { title: 'सीईओ एक्झिक्युटिव्ह डॅशबोर्ड (Scope Engine)', path: '/ceo-dashboard', category: 'प्रशासन' },
  { title: 'Connect Maratha संस्था परिचय', path: '/about', category: 'संस्था' }
];

export default function CommandPalette({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const filtered = query.trim()
    ? SEARCHABLE_ITEMS.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) || 
        item.category.toLowerCase().includes(query.toLowerCase())
      )
    : SEARCHABLE_ITEMS.slice(0, 8);

  const handleSelect = (item) => {
    navigate(item.path);
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filtered.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      e.preventDefault();
      handleSelect(filtered[selectedIndex]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: '10vh' }}
      onClick={onClose}>
      <div 
        style={{ width: '90%', maxWidth: '560px', background: '#FFFFFF', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.3)', border: '2px solid var(--saffron-500, #F4511E)' }}
        onClick={(e) => e.stopPropagation()}>
        
        {/* Search Input */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid #E0E0E0', gap: '10px' }}>
          <span style={{ fontSize: '1.2rem' }}>🔍</span>
          <input 
            ref={inputRef}
            type="text"
            placeholder="इतिहास, किल्ले, व्यवसाय, सदस्य शोधा... (उदा. रायगड, शिवराय, CA)"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            onKeyDown={handleKeyDown}
            style={{ width: '100%', border: 'none', outline: 'none', fontSize: '1.05rem', fontFamily: 'inherit' }}
          />
          <button 
            onClick={onClose}
            style={{ background: '#EEEEEE', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '0.75rem', cursor: 'pointer', color: '#666' }}>
            ESC
          </button>
        </div>

        {/* Results List */}
        <div style={{ maxHeight: '360px', overflowY: 'auto', padding: '8px 0' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#888' }}>
              काहीही सापडले नाही. कृपया वेगळा शब्द वापरून शोधा.
            </div>
          ) : (
            filtered.map((item, idx) => (
              <div 
                key={item.path}
                onClick={() => handleSelect(item)}
                onMouseEnter={() => setSelectedIndex(idx)}
                style={{
                  padding: '12px 18px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  background: idx === selectedIndex ? 'rgba(244, 81, 30, 0.1)' : 'transparent',
                  borderLeft: idx === selectedIndex ? '4px solid var(--saffron-500, #F4511E)' : '4px solid transparent'
                }}>
                <div>
                  <div style={{ fontWeight: 600, color: idx === selectedIndex ? 'var(--maroon-900, #D84315)' : '#333' }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#888' }}>
                    {item.path}
                  </div>
                </div>
                <span style={{ fontSize: '0.75rem', background: '#F5F5F5', padding: '3px 8px', borderRadius: '4px', color: '#555' }}>
                  {item.category}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Footer Hint */}
        <div style={{ padding: '8px 18px', background: '#FAFAFA', borderTop: '1px solid #EEE', display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#777' }}>
          <span>निवडण्यासाठी <strong>↑</strong> <strong>↓</strong> व <strong>Enter</strong> दाबा</span>
          <span>बाहेर पडण्यासाठी <strong>ESC</strong></span>
        </div>
      </div>
    </div>
  );
}
