import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CMDB from '../../services/cmdb';

const FALLBACK_CHAPTERS = [
  {
    id: 'CH01',
    slug: 'pune-shivneri-vyavsay-mandal',
    name: 'Pune Shivneri Business Mandal',
    marathiName: 'पुणे – शिवनेरी व्यवसाय मंडळ',
    city: 'पुणे',
    district: 'पुणे',
    territory: 'Pune West',
    meetingDay: 'बुधवार',
    meetingTime: 'सकाळी ७:३०',
    venue: 'शिवाजीनगर, पुणे',
    capacity: 32,
    openSeats: 11,
    visitors: 19,
    monthlyBusiness: 4875000,
    monthlyOpportunities: 47,
    totalClosedValue: 18500000
  },
  {
    id: 'CH02',
    slug: 'kolhapur-raigad-vyavsay-mandal',
    name: 'Kolhapur Raigad Business Mandal',
    marathiName: 'कोल्हापूर – रायगड व्यवसाय मंडळ',
    city: 'कोल्हापूर',
    district: 'कोल्हापूर',
    territory: 'Kolhapur City',
    meetingDay: 'शुक्रवार',
    meetingTime: 'सकाळी ८:००',
    venue: 'महाद्वार रोड, कोल्हापूर',
    capacity: 28,
    openSeats: 9,
    visitors: 12,
    monthlyBusiness: 2610000,
    monthlyOpportunities: 35,
    totalClosedValue: 12600000
  },
  {
    id: 'CH03',
    slug: 'nashik-jijau-vyavsay-sangam',
    name: 'Nashik Jijau Business Sangam',
    marathiName: 'नाशिक – जिजाऊ व्यवसाय संगम',
    city: 'नाशिक',
    district: 'नाशिक',
    territory: 'Nashik Central',
    meetingDay: 'मंगळवार',
    meetingTime: 'सकाळी ७:००',
    venue: 'गंगापूर रोड, नाशिक',
    capacity: 38,
    openSeats: 6,
    visitors: 23,
    monthlyBusiness: 6240000,
    monthlyOpportunities: 58,
    totalClosedValue: 22400000
  }
];

function formatCurrency(amount) {
  if (!amount) return '₹०';
  if (amount >= 10000000) {
    return '₹' + (amount / 10000000).toFixed(2) + ' कोटी';
  }
  if (amount >= 100000) {
    return '₹' + (amount / 100000).toFixed(2) + ' लाख';
  }
  return '₹' + amount.toLocaleString('en-IN');
}

