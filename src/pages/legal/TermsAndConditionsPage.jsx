import React from 'react';
import { Link } from 'react-router-dom';

/* ============================================================
   🚩 CONNECT MARATHA — नियम व अटी (Terms & Conditions)
   Google Play Console & Indian IT Act / DPDP Act 2023 Compliant
   ============================================================ */

export default function TermsAndConditionsPage() {
  return (
    <div style={{ background: '#FAF7F2', minHeight: '100vh', padding: '40px 0 80px', color: '#1C1917' }}>
      <div className="container" style={{ maxWidth: '980px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* Navigation Breadcrumb */}
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
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
          <div style={{ display: 'flex', gap: '12px' }}>
            <Link
              to="/privacy"
              style={{
                color: '#7C2D12',
                textDecoration: 'underline',
                fontWeight: 600,
                fontSize: '0.9rem'
              }}
            >
              गोपनीयता धोरण (Privacy Policy) →
            </Link>
          </div>
        </div>

        {/* Hero Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #7A1C1C 0%, #C73800 100%)',
            borderRadius: '16px',
            color: '#FFFFFF',
            padding: '36px 30px',
            marginBottom: '32px',
            boxShadow: '0 10px 25px rgba(122, 28, 28, 0.2)'
          }}
        >
          <div style={{ display: 'inline-block', background: 'rgba(255, 255, 255, 0.2)', padding: '4px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 800, marginBottom: '12px' }}>
            अधिकृत वापर नियम व कायदेशीर करार (Terms of Service)
          </div>
          <h1 style={{ margin: '0 0 10px', fontSize: '2.4rem', fontFamily: 'Baloo 2, sans-serif', fontWeight: 800 }}>
            नियम व अटी | Terms & Conditions
          </h1>
          <p style={{ margin: 0, opacity: 0.95, fontSize: '1.05rem', lineHeight: 1.6 }}>
            Connect Maratha (कनेक्ट मराठा) • अखिल भारतीय मराठा महासंघ डिजिटल प्लॅटफॉर्म
          </p>
          <div style={{ marginTop: '16px', fontSize: '0.88rem', opacity: 0.9 }}>
            लागू तारीख (Effective Date): <strong>१ ऑक्टोबर २०२६</strong> | आवृत्ती (Version): <strong>2.0.0</strong>
          </div>
        </div>

        {/* Content Box */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            padding: '40px 34px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
            lineHeight: 1.85,
            fontSize: '1rem'
          }}
        >
          
          {/* Summary Box */}
          <div style={{ background: '#FFF7ED', borderLeft: '4px solid #EA580C', padding: '16px 20px', borderRadius: '0 8px 8px 0', marginBottom: '32px' }}>
            <h4 style={{ margin: '0 0 6px', color: '#9A3412', fontWeight: 800 }}>
              महत्त्वाची नोंद (Important Notice for All Users):
            </h4>
            <p style={{ margin: 0, fontSize: '0.95rem', color: '#431407' }}>
              Connect Maratha ॲप किंवा संकेतस्थळाचा वापर करून, आपण या नियम व अटी आणि आमच्या गोपनीयता धोरणास पूर्णपणे सहमती दर्शवता. जर आपण या अटींशी सहमत नसाल, तर कृपया या व्यासपीठाचा वापर करू नये किंवा तात्काळ खाते रद्द करावे.
            </p>
          </div>

          {/* Section 1 */}
          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ color: '#7A1C1C', fontSize: '1.35rem', fontWeight: 800, borderBottom: '2px solid #FED7AA', paddingBottom: '6px', marginBottom: '14px' }}>
              १. सदस्यत्व पात्रता व नोंदणी (Membership Eligibility & Registration)
            </h2>
            <ul style={{ paddingLeft: '22px', margin: 0 }}>
              <li style={{ marginBottom: '8px' }}>
                <strong>वय पात्रता:</strong> Connect Maratha चे स्वतंत्र डिजिटल सदस्यत्व घेण्यासाठी वापरकर्त्याचे वय <strong>किमान १८ वर्षे</strong> पूर्ण असणे आवश्यक आहे. १८ वर्षांखालील व्यक्ती पालकांच्या देखरेखीखालीच शैक्षणिक विभागाचा लाभ घेऊ शकतात.
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong>सत्य व अचूक माहिती:</strong> नोंदणी करताना आपले खरे नाव, अधिकृत मोबाईल क्रमांक, पत्ता आणि वैध तपशील देणे बंधनकारक आहे. खोटी माहिती दिल्यास सदस्यत्व रद्द केले जाईल.
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong>एक व्यक्ती, एक ओळखपत्र:</strong> एका व्यक्तीस केवळ एकच अधिकृत डिजिटल सदस्यत्व ओळखपत्र (Digital Member ID) दिले जाईल. एकाधिक बनावट खाती तयार करण्यास सक्त मनाई आहे.
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ color: '#7A1C1C', fontSize: '1.35rem', fontWeight: 800, borderBottom: '2px solid #FED7AA', paddingBottom: '6px', marginBottom: '14px' }}>
              २. समुदाय आचारसंहिता व शून्य सहिष्णुता (Code of Conduct & Zero Tolerance Policy)
            </h2>
            <p>
              Connect Maratha हे छत्रपती शिवाजी महाराज आणि राजमाता जिजाऊंच्या विचारांवर आधारित एक सन्माननीय, स्वाभिमानी आणि प्रगतीशील सामाजिक-व्यावसायिक व्यासपीठ आहे. खालील वर्तणुकीस <strong>शून्य सहिष्णुता (Zero Tolerance)</strong> लागू आहे:
            </p>
            <ul style={{ paddingLeft: '22px', margin: 0 }}>
              <li style={{ marginBottom: '8px' }}>
                कोणत्याही प्रकारची द्वेषमूलक विधाने (Hate Speech), समाजात तेढ निर्माण करणारा मजकूर किंवा धार्मिक/जातीय अवमान.
              </li>
              <li style={{ marginBottom: '8px' }}>
                महिला सदस्यांचा छळ, अयोग्य संदेश किंवा असभ्य भाषा वापरणे.
              </li>
              <li style={{ marginBottom: '8px' }}>
                वधू-वर (Matrimony) किंवा रोजगार (Jobs) कक्षात फसवणूक, दिशाभूल किंवा आर्थिक मागण्या करणे.
              </li>
              <li style={{ marginBottom: '8px' }}>
                व्यासपीठाचा वापर बेकायदेशीर कृत्ये, जुगार किंवा अनधिकृत देणगी गोळा करण्यासाठी करणे.
              </li>
            </ul>
            <p style={{ marginTop: '10px', color: '#991B1B', fontWeight: 700, fontSize: '0.92rem' }}>
              * या नियमांचे उल्लंघन करणाऱ्या वापरकर्त्याचे खाते तात्काळ ब्लॉक केले जाईल आणि आवश्यकतेनुसार कायदेशीर कारवाई केली जाईल.
            </p>
          </section>

          {/* Section 3 */}
          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ color: '#7A1C1C', fontSize: '1.35rem', fontWeight: 800, borderBottom: '2px solid #FED7AA', paddingBottom: '6px', marginBottom: '14px' }}>
              ३. व्यावसायिक सेवा, B2B करार व कम्युनिटी सेंटर व्यवहार (Commercial Services & Disclaimers)
            </h2>
            <ul style={{ paddingLeft: '22px', margin: 0 }}>
              <li style={{ marginBottom: '8px' }}>
                <strong>मध्यस्थ व्यासपीठ:</strong> Connect Maratha हे स्थानिक व्यापारी, उद्योजक, व्यावसायिक भागीदार (CA, वकील, डॉक्टर्स) आणि नागरिक यांना जोडणारे माध्यम आहे.
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong>व्यवहारांची पडताळणी:</strong> B2B सौदे किंवा व्यावसायिक सेवा घेताना ग्राहकाने व पुरवठादाराने योग्य ती खबरदारी व व्यावसायिक खात्री करावी. कोणत्याही खाजगी व्यापारी वादात संस्थेची जबाबदारी मर्यादित राहील.
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong>दैनिक पावत्या व वर्गणी:</strong> कम्युनिटी सेंटर किंवा ऑनलाइन माध्यमातून दिलेली सदस्यता वर्गणी किंवा देणगी संस्थेच्या अधिकृत पावतीसह नोंदवली जाते.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ color: '#7A1C1C', fontSize: '1.35rem', fontWeight: 800, borderBottom: '2px solid #FED7AA', paddingBottom: '6px', marginBottom: '14px' }}>
              ४. बौद्धिक संपदा व बोधचिन्ह अधिकार (Intellectual Property & Trademarks)
            </h2>
            <p>
              "Connect Maratha", संस्थेचे अधिकृत बोधचिन्ह (Emblem - आधुनिक युगातील आधुनिक संघटन), मोबाइल ॲपची रचना, डेटाबेस आर्किटेक्चर आणि विशेष अल्गोरिदम हे अखिल भारतीय मराठा महासंघाच्या मालकीचे आहेत. संस्थेच्या लेखी परवानगीशिवाय बोधचिन्हाचा गैरवापर करण्यास मनाई आहे.
            </p>
          </section>

          {/* Section 5 */}
          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ color: '#7A1C1C', fontSize: '1.35rem', fontWeight: 800, borderBottom: '2px solid #FED7AA', paddingBottom: '6px', marginBottom: '14px' }}>
              ५. खाते रद्द करणे व डेटा हटवणे (Account Termination & Deletion)
            </h2>
            <p>
              कोणत्याही वापरकर्त्यास आपले खाते स्वेच्छेने बंद करण्याचा पूर्ण अधिकार आहे. Google Play Console मार्गदर्शक तत्त्वांनुसार, आपण थेट आमच्या <Link to="/privacy#deletion" style={{ color: '#C73800', fontWeight: 700 }}>खाते हटवणे (Account Deletion)</Link> विभागातून किंवा support@connectmaratha.com वर विनंती पाठवून खाते व डेटा कायमस्वरूपी हटवू शकता.
            </p>
          </section>

          {/* Section 6 */}
          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ color: '#7A1C1C', fontSize: '1.35rem', fontWeight: 800, borderBottom: '2px solid #FED7AA', paddingBottom: '6px', marginBottom: '14px' }}>
              ६. कायदेशीर अधिकारक्षेत्र व वाद निवारण (Governing Law & Jurisdiction)
            </h2>
            <p>
              हे नियम व अटी भारताच्या कायद्यानुसार आणि विशेषतः माहिती तंत्रज्ञान कायदा २००० (IT Act 2000) व डिजिटल वैयक्तिक डेटा संरक्षण कायदा २०२३ (DPDP Act 2023) अंतर्गत नियंत्रित आहेत. या व्यासपीठासंदर्भात उद्भवणारे कोणतेही वाद हे <strong>पुणे न्यायालय (Pune Jurisdiction, Maharashtra)</strong> अंतर्गत हाताळले जातील.
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 style={{ color: '#7A1C1C', fontSize: '1.35rem', fontWeight: 800, borderBottom: '2px solid #FED7AA', paddingBottom: '6px', marginBottom: '14px' }}>
              ७. कायदेशीर संपर्क व तक्रार निवारण (Legal Contact)
            </h2>
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '18px 22px', borderRadius: '10px' }}>
              <div style={{ fontWeight: 800, color: '#0F172A', marginBottom: '6px', fontSize: '1.05rem' }}>
                अखिल भारतीय मराठा महासंघ — कायदेशीर कक्ष (Legal & Compliance Department)
              </div>
              <div>📍 <strong>पत्ता:</strong> छत्रपती संभाजी महाराज भवन, एफसी रोड, शिवाजीनगर, पुणे – ४११००४, महाराष्ट्र.</div>
              <div>✉️ <strong>कायदेशीर ईमेल:</strong> <a href="mailto:legal@connectmaratha.com" style={{ color: '#C73800' }}>legal@connectmaratha.com</a></div>
              <div>✉️ <strong>सपोर्ट ईमेल:</strong> <a href="mailto:support@connectmaratha.com" style={{ color: '#C73800' }}>support@connectmaratha.com</a></div>
              <div>📞 <strong>हेल्पलाईन:</strong> १८००-२०९-१६७४</div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
