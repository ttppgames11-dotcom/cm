import React from 'react';
import { Link } from 'react-router-dom';

export default function PrivacyPolicyPage() {
  return (
    <div style={{ background: '#FAF7F2', minHeight: '100vh', padding: '40px 0 80px' }}>
      <div className="container" style={{ maxWidth: '980px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* Navigation Breadcrumb / Return Link */}
        <div style={{ marginBottom: '24px' }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              color: '#C73800',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '0.95rem'
            }}
          >
            ← मुख्य पृष्ठावर परत जा (Return to Home)
          </Link>
        </div>

        {/* Hero Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #C73800 0%, #EA580C 100%)',
            borderRadius: '16px',
            color: '#FFFFFF',
            padding: '36px 30px',
            marginBottom: '32px',
            boxShadow: '0 10px 25px rgba(199, 56, 0, 0.15)'
          }}
        >
          <div style={{ display: 'inline-block', background: 'rgba(255, 255, 255, 0.2)', padding: '4px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 800, marginBottom: '12px' }}>
            अधिकृत गोपनीयता धोरण (Official Legal Document)
          </div>
          <h1 style={{ margin: '0 0 10px', fontSize: '2.4rem', fontFamily: 'Baloo 2, sans-serif', fontWeight: 800 }}>
            Privacy Policy | गोपनीयता धोरण
          </h1>
          <p style={{ margin: 0, opacity: 0.95, fontSize: '1.05rem', lineHeight: 1.6 }}>
            Connect Maratha (कनेक्ट मराठा) — अखिल भारतीय मराठा महासंघ (All India Maratha Mahasangh)
          </p>
          <div style={{ marginTop: '16px', fontSize: '0.88rem', opacity: 0.9 }}>
            लागू तारीख (Effective Date): <strong>१ ऑक्टोबर २०२६</strong> | शेवटचे अद्यतन (Last Updated): <strong>ऑक्टोबर २०२६</strong>
          </div>
        </div>

        {/* Content Container */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            padding: '36px 32px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
            lineHeight: 1.8,
            color: '#374151',
            fontSize: '0.98rem'
          }}
        >

          {/* 1. Introduction & Developer Identity */}
          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ color: '#C73800', fontSize: '1.4rem', fontFamily: 'Baloo 2, sans-serif', borderBottom: '2px solid #FED7AA', paddingBottom: '6px', marginBottom: '12px' }}>
              १. परिचय व संस्था ओळख (Introduction & Entity Identity)
            </h2>
            <p>
              <strong>Connect Maratha (कनेक्ट मराठा)</strong> हे <strong>अखिल भारतीय मराठा महासंघ (All India Maratha Mahasangh)</strong> चे अधिकृत डिजिटल व्यासपीठ आहे (Android App Package: <code>com.connectmaratha.app</code>, संकेतस्थळ: <code>https://www.connectmaratha.com</code>).
            </p>
            <p>
              हे गोपनीयता धोरण स्पष्ट करते की आम्ही आमच्या मोबाइल अ‍ॅप आणि वेब पोर्टलवर कोणती वैयक्तिक माहिती गोळा करतो, ती कशी वापरली जाते आणि आपल्या अधिकारांचे संरक्षण कसे केले जाते. आम्ही सदस्यांच्या वैयक्तिक गोपनीयतेचा आदर करतो आणि भारतीय डिजिटल वैयक्तिक डेटा संरक्षण कायदा, २०२३ (DPDP Act 2023) तसेच Google Play डेव्हलपर धोरणांचे काटेकोर पालन करण्यास कटिबद्ध आहोत.
            </p>
          </section>

          {/* 2. Personal Data Collected */}
          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ color: '#C73800', fontSize: '1.4rem', fontFamily: 'Baloo 2, sans-serif', borderBottom: '2px solid #FED7AA', paddingBottom: '6px', marginBottom: '12px' }}>
              २. आम्ही कोणती वैयक्तिक माहिती गोळा करतो (Personal Data Collected)
            </h2>
            <p>
              Connect Maratha अ‍ॅप वापरताना सदस्य नोंदणी व प्रोफाइल निर्मितीदरम्यान खालील माहिती सदस्य स्वेच्छेने सादर करतात:
            </p>
            <ul style={{ paddingLeft: '22px', marginBottom: '16px' }}>
              <li><strong>ओळख व संपर्क माहिती:</strong> संपूर्ण नाव (Full Name), ईमेल पत्ता (Email Address), मोबाइल फोन नंबर (Mobile/Phone Number).</li>
              <li><strong>भौगोलिक व मूळ गाव माहिती (वापरकर्त्याने निवडलेली):</strong> देश (Country), राज्य (State), जिल्हा (District), तालुका (Taluka), गाव (Village) आणि सध्याचे शहर (City).</li>
              <li><strong>व्यावसायिक व शैक्षणिक माहिती:</strong> व्यवसाय (Profession), व्यवसाय/कंपनी नाव (Business Info), शिक्षण (Education), कौशल्ये (Skills) आणि बायो/स्व-परिचय (About/Bio).</li>
              <li><strong>प्रोफाइल छायाचित्र:</strong> सदस्याने डिव्हाइसच्या सिस्टीम फोटो पिकरद्वारे स्वेच्छेने निवडलेले व अपलोड केलेले प्रोफाइल चित्र.</li>
              <li><strong>समुदाय संवाद (UGC):</strong> सदस्याने स्वतः तयार केलेल्या पोस्ट (Posts), पोस्टसोबत जोडलेली छायाचित्रे (Images), प्रतिक्रिया (Comments) आणि पसंती (Likes).</li>
            </ul>
          </section>

          {/* 3. Purpose & Use of Data */}
          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ color: '#C73800', fontSize: '1.4rem', fontFamily: 'Baloo 2, sans-serif', borderBottom: '2px solid #FED7AA', paddingBottom: '6px', marginBottom: '12px' }}>
              ३. माहिती गोळा करण्याचा उद्देश व वापर (Purpose & Use of Data)
            </h2>
            <p>आम्ही गोळा केलेल्या माहितीचा वापर खालील उद्देशांसाठी करतो:</p>
            <ul style={{ paddingLeft: '22px', marginBottom: '16px' }}>
              <li><strong>खाते निर्मिती व प्रमाणीकरण:</strong> सुरक्षित लॉगिन, पासवर्ड रीसेटसाठी ईमेल OTP पडताळणी आणि अधिकृत डिजिटल सदस्य कार्ड निर्मिती.</li>
              <li><strong>स्थानिक व प्रादेशिक जोडणी:</strong> सदस्यांना त्यांच्या जिल्ह्यातील व तालुक्यातील समाजबांधव आणि उद्योजक शोधण्यात साहाय्य करणे.</li>
              <li><strong>समुदाय चर्चा व ज्ञान देवाणघेवाण:</strong> ऐतिहासिक वारसा, गड-किल्ले माहिती, सण आणि सामाजिक विषयांवर संवाद साधणे.</li>
              <li><strong>सेवा व साहाय्य:</strong> सदस्य चौकशी आणि तांत्रिक अडचणी निवारण करणे.</li>
            </ul>
          </section>

          {/* 4. Permissions & Device Access */}
          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ color: '#C73800', fontSize: '1.4rem', fontFamily: 'Baloo 2, sans-serif', borderBottom: '2px solid #FED7AA', paddingBottom: '6px', marginBottom: '12px' }}>
              ४. डिव्हाइस परवानग्या व डेटा मर्यादा (Device Permissions & What We DO NOT Access)
            </h2>
            <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '10px', padding: '16px 20px', marginBottom: '16px' }}>
              <strong>पारदर्शकता घोषणा (Explicit Privacy Guarantees):</strong>
              <ul style={{ paddingLeft: '20px', margin: '8px 0 0' }}>
                <li><strong>GPS / थेट स्थान ट्रॅकिंग नाही:</strong> अ‍ॅप डिव्हाइसचे सततचे किंवा बॅकग्राउंड GPS स्थान ट्रॅक करत नाही. स्थान माहिती केवळ नोंदणीवेळी वापरकर्त्याने मॅन्युअली ड्रॉपडाउनमधून निवडलेली असते.</li>
                <li><strong>संपर्क यादी (Contacts) प्रवेश नाही:</strong> आम्ही आपल्या फोनमधील कॉन्टॅक्ट्स वाचत नाही किंवा अ‍ॅक्सेस करत नाही.</li>
                <li><strong>SMS व कॉल लॉग्स प्रवेश नाही:</strong> आम्ही आपले खाजगी मेसेज किंवा फोन कॉल्स वाचत नाही. पासवर्ड रीसेट OTP केवळ अधिकृत ईमेलद्वारे पाठवला जातो.</li>
                <li><strong>मायक्रोफोन प्रवेश नाही:</strong> अ‍ॅप मायक्रोफोन वापरत नाही.</li>
                <li><strong>कोणत्याही जाहिराती नाहीत (No Advertisements):</strong> Connect Maratha अ‍ॅपमध्ये कोणतेही थर्ड-पार्टी अ‍ॅडव्हर्टायझिंग SDK समाविष्ट नाही.</li>
                <li><strong>फोटो पिकर:</strong> छायाचित्र निवडताना केवळ सिस्टीम फोटो पिकर (Android Photo Picker) वापरला जातो, ज्यामुळे संपूर्ण स्टोरेजला परवानगी देण्याची आवश्यकता नसते.</li>
              </ul>
            </div>
          </section>

          {/* 5. Security & Technical Architecture */}
          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ color: '#C73800', fontSize: '1.4rem', fontFamily: 'Baloo 2, sans-serif', borderBottom: '2px solid #FED7AA', paddingBottom: '6px', marginBottom: '12px' }}>
              ५. डेटा सुरक्षा व प्रमाणीकरण (Data Security & Authentication)
            </h2>
            <ul style={{ paddingLeft: '22px', marginBottom: '16px' }}>
              <li><strong>एनक्रिप्टेड पासवर्ड:</strong> सदस्यांचे पासवर्ड कधीही प्लेन टेक्स्ट स्वरूपात साठवले जात नाहीत; ते उद्योग-मानक bcrypt अल्गोरिदमद्वारे हॅश केले जातात.</li>
              <li><strong>सत्र सुरक्षितता:</strong> JSON Web Tokens (JWT) आणि रिफ्रेश टोकन्सद्वारे सत्र सुरक्षित केले जाते. मोबाइल अ‍ॅपमध्ये टोकन्स Android KeyStore समर्थित secure storage मध्ये सुरक्षित राहतात.</li>
              <li><strong>डेटा ट्रान्सफर सुरक्षा:</strong> सर्व नेटवर्क संप्रेषण HTTPS (TLS 1.3) द्वारे एनक्रिप्ट केलेले असते.</li>
              <li><strong>पायाभूत सुविधा:</strong> अधिकृत उत्पादन सर्व्हर्स Cloudflare सुरक्षा कवचाखाली आणि अधिकृत डेटाबेसद्वारे सुरक्षित ठेवले जातात.</li>
            </ul>
          </section>

          {/* 6. Third-Party Services */}
          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ color: '#C73800', fontSize: '1.4rem', fontFamily: 'Baloo 2, sans-serif', borderBottom: '2px solid #FED7AA', paddingBottom: '6px', marginBottom: '12px' }}>
              ६. त्रयस्थ पक्ष सेवा (Third-Party Infrastructure & Services)
            </h2>
            <p>
              Connect Maratha आपला वैयक्तिक डेटा कोणत्याही मार्केटिंग किंवा व्यावसायिक जाहिरात कंपन्यांना विकत नाही, भाड्याने देत नाही किंवा व्यापार करत नाही. केवळ सेवा चालवण्यासाठी खालील अधिकृत तांत्रिक पायाभूत सुविधा वापरल्या जातात:
            </p>
            <ul style={{ paddingLeft: '22px', marginBottom: '16px' }}>
              <li><strong>Cloudflare:</strong> DDoS संरक्षण, DNS व SSL/TLS सुरक्षा.</li>
              <li><strong>Vercel:</strong> अधिकृत वेब पोर्टल होस्टिंग.</li>
              <li><strong>Google Identity (पर्यायी):</strong> सदस्य जेव्हा स्वेच्छेने "Sign in with Google" निवडतात तेव्हा केवळ प्रमाणीकरणासाठी वापरले जाते.</li>
              <li><strong>Sentry (पर्यायी त्रुटी नोंदणी):</strong> अ‍ॅप अचानक बंद पडल्यास (crash) तांत्रिक त्रुटीचे विश्लेषण करण्यासाठी (यात कोणताही वैयक्तिक डेटा पाठवला जात नाही).</li>
            </ul>
          </section>

          {/* 7. User-Generated Content & Moderation */}
          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ color: '#C73800', fontSize: '1.4rem', fontFamily: 'Baloo 2, sans-serif', borderBottom: '2px solid #FED7AA', paddingBottom: '6px', marginBottom: '12px' }}>
              ७. समुदाय सामग्री व नियम (User-Generated Content & Guidelines)
            </h2>
            <p>
              Connect Maratha व्यासपीठावर पोस्ट किंवा कमेंट करताना समाजाच्या सन्मानाला बाधा पोहोचवणारी, द्वेषमूलक, हिंसक किंवा अश्लील सामग्री प्रसारित करण्यास सक्त मनाई आहे. नियमबाह्य मजकूर आढळल्यास प्रशासकीय समिती तो काढून टाकण्याचा किंवा संबंधित सदस्यावर कारवाई करण्याचा अधिकार राखून ठेवते.
            </p>
          </section>

          {/* 8. Account & Data Deletion */}
          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ color: '#C73800', fontSize: '1.4rem', fontFamily: 'Baloo 2, sans-serif', borderBottom: '2px solid #FED7AA', paddingBottom: '6px', marginBottom: '12px' }}>
              ८. खाते व डेटा हटवणे (Account & Data Deletion Requests)
            </h2>
            <p>
              प्रत्येक सदस्याला आपले खाते आणि वैयक्तिक माहिती कायमस्वरूपी हटवण्याचा (Right to be Forgotten) पूर्ण अधिकार आहे.
            </p>
            <div style={{ background: '#FFF7ED', border: '1px solid #FFEDD5', borderRadius: '10px', padding: '16px 20px', marginBottom: '14px' }}>
              <p style={{ margin: '0 0 10px', fontWeight: 700, color: '#C2410C' }}>
                खाते हटवण्याची विनंती कशी करावी (How to Request Account Deletion):
              </p>
              <ol style={{ paddingLeft: '20px', margin: 0 }}>
                <li style={{ marginBottom: '8px' }}>
                  <strong>थेट सपोर्ट ईमेलद्वारे:</strong> आपल्या नोंदणीकृत ईमेल पत्त्यावरून <strong>support@connectmaratha.com</strong> किंवा <strong>contact@connectmaratha.org</strong> वर <em>"Account Deletion Request"</em> या विषयासह ईमेल पाठवा.
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong>मोबाइल अ‍ॅप सेटिंग्ज:</strong> अ‍ॅपमधील प्रोफाइल → गोपनीयता व सुरक्षा (Security & Privacy) पर्यायामध्ये जाऊन खाते हटवण्याची विनंती नोंदवा.
                </li>
              </ol>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#6B7280' }}>
              * नोंदणीकृत विनंतीची पडताळणी झाल्यानंतर संबंधित सदस्याचे प्रोफाइल, संपर्क माहिती आणि संबंधित डेटा उत्पादन सर्व्हर्सवरून कायमस्वरूपी काढून टाकला जातो.
            </p>
          </section>

          {/* 9. Children's Privacy */}
          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ color: '#C73800', fontSize: '1.4rem', fontFamily: 'Baloo 2, sans-serif', borderBottom: '2px solid #FED7AA', paddingBottom: '6px', marginBottom: '12px' }}>
              ९. बालकांची गोपनीयता (Children's Privacy)
            </h2>
            <p>
              Connect Maratha हे सर्वसामान्य सामाजिक, सांस्कृतिक व व्यावसायिक व्यासपीठ आहे आणि हे १३ वर्षांखालील बालकांसाठी उद्देशित नाही. आम्ही जाणीवपूर्वक कोणत्याही अल्पवयीन बालकांची वैयक्तिक माहिती गोळा करत नाही. पालकांच्या संमतीशिवाय अशी माहिती नोंदवली गेल्याचे निदर्शनास आल्यास आम्ही ती तात्काळ हटवतो.
            </p>
          </section>

          {/* 10. Contact & Grievance Redressal */}
          <section>
            <h2 style={{ color: '#C73800', fontSize: '1.4rem', fontFamily: 'Baloo 2, sans-serif', borderBottom: '2px solid #FED7AA', paddingBottom: '6px', marginBottom: '12px' }}>
              १०. संपर्क व तक्रार निवारण अधिकारी (Grievance Officer & Contact Information)
            </h2>
            <p>
              या गोपनीयता धोरणाबाबत किंवा आपल्या वैयक्तिक डेटाबाबत कोणतीही शंका, तक्रार किंवा विनंती असल्यास आपण खालील अधिकृत पत्त्यावर संपर्क साधू शकता:
            </p>
            <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '18px 22px' }}>
              <div style={{ fontWeight: 800, color: '#1F2937', marginBottom: '6px', fontSize: '1.05rem' }}>
                अखिल भारतीय मराठा महासंघ — Connect Maratha सचिवालय
              </div>
              <div>📍 <strong>पत्ता:</strong> नारायण पेठ, छत्रपती शिवाजी महाराज चौक, पुणे – ४११०३०, महाराष्ट्र, भारत.</div>
              <div>✉️ <strong>सपोर्ट ईमेल:</strong> <a href="mailto:support@connectmaratha.com" style={{ color: '#C73800' }}>support@connectmaratha.com</a></div>
              <div>✉️ <strong>संपर्क ईमेल:</strong> <a href="mailto:contact@connectmaratha.org" style={{ color: '#C73800' }}>contact@connectmaratha.org</a></div>
              <div>✉️ <strong>महासंघ ईमेल:</strong> <a href="mailto:connect@marathamahasangh.org" style={{ color: '#C73800' }}>connect@marathamahasangh.org</a></div>
              <div>📞 <strong>हेल्पलाईन:</strong> १८००-२३३-१९८१</div>
            </div>
          </section>

        </div>

      </div>
    </div>
  );
}
