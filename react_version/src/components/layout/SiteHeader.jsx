import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function SiteHeader({ onOpenSearch }) {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const navigate = useNavigate();

  const handleNavClick = () => {
    setActiveMenu(null);
    setMobileOpen(false);
  };

  return (
    <header className="header" style={{ position: 'sticky', top: 0, zIndex: 1000, background: 'var(--paper, #FFFFFF)', borderBottom: '2px solid var(--saffron-500, #F4511E)' }}>
      {/* Topbar */}
      <div className="topbar" style={{ background: 'var(--maroon-950, #C73800)', color: '#fff', fontSize: '0.85rem', padding: '6px 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <span>🚩 <strong>अखिल भारतीय मराठा महासंघ</strong> — अधिकृत डिजिटल महाव्यासपीठ</span>
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <span>📞 २४/७ हेल्पलाइन: <strong>१८००-२३३-१९८१</strong></span>
            <button 
              onClick={onOpenSearch}
              style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', padding: '2px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>
              🔍 शोधा (Ctrl+K)
            </button>
          </div>
        </div>
      </div>

      {/* Main Header / Brand */}
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: 'inherit' }}>
          <img src="/assets/images/logo.png" alt="Connect Maratha Logo" style={{ height: '52px', width: 'auto' }} />
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--maroon-900, #D84315)', lineHeight: 1.1 }}>
              कनेक्ट मराठा
            </div>
            <div style={{ fontSize: '0.78rem', color: '#666', fontWeight: 600 }}>
              CONNECT MARATHA — एकी, प्रगती आणि वारसा
            </div>
          </div>
        </Link>

        {/* Header Actions */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Link to="/card" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', fontSize: '0.85rem' }}>
            <span>🪪</span>
            <span className="hide-mobile">स्मार्ट कार्ड</span>
          </Link>

          {user && user.id ? (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Link to="/dashboard" className="btn btn-primary" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
                👤 {user.name || 'डॅशबोर्ड'}
              </Link>
              <button onClick={logout} className="btn btn-outline" style={{ padding: '8px 10px', fontSize: '0.85rem' }} title="बाहेर पडा">
                🚪
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <Link to="/login" className="btn btn-outline" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
                लॉगिन
              </Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
                नोंदणी
              </Link>
            </div>
          )}

          {/* Hamburger for Mobile */}
          <button 
            className="mobile-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{ display: 'none', background: 'none', border: '1px solid #ccc', padding: '6px 10px', borderRadius: '6px', fontSize: '1.2rem', cursor: 'pointer' }}
            aria-label="Toggle Menu">
            ☰
          </button>
        </div>
      </div>

      {/* 4-Pillar Mega Navigation Bar */}
      <nav className="desktop-nav" style={{ background: 'var(--maroon-900, #D84315)', color: '#fff' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
          <div 
            className="nav-dropdown"
            onMouseEnter={() => setActiveMenu('history')}
            onMouseLeave={() => setActiveMenu(null)}
            style={{ position: 'relative' }}>
            <Link to="/history" className="nav-link" style={{ display: 'block', padding: '12px 16px', color: '#fff', textDecoration: 'none', fontWeight: 600 }}>
              इतिहास व वारसा ▾
            </Link>
            {activeMenu === 'history' && (
              <div className="mega-menu" style={{ position: 'absolute', top: '100%', left: 0, width: '450px', background: '#fff', color: '#333', boxShadow: '0 8px 24px rgba(0,0,0,0.15)', borderRadius: '0 0 8px 8px', padding: '16px', zIndex: 1001, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <h4 style={{ color: 'var(--maroon-900)', borderBottom: '1px solid #eee', paddingBottom: '4px', marginBottom: '8px' }}>🚩 छत्रपती व पराक्रमी</h4>
                  <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.9rem' }}>
                    <li><Link to="/history/shivaji-maharaj" onClick={handleNavClick}>छत्रपती शिवाजी महाराज</Link></li>
                    <li><Link to="/history/sambhaji-maharaj" onClick={handleNavClick}>छत्रपती संभाजी महाराज</Link></li>
                    <li><Link to="/history/rajmata-jijau" onClick={handleNavClick}>राजमाता जिजाऊ</Link></li>
                    <li><Link to="/history/bajirao-peshwa" onClick={handleNavClick}>श्रीमंत बाजीराव पेशवे</Link></li>
                    <li><Link to="/history/warriors" onClick={handleNavClick}>शूर मावळे व सेनापती</Link></li>
                  </ul>
                </div>
                <div>
                  <h4 style={{ color: 'var(--maroon-900)', borderBottom: '1px solid #eee', paddingBottom: '4px', marginBottom: '8px' }}>🏰 किल्ले व संशोधन</h4>
                  <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.9rem' }}>
                    <li><Link to="/forts" onClick={handleNavClick}>महाराष्ट्राचे ३५०+ किल्ले</Link></li>
                    <li><Link to="/history/battles" onClick={handleNavClick}>ऐतिहासिक रणसंग्राम</Link></li>
                    <li><Link to="/history/navy" onClick={handleNavClick}>मराठा आरमार</Link></li>
                    <li><Link to="/history/granthalaya" onClick={handleNavClick}>मराठा डिजिटल ग्रंथालय</Link></li>
                    <li><Link to="/history/dates" onClick={handleNavClick}>ऐतिहासिक दिनविशेष</Link></li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          <div 
            className="nav-dropdown"
            onMouseEnter={() => setActiveMenu('network')}
            onMouseLeave={() => setActiveMenu(null)}
            style={{ position: 'relative' }}>
            <Link to="/network" className="nav-link" style={{ display: 'block', padding: '12px 16px', color: '#fff', textDecoration: 'none', fontWeight: 600 }}>
              महाराष्ट्र नेटवर्क ▾
            </Link>
            {activeMenu === 'network' && (
              <div className="mega-menu" style={{ position: 'absolute', top: '100%', left: 0, width: '380px', background: '#fff', color: '#333', boxShadow: '0 8px 24px rgba(0,0,0,0.15)', borderRadius: '0 0 8px 8px', padding: '16px', zIndex: 1001 }}>
                <h4 style={{ color: 'var(--maroon-900)', borderBottom: '1px solid #eee', paddingBottom: '4px', marginBottom: '8px' }}>🗺️ विभाग व जिल्हे (३६ जिल्हे)</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.9rem' }}>
                  <Link to="/network" onClick={handleNavClick}>पुणे विभाग (५ जिल्हे)</Link>
                  <Link to="/network" onClick={handleNavClick}>कोकण विभाग (७ जिल्हे)</Link>
                  <Link to="/network" onClick={handleNavClick}>छत्रपती संभाजीनगर (८)</Link>
                  <Link to="/network" onClick={handleNavClick}>नाशिक विभाग (५ जिल्हे)</Link>
                  <Link to="/network" onClick={handleNavClick}>नागपूर विभाग (६ जिल्हे)</Link>
                  <Link to="/network" onClick={handleNavClick}>अमरावती विभाग (५)</Link>
                </div>
                <div style={{ borderTop: '1px solid #eee', marginTop: '10px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <Link to="/directory" onClick={handleNavClick}>👥 सदस्य शोधा</Link>
                  <Link to="/governance" onClick={handleNavClick}>🏛️ महासंघ रचना</Link>
                </div>
              </div>
            )}
          </div>

          <div 
            className="nav-dropdown"
            onMouseEnter={() => setActiveMenu('sangam')}
            onMouseLeave={() => setActiveMenu(null)}
            style={{ position: 'relative' }}>
            <Link to="/sangam" className="nav-link" style={{ display: 'block', padding: '12px 16px', color: '#fff', textDecoration: 'none', fontWeight: 600 }}>
              व्यवसाय संगम ▾
            </Link>
            {activeMenu === 'sangam' && (
              <div className="mega-menu" style={{ position: 'absolute', top: '100%', left: 0, width: '400px', background: '#fff', color: '#333', boxShadow: '0 8px 24px rgba(0,0,0,0.15)', borderRadius: '0 0 8px 8px', padding: '16px', zIndex: 1001 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.9rem' }}>
                  <div>
                    <h4 style={{ color: 'var(--maroon-900)', borderBottom: '1px solid #eee', paddingBottom: '4px', marginBottom: '6px' }}>💼 व्यवसाय विकास</h4>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                      <li><Link to="/business/directory" onClick={handleNavClick}>उद्योजक डिरेक्टरी</Link></li>
                      <li><Link to="/referrals" onClick={handleNavClick}>संदर्भ देवाणघेवाण</Link></li>
                      <li><Link to="/business/meetings" onClick={handleNavClick}>१-टू-१ विश्वास भेटी</Link></li>
                      <li><Link to="/business/opportunities" onClick={handleNavClick}>व्यवसाय संधी</Link></li>
                    </ul>
                  </div>
                  <div>
                    <h4 style={{ color: 'var(--maroon-900)', borderBottom: '1px solid #eee', paddingBottom: '4px', marginBottom: '6px' }}>🏛️ मंडळ नेटवर्क</h4>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                      <li><Link to="/business/mandal" onClick={handleNavClick}>माझे व्यवसाय मंडळ</Link></li>
                      <li><Link to="/business/list" onClick={handleNavClick}>व्यवसाय नोंदवा</Link></li>
                      <li><Link to="/business/membership-application" onClick={handleNavClick}>मंडळ सदस्यत्व अर्ज</Link></li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Link to="/community" className="nav-link" style={{ display: 'block', padding: '12px 16px', color: '#fff', textDecoration: 'none', fontWeight: 600 }}>
            समुदाय
          </Link>
          <Link to="/events" className="nav-link" style={{ display: 'block', padding: '12px 16px', color: '#fff', textDecoration: 'none', fontWeight: 600 }}>
            कार्यक्रम
          </Link>
          <Link to="/services" className="nav-link" style={{ display: 'block', padding: '12px 16px', color: '#fff', textDecoration: 'none', fontWeight: 600 }}>
            सेवा व करिअर
          </Link>
          <Link to="/about" className="nav-link" style={{ display: 'block', padding: '12px 16px', color: '#fff', textDecoration: 'none', fontWeight: 600 }}>
            महासंघ परिचय
          </Link>

          {/* Admin link if user has admin scope or direct link */}
          <Link to="/admin" className="nav-link" style={{ display: 'block', padding: '12px 16px', color: '#FFE082', textDecoration: 'none', fontWeight: 700, marginLeft: 'auto' }}>
            ⚙️ अ‍ॅडमिन कन्सोल
          </Link>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div style={{ background: '#fff', borderBottom: '2px solid var(--saffron-500)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Link to="/" onClick={handleNavClick}>🏠 मुख्यपृष्ठ</Link>
          <Link to="/history" onClick={handleNavClick}>🚩 इतिहास व वारसा</Link>
          <Link to="/forts" onClick={handleNavClick}>🏰 किल्ले व सह्याद्री</Link>
          <Link to="/network" onClick={handleNavClick}>🗺️ महाराष्ट्र नेटवर्क (३६ जिल्हे)</Link>
          <Link to="/sangam" onClick={handleNavClick}>💼 व्यवसाय संगम</Link>
          <Link to="/referrals" onClick={handleNavClick}>🤝 व्यवसाय संदर्भ</Link>
          <Link to="/community" onClick={handleNavClick}>👥 समुदाय व संवाद</Link>
          <Link to="/events" onClick={handleNavClick}>📅 कार्यक्रम</Link>
          <Link to="/services" onClick={handleNavClick}>🛠️ सेवा व करिअर</Link>
          <Link to="/card" onClick={handleNavClick}>🪪 डिजिटल स्मार्ट कार्ड</Link>
          <Link to="/admin" onClick={handleNavClick}>⚙️ अ‍ॅडमिन ईआरपी</Link>
        </div>
      )}
    </header>
  );
}
