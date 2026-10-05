import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const contactOffices = [
  {
    city: 'पुणे (मध्यवर्ती मुख्यालय व सारथी संस्था)',
    role: 'राज्य समन्वय, सारथी व प्रशासकीय केंद्र',
    address: 'बालगंधर्व रंगमंदिर परिसर / डेक्कन जिमखाना, पुणे - ४११००४',
    phone: '०२०-२५५९२५०२ / ०२०-२५५९२५१० (सारथी हेल्पलाईन)',
    email: 'contact@connectmaratha.com / sarthipune@gmail.com',
    hours: 'सकाळी ९:४५ ते सायं ६:१५ (शासकीय कार्यालयीन वेळ)',
    icon: '🏛️',
    color: '#B71C1C'
  },
  {
    city: 'मुंबई (विधी व राज्य रक्त संक्रमण केंद्र)',
    role: 'उच्च न्यायालय विधी व SBTC आरोग्य संपर्क',
    address: 'रवींद्र ॲनेक्स, ५ वा मजला, चर्चगेट, मुंबई - ४०००२०',
    phone: '०२२-२२८३०२१६ / ०२२-३५७७६२७१ (SBTC मुंबई)',
    email: 'mumbai@connectmaratha.com / sbtc@mahasbtc.com',
    hours: 'सकाळी १०:०० ते सायं ६:०० (सोम-शुक्र)',
    icon: '🏢',
    color: '#E65100'
  },
  {
    city: 'छत्रपती संभाजीनगर (मराठवाडा विभाग)',
    role: 'शासकीय वैद्यकीय रुग्णालय (घाटी) व विभागीय केंद्र',
    address: 'घाटी हॉस्पिटल परिसर, जुना बाजार, छत्रपती संभाजीनगर - ४३१००१',
    phone: '०२४०-२४०३४०५ / ०२४०-२४०३८८८',
    email: 'marathwada@connectmaratha.com',
    hours: '२४ तास आपत्कालीन सेवा उपलब्ध',
    icon: '🌾',
    color: '#C2185B'
  },
  {
    city: 'कोल्हापूर (सीपीआर रुग्णालय व शाहू स्मारक)',
    role: 'छत्रपती प्रमिलाराजे रुग्णालय (CPR) व वारसा केंद्र',
    address: 'दसऱ्या चौक, सीपीआर परिसर, कोल्हापूर - ४१६००२',
    phone: '०२३१-२६४१५८१ / ०२३१-२६४१५८२',
    email: 'kolhapur@connectmaratha.com',
    hours: '२४ तास रुग्ण व आपत्कालीन सेवा',
    icon: '🏰',
    color: '#D84315'
  }
];

