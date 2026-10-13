import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function PrivacyPolicyPage() {
  const [deletionSubmitted, setDeletionSubmitted] = useState(false);
  const [deletionForm, setDeletionForm] = useState({ identifier: '', reason: 'इतर (Other)', confirmation: false });

  const handleDeletionSubmit = (e) => {
    e.preventDefault();
    if (!deletionForm.identifier || !deletionForm.confirmation) return;
    setDeletionSubmitted(true);
  };

  return (
    <div style={{ background: '#FAF7F2', minHeight: '100vh', padding: '36px 0 80px', fontFamily: "'Inter', sans-serif" }}>
      <div className="container" style={{ maxWidth: '1040px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* Navigation Breadcrumb */}
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              color: '#8b1e1e',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '0.92rem'
            }}
          >
            ← मुख्य पृष्ठावर परत जा (Home)
          </Link>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link
              to="/terms"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: '#5c534b',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.88rem',
                background: '#fff',
                padding: '6px 14px',
                borderRadius: '8px',
                border: '1px solid #e2d9cd'
              }}
            >
              📜 नियम व अटी (Terms & Conditions)
            </Link>
            <a
              href="#deletion"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: '#991b1b',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '0.88rem',
                background: '#fee2e2',
                padding: '6px 14px',
                borderRadius: '8px',
                border: '1px solid #fca5a5'
              }}
            >
              🗑️ खाते हटवा (Delete Account)
            </a>
          </div>
        </div>

        {/* Hero Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #4a0e0e 0%, #7a1c1c 50%, #b43414 100%)',
            borderRadius: '20px',
            color: '#FFFFFF',
            padding: '36px 32px',
            marginBottom: '28px',
            boxShadow: '0 12px 32px rgba(74, 14, 14, 0.25)',
            border: '1px solid rgba(240, 184, 102, 0.3)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255, 255, 255, 0.18)',
                backdropFilter: 'blur(8px)',
                padding: '5px 14px',
                borderRadius: '20px',
                fontSize: '0.82rem',
                fontWeight: 800,
                letterSpacing: '0.04em',
                marginBottom: '14px',
                border: '1px solid rgba(255,255,255,0.25)'
              }}>
                <span>🛡️ अधिकृत कायदेशीर दस्तावेज</span>
                <span>•</span>
                <span>Google Play Console & DPDP Act 2023 Compliant</span>
              </div>
              <h1 style={{ margin: '0 0 10px', fontSize: '2.3rem', fontFamily: 'Baloo 2, sans-serif', fontWeight: 800, lineHeight: 1.25 }}>
                गोपनीयता धोरण | Privacy Policy
              </h1>
              <p style={{ margin: 0, opacity: 0.95, fontSize: '1.05rem', lineHeight: 1.6, maxWidth: '780px' }}>
                Connect Maratha (अखिल भारतीय मराठा महासंघ अधिकृत डिजिटल व्यासपीठ) — Android Package: <code style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.9em' }}>com.connectmaratha.app</code>
              </p>
            </div>
            <div style={{
              background: 'rgba(0,0,0,0.25)',
              padding: '12px 18px',
              borderRadius: '12px',
              fontSize: '0.82rem',
              border: '1px solid rgba(255,255,255,0.15)',
              minWidth: '220px'
            }}>
              <div>📅 लागू तारीख (Effective): <strong>१ जानेवारी २०२६</strong></div>
              <div>🔄 शेवटचे अद्यतन: <strong>ऑक्टोबर २०२६</strong></div>
              <div>🔖 आवृत्ती: <strong>v2026.2.0 (Strict Google Compliance)</strong></div>
            </div>
          </div>
        </div>

        {/* Google Play Data Safety Compliance Summary Badges */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '14px',
          marginBottom: '28px'
        }}>
          <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #e7ded2', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
            <div style={{ fontSize: '20px', marginBottom: '4px' }}>🔒</div>
            <strong style={{ display: 'block', fontSize: '13.5px', color: '#2b2420' }}>डेटा एन्क्रिप्शन (In-Transit & At-Rest)</strong>
            <span style={{ fontSize: '12px', color: '#665c52' }}>सर्व डेटा ट्रान्सफर HTTPS (TLS 1.3) आणि डेटाबेस AES-256 द्वारे एनक्रिप्टेड आहे.</span>
          </div>
          <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #e7ded2', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
            <div style={{ fontSize: '20px', marginBottom: '4px' }}>🚫</div>
            <strong style={{ display: 'block', fontSize: '13.5px', color: '#2b2420' }}>डेटा विक्री नाही (No Data Sale)</strong>
            <span style={{ fontSize: '12px', color: '#665c52' }}>आम्ही कोणत्याही जाहिरातदार किंवा डेटा ब्रोकर कंपन्यांना आपला डेटा विकत किंवा भाड्याने देत नाही.</span>
          </div>
          <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #e7ded2', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
            <div style={{ fontSize: '20px', marginBottom: '4px' }}>🗑️</div>
            <strong style={{ display: 'block', fontSize: '13.5px', color: '#2b2420' }}>थेट डेटा हटवण्याची सुविधा (Account Deletion)</strong>
            <span style={{ fontSize: '12px', color: '#665c52' }}>सदस्य अ‍ॅपमधून किंवा वेब फॉर्मद्वारे २४-४८ तासांत संपूर्ण डेटा हटवू शकतात.</span>
          </div>
          <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #e7ded2', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
            <div style={{ fontSize: '20px', marginBottom: '4px' }}>🇮🇳</div>
            <strong style={{ display: 'block', fontSize: '13.5px', color: '#2b2420' }}>भारतीय डेटा कायदे (DPDP Act 2023)</strong>
            <span style={{ fontSize: '12px', color: '#665c52' }}>सर्व सर्व्हर्स भारतात स्थित असून डिजिटल वैयक्तिक डेटा संरक्षण कायद्याचे पालन करतात.</span>
          </div>
        </div>

        {/* Table of Contents / Quick Jump */}
        <div style={{
          background: '#fff',
          borderRadius: '14px',
          padding: '18px 24px',
          marginBottom: '28px',
          border: '1px solid #e6dcce',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'center',
          fontSize: '12.5px'
        }}>
          <span style={{ fontWeight: 800, color: '#7a1c1c' }}>जलद नेव्हिगेशन (Index):</span>
          <a href="#section1" style={{ color: '#4a4036', textDecoration: 'none', fontWeight: 600 }}>१. ओळख व संस्था</a> •
          <a href="#section2" style={{ color: '#4a4036', textDecoration: 'none', fontWeight: 600 }}>२. डेटा संकलन तक्ता</a> •
          <a href="#section3" style={{ color: '#4a4036', textDecoration: 'none', fontWeight: 600 }}>३. माहितीचा उद्देश</a> •
          <a href="#section4" style={{ color: '#4a4036', textDecoration: 'none', fontWeight: 600 }}>४. Android परवानग्या (Permissions)</a> •
          <a href="#section5" style={{ color: '#4a4036', textDecoration: 'none', fontWeight: 600 }}>५. तृतीय-पक्ष SDK व सर्व्हिसेस</a> •
          <a href="#deletion" style={{ color: '#991b1b', textDecoration: 'none', fontWeight: 700 }}>६. खाते व डेटा हटवणे (Play Console Mandate)</a> •
          <a href="#section7" style={{ color: '#4a4036', textDecoration: 'none', fontWeight: 600 }}>७. बालकांची गोपनीयता (18+)</a> •
          <a href="#section8" style={{ color: '#4a4036', textDecoration: 'none', fontWeight: 600 }}>८. तक्रार निवारण अधिकारी</a>
        </div>

        {/* Main Content Body */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            padding: '40px 36px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
            lineHeight: 1.8,
            color: '#374151',
            fontSize: '0.98rem'
          }}
        >

          {/* Section 1 */}
          <section id="section1" style={{ marginBottom: '36px' }}>
            <h2 style={{ color: '#7a1c1c', fontSize: '1.45rem', fontFamily: 'Baloo 2, sans-serif', borderBottom: '2px solid #fed7aa', paddingBottom: '8px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              १. विकासक संस्था व कायदेशीर ओळख (Developer Identity & Legal Entity)
            </h2>
            <p>
              हे गोपनीयता धोरण <strong>Connect Maratha (कनेक्ट मराठा)</strong> या मोबाइल अ‍ॅप्लिकेशन (Android Package: <code>com.connectmaratha.app</code>) आणि वेब पोर्टल (<code>https://www.connectmaratha.com</code>) साठी लागू आहे.
            </p>
            <div style={{ background: '#fdf8f4', borderLeft: '4px solid #7a1c1c', padding: '14px 18px', borderRadius: '0 8px 8px 0', margin: '14px 0' }}>
              <div><strong>अधिकृत कायदेशीर संस्था (Legal Entity):</strong> अखिल भारतीय मराठा महासंघ (All India Maratha Mahasangh - Central IT & Digital Council)</div>
              <div><strong>Google Play Developer Account:</strong> Connect Maratha Official Digital Operations</div>
              <div><strong>नोंदणीकृत कार्यालय:</strong> नारायण पेठ, छत्रपती शिवाजी महाराज चौक, पुणे – ४११०३०, महाराष्ट्र, भारत.</div>
              <div><strong>अधिकृत ईमेल:</strong> <a href="mailto:privacy@connectmaratha.com" style={{ color: '#7a1c1c', fontWeight: 600 }}>privacy@connectmaratha.com</a> | <a href="mailto:support@connectmaratha.com" style={{ color: '#7a1c1c', fontWeight: 600 }}>support@connectmaratha.com</a></div>
            </div>
            <p>
              आम्ही Google Play Console डेव्हलपर प्रोग्राम पॉलिसी (Data Safety Policy), भारतीय डिजिटल वैयक्तिक डेटा संरक्षण कायदा, २०२३ (DPDP Act 2023), आणि माहिती तंत्रज्ञान कायदा, २००० चे संपूर्ण पालन करण्यास बांधील आहोत.
            </p>
          </section>

          {/* Section 2: Standard Google Play Data Safety Matrix */}
          <section id="section2" style={{ marginBottom: '36px' }}>
            <h2 style={{ color: '#7a1c1c', fontSize: '1.45rem', fontFamily: 'Baloo 2, sans-serif', borderBottom: '2px solid #fed7aa', paddingBottom: '8px', marginBottom: '14px' }}>
              २. डेटा सुरक्षितता घोषणा व संकलित माहिती (Google Play Data Safety Section)
            </h2>
            <p>
              Google Play Console मार्गदर्शक तत्त्वांनुसार आम्ही गोळा करत असलेल्या डेटाचा तपशील, त्याचा उद्देश आणि तो अनिवार्य आहे की ऐच्छिक (Optional), खालीलप्रमाणे स्पष्ट केला आहे:
            </p>
            
            <div style={{ overflowX: 'auto', margin: '18px 0' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#5c1414', color: '#fff' }}>
                    <th style={{ padding: '10px 12px', border: '1px solid #7a1c1c' }}>डेटा श्रेणी (Data Category)</th>
                    <th style={{ padding: '10px 12px', border: '1px solid #7a1c1c' }}>गोळा केलेला तपशील (Data Types)</th>
                    <th style={{ padding: '10px 12px', border: '1px solid #7a1c1c' }}>संकलन प्रकार</th>
                    <th style={{ padding: '10px 12px', border: '1px solid #7a1c1c' }}>उद्देश (Purpose)</th>
                    <th style={{ padding: '10px 12px', border: '1px solid #7a1c1c' }}>तृतीय पक्षासोबत शेअरिंग</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ background: '#fff' }}>
                    <td style={{ padding: '10px 12px', border: '1px solid #e5e7eb', fontWeight: 700 }}>वैयक्तिक माहिती (Personal Info)</td>
                    <td style={{ padding: '10px 12px', border: '1px solid #e5e7eb' }}>नाव, ईमेल, फोन नंबर, जन्मतारीख, कुल/गोत्र, पद</td>
                    <td style={{ padding: '10px 12px', border: '1px solid #e5e7eb' }}><span style={{ color: '#b91c1c', fontWeight: 700 }}>अनिवार्य (Mandatory)</span></td>
                    <td style={{ padding: '10px 12px', border: '1px solid #e5e7eb' }}>खाते व्यवस्थापन, ओळखपत्र (Digital ID), KYC व शिफारस पडताळणी</td>
                    <td style={{ padding: '10px 12px', border: '1px solid #e5e7eb', color: '#16a34a', fontWeight: 700 }}>नाही (No Share)</td>
                  </tr>
                  <tr style={{ background: '#faf9f6' }}>
                    <td style={{ padding: '10px 12px', border: '1px solid #e5e7eb', fontWeight: 700 }}>स्थान माहिती (Location Info)</td>
                    <td style={{ padding: '10px 12px', border: '1px solid #e5e7eb' }}>राज्य, जिल्हा, तालुका, शहर (वापरकर्त्याने निवडलेले)</td>
                    <td style={{ padding: '10px 12px', border: '1px solid #e5e7eb' }}><span style={{ color: '#b91c1c', fontWeight: 700 }}>अनिवार्य (Mandatory)</span></td>
                    <td style={{ padding: '10px 12px', border: '1px solid #e5e7eb' }}>स्थानिक कम्युनिटी सेंटर शोधणे आणि जिल्हा नेटवर्क जोडणी</td>
                    <td style={{ padding: '10px 12px', border: '1px solid #e5e7eb', color: '#16a34a', fontWeight: 700 }}>नाही (No Share)</td>
                  </tr>
                  <tr style={{ background: '#fff' }}>
                    <td style={{ padding: '10px 12px', border: '1px solid #e5e7eb', fontWeight: 700 }}>छायाचित्रे व मीडिया (Photos & Videos)</td>
                    <td style={{ padding: '10px 12px', border: '1px solid #e5e7eb' }}>प्रोफाइल फोटो, कम्युनिटी इव्हेंट फोटो</td>
                    <td style={{ padding: '10px 12px', border: '1px solid #e5e7eb' }}><span style={{ color: '#166534', fontWeight: 700 }}>ऐच्छिक (Optional)</span></td>
                    <td style={{ padding: '10px 12px', border: '1px solid #e5e7eb' }}>सदस्य कार्ड फोटो आणि समुदाय चर्चा मंच</td>
                    <td style={{ padding: '10px 12px', border: '1px solid #e5e7eb', color: '#16a34a', fontWeight: 700 }}>नाही (No Share)</td>
                  </tr>
                  <tr style={{ background: '#faf9f6' }}>
                    <td style={{ padding: '10px 12px', border: '1px solid #e5e7eb', fontWeight: 700 }}>आर्थिक माहिती (Financial Info)</td>
                    <td style={{ padding: '10px 12px', border: '1px solid #e5e7eb' }}>देणगी व वर्गणी व्यवहार संदर्भ आयडी (Transaction ID)</td>
                    <td style={{ padding: '10px 12px', border: '1px solid #e5e7eb' }}><span style={{ color: '#166534', fontWeight: 700 }}>ऐच्छिक (व्यवहार करताना)</span></td>
                    <td style={{ padding: '10px 12px', border: '1px solid #e5e7eb' }}>पावती निर्मिती व लेखापरीक्षण (RBI-reg gateway द्वारे प्रक्रिया)</td>
                    <td style={{ padding: '10px 12px', border: '1px solid #e5e7eb' }}>केवळ अधिकृत Payment Gateway</td>
                  </tr>
                  <tr style={{ background: '#fff' }}>
                    <td style={{ padding: '10px 12px', border: '1px solid #e5e7eb', fontWeight: 700 }}>डिव्हाइस आयडेंटिफायर (Device & Diagnostics)</td>
                    <td style={{ padding: '10px 12px', border: '1px solid #e5e7eb' }}>Firebase Push Token, App Crash Logs, OS व्हर्जन</td>
                    <td style={{ padding: '10px 12px', border: '1px solid #e5e7eb' }}>स्वयंचलित तांत्रिक संकलन</td>
                    <td style={{ padding: '10px 12px', border: '1px solid #e5e7eb' }}>पुश सूचना पाठवणे, अ‍ॅप क्रॅश दुरुस्ती व सुरक्षितता</td>
                    <td style={{ padding: '10px 12px', border: '1px solid #e5e7eb' }}>Google Firebase (Technical only)</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#6b7280', fontStyle: 'italic' }}>
              * नोंद: आम्ही कधीही वापरकर्त्यांचे क्रेडिट/डेबिट कार्ड नंबर, सीव्हीव्ही (CVV), किंवा नेट बँकिंग पासवर्ड आमच्या सर्व्हरवर साठवत नाही.
            </p>
          </section>

          {/* Section 3 */}
          <section id="section3" style={{ marginBottom: '36px' }}>
            <h2 style={{ color: '#7a1c1c', fontSize: '1.45rem', fontFamily: 'Baloo 2, sans-serif', borderBottom: '2px solid #fed7aa', paddingBottom: '8px', marginBottom: '14px' }}>
              ३. डेटा वापराचा कायदेशीर उद्देश (Purposes of Processing)
            </h2>
            <ul style={{ paddingLeft: '22px' }}>
              <li><strong>सदस्यत्व ओळख व कार्ड:</strong> अधिकृत डिजिटल मराठा सभासद कार्ड निर्मिती, QR कोड व्हेरिफिकेशन आणि शिफारस प्रणाली नियंत्रण.</li>
              <li><strong>कम्युनिटी सेंटर समन्वय:</strong> तालुका, जिल्हा व विभाग स्तरावरील कम्युनिटी सेंटरशी सदस्यांना जोडणे व स्थानिक मदत पोहोचवणे.</li>
              <li><strong>बिझनेस संगम व रोजगार संधी:</strong> मराठा उद्योजकांमध्ये व्यापार देवाणघेवाण, रेफरल्स आणि नोकरीच्या संधी उपलब्ध करून देणे.</li>
              <li><strong>आपत्कालीन सामाजिक मदत:</strong> सदस्याने स्वेच्छेने संमती दिल्यास आपत्कालीन रक्तदाता शोध व सामाजिक मदत मोहिमेसाठी समन्वय साधणे.</li>
              <li><strong>सुरक्षितता व फसवणूक प्रतिबंध:</strong> बनावट खाती रोखणे आणि अधिकृत सभासदांचे संरक्षण करणे.</li>
            </ul>
          </section>

          {/* Section 4: Android Permissions Matrix */}
          <section id="section4" style={{ marginBottom: '36px' }}>
            <h2 style={{ color: '#7a1c1c', fontSize: '1.45rem', fontFamily: 'Baloo 2, sans-serif', borderBottom: '2px solid #fed7aa', paddingBottom: '8px', marginBottom: '14px' }}>
              ४. Android सिस्टीम परवानग्यांचे स्पष्टीकरण (Runtime Permissions Declaration)
            </h2>
            <p>
              Connect Maratha अ‍ॅपमध्ये केवळ आवश्यक असणाऱ्या सिस्टीम परवानग्या मागितल्या जातात. प्रत्येक परवानगीचे समर्थन खालीलप्रमाणे आहे:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', margin: '14px 0' }}>
              <div style={{ background: '#fcfaf6', padding: '14px', borderRadius: '10px', border: '1px solid #ebd9c8' }}>
                <code style={{ color: '#7a1c1c', fontWeight: 700, fontSize: '12px' }}>CAMERA</code>
                <div style={{ fontWeight: 700, fontSize: '13px', margin: '4px 0' }}>कॅमेरा प्रवेश (पर्यायी)</div>
                <div style={{ fontSize: '12px', color: '#555' }}>सदस्य कार्डसाठी थेट फोटो काढणे आणि इव्हेंटच्या वेळी QR कोड स्कॅन करणे.</div>
              </div>
              <div style={{ background: '#fcfaf6', padding: '14px', borderRadius: '10px', border: '1px solid #ebd9c8' }}>
                <code style={{ color: '#7a1c1c', fontWeight: 700, fontSize: '12px' }}>READ_MEDIA_IMAGES</code>
                <div style={{ fontWeight: 700, fontSize: '13px', margin: '4px 0' }}>फोटो पिकर / गॅलरी (पर्यायी)</div>
                <div style={{ fontSize: '12px', color: '#555' }}>Android Photo Picker द्वारे प्रोफाइल फोटो अपलोड करणे. संपूर्ण स्टोरेजचा अ‍ॅक्सेस घेतला जात नाही.</div>
              </div>
              <div style={{ background: '#fcfaf6', padding: '14px', borderRadius: '10px', border: '1px solid #ebd9c8' }}>
                <code style={{ color: '#7a1c1c', fontWeight: 700, fontSize: '12px' }}>POST_NOTIFICATIONS</code>
                <div style={{ fontWeight: 700, fontSize: '13px', margin: '4px 0' }}>पुश नोटिफिकेशन्स (Android 13+)</div>
                <div style={{ fontSize: '12px', color: '#555' }}>महत्त्वाच्या बैठका, रक्तदान विनंती आणि सदस्यत्व नूतनीकरण सूचना मिळवण्यासाठी.</div>
              </div>
              <div style={{ background: '#fcfaf6', padding: '14px', borderRadius: '10px', border: '1px solid #ebd9c8' }}>
                <code style={{ color: '#7a1c1c', fontWeight: 700, fontSize: '12px' }}>ACCESS_COARSE_LOCATION</code>
                <div style={{ fontWeight: 700, fontSize: '13px', margin: '4px 0' }}>अंदाजे स्थान (पर्यायी)</div>
                <div style={{ fontSize: '12px', color: '#555' }}>जवळचे कम्युनिटी सेंटर किंवा गड-किल्ले अंतर मोजण्यासाठी. पार्श्वभूमीत (Background) ट्रॅकिंग केले जात नाही.</div>
              </div>
            </div>
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '12px 16px', fontSize: '12.5px', color: '#92400e' }}>
              ⚠️ <strong>आम्ही खालील संवेदनशील परवानग्या कधीही मागत नाही:</strong> संपर्क यादी (Contacts), कॉल लॉग्स (Call Logs), एसएमएस वाचन (READ_SMS), किंवा मायक्रोफोन (RECORD_AUDIO).
            </div>
          </section>

          {/* Section 5: Third Party SDKs */}
          <section id="section5" style={{ marginBottom: '36px' }}>
            <h2 style={{ color: '#7a1c1c', fontSize: '1.45rem', fontFamily: 'Baloo 2, sans-serif', borderBottom: '2px solid #fed7aa', paddingBottom: '8px', marginBottom: '14px' }}>
              ५. तृतीय-पक्ष SDK आणि सेवा प्रदाते (Third-Party SDKs & Processors)
            </h2>
            <p>
              Connect Maratha अ‍ॅप्लिकेशन केवळ तांत्रिक पायाभूत सुविधांसाठी विश्वासू व सुरक्षित प्रदात्यांचा वापर करते:
            </p>
            <ul style={{ paddingLeft: '22px' }}>
              <li><strong>Google Firebase Cloud Messaging (FCM):</strong> सुरक्षित पुश नोटिफिकेशन्स पाठवण्यासाठी.</li>
              <li><strong>Razorpay / RBI Regulated Gateway:</strong> देणगी व नोंदणी शुल्क प्रक्रिया (PCI-DSS सुसंगत).</li>
              <li><strong>Cloudflare:</strong> DDoS हल्ला प्रतिबंध, SSL/TLS एन्क्रिप्शन व सुरक्षा कवच.</li>
              <li><strong>OpenStreetMap / Leaflet:</strong> गड-किल्ले व कम्युनिटी सेंटर नकाशा दर्शविण्यासाठी.</li>
            </ul>
          </section>

          {/* Section 6: Google Play Account & Data Deletion Requirement */}
          <section id="deletion" style={{ marginBottom: '36px', scrollMarginTop: '60px' }}>
            <div style={{
              background: '#fff5f5',
              border: '2px solid #f87171',
              borderRadius: '16px',
              padding: '24px 28px',
              boxShadow: '0 4px 16px rgba(239, 68, 68, 0.08)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <span style={{ fontSize: '24px' }}>🗑️</span>
                <h2 style={{ color: '#991b1b', fontSize: '1.45rem', fontFamily: 'Baloo 2, sans-serif', margin: 0 }}>
                  ६. Google Play Console अनिवार्य खाते व डेटा हटवणे (Account & Data Deletion Portal)
                </h2>
              </div>
              <p style={{ color: '#7f1d1d', fontWeight: 600, fontSize: '0.96rem', margin: '0 0 14px' }}>
                Google Play डेव्हलपर धोरणानुसार, ज्या अ‍ॅप्समध्ये खाते तयार करण्याची सुविधा आहे, त्या अ‍ॅप्समध्ये अ‍ॅपच्या आतून तसेच वेब लिंकद्वारे वापरकर्त्याला खाते आणि संबंधित डेटा कायमस्वरूपी हटवण्याची थेट सुविधा देणे अनिवार्य आहे.
              </p>
              
              <div style={{ background: '#fff', padding: '18px', borderRadius: '12px', border: '1px solid #fecaca', marginBottom: '18px' }}>
                <h3 style={{ fontSize: '1rem', color: '#991b1b', margin: '0 0 10px', fontWeight: 800 }}>
                  खाते हटवल्यावर काय होते (What Data is Deleted):
                </h3>
                <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '13px', lineHeight: 1.7, color: '#374151' }}>
                  <li><strong>कायमस्वरूपी नष्ट केले जाणारे तपशील (Permanently Deleted):</strong> आपले संपूर्ण प्रोफाइल, मोबाइल नंबर, ईमेल, पासवर्ड हॅश, फोटो, बायो, कुल/गोत्र, सदस्य कार्ड आणि सोशल पोस्ट्स/कमेंट्स.</li>
                  <li><strong>कालावधी (Deletion Timeline):</strong> विनंती प्राप्त झाल्यानंतर २४ ते ४८ तासांच्या आत डेटा उत्पादन सर्व्हर्सवरून पूर्णपणे नष्ट केला जातो.</li>
                  <li><strong>कायद्यानुसार राखून ठेवला जाणारा डेटा (Statutory Retention):</strong> आर्थिक व्यवहारांच्या नोंदी (देणगी पावत्या) भारतीय आयकर व कंपनी कायद्यानुसार आवश्यक कालावधीसाठी ऑडिटच्या उद्देशाने सुरक्षित राखल्या जातात.</li>
                </ul>
              </div>

              {/* Interactive Deletion Request Form */}
              <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1.5px dashed #dc2626' }}>
                <h3 style={{ fontSize: '1.05rem', color: '#991b1b', margin: '0 0 8px', fontWeight: 800 }}>
                  ऑनलाइन खाते हटवण्याची विनंती फॉर्म (Web Deletion Request Form)
                </h3>
                <p style={{ fontSize: '12.5px', color: '#6b7280', margin: '0 0 14px' }}>
                  अ‍ॅप अनइन्स्टॉल केले असल्यास आपण या वेब फॉर्मद्वारे थेट खाते हटवण्याची अधिकृत विनंती नोंदवू शकता:
                </p>

                {deletionSubmitted ? (
                  <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '16px', borderRadius: '8px', color: '#065f46', fontWeight: 700 }}>
                    ✅ आपली खाते हटवण्याची विनंती यशस्वीरित्या नोंदवली गेली आहे (Request ID: DEL-{Math.floor(100000 + Math.random() * 900000)}). आमच्या डेटा सुरक्षा अधिकाऱ्यांमार्फत २४ ते ४८ तासांत आपल्या खात्याचा संपूर्ण डेटा नष्ट केला जाईल आणि पुष्टीकरण संदेश पाठवला जाईल.
                  </div>
                ) : (
                  <form onSubmit={handleDeletionSubmit} style={{ display: 'grid', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>
                        नोंदणीकृत मोबाइल नंबर / ईमेल किंवा सभासद आयडी (Member ID / Phone / Email): *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="उदा. 9822012345 किंवा CM-96K-0001"
                        value={deletionForm.identifier}
                        onChange={(e) => setDeletionForm({ ...deletionForm, identifier: e.target.value })}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '13.5px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>
                        खाते हटवण्याचे कारण (Reason for Deletion):
                      </label>
                      <select
                        value={deletionForm.reason}
                        onChange={(e) => setDeletionForm({ ...deletionForm, reason: e.target.value })}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '13.5px' }}
                      >
                        <option value="गोपनीयता चिंता (Privacy Concerns)">गोपनीयता चिंता (Privacy Concerns)</option>
                        <option value="नवीन खाते तयार करायचे आहे">नवीन खाते तयार करायचे आहे</option>
                        <option value="अ‍ॅप वापर थांबवायचा आहे">अ‍ॅप वापर थांबवायचा आहे</option>
                        <option value="इतर (Other)">इतर (Other)</option>
                      </select>
                    </div>
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12.5px', cursor: 'pointer', margin: '4px 0' }}>
                      <input
                        type="checkbox"
                        required
                        checked={deletionForm.confirmation}
                        onChange={(e) => setDeletionForm({ ...deletionForm, confirmation: e.target.checked })}
                        style={{ marginTop: '3px', accentColor: '#dc2626' }}
                      />
                      <span>
                        मी पुष्टी करतो/करते की माझे खाते व संबंधित सर्व डेटा कायमस्वरूपी नष्ट केला जावा. ही प्रक्रिया पूर्ववत (Undo) करता येणार नाही याची मला जाणीव आहे.
                      </span>
                    </label>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <button
                        type="submit"
                        style={{
                          background: '#dc2626',
                          color: '#fff',
                          border: 'none',
                          padding: '10px 22px',
                          borderRadius: '8px',
                          fontWeight: 700,
                          fontSize: '13.5px',
                          cursor: 'pointer'
                        }}
                      >
                        खाते हटवण्याची विनंती सबमिट करा (Submit Request)
                      </button>
                      <span style={{ fontSize: '12px', color: '#6b7280' }}>
                        किंवा थेट ईमेल करा: <a href="mailto:privacy@connectmaratha.com?subject=Account%20Deletion%20Request" style={{ color: '#dc2626', fontWeight: 700 }}>privacy@connectmaratha.com</a>
                      </span>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </section>

          {/* Section 7 */}
          <section id="section7" style={{ marginBottom: '36px' }}>
            <h2 style={{ color: '#7a1c1c', fontSize: '1.45rem', fontFamily: 'Baloo 2, sans-serif', borderBottom: '2px solid #fed7aa', paddingBottom: '8px', marginBottom: '14px' }}>
              ७. बालकांची गोपनीयता व वय धोरण (Children's Privacy & Age Policy)
            </h2>
            <p>
              Connect Maratha हे १८ वर्षे पूर्ण केलेल्या प्रौढ नागरिकांसाठी तयार केलेले सामाजिक व व्यावसायिक नेटवर्क आहे. आम्ही १८ वर्षांखालील मुलांचा वैयक्तिक डेटा जाणीवपूर्वक गोळा करत नाही किंवा त्यांच्या वर्तनावर (Behavioral profiling) कोणतीही प्रक्रिया करत नाही.
            </p>
            <p>
              पालकांच्या पूर्वपरवानगीशिवाय कोणत्याही अल्पवयीन व्यक्तीची नोंदणी झाल्याचे निदर्शनास आल्यास, आम्ही त्वरित तो डेटा आमच्या सर्व्हरवरून नष्ट करतो.
            </p>
          </section>

          {/* Section 8: DPDP Act 2023 Rights & Grievance Redressal */}
          <section id="section8">
            <h2 style={{ color: '#7a1c1c', fontSize: '1.45rem', fontFamily: 'Baloo 2, sans-serif', borderBottom: '2px solid #fed7aa', paddingBottom: '8px', marginBottom: '14px' }}>
              ८. डेटा संरक्षण हक्क व तक्रार निवारण अधिकारी (DPDP 2023 Grievance Redressal)
            </h2>
            <p>
              भारतीय डिजिटल वैयक्तिक डेटा संरक्षण कायदा, २०२३ (DPDP Act 2023) अंतर्गत सदस्यांना खालील मूलभूत अधिकार आहेत:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', margin: '14px 0' }}>
              <div style={{ background: '#fdfaf5', padding: '12px', borderRadius: '8px', border: '1px solid #ebd9c8', fontSize: '12.5px' }}>
                <strong>१. माहिती मिळवण्याचा अधिकार:</strong> आपल्या डेटाच्या प्रक्रियेचा सारांश पाहणे.
              </div>
              <div style={{ background: '#fdfaf5', padding: '12px', borderRadius: '8px', border: '1px solid #ebd9c8', fontSize: '12.5px' }}>
                <strong>२. दुरुस्तीचा अधिकार:</strong> अपूर्ण किंवा चुकीचा डेटा दुरुस्त करणे.
              </div>
              <div style={{ background: '#fdfaf5', padding: '12px', borderRadius: '8px', border: '1px solid #ebd9c8', fontSize: '12.5px' }}>
                <strong>३. संमती मागे घेण्याचा अधिकार:</strong> दिलेली संमती कधीही रद्द करणे.
              </div>
              <div style={{ background: '#fdfaf5', padding: '12px', borderRadius: '8px', border: '1px solid #ebd9c8', fontSize: '12.5px' }}>
                <strong>४. नामनिर्देशन अधिकार (Nomination):</strong> असमर्थतेच्या वेळी प्रतिनिधी नियुक्त करणे.
              </div>
            </div>

            <div style={{ background: '#f8fafc', border: '1.5px solid #cbd5e1', borderRadius: '12px', padding: '20px 24px', marginTop: '18px' }}>
              <div style={{ fontWeight: 800, color: '#1e293b', marginBottom: '8px', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                ⚖️ अधिकृत तक्रार निवारण अधिकारी (Grievance Redressal Officer)
              </div>
              <div style={{ fontSize: '13.5px', lineHeight: 1.8 }}>
                <div><strong>अधिकारी नाव:</strong> ॲड. रणजीत पाटील (Data Protection & Grievance Officer)</div>
                <div><strong>संस्था:</strong> अखिल भारतीय मराठा महासंघ — केंद्रीय विधी व डेटा संरक्षण कक्ष</div>
                <div>📍 <strong>कार्यालय:</strong> मराठा महासंघ भवन, नारायण पेठ, छत्रपती शिवाजी महाराज चौक, पुणे – ४११०३०, महाराष्ट्र.</div>
                <div>✉️ <strong>विशेष तक्रार ईमेल:</strong> <a href="mailto:grievance@connectmaratha.com" style={{ color: '#7a1c1c', fontWeight: 700 }}>grievance@connectmaratha.com</a></div>
                <div>✉️ <strong>गोपनीयता कक्ष:</strong> <a href="mailto:privacy@connectmaratha.com" style={{ color: '#7a1c1c', fontWeight: 700 }}>privacy@connectmaratha.com</a></div>
                <div>📞 <strong>हेल्पलाईन:</strong> १८००-२३३-१९८१ (सोमवार ते शनिवार, सकाळी १० ते संध्याकाळी ६)</div>
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#64748b' }}>
                  * तक्रार निवारण SLA: प्रत्येक कायदेशीर तक्रारीची पावती २४ तासांच्या आत दिली जाईल आणि संपूर्ण निवारण कमाल ७ कामकाजाच्या दिवसांत केले जाईल.
                </div>
              </div>
            </div>
          </section>

        </div>

      </div>
    </div>
  );
}
