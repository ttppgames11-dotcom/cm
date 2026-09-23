import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const PROVIDERS_BY_CATEGORY = {
  tech: [
    { id: 'p1', name: 'अमोल जाधव', badge: 'Verified', agency: 'Jadhav Software', exp: '९+ वर्षे अनुभव', rating: '⭐ ४.९ (७५ पुनरावलोकने)', baseFee: 2500, projFee: 35000 },
    { id: 'p2', name: 'विक्रम शिंदे', badge: 'Verified', agency: 'Shinde Tech Labs', exp: '६+ वर्षे अनुभव', rating: '⭐ ४.८ (४० पुनरावलोकने)', baseFee: 2000, projFee: 28000 }
  ],
  legal: [
    { id: 'p3', name: 'ॲड. राजेश पाटील', badge: 'Verified', agency: 'पाटील विधी सल्लागार', exp: '१५+ वर्षे अनुभव', rating: '⭐ ४.९ (१२० पुनरावलोकने)', baseFee: 1500, projFee: 15000 },
    { id: 'p4', name: 'ॲड. प्रियांका देशमुख', badge: 'Verified', agency: 'देशमुख लीगल असोसिएट्स', exp: '८+ वर्षे अनुभव', rating: '⭐ ४.८ (४५ पुनरावलोकने)', baseFee: 1200, projFee: 12000 }
  ],
  ca: [
    { id: 'p5', name: 'सीए स्मिता गायकवाड', badge: 'Verified CA', agency: 'गायकवाड अँड कंपनी', exp: '१०+ वर्षे अनुभव', rating: '⭐ ४.९ (९० पुनरावलोकने)', baseFee: 2000, projFee: 18000 }
  ],
  trek: [
    { id: 'p6', name: 'रोहित मोरे', badge: 'Certified Guide', agency: 'सह्याद्री ट्रेकर्स क्लब', exp: '१५०+ दुर्ग मोहीम अनुभव', rating: '⭐ ५.० (२००+ ट्रेकर्स)', baseFee: 1000, projFee: 8000 }
  ],
  civil: [
    { id: 'p7', name: 'आर्कि. राहुल कदम', badge: 'Verified Architect', agency: 'शिवनेरी डिझाइन स्टुडिओ', exp: '१२+ वर्षे अनुभव', rating: '⭐ ४.८ (६० प्रकल्प)', baseFee: 3000, projFee: 45000 }
  ]
};