const helplines = [
  {
    title: '२४x७ एकात्मिक राष्ट्रीय आपत्कालीन सेवा',
    number: '११२ (टोल फ्री - सर्व आपत्कालीन मदत)',
    desc: 'पोलीस, अग्निशामक दल, महिला व संकटग्रस्त कुटुंब त्वरित साहाय्य',
    icon: '🚨',
    badge: 'शासकीय • २४x७'
  },
  {
    title: 'महाराष्ट्र मोफत रुग्णवाहिका व वैद्यकीय मदत',
    number: '१०८ (टोल फ्री - MEMS रुग्णवाहिका)',
    desc: 'गंभीर रुग्ण, अपघात व तात्काळ वैद्यकीय उपचारांसाठी मोफत रुग्णवाहिका',
    icon: '🚑',
    badge: '१०८ रुग्णवाहिका'
  },
  {
    title: 'रक्तपेढी साहाय्य व थेट रक्त साठा (SBTC)',
    number: '०२२-२२८३०२१६ / ०२०-२६१२८००० (ससून)',
    desc: 'महाराष्ट्र राज्य रक्त संक्रमण परिषद व ससून/केईएम रक्तपेढी थेट संपर्क',
    icon: '🩸',
    badge: 'रक्तपेढी थेट संपर्क'
  },
  {
    title: 'सारथी (SARTHI) विद्यार्थी व युवक हेल्पलाईन',
    number: '०२०-२५५९२५०२ / ०२०-२५५९२५२९',
    desc: 'मराठा-कुणबी विद्यार्थी शिष्यवृत्ती, MPSC/UPSC व परदेशी शिक्षण मार्गदर्शन',
    icon: '🎓',
    badge: 'सारथी पुणे अधिकृत'
  }
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    district: 'पुणे',
    category: 'सामान्य चौकशी (General Inquiry)',
    subject: '',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.message) {
      alert('कृपया आपले नाव, फोन नंबर व संदेश प्रविष्ट करा.');
      return;
    }
    setSubmitted(true);
  };

  return (
    <div className="contact-page" style={{ background: '#FAF7F2', minHeight: '100vh', paddingBottom: '70px' }}>
      {/* Hero Banner */}
      <section style={{
        background: 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 45%, #FFCC80 100%)',
        color: '#2E1A17',
        padding: '54px 20px 48px',
        borderBottom: '4px solid #E65100',
        boxShadow: '0 4px 16px rgba(230,81,0,0.08)',
        position: 'relative'
      }}>
        <div style={{ maxWidth: '1180px', margin: '0 auto', textAlign: 'center' }}>
          <span style={{
            background: 'linear-gradient(135deg, #FF6F00 0%, #D84315 100%)',
            color: '#FFFFFF',
            padding: '5px 18px',
            borderRadius: '20px',
            fontSize: '0.84rem',
            fontWeight: 800,
            letterSpacing: '0.5px',
            display: 'inline-block',
            marginBottom: '14px',
            boxShadow: '0 3px 8px rgba(216,67,21,0.25)'
          }}>
            🚩 संपर्क, साहाय्य व तक्रार निवारण कक्ष
          </span>
          <h1 style={{
            fontSize: 'clamp(2rem, 3.6vw, 2.8rem)',
            fontWeight: 800,
            margin: '0 0 12px',
            fontFamily: 'Baloo 2',
            color: '#B71C1C'
          }}>
            आम्हाला संपर्क साधा — <span style={{ color: '#E65100' }}>CONNECT मराठा</span>
          </h1>
          <p style={{
            fontSize: '1.05rem',
            color: '#4E342E',
            maxWidth: '750px',
            margin: '0 auto 20px',
            lineHeight: 1.6,
            fontWeight: 500
          }}>
            महाराष्ट्रातील कोणत्याही जिल्ह्यातील बंधू-भगिनी, उद्योजक, विद्यार्थी व कार्यकर्त्यांसाठी आमचे संपर्क कक्ष २४x७ सदैव कार्यरत आहेत.
          </p>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            background: '#FFFFFF',
            padding: '9px 24px',
            borderRadius: '30px',
            border: '2px solid #FFB74D',
            boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <span style={{ fontSize: '0.94rem', color: '#B71C1C', fontWeight: 800 }}>
              🚨 राष्ट्रीय आपत्कालीन: <strong>११२</strong>
            </span>
            <span style={{ color: '#D7CCC8' }}>|</span>
            <span style={{ fontSize: '0.94rem', color: '#C2185B', fontWeight: 800 }}>
              🚑 मोफत रुग्णवाहिका: <strong>१०८</strong>
            </span>
            <span style={{ color: '#D7CCC8' }}>|</span>
            <span style={{ fontSize: '0.94rem', color: '#E65100', fontWeight: 800 }}>
              🎓 सारथी हेल्पलाईन: <strong>०२०-२५५९२५०२</strong>
            </span>
          </div>
        </div>
      </section>

      {/* Main Grid: Contact Form + Direct Helplines */}
      <section style={{ maxWidth: '1180px', margin: '40px auto 0', padding: '0 16px', position: 'relative' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '26px' }}>
          
          {/* Form Card */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            padding: '34px 28px',
            border: '1.5px solid #FFCC80',
            boxShadow: '0 10px 28px rgba(0,0,0,0.06)'
          }}>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#B71C1C', margin: '0 0 8px', fontFamily: 'Baloo 2' }}>
              ✍️ आम्हाला थेट संदेश पाठवा
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#666', margin: '0 0 22px', lineHeight: 1.5 }}>
              आपली विचारणा, सूचना किंवा तक्रार खालील फॉर्ममध्ये भरा. आमची समन्वय समिती २४ तासांच्या आत आपल्याशी संपर्क साधेल.
            </p>

            {submitted ? (
              <div style={{
                background: '#E8F5E9',
                border: '1.5px solid #81C784',
                padding: '30px 20px',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '10px' }}>✅</div>
                <h3 style={{ color: '#2E7D32', fontSize: '1.3rem', fontWeight: 800, margin: '0 0 8px' }}>
                  आपला संदेश यशस्वीरित्या प्राप्त झाला!
                </h3>
                <p style={{ color: '#1B5E20', fontSize: '0.9rem', lineHeight: 1.6, margin: '0 0 18px' }}>
                  धन्यवाद <strong>{formData.name}</strong> जी. आपल्या <strong>{formData.category}</strong> बाबत आमची टीम लवकरच {formData.phone} वर संपर्क साधेल.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: '', phone: '', email: '', district: 'पुणे', category: 'सामान्य चौकशी (General Inquiry)', subject: '', message: '' });
                  }}
                  style={{
                    background: '#2E7D32',
                    color: '#fff',
                    border: 'none',
                    padding: '8px 20px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  नवीन संदेश पाठवा
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: '#333', marginBottom: '5px' }}>
                    पूर्ण नाव *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. राहुल संभाजीराव पाटील"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #D7CCC8',
                      fontSize: '0.92rem',
                      outline: 'none',
                      background: '#FAF7F2'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: '#333', marginBottom: '5px' }}>
                      मोबाईल नंबर *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="९८XXXXXXXX"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid #D7CCC8',
                        fontSize: '0.92rem',
                        outline: 'none',
                        background: '#FAF7F2'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: '#333', marginBottom: '5px' }}>
                      ईमेल पत्ता
                    </label>
                    <input
                      type="email"
                      placeholder="आपला ईमेल"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid #D7CCC8',
                        fontSize: '0.92rem',
                        outline: 'none',
                        background: '#FAF7F2'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: '#333', marginBottom: '5px' }}>
                      जिल्हा
                    </label>
                    <select
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid #D7CCC8',
                        fontSize: '0.92rem',
                        background: '#FAF7F2',
                        outline: 'none'
                      }}
                    >
                      {['पुणे', 'मुंबई', 'ठाणे', 'छत्रपती संभाजीनगर', 'कोल्हापूर', 'सातारा', 'सांगली', 'सोलापूर', 'नाशिक', 'अहमदनगर', 'नागपूर', 'अमरावती', 'लातूर', 'नांदेड', 'जळगाव', 'रत्नागिरी', 'सिंधुदुर्ग', 'इतर'].map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: '#333', marginBottom: '5px' }}>
                      विषय प्रवर्ग
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid #D7CCC8',
                        fontSize: '0.92rem',
                        background: '#FAF7F2',
                        outline: 'none'
                      }}
                    >
                      <option value="सामान्य चौकशी (General Inquiry)">सामान्य चौकशी</option>
                      <option value="व्यवसाय संगम नोंदणी (B2B Sangam)">व्यवसाय संगम नोंदणी</option>
                      <option value="रक्तदान व आरोग्य साहाय्य">रक्तदान व आरोग्य साहाय्य</option>
                      <option value="विद्यार्थी शिष्यवृत्ती व करिअर">विद्यार्थी शिष्यवृत्ती व करिअर</option>
                      <option value="दुर्ग संवर्धन व इतिहास मोहीम">दुर्ग संवर्धन व इतिहास मोहीम</option>
                      <option value="तक्रार व निवारण (Grievance)">तक्रार व निवारण</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: '#333', marginBottom: '5px' }}>
                    संदेश / विचारणा *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="आपला सविस्तर संदेश किंवा प्रश्न येथे लिहा..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #D7CCC8',
                      fontSize: '0.92rem',
                      outline: 'none',
                      background: '#FAF7F2',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    background: 'linear-gradient(135deg, #FF6F00 0%, #E65100 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '12px 20px',
                    borderRadius: '8px',
                    fontWeight: 800,
                    fontSize: '1rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(230,81,0,0.25)',
                    transition: 'transform 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  🚀 संदेश पाठवा (Submit Message)
                </button>
              </form>
            )}
          </div>

          {/* Direct Helplines */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              padding: '24px 26px',
              border: '1px solid #EADBCE',
              boxShadow: '0 6px 18px rgba(0,0,0,0.04)'
            }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#2E1A17', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                ⚡ त्वरित साहाय्यता कक्षाशी संपर्क
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {helplines.map((hl, idx) => (
                  <div key={idx} style={{
                    padding: '14px 16px',
                    background: '#FFF8E7',
                    borderRadius: '10px',
                    border: '1px solid #FFE0B2',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px'
                  }}>
                    <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>{hl.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px', flexWrap: 'wrap', gap: '4px' }}>
                        <div style={{ fontWeight: 800, color: '#B71C1C', fontSize: '0.94rem' }}>
                          {hl.title}
                        </div>
                        <span style={{ fontSize: '0.72rem', background: '#FFEBEE', color: '#B71C1C', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                          {hl.badge}
                        </span>
                      </div>
                      <div style={{ fontSize: '1.02rem', fontWeight: 800, color: '#E65100', margin: '2px 0' }}>
                        {hl.number}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#666', lineHeight: 1.4 }}>
                        {hl.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* DPDP and Trust Guarantee */}
            <div style={{
              background: 'linear-gradient(135deg, #FFFDF9 0%, #FFF3E0 100%)',
              borderRadius: '16px',
              padding: '20px 24px',
              border: '1.5px solid #FFCC80',
              boxShadow: '0 4px 14px rgba(230,81,0,0.06)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span style={{ fontSize: '1.4rem' }}>🔒</span>
                <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#B71C1C' }}>
                  गोपनीयता व डेटा सुरक्षिततेची हमी (DPDP Act, 2023)
                </h4>
              </div>
              <p style={{ margin: 0, fontSize: '0.84rem', color: '#5D4037', lineHeight: 1.5 }}>
                CONNECT MARATHA वर सादर करण्यात आलेली आपली कोणतीही माहिती पूर्णतः गोपनीय ठेवली जाते. कोणत्याही व्यावसायिक हेतूसाठी माहितीची विक्री किंवा गैरवापर केला जात नाही.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Regional Headquarters Section */}
      <section style={{ maxWidth: '1180px', margin: '54px auto 0', padding: '0 16px' }}>
        <div style={{ textAlign: 'center', marginBottom: '26px' }}>
          <span style={{
            background: '#FFE0B2',
            color: '#E65100',
            padding: '3px 12px',
            borderRadius: '14px',
            fontSize: '0.8rem',
            fontWeight: 800
          }}>
            विभागीय कार्यालये
          </span>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#2E1A17', margin: '8px 0 6px', fontFamily: 'Baloo 2' }}>
            🏢 मुख्य प्रशासकीय व समन्वय कार्यालये
          </h2>
          <p style={{ color: '#666', fontSize: '0.92rem', margin: 0 }}>
            महाराष्ट्रातील प्रमुख विभागीय मुख्यालयांचे संपर्क पत्ते व कार्यवेळा
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          {contactOffices.map((office, idx) => (
            <div key={idx} style={{
              background: '#FFFFFF',
              borderRadius: '14px',
              border: '1px solid #EADBCE',
              padding: '24px 20px',
              boxShadow: '0 6px 16px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 10px 22px rgba(0,0,0,0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.03)';
            }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <span style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    background: '#FFF3E0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.3rem'
                  }}>
                    {office.icon}
                  </span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: office.color }}>
                      {office.city}
                    </h3>
                    <span style={{ fontSize: '0.74rem', color: '#777', fontWeight: 600 }}>
                      {office.role}
                    </span>
                  </div>
                </div>

                <div style={{ fontSize: '0.85rem', color: '#444', lineHeight: 1.5, marginBottom: '12px', background: '#FAF7F2', padding: '10px 12px', borderRadius: '8px' }}>
                  📍 {office.address}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.84rem', color: '#B71C1C', fontWeight: 700, marginBottom: '4px' }}>
                  📞 {office.phone}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#555', marginBottom: '6px' }}>
                  ✉️ {office.email}
                </div>
                <div style={{ fontSize: '0.76rem', color: '#777', borderTop: '1px solid #EEE', paddingTop: '6px' }}>
                  ⏰ वेळ: {office.hours}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Navigation Footer Links */}
      <section style={{ maxWidth: '1180px', margin: '48px auto 0', padding: '0 16px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #FFFDF9 0%, #FFF3E0 100%)',
          borderRadius: '16px',
          padding: '24px 28px',
          border: '1.5px solid #FFCC80',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#B71C1C' }}>
              संस्थेची घटना व मार्गदर्शक मंडळाबद्दल जाणून घ्यायचे आहे का?
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: '#5D4037' }}>
              सल्लागार मंडळ, विधी समिती व समुदाय सनद (Charter) बद्दल संपूर्ण माहिती उपलब्ध आहे.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link
              to="/about"
              style={{
                background: '#B71C1C',
                color: '#fff',
                textDecoration: 'none',
                padding: '9px 18px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.88rem'
              }}
            >
              🏛️ संस्था सनद पहा →
            </Link>
            <Link
              to="/governance"
              style={{
                background: '#FFFFFF',
                color: '#B71C1C',
                border: '1px solid #B71C1C',
                textDecoration: 'none',
                padding: '9px 18px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.88rem'
              }}
            >
              ⚖️ संविधान व DPDP
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