export default function BusinessSangamPage() {
  const [chapters, setChapters] = useState(FALLBACK_CHAPTERS);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined' && window.CMDB && window.CMDB.getChapters) {
      const dbChapters = window.CMDB.getChapters();
      if (dbChapters && dbChapters.length > 0) {
        setChapters(dbChapters);
      }
    }
  }, []);

  const totals = chapters.reduce(
    (acc, ch) => {
      acc.members += (ch.capacity || 30) - (ch.openSeats || 0);
      acc.business += ch.totalClosedValue || 0;
      acc.opportunities += ch.monthlyOpportunities || 0;
      return acc;
    },
    { members: 0, business: 0, opportunities: 0 }
  );

  const filteredChapters = chapters.filter((ch) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    const hay = `${ch.marathiName || ''} ${ch.name || ''} ${ch.city || ''} ${ch.territory || ''}`.toLowerCase();
    return hay.includes(q);
  });

  return (
    <>
      {/* Topbar strip */}
      <div className="topbar">
        <div className="wrap topbar-inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 24px', fontSize: '0.82rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ color: 'var(--gold-400)', fontWeight: 700 }}>🚩 ओळखीतून संबंध · संबंधातून विश्वास</span>
            <span>|</span>
            <span>विश्वासातून व्यवसाय</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span>📞 व्यवसाय हेल्पलाईन: <strong>१८००-१२३-१६७४</strong></span>
            <span>|</span>
            <Link to="/contact" style={{ color: 'var(--gold-400)', textDecoration: 'underline' }}>
              संपर्क व मदत
            </Link>
          </div>
        </div>
      </div>

      {/* HERO BANNER */}
      <div className="hero short" style={{ minHeight: '340px', position: 'relative', overflow: 'hidden' }}>
        <img
          src="/assets/images/real-shaniwar-wada.jpg"
          alt="व्यवसाय संगम"
          className="hero-bg-img"
          style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.38)' }}
        />
        <div
          className="hero-overlay"
          style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 70% 30%, rgba(20,4,6,0.6), rgba(12,2,4,0.95) 85%)' }}
        />
        <div className="wrap hero-content" style={{ position: 'relative', zIndex: 2, maxWidth: '1320px', width: '100%', padding: '48px 24px', color: '#fff' }}>
          <div className="eyebrow" style={{ color: 'var(--gold-400)', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '1px' }}>
            Connect Maratha व्यवसाय संगम
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', margin: '10px 0 14px', fontFamily: 'Baloo 2', color: '#fff' }}>
            ओळखीतून संबंध • संबंधातून विश्वास • विश्वासातून व्यवसाय
          </h1>
          <p style={{ maxWidth: '65ch', color: 'var(--text-sec)', fontSize: '1.05rem', lineHeight: 1.6, margin: 0 }}>
            Marathi-first business networking system with स्थानिक व्यवसाय मंडळे, trackable व्यवसाय संधी, एक-ते-एक भेटी आणि demo CRM flows.
          </p>
          <div className="hero-ctas" style={{ marginTop: '24px', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <Link to="/meetings" className="btn btn-primary" style={{ padding: '10px 22px', fontWeight: 700, background: '#C73800', border: 'none' }}>
              ☕ १-टू-१ बैठका पोर्टल
            </Link>
            <Link to="/business/mandal" className="btn btn-primary" style={{ padding: '10px 22px', fontWeight: 700 }}>
              🏢 माझे व्यवसाय मंडळ
            </Link>
            <Link to="/business/directory" className="btn btn-outline" style={{ padding: '10px 22px', color: '#fff', borderColor: '#fff' }}>
              🤝 व्यवसाय संधी
            </Link>
            <Link to="/referrals" className="btn btn-outline" style={{ padding: '10px 22px', color: '#fff', borderColor: 'var(--gold-400)' }}>
              🔗 रेफरल ट्रॅकर
            </Link>
          </div>
        </div>
      </div>

      {/* SANGAM SHELL */}
      <div className="wrap sangam-shell" style={{ maxWidth: '1300px', margin: '0 auto', padding: '36px 24px' }}>
        {/* STAT STRIP */}
        <section style={{ marginBottom: '40px' }}>
          <div
            className="stat-strip"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
              background: 'var(--paper-2)',
              padding: '24px',
              borderRadius: '16px',
              border: '1px solid var(--border)'
            }}
          >
            <div className="cell" style={{ textAlign: 'center' }}>
              <div className="num" style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--saffron-600)', fontFamily: 'Baloo 2' }}>
                {chapters.length}
              </div>
              <div className="lbl" style={{ fontSize: '0.88rem', color: 'var(--text-sec)', fontWeight: 600 }}>
                सक्रिय व्यवसाय मंडळे
              </div>
            </div>
            <div className="cell" style={{ textAlign: 'center' }}>
              <div className="num" style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--gold-500)', fontFamily: 'Baloo 2' }}>
                {totals.members}
              </div>
              <div className="lbl" style={{ fontSize: '0.88rem', color: 'var(--text-sec)', fontWeight: 600 }}>
                सदस्य व्यावसायिक
              </div>
            </div>
            <div className="cell" style={{ textAlign: 'center' }}>
              <div className="num" style={{ fontSize: '2.4rem', fontWeight: 800, color: '#2E7D32', fontFamily: 'Baloo 2' }}>
                {formatCurrency(totals.business)}
              </div>
              <div className="lbl" style={{ fontSize: '0.88rem', color: 'var(--text-sec)', fontWeight: 600 }}>
                निर्माण झालेला व्यवसाय
              </div>
            </div>
            <div className="cell" style={{ textAlign: 'center' }}>
              <div className="num" style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--maroon-900)', fontFamily: 'Baloo 2' }}>
                {totals.opportunities}
              </div>
              <div className="lbl" style={{ fontSize: '0.88rem', color: 'var(--text-sec)', fontWeight: 600 }}>
                या महिन्यातील संधी
              </div>
            </div>
          </div>
        </section>

        {/* ACTIVE CHAPTERS SECTION */}
        <section style={{ marginBottom: '48px' }}>
          <div className="section-head" style={{ marginBottom: '20px' }}>
            <span className="tag" style={{ background: 'var(--saffron-600)', color: '#fff' }}>
              स्थानिक व्यवसाय नेटवर्क
            </span>
            <h2 style={{ fontSize: '2rem', margin: '8px 0', fontFamily: 'Baloo 2' }}>
              सक्रिय व्यवसाय मंडळे (Chapters)
            </h2>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="मंडळ / शहर शोधा..."
              style={{
                width: 'min(420px, 100%)',
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                fontSize: '0.92rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div className="grid grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            {filteredChapters.map((ch) => (
              <div
                key={ch.id}
                className="card profile-card"
                style={{
                  padding: '24px',
                  borderRadius: '16px',
                  border: '1px solid var(--border)',
                  background: 'var(--paper)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
                }}
              >
                <div>
                  <div style={{ fontSize: '2.4rem', marginBottom: '10px' }}>🏢</div>
                  <h3 style={{ fontSize: '1.3rem', margin: '0 0 6px', fontFamily: 'Baloo 2', color: 'var(--ink)' }}>
                    {ch.marathiName || ch.name}
                  </h3>
                  <div style={{ fontSize: '0.86rem', color: 'var(--text-sec)', marginBottom: '14px' }}>
                    {ch.territory} · {ch.meetingDay} · {ch.meetingTime}
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
                    <span className="tag" style={{ background: 'var(--paper-3)', color: 'var(--ink)', fontSize: '0.75rem' }}>
                      सदस्य: {(ch.capacity || 30) - (ch.openSeats || 0)}
                    </span>
                    <span className="tag" style={{ background: '#FFF3E0', color: '#E65100', fontSize: '0.75rem', fontWeight: 700 }}>
                      Open Seats: {ch.openSeats || 0}
                    </span>
                    <span className="tag" style={{ background: '#E8F5E9', color: '#2E7D32', fontSize: '0.75rem' }}>
                      Visitors: {ch.visitors || 0}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.88rem', color: 'var(--text-sec)', margin: '0 0 16px', lineHeight: 1.5 }}>
                    या महिन्यातील व्यवसाय: <strong style={{ color: 'var(--ink)' }}>{formatCurrency(ch.monthlyBusiness)}</strong>
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', width: '100%', marginTop: '10px' }}>
                  <Link
                    to={`/business/mandal?chapter=${encodeURIComponent(ch.id)}`}
                    className="btn btn-primary"
                    style={{ flex: 1, textAlign: 'center', justifyContent: 'center', padding: '10px 14px', fontSize: '0.85rem', fontWeight: 700 }}
                  >
                    माझे मंडळ दृश्य
                  </Link>
                  <Link
                    to={`/business/directory?chapter=${encodeURIComponent(ch.id)}`}
                    className="btn btn-outline"
                    style={{ flex: 1, textAlign: 'center', justifyContent: 'center', padding: '10px 14px', fontSize: '0.85rem' }}
                  >
                    तपशील पहा
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* WORKFLOW EXPLANATION */}
        <section style={{ borderTop: '1px solid var(--border)', paddingTop: '40px' }}>
          <div className="section-head" style={{ marginBottom: '24px', textAlign: 'center' }}>
            <span className="tag" style={{ background: 'var(--maroon-900)', color: 'var(--gold-400)' }}>
              Workflow
            </span>
            <h2 style={{ fontSize: '2rem', margin: '8px 0', fontFamily: 'Baloo 2' }}>
              व्यवसाय संगम कसे काम करते?
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <div className="card" style={{ padding: '24px', borderRadius: '14px', borderTop: '3px solid var(--saffron-600)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🏢</div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', fontFamily: 'Baloo 2' }}>व्यवसाय मंडळ</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-sec)', lineHeight: 1.6, margin: 0 }}>
                शहरनिहाय विश्वासाधारित chapter system with exclusive seat lockout logic to eliminate competition.
              </p>
            </div>
            <div className="card" style={{ padding: '24px', borderRadius: '14px', borderTop: '3px solid var(--gold-500)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🤝</div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', fontFamily: 'Baloo 2' }}>व्यवसाय संधी</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-sec)', lineHeight: 1.6, margin: 0 }}>
                Trackable opportunity CRM with quality grades, follow-up scheduler and closed deal value metrics.
              </p>
            </div>
            <div className="card" style={{ padding: '24px', borderRadius: '14px', borderTop: '3px solid #2E7D32' }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>👥</div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', fontFamily: 'Baloo 2' }}>एक-ते-एक भेट</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-sec)', lineHeight: 1.6, margin: 0 }}>
                Collaboration building meetings for deeper understanding, trust verification, and high-value introductions.
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