export default function ServiceBookingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [category, setCategory] = useState('tech');
  const [selectedProviderId, setSelectedProviderId] = useState('p1');
  const [bookingDate, setBookingDate] = useState('2026-09-20');
  const [timeSlot, setTimeSlot] = useState('दुपारी २:०० ते ३:००');
  const [projectTitle, setProjectTitle] = useState('');
  const [projectNotes, setProjectNotes] = useState('');
  const [projectCity, setProjectCity] = useState('पुणे, महाराष्ट्र');
  const [bookingRefId, setBookingRefId] = useState('');

  const activeProviders = PROVIDERS_BY_CATEGORY[category] || PROVIDERS_BY_CATEGORY.tech;
  const currentProvider = activeProviders.find(p => p.id === selectedProviderId) || activeProviders[0];

  const baseConsult = currentProvider?.baseFee || 2500;
  const projCost = currentProvider?.projFee || 35000;
  const discount = Math.round((baseConsult + projCost) * 0.15);
  const finalTotal = (baseConsult + projCost) - discount;

  const handleCategoryChange = (newCat) => {
    setCategory(newCat);
    const providers = PROVIDERS_BY_CATEGORY[newCat] || [];
    if (providers.length > 0) {
      setSelectedProviderId(providers[0].id);
    }
  };

  const handleConfirm = () => {
    const id = 'CM-SRV-2026-' + Math.floor(1000 + Math.random() * 9000);
    setBookingRefId(id);
    setCurrentStep(5);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const goToStep = (step) => {
    setCurrentStep(step);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  return (
    <>
      {/* BREADCRUMB & HEADER */}
      <div style={{ background: 'var(--paper-2)', padding: '32px 24px', borderBottom: '1px solid var(--line)' }}>
        <div className="wrap" style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-sec)', marginBottom: '8px' }}>
            <Link to="/" title="होम" style={{ textDecoration: 'none' }}>🏠</Link> /{' '}
            <Link to="/jobs" style={{ textDecoration: 'none' }}>सेवा बाजारपेठ</Link> /{' '}
            <span style={{ color: 'var(--ink)', fontWeight: 700 }}>बुकिंग प्रक्रिया</span>
          </div>
          <h1 style={{ fontSize: '2.2rem', margin: '0 0 6px', fontFamily: 'Baloo 2' }}>
            📅 समुदाय सेवा बुकिंग (Service Booking Flow)
          </h1>
          <p style={{ color: 'var(--text-sec)', fontSize: '0.95rem', margin: 0 }}>
            पडताळणीकृत मराठा उद्योजक व तज्ज्ञांकडून खात्रीशीर, वाजवी व वेळेत सेवा मिळवा.
          </p>
        </div>
      </div>

      {/* BOOKING WIZARD WRAPPER */}
      <div className="wrap" style={{ maxWidth: '960px', margin: '40px auto', padding: '0 24px' }}>
        {/* PROGRESS STEPPER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '36px', position: 'relative' }}>
          {[
            { num: 1, label: 'सेवा व तज्ज्ञ' },
            { num: 2, label: 'वेळ व तारीख' },
            { num: 3, label: 'कामाचे स्वरूप' },
            { num: 4, label: 'मूल्य अंदाज' },
            { num: 5, label: 'पुष्टीकरण' }
          ].map((s) => {
            const isCompleted = s.num < currentStep;
            const isCurrent = s.num === currentStep;
            return (
              <div key={s.num} style={{ textAlign: 'center', flex: 1 }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: isCompleted ? 'var(--success, #2E7D32)' : isCurrent ? 'var(--saffron-600)' : 'var(--paper-3)',
                    color: isCompleted || isCurrent ? '#fff' : 'var(--ink)',
                    border: isCompleted || isCurrent ? 'none' : '2px solid var(--line)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 6px',
                    fontWeight: 700
                  }}
                >
                  {isCompleted ? '✓' : s.num}
                </div>
                <div
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: isCurrent ? 700 : 600,
                    color: isCurrent ? 'var(--saffron-600)' : 'var(--text-sec)'
                  }}
                >
                  {s.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* STEP 1: SERVICE & PROVIDER */}
        {currentStep === 1 && (
          <div className="card booking-step" style={{ padding: '32px', borderRadius: '16px', background: 'var(--paper)', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '8px', fontFamily: 'Baloo 2' }}>
              १. सेवा प्रकार व तज्ज्ञ व्यावसायिक निवडा
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-sec)', marginBottom: '24px' }}>
              आपल्या गरजेनुसार योग्य श्रेणी आणि पडताळणीकृत तज्ज्ञ निवडा.
            </p>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                सेवा श्रेणी *
              </label>
              <select
                className="input"
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.92rem' }}
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
              >
                <option value="tech">💻 तंत्रज्ञान व सॉफ्टवेअर विकास (Web/App Development)</option>
                <option value="legal">⚖️ कायदेशीर सल्ला व दस्तऐवज (Legal & Property)</option>
                <option value="ca">📊 चार्टर्ड अकाउंटंट व कर नियोजन (CA, GST, ITR)</option>
                <option value="trek">🧗 सह्याद्री गड-किल्ले ट्रेक गाईड (Certified Trek Leader)</option>
                <option value="civil">🏗️ आर्किटेक्चर व अंतर्गत सजावट (Interior & Architecture)</option>
              </select>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px' }}>
                उपलब्ध पडताळणीकृत व्यावसायिक *
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                {activeProviders.map((prov) => {
                  const isChecked = selectedProviderId === prov.id;
                  return (
                    <label
                      key={prov.id}
                      onClick={() => setSelectedProviderId(prov.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '14px',
                        border: isChecked ? '2px solid var(--saffron-600)' : '1px solid var(--line)',
                        background: isChecked ? 'var(--paper-3)' : 'var(--paper)',
                        borderRadius: '10px',
                        cursor: 'pointer'
                      }}
                    >
                      <input
                        type="radio"
                        name="provider"
                        checked={isChecked}
                        onChange={() => setSelectedProviderId(prov.id)}
                        style={{ width: '18px', height: '18px' }}
                      />
                      <div>
                        <div style={{ fontWeight: 700 }}>
                          {prov.name}{' '}
                          <span className="tag" style={{ background: 'var(--success, #2E7D32)', color: '#fff', fontSize: '0.7rem' }}>
                            {prov.badge}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-sec)', marginTop: '2px' }}>
                          {prov.agency} • {prov.exp} • {prov.rating}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => goToStep(2)}
                className="btn btn-primary"
                style={{ padding: '10px 24px', fontWeight: 700 }}
              >
                पुढील पायरी → (वेळ व तारीख)
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: DATE & TIME */}
        {currentStep === 2 && (
          <div className="card booking-step" style={{ padding: '32px', borderRadius: '16px', background: 'var(--paper)', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '8px', fontFamily: 'Baloo 2' }}>
              २. भेट किंवा कामाची तारीख व वेळ निवडा
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-sec)', marginBottom: '24px' }}>
              आपल्या सोयीनुसार प्रारंभिक सल्लामसलतीची वेळ निश्चित करा.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                  प्रारंभिक तारीख *
                </label>
                <input
                  type="date"
                  className="input"
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', boxSizing: 'border-box' }}
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                  सोयीची वेळ स्लॉट *
                </label>
                <select
                  className="input"
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', boxSizing: 'border-box' }}
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                >
                  <option>सकाळी १०:०० ते ११:००</option>
                  <option>दुपारी २:०० ते ३:००</option>
                  <option>संध्याकाळी ५:०० ते ६:००</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button type="button" onClick={() => goToStep(1)} className="btn btn-outline" style={{ padding: '10px 20px' }}>
                ← मागील पायरी
              </button>
              <button type="button" onClick={() => goToStep(3)} className="btn btn-primary" style={{ padding: '10px 24px', fontWeight: 700 }}>
                पुढील पायरी → (कामाचे स्वरूप)
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: SCOPE & REQUIREMENT */}
        {currentStep === 3 && (
          <div className="card booking-step" style={{ padding: '32px', borderRadius: '16px', background: 'var(--paper)', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '8px', fontFamily: 'Baloo 2' }}>
              ३. कामाचे स्वरूप व आवश्यकता सांगा
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-sec)', marginBottom: '24px' }}>
              व्यावसायिकाला आपल्या प्रकल्पाचा संपूर्ण अंदाज येण्यासाठी माहिती भरा.
            </p>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                कामाचे शीर्षक / मुख्य विषय *
              </label>
              <input
                type="text"
                className="input"
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', boxSizing: 'border-box' }}
                placeholder="उदा. नवीन व्यवसाय वेबसाइट व पेमेंट गेटवे एकत्रीकरण"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                सविस्तर आवश्यकता / नोट्स *
              </label>
              <textarea
                className="input"
                rows="4"
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', boxSizing: 'border-box' }}
                placeholder="आपल्याला कोणती वैशिष्ट्ये हवी आहेत, अपेक्षित कालावधी काय आहे, इत्यादी माहिती लिहा..."
                value={projectNotes}
                onChange={(e) => setProjectNotes(e.target.value)}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                शहर / ठिकाण *
              </label>
              <input
                type="text"
                className="input"
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', boxSizing: 'border-box' }}
                value={projectCity}
                onChange={(e) => setProjectCity(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button type="button" onClick={() => goToStep(2)} className="btn btn-outline" style={{ padding: '10px 20px' }}>
                ← मागील पायरी
              </button>
              <button type="button" onClick={() => goToStep(4)} className="btn btn-primary" style={{ padding: '10px 24px', fontWeight: 700 }}>
                पुढील पायरी → (मूल्य अंदाज)
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: PRICING ESTIMATE & DISCOUNT */}
        {currentStep === 4 && (
          <div className="card booking-step" style={{ padding: '32px', borderRadius: '16px', background: 'var(--paper)', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '8px', fontFamily: 'Baloo 2' }}>
              ४. अंदाजे मूल्य व समुदाय सवलत
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-sec)', marginBottom: '24px' }}>
              CONNECT MARATHA सदस्यतेअंतर्गत मिळणारा विशेष दर व अटी.
            </p>

            <div style={{ background: 'var(--paper-2)', border: '1px solid var(--line)', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.95rem' }}>
                <span>प्रारंभिक सल्लामसलत व प्रकल्प योजना:</span>
                <span>₹{baseConsult.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.95rem' }}>
                <span>अपेक्षित प्रकल्प विकास खर्च:</span>
                <span>₹{projCost.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.95rem', color: 'var(--success, #2E7D32)', fontWeight: 700 }}>
                <span>🎁 CONNECT MARATHA समुदाय सवलत (१५%):</span>
                <span>- ₹{discount.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ borderTop: '2px dashed var(--line)', paddingTop: '12px', marginTop: '12px', display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 800, color: 'var(--saffron-600)' }}>
                <span>एकूण अंदाजित रक्कम:</span>
                <span>₹{finalTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div style={{ fontSize: '0.82rem', color: 'var(--text-sec)', marginBottom: '24px', lineHeight: 1.5 }}>
              ℹ️ <strong>टीप:</strong> हे अंदाजित मूल्य आहे. कामाचे स्वरूप अंतिम झाल्यावर अंतिम करार व टप्पे (Milestones) व्यावसायिकासोबत थेट ठरवले जातील.
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button type="button" onClick={() => goToStep(3)} className="btn btn-outline" style={{ padding: '10px 20px' }}>
                ← मागील पायरी
              </button>
              <button type="button" onClick={handleConfirm} className="btn btn-primary" style={{ padding: '10px 24px', fontWeight: 700 }}>
                ✓ बुकिंग निश्चित करा
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: CONFIRMATION */}
        {currentStep === 5 && (
          <div className="card booking-step" style={{ padding: '40px', borderRadius: '16px', textAlign: 'center', background: 'var(--paper)', border: '1px solid var(--border)' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'var(--success, #2E7D32)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.2rem', margin: '0 auto 16px' }}>
              ✓
            </div>
            <h2 style={{ fontSize: '2rem', marginBottom: '8px', fontFamily: 'Baloo 2' }}>
              बुकिंग विनंती यशस्वीरित्या नोंदवली गेली!
            </h2>
            <p style={{ color: 'var(--text-sec)', fontSize: '1rem', maxWidth: '540px', margin: '0 auto 20px', lineHeight: 1.6 }}>
              आपला बुकिंग संदर्भ क्रमांक: <strong style={{ color: 'var(--saffron-600)' }}>#{bookingRefId}</strong>. संबंधित व्यावसायिकाला SMS व ईमेलद्वारे त्वरित सूचना पाठवली आहे.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <Link to="/messages" className="btn btn-primary" style={{ padding: '10px 24px', fontWeight: 700 }}>
                💬 व्यावसायिकासोबत थेट चॅट करा
              </Link>
              <Link to="/dashboard" className="btn btn-outline" style={{ padding: '10px 24px' }}>
                📊 माझ्या डॅशबोर्डवर जा
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
