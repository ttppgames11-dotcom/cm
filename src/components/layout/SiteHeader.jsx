import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function SiteHeader({ onOpenSearch }) {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLinkClick = () => {
    setMobileOpen(false);
  };

  return (
    <>
      {/* ========== TOPBAR ========== */}
      <div className="site-topbar">
        <div className="site-topbar-inner">
          <div className="left-info">
            <span>🚩 <strong>जय जिजाऊ · जय शिवराय · जय शंभूराजे</strong></span>
            <span>|</span>
            <span>Connect Maratha डिजिटल व्यासपीठ</span>
          </div>
          <div className="right-info">
            <span>📞 हेल्पलाईन: <strong>१८००-१२३-१६७४</strong></span>
            <span>|</span>
            <Link to="/about">संस्था परिचय</Link>
            <span>|</span>
            <Link to="/governance">DPDP धोरण</Link>
          </div>
        </div>
      </div>

      {/* ========== HEADER ========== */}
      <header className="site-header">
        <div className="site-header-inner">
          <Link to="/" className="brand-desktop" onClick={handleLinkClick}>
            <img src="/assets/images/logo.png" alt="Connect Maratha Logo" className="brand-logo" />
            <div className="brand-titles">
              <div className="brand-main">
                <span className="en">CONNECT</span>
                <span className="mr">मराठा</span>
              </div>
              <span className="brand-sub">भूतकाळातून प्रेरणा • वर्तमानात जोडणी • भविष्यासाठी उभारणी</span>
            </div>
          </Link>

          <nav className={`desktop-nav ${mobileOpen ? 'mobile-nav-active' : ''}`}>
            {/* Pillar 1: इतिहास व वारसा */}
            <div className="nav-item-has-mega">
              <Link to="/history" onClick={handleLinkClick}>⚔️ इतिहास व वारसा ▾</Link>
              <div className="mega-menu">
                <div className="mega-menu-grid">
                  <div className="mega-col">
                    <div className="mega-col-title">🚩 मराठा शौर्यगाथा</div>
                    <Link to="/history" onClick={handleLinkClick}>📜 मराठा कालपट (१६३०-१८१८)</Link>
                    <Link to="/history/battles" onClick={handleLinkClick}>⚔️ प्रमुख ७ रणांगणे व व्यूहरचना</Link>
                    <Link to="/forts" onClick={handleLinkClick}>🏰 सह्याद्रीचे गड-किल्ले (३५०+)</Link>
                    <Link to="/history/navy" onClick={handleLinkClick}>⚓ मराठा आरमार व जलदुर्ग</Link>
                    <Link to="/quiz" onClick={handleLinkClick} style={{ color: 'var(--maroon-800)', fontWeight: 700 }}>🎯 स्वराज्य इतिहास महाक्विझ</Link>
                  </div>
                  <div className="mega-col">
                    <div className="mega-col-title">🕯️ स्मृती व ग्रंथ संपदा</div>
                    <Link to="/history/balidan-maas" onClick={handleLinkClick}>🕯️ धर्मवीर बलिदान मास स्मरण</Link>
                    <Link to="/history/granthalaya" onClick={handleLinkClick}>📚 मराठा ग्रंथालय व बखरी</Link>
                    <Link to="/history/warriors" onClick={handleLinkClick}>👑 ९६ कुळे व सरदार घराणी</Link>
                    <Link to="/culture" onClick={handleLinkClick}>🏷️ राजमुद्रा व मराठा चिन्हे</Link>
                  </div>
                  <div className="mega-col">
                    <div className="mega-col-title">✊ समाज लढा व वारसा</div>
                    <Link to="/history/movements" onClick={handleLinkClick}>🚩 मराठा क्रांती मूक मोर्चे (५८+)</Link>
                    <Link to="/history/dates" onClick={handleLinkClick}>📅 ऐतिहासिक दिनविशेष</Link>
                    <Link to="/gallery" onClick={handleLinkClick}>🖼️ आपुला महाराष्ट्र छायाचित्र दालन</Link>
                    <Link to="/history/shivaji-maharaj" onClick={handleLinkClick}>📖 विशेष संशोधन लेख</Link>
                  </div>
                  <div className="mega-col">
                    <div className="mega-col-title">🌟 गौरव व अचीव्हर्स</div>
                    <Link to="/about" onClick={handleLinkClick}>🏆 राष्ट्रीय मराठा गौरव</Link>
                    <Link to="/about" onClick={handleLinkClick}>🏛️ कनेक्ट मराठा परिचय व सनद</Link>
                    <Link to="/governance" onClick={handleLinkClick}>🎯 व्हिजन, धोरण व DPDP</Link>
                    <Link to="/governance" onClick={handleLinkClick}>🧭 मास्टर ब्लूप्रिंट (५० विभाग)</Link>
                    <Link to="/roles-matrix" onClick={handleLinkClick}>⚖️ भूमिका व पात्रता मॅट्रिक्स</Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Pillar: संस्कृती व वारसा ज्ञानकोश */}
            <div className="nav-item-has-mega">
              <Link to="/culture" onClick={handleLinkClick}>🏛️ संस्कृती व ज्ञानकोश ▾</Link>
              <div className="mega-menu">
                <div className="mega-menu-grid">
                  <div className="mega-col">
                    <div className="mega-col-title">🌍 सांस्कृतिक विविधता व बोली</div>
                    <Link to="/culture" onClick={handleLinkClick}>🗺️ ८ प्रादेशिक सांस्कृतिक प्रोफाइल</Link>
                    <Link to="/culture/dialects" onClick={handleLinkClick}>🗣️ महाराष्ट्राच्या बोली व उच्चार</Link>
                    <Link to="/culture/food" onClick={handleLinkClick}>🍲 खाद्यसंस्कृती व उगम इतिहास</Link>
                    <Link to="/culture/symbols" onClick={handleLinkClick}>🏷️ राजमुद्रा व मराठा चिन्हे</Link>
                  </div>
                  <div className="mega-col">
                    <div className="mega-col-title">🛕 ग्रामदैवत, जत्रा व लोककला</div>
                    <Link to="/culture/gramdevat-jatra" onClick={handleLinkClick}>🛕 ग्रामदैवत व कुलदैवत ज्ञानकार्ड</Link>
                    <Link to="/jatra" onClick={handleLinkClick}>🎪 जत्रा व वार्षिक यात्रा दिनदर्शिका</Link>
                    <Link to="/culture/gramdevat-jatra" onClick={handleLinkClick}>🎭 दशावतार, तमाशा व पोवाडा</Link>
                    <Link to="/culture/gramdevat-jatra" onClick={handleLinkClick}>🏏 विटी-दांडू व पारंपरिक खेळ</Link>
                  </div>
                  <div className="mega-col">
                    <div className="mega-col-title">🗺️ वारसा नकाशा व नॉलेज ग्राफ</div>
                    <Link to="/culture/heritage-map" onClick={handleLinkClick}>🗺️ बहुस्तरीय परस्परसंवादी नकाशा</Link>
                    <Link to="/history/knowledge-graph" onClick={handleLinkClick}>⚡ घटना ↔ स्थळे नॉलेज ग्राफ</Link>
                    <Link to="/temples" onClick={handleLinkClick}>🛕 प्रमुख मंदिरे व शक्तिपीठे</Link>
                    <Link to="/forts" onClick={handleLinkClick}>🏰 सह्याद्रीचे ३५०+ गडकिल्ले</Link>
                  </div>
                  <div className="mega-col">
                    <div className="mega-col-title">📚 संदर्भ चौकट व समुदाय</div>
                    <Link to="/community/oral-history" onClick={handleLinkClick}>✍️ मौखिक इतिहास संकलन (Tier 4)</Link>
                    <Link to="/history/granthalaya" onClick={handleLinkClick}>📚 पुराभिलेख व ऐतिहासिक ग्रंथालय</Link>
                    <Link to="/history/dates" onClick={handleLinkClick}>📅 ऐतिहासिक दिनविशेष</Link>
                    <Link to="/gallery" onClick={handleLinkClick}>🖼️ आपुला महाराष्ट्र छायाचित्र दालन</Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Pillar 2: व्यवसाय व संधी */}
            <div className="nav-item-has-mega">
              <Link to="/sangam" onClick={handleLinkClick}>💼 व्यवसाय व संधी ▾</Link>
              <div className="mega-menu">
                <div className="mega-menu-grid">
                  <div className="mega-col">
                    <div className="mega-col-title">🤝 बिझनेस संगम</div>
                    <Link to="/business/directory" onClick={handleLinkClick}>🏢 व्यवसाय निर्देशिका</Link>
                    <Link to="/sangam" onClick={handleLinkClick}>🤝 चॅप्टर्स व लीडरशिप</Link>
                    <Link to="/jobs" onClick={handleLinkClick}>🛠️ सेवा बुकिंग विझार्ड</Link>
                  </div>
                  <div className="mega-col">
                    <div className="mega-col-title">📈 उद्योग व नेटवर्किंग</div>
                    <Link to="/business/directory" onClick={handleLinkClick}>📈 व्यवसाय संधी व सौदे</Link>
                    <Link to="/referrals" onClick={handleLinkClick}>🔗 रेफरल व व्यवसाय देवाणघेवाण</Link>
                    <Link to="/meetings" onClick={handleLinkClick}>☕ 1-to-1 व्यावसायिक बैठका</Link>
                  </div>
                  <div className="mega-col">
                    <div className="mega-col-title">💼 रोजगार व शिक्षण</div>
                    <Link to="/jobs" onClick={handleLinkClick}>💼 रोजगार व करिअर केंद्र</Link>
                    <Link to="/jobs" onClick={handleLinkClick}>🎓 उच्च शिक्षण व शिष्यवृत्ती</Link>
                    <Link to="/directory" onClick={handleLinkClick}>👨‍💼 प्रोफेशनेल्स डिरेक्टरी</Link>
                  </div>
                  <div className="mega-col">
                    <div className="mega-col-title">🛠️ उद्योग, बँक व डेव्हलपर्स</div>
                    <Link to="/bank" onClick={handleLinkClick}>🏦 मराठा बँक व वित्त संस्था</Link>
                    <Link to="/builders" onClick={handleLinkClick}>🏗️ मराठा बिल्डर्स व डेव्हलपर्स</Link>
                    <Link to="/dairy" onClick={handleLinkClick}>🥛 मराठा दूध व संकलन केंद्र</Link>
                    <Link to="/manufacturers" onClick={handleLinkClick}>🏭 मराठा मॅन्युफॅक्चरर्स</Link>
                    <Link to="/business/directory" onClick={handleLinkClick}>🚀 B2B संधी व सौदे</Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Pillar 3: समाज व उपक्रम */}
            <div className="nav-item-has-mega">
              <Link to="/community" onClick={handleLinkClick}>🚩 समाज व उपक्रम ▾</Link>
              <div className="mega-menu">
                <div className="mega-menu-grid">
                  <div className="mega-col">
                    <div className="mega-col-title">👥 समुदाय व कल्याण मंच</div>
                    <Link to="/community" onClick={handleLinkClick}>💬 मराठा डिजिटल कम्युनिटी</Link>
                    <Link to="/women" onClick={handleLinkClick}>🌸 महिला सक्षमीकरण कक्ष</Link>
                    <Link to="/blood" onClick={handleLinkClick}>🩸 २४×७ रक्त मदत केंद्र</Link>
                    <Link to="/matrimony" onClick={handleLinkClick}>💍 मराठा वधू-वर सूचक केंद्र</Link>
                  </div>
                  <div className="mega-col">
                    <div className="mega-col-title">🤝 संघटना व नेते</div>
                    <Link to="/organizations" onClick={handleLinkClick}>🤝 मराठा सामाजिक संघटना</Link>
                    <Link to="/political" onClick={handleLinkClick}>🏛️ राजकीय नेतृत्व व पक्ष</Link>
                    <Link to="/social-workers" onClick={handleLinkClick}>🤝 मराठा निष्ठावंत समाजसेवक</Link>
                    <Link to="/officers" onClick={handleLinkClick}>⭐ मराठा सनदी अधिकारी (IAS/IPS)</Link>
                  </div>
                  <div className="mega-col">
                    <div className="mega-col-title">🎭 कला, साहित्य व मीडिया</div>
                    <Link to="/doctors" onClick={handleLinkClick}>👨‍⚕️ मराठा तज्ज्ञ डॉक्टर्स</Link>
                    <Link to="/artists" onClick={handleLinkClick}>🎭 कलाकार, गायक व दिग्दर्शक</Link>
                    <Link to="/books" onClick={handleLinkClick}>📚 मराठा ग्रंथ व साहित्य</Link>
                    <Link to="/movies" onClick={handleLinkClick}>🎬 मराठी दर्जेदार चित्रपट</Link>
                    <Link to="/speakers" onClick={handleLinkClick}>🎙️ प्रेरक वक्ते व मार्गदर्शक</Link>
                    <Link to="/maratha-news" onClick={handleLinkClick}>📺 मराठा न्यूज व ई-पेपर्स</Link>
                  </div>
                  <div className="mega-col">
                    <div className="mega-col-title">🏛️ संस्था व प्रशासन</div>
                    <Link to="/about" onClick={handleLinkClick}>🏛️ संस्था सनद व मार्गदर्शक मंडळ</Link>
                    <Link to="/governance" onClick={handleLinkClick}>⚖️ संविधान व DPDP २०२३</Link>
                    <Link to="/contact" onClick={handleLinkClick}>☎️ संपर्क व तक्रार निवारण</Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Pillar 4: महाराष्ट्र नेटवर्क */}
            <div className="nav-item-has-mega">
              <Link to="/network" onClick={handleLinkClick}>🗺️ महाराष्ट्र नेटवर्क ▾</Link>
              <div className="mega-menu">
                <div className="mega-menu-grid">
                  <div className="mega-col">
                    <div className="mega-col-title">🏛️ पश्चिम व कोकण विभाग</div>
                    <Link to="/network" onClick={handleLinkClick}>🏛️ पुणे विभाग (पुणे, सातारा, कोल्हापूर)</Link>
                    <Link to="/network" onClick={handleLinkClick}>🌊 कोकण विभाग (मुंबई, ठाणे, पालघर)</Link>
                    <Link to="/network" onClick={handleLinkClick}>⛵ रायगड, रत्नागिरी, सिंधुदुर्ग</Link>
                    <Link to="/network" onClick={handleLinkClick}>🗺️ संपूर्ण राज्य शाखा नकाशा</Link>
                  </div>
                  <div className="mega-col">
                    <div className="mega-col-title">🌄 मराठवाडा व उत्तर महाराष्ट्र</div>
                    <Link to="/network" onClick={handleLinkClick}>🌄 छ. संभाजीनगर, जालना, बीड</Link>
                    <Link to="/network" onClick={handleLinkClick}>🌾 नाशिक, अहमदनगर, जळगाव, धुळे</Link>
                    <Link to="/network" onClick={handleLinkClick}>🚩 धाराशिव, लातूर, नांदेड, परभणी</Link>
                    <Link to="/directory" onClick={handleLinkClick}>👥 विभागीय संपर्क व प्रतिनिधी</Link>
                  </div>
                  <div className="mega-col">
                    <div className="mega-col-title">🌿 विदर्भ व सीमावर्ती भाग</div>
                    <Link to="/network" onClick={handleLinkClick}>🌿 अमरावती, अकोला, बुलढाणा, यवतमाळ</Link>
                    <Link to="/network" onClick={handleLinkClick}>🐅 नागपूर, वर्धा, चंद्रपूर, गडचिरोली</Link>
                    <Link to="/network" onClick={handleLinkClick}>🚩 बेळगाव, कारवार सीमावर्ती शाखा</Link>
                    <Link to="/business/directory" onClick={handleLinkClick}>🏢 स्थानिक व्यापारी व उद्योजक</Link>
                  </div>
                  <div className="mega-col">
                    <div className="mega-col-title">🏢 संघटनात्मक चौकट</div>
                    <Link to="/about" onClick={handleLinkClick}>🏛️ राज्य मध्यवर्ती कार्यकारिणी</Link>
                    <Link to="/network" onClick={handleLinkClick}>🏢 ३६ जिल्हा समन्वय केंद्रे</Link>
                    <Link to="/network" onClick={handleLinkClick}>🏘️ ३५८+ तालुका समित्या</Link>
                    <Link to="/network" onClick={handleLinkClick}>🚩 ३,२००+ ग्रामशाखा नेटवर्क</Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Pillar 5: सर्व दालने (७०+) */}
            <div className="nav-item-has-mega">
              <Link to="/gallery" onClick={handleLinkClick}>📂 सर्व दालने (७०+) ▾</Link>
              <div className="mega-menu">
                <div className="mega-menu-grid">
                  <div className="mega-col">
                    <div className="mega-col-title">🏛️ इतिहास, दुर्ग व महापुरुष</div>
                    <Link to="/history/shivaji-maharaj" onClick={handleLinkClick}>👑 छत्रपती शिवाजी महाराज चरित्र</Link>
                    <Link to="/history/sambhaji-maharaj" onClick={handleLinkClick}>⚔️ छत्रपती संभाजी महाराज शौर्यगाथा</Link>
                    <Link to="/history/rajmata-jijau" onClick={handleLinkClick}>🌸 राष्ट्रमाता जिजाऊ माँसाहेब</Link>
                    <Link to="/history/bajirao-peshwa" onClick={handleLinkClick}>🐎 श्रीमंत थोरले बाजीराव पेशवे</Link>
                    <Link to="/forts" onClick={handleLinkClick}>🏰 सह्याद्रीचे ३५०+ गडकिल्ले</Link>
                    <Link to="/history/battles" onClick={handleLinkClick}>⚔️ प्रमुख ७ रणांगणे व व्यूहरचना</Link>
                  </div>
                  <div className="mega-col">
                    <div className="mega-col-title">💼 उद्योग, करिअर व संगम</div>
                    <Link to="/business/directory" onClick={handleLinkClick}>🏢 अखिल मराठा व्यवसाय निर्देशिका</Link>
                    <Link to="/sangam" onClick={handleLinkClick}>🤝 बिझनेस संगम व चॅप्टर्स</Link>
                    <Link to="/referrals" onClick={handleLinkClick}>🔗 व्यावसायिक रेफरल देवाणघेवाण</Link>
                    <Link to="/jobs" onClick={handleLinkClick}>💼 रोजगार केंद्र व भरती पोर्टल</Link>
                    <Link to="/meetings" onClick={handleLinkClick}>☕ 1-to-1 व्यावसायिक बैठका</Link>
                    <Link to="/business/directory" onClick={handleLinkClick}>🚀 B2B संधी व सौदे</Link>
                  </div>
                  <div className="mega-col">
                    <div className="mega-col-title">👥 समाज, संस्कृती व कल्याण</div>
                    <Link to="/community" onClick={handleLinkClick}>💬 मराठा डिजिटल कम्युनिटी</Link>
                    <Link to="/community" onClick={handleLinkClick}>🧑‍🤝‍🧑 उपक्रम गट व चर्चा मंच</Link>
                    <Link to="/events" onClick={handleLinkClick}>📅 आगामी मेळावे व दिनविशेष</Link>
                    <Link to="/donation" onClick={handleLinkClick}>❤️ दुर्ग संवर्धन व देणगी कोष</Link>
                    <Link to="/culture" onClick={handleLinkClick}>🎭 मराठी संस्कृती व सण परंपरा</Link>
                    <Link to="/gallery" onClick={handleLinkClick}>🖼️ आपुला महाराष्ट्र छायाचित्र दालन</Link>
                  </div>
                  <div className="mega-col">
                    <div className="mega-col-title">⚖️ प्रशासन, ओळख व CRM</div>
                    <Link to="/card" onClick={handleLinkClick}>🪪 डिजिटल सभासद ओळखपत्र</Link>
                    <Link to="/crm" onClick={handleLinkClick}>🚩 भूमिका आधारित CRM पोर्टल</Link>
                    <Link to="/roles-matrix" onClick={handleLinkClick}>⚖️ भूमिका व पात्रता मॅट्रिक्स</Link>
                    <Link to="/admin" onClick={handleLinkClick}>👑 सुपर ॲडमिन कन्सोल</Link>
                    <Link to="/crm/ceo" onClick={handleLinkClick}>🦅 CEO एक्झिक्युटिव्ह डॅशबोर्ड</Link>
                    <Link to="/crm/district" onClick={handleLinkClick}>📍 जिल्हा समन्वयक CRM</Link>
                    <Link to="/crm/chapter" onClick={handleLinkClick}>💼 चॅप्टर अध्यक्ष CRM</Link>
                    <Link to="/crm/helpdesk" onClick={handleLinkClick}>🩺 समाज साहाय्यता कक्ष CRM</Link>
                  </div>
                </div>
              </div>
            </div>
          </nav>

          <div className="header-actions">
            <button
              type="button"
              onClick={onOpenSearch}
              className="btn btn-outline"
              style={{ background: '#FFF3E0', border: '1.5px solid #F4511E', color: '#E65100', cursor: 'pointer' }}
              title="शोध (Ctrl+K)">
              🔎 शोध
            </button>

            {user && user.id ? (
              <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                <Link to="/card" className="btn btn-outline" onClick={handleLinkClick} title="माझे डिजिटल सभासद ओळखपत्र">
                  🪪 माझे कार्ड
                </Link>
                <Link to="/dashboard" className="btn btn-primary" onClick={handleLinkClick}>
                  👤 {user.name?.split(' ')[0] || 'डॅशबोर्ड'}
                </Link>
                <button
                  onClick={logout}
                  className="btn btn-outline"
                  title="बाहेर पडा"
                  style={{ padding: '7px 10px' }}>
                  🚪
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline" onClick={handleLinkClick}>
                  👤 लॉगिन
                </Link>
                <Link to="/register" className="btn btn-primary" onClick={handleLinkClick}>
                  🚩 नोंदणी
                </Link>
              </>
            )}

            {/* Mobile Toggle Button */}
            <button
              className="mobile-hamburger-btn"
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{ display: 'none', background: 'none', border: '1px solid #FFCC80', borderRadius: '8px', padding: '6px 10px', fontSize: '1.2rem', cursor: 'pointer', color: '#E65100' }}
              aria-label="मेनू">
              ☰
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
