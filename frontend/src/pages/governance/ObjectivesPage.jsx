import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ObjectivesPage() {
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'सर्व १० उद्दिष्टे (All Goals)' },
    { id: 'heritage', label: '🚩 इतिहास व दुर्गसंवर्धन' },
    { id: 'business', label: '💼 व्यवसाय व उद्योग' },
    { id: 'education', label: '🎓 शिक्षण व रोजगार' },
    { id: 'social', label: '🩸 समाजकल्याण व सुरक्षा' },
    { id: 'agriculture', label: '🌾 शेतकरी व कृषी समृद्धी' }
  ];

  const objectives = [
    {
      id: 1,
      cat: 'heritage',
      num: '१',
      title: 'अखंड मराठा समाज ऐक्य, डिजिटल ओळख व स्वाभिमान',
      target: '१ कोटी अधिकृत सदस्य',
      timeline: '२०२६–२०२८',
      badge: 'प्रथम प्राधान्य',
      desc: 'महाराष्ट्रासह देश-विदेशातील प्रत्येक मराठा बांधवाला अधिकृत डिजिटल सदस्य ओळखपत्र (CM-ID), सुरक्षित DPDP अनुपालन आणि संघटित डिजिटल व्यासपीठावर एकत्र आणणे.',
      points: [
        'सर्व ३६ जिल्ह्यांत बायोमेट्रिक व डिजिटल सदस्यत्व प्रमाणीकरण',
        'अद्वितीय डिजिटल स्मार्ट कार्ड व बारकोड सुरक्षा',
        'समाजहिताच्या निर्णयांसाठी एकात्मिक ई-मतदान व पारदर्शक सहभाग'
      ]
    },
    {
      id: 2,
      cat: 'heritage',
      num: '२',
      title: '३५०+ सह्याद्री गड-किल्ल्यांचे १००% संवर्धन व डिजिटायझेशन',
      target: '३५०+ गडकोट',
      timeline: '२०२६–२०३०',
      badge: 'वारसा संवर्धन',
      desc: 'छत्रपती शिवरायांच्या पदस्पर्शाने पावन झालेल्या सर्व ३५०+ किल्ल्यांचे जतन, स्वच्छता मोहिमा, वृक्षारोपण, ऐतिहासिक संशोधन आणि जागतिक वारसा दर्जा मिळवून देणे.',
      points: [
        'प्रत्येक किल्ल्याचे ३६०° आभासी दर्शन व ऐतिहासिक माहिती केंद्र',
        'स्थानिक दुर्गप्रेमी संघटनांना संवर्धन साहित्याचे थेट अर्थसाहाय्य',
        'शिवकालीन स्थापत्य व जलव्यवस्थापनाचा आंतरराष्ट्रीय प्रचार'
      ]
    },
    {
      id: 3,
      cat: 'business',
      num: '३',
      title: 'व्यवसाय संगम: ₹ १०,००० कोटींचा वार्षिक अंतर्गत B2B व्यापार',
      target: '₹१०,००० कोटी उलाढाल',
      timeline: '२०२६–२०३०',
      badge: 'आर्थिक उन्नती',
      desc: "'व्यवसाय संगम' चॅप्टर्सच्या माध्यमातून मराठी उद्योजक, उत्पादक, व्यापारी आणि व्यावसायिक यांना एकमेकांशी जोडून अंतर्गत व्यापार वृद्धी करणे.",
      points: [
        '३६ जिल्ह्यांत ५००+ व्यावसायिक संगम चॅप्टर्सची स्थापना',
        'सह्याद्री व्हेंचर फंड व नवउद्योजकांसाठी सीड फंडिंग साहाय्य',
        'दुबई, लंडन, सिंगापूर व मुंबई येथे मराठा आंतरराष्ट्रीय ग्लोबल एक्स्पो'
      ]
    },
    {
      id: 4,
      cat: 'education',
      num: '४',
      title: '१ लाख मराठा युवा करिअर, रोजगार व स्पर्धा परीक्षा सक्षमीकरण',
      target: '१,००,००० युवक-युवती',
      timeline: '२०२६–२०२९',
      badge: 'करिअर क्रांती',
      desc: 'UPSC, MPSC, संरक्षण दल, मर्चंट नेव्ही, आयटी, आणि आर्टिफिशिअल इंटेलिजन्स क्षेत्रात मराठा तरुणांना मोफत प्रशिक्षण, मार्गदर्शन व शिष्यवृत्ती उपलब्ध करणे.',
      points: [
        'जिल्हानिहाय मोफत डिजिटल अभ्यासिका व करिअर समुपदेशन केंद्र',
        'जागतिक दर्जाच्या नामांकित कंपन्यांसोबत थेट नोकरभरती करार',
        'उच्च शिक्षणासाठी सुलभ शैक्षणिक कर्ज व आंतरराष्ट्रीय मार्गदर्शन'
      ]
    },
    {
      id: 5,
      cat: 'social',
      num: '५',
      title: '२४×७ आपत्कालीन सुरक्षा व २४ तास रक्तदाता महासाखळी',
      target: '१००% तालुके समन्वय',
      timeline: 'तात्काळ कार्यरत',
      badge: 'जीवनरक्षा',
      desc: 'महाराष्ट्रातील ३६ जिल्हे व ३५८+ तालुक्यांमध्ये गरजू रुग्णांना एका क्लिकवर तत्काळ रक्तदाता, रुग्णवाहिका आणि कायदेशीर मदत उपलब्ध करणे.',
      points: [
        '३० सेकंदांत स्थानिक रक्तदात्याशी संपर्क साधणारी डिजिटल प्रणाली',
        'ग्रामीण व दुर्गम भागात मोफत फिरती आरोग्य तपासणी शिबिरे',
        'अडचणीत सापडलेल्या समाजबांधवांसाठी २४×७ विनामूल्य मदत हेल्पलाईन'
      ]
    },
    {
      id: 6,
      cat: 'heritage',
      num: '६',
      title: 'अस्सल ऐतिहासिक ज्ञाननिर्मिती, बखरी व मोडी लिपी ग्रंथालय',
      target: '५०,०००+ दुर्मिळ कागदपत्रे',
      timeline: '२०२६–२०२८',
      badge: 'सत्य इतिहास',
      desc: 'शिवकालीन बखरी, अस्सल फर्मान, मोडी लिपीतील दस्तावेज यांचे संकलन करून जगातील सर्वात मोठे मराठा डिजिटल ग्रंथालय (Dnyankosh) निर्माण करणे.',
      points: [
        'इतिहासाचे विकृतीकरण रोखून अस्सल पुराव्यांसह सत्य इतिहास मांडणे',
        'नवीन पिढीसाठी मोडी लिपी व ऐतिहासिक संशोधन कार्यशाळा',
        '१५ भागांची सविस्तर शिवचरित्र कथन डिजिटल ऑडिओ-व्हिडिओ मालिका'
      ]
    },
    {
      id: 7,
      cat: 'agriculture',
      num: '७',
      title: 'बळीराजा समृद्धी, FPO महासंघ व शून्य-मध्यस्थी जागतिक शेती निर्यात',
      target: '५००+ FPO व १० लाख शेतकरी',
      timeline: '२०२६–२०३०',
      badge: 'शेतकरी सन्मान',
      desc: 'शेतकऱ्यांच्या पाठीशी खंबीरपणे उभे राहून दलाली व्यवस्था नष्ट करणे. शेतमाल थेट देशांतर्गत व आखाती देशांत निर्यात करण्याची हमी साखळी निर्माण करणे.',
      points: [
        'कांदा, डाळिंब, द्राक्षे व सेंद्रिय अन्नधान्य निर्यात क्लस्टर्स',
        'तालुकानिहाय शीतगृह (Cold Storage) व शेती प्रक्रिया उद्योग',
        'शेतकरी आत्महत्याग्रस्त कुटुंबांना सन्मानजनक पुनर्वसन व अर्थसाहाय्य'
      ]
    },
    {
      id: 8,
      cat: 'social',
      num: '८',
      title: 'महिला सक्षमीकरण, बचत गट स्वावलंबन व नेतृत्व विकास',
      target: '१०,०००+ महिला बचत गट',
      timeline: '२०२६–२०२९',
      badge: 'मातृशक्ती',
      desc: 'राजमाता जिजाऊंच्या प्रेरणेने महिलांना आर्थिक, सामाजिक व कायदेशीरदृष्ट्या सक्षम करणे. गृहउद्योग व बचत गटांना डिजिटल ई-कॉमर्स बाजारपेठ देणे.',
      points: [
        'महिला बचत गटांच्या उत्पादनांना Connect Maratha द्वारे थेट विक्री',
        'मोफत कायदेशीर सल्ला, समुपदेशन व कौटुंबिक तक्रार निवारण कक्ष',
        'राजकीय व प्रशासकीय क्षेत्रात महिला नेतृत्वाला प्रोत्साहन व प्रशिक्षण'
      ]
    },
    {
      id: 9,
      cat: 'social',
      num: '९',
      title: 'मराठा वधू-वर सूचक केंद्र व पारदर्शक कौटुंबिक समन्वय',
      target: '१००% मोफत व सुरक्षित',
      timeline: 'सक्रिय',
      badge: 'संस्कार व कुटुंब',
      desc: 'कोणत्याही अनाठायी शुल्काशिवाय, १००% गोपनीय, सुरक्षित व उच्च दर्जाची वैवाहिक डिजिटल प्रणाली उपलब्ध करून मराठा कुटुंबांचे ऋणानुबंध जोडणे.',
      points: [
        'सत्यापित प्रोफाईल्स व सुरक्षित कौटुंबिक माहिती',
        'विवाह समुपदेशन व साधेपणाने विवाह सोहळे साजरे करण्याची चळवळ',
        'सर्व ९६ कुळे व शाखांचा परिपूर्ण व पारदर्शक समन्वय'
      ]
    },
    {
      id: 10,
      cat: 'heritage',
      num: '१०',
      title: '५६ प्रशासकीय पदे, पारदर्शक संघटन व सुशासन व्यवस्था',
      target: '३६ जिल्हे नेतृत्व संघ',
      timeline: '२०२६',
      badge: 'सुशासन',
      desc: 'प्रत्येक पदासाठी स्पष्ट KPI, पारदर्शक निवडप्रक्रिया आणि सेवाभावी प्रशासकीय चौकट निर्माण करून समाजाचे नेतृत्व सक्षम करणे.',
      points: [
        'जिल्हाध्यक्ष, तालुकाध्यक्ष ते शाखाप्रमुखांपर्यंत स्पष्ट जबाबदाऱ्या',
        'दरमहा त्रैमासिक अहवाल व थेट कामगिरी मूल्यमापन',
        'कोणताही राजकीय किंवा वैयक्तिक स्वार्थ न ठेवता समाजसेवा'
      ]
    }
  ];

  const filteredObjectives = activeCategory === 'all'
    ? objectives
    : objectives.filter((o) => o.cat === activeCategory);

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', color: '#C2410C' }}>
      {/* Hero Header */}
      <section
        style={{
          background: 'linear-gradient(135deg, #FFF7ED 0%, #FFFFFF 50%, #FFF7ED 100%)',
          borderBottom: '2px solid #FED7AA',
          padding: '60px 20px 48px',
          textAlign: 'center'
        }}
      >
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 18px',
              background: '#FFFFFF',
              border: '1.5px solid #EA580C',
              borderRadius: '50px',
              color: '#EA580C',
              fontWeight: 800,
              fontSize: '0.9rem',
              marginBottom: '16px',
              boxShadow: '0 2px 8px rgba(234, 88, 12, 0.1)'
            }}
          >
            🏆 अधिकृत ध्येय व संकल्प
          </div>
          <h1
            style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 900,
              color: '#EA580C',
              lineHeight: 1.25,
              marginBottom: '16px'
            }}
          >
            Connect Maratha — १० प्रमुख महाउद्दिष्टे
          </h1>
          <p
            style={{
              fontSize: 'clamp(1.05rem, 2vw, 1.25rem)',
              color: '#C2410C',
              lineHeight: 1.6,
              maxWidth: '820px',
              margin: '0 auto 24px',
              fontWeight: 600
            }}
          >
            अखंड मराठा समाजाच्या सर्वांगीण विकासासाठी, आर्थिक समृद्धीसाठी आणि शिवकालीन स्वाभिमानाच्या पुनर्स्थापनेसाठी आखलेली ठोस, कालबद्ध व परिपूर्ण उद्दिष्टे.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <Link
              to="/register"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 28px',
                background: 'linear-gradient(135deg, #EA580C, #F97316)',
                color: '#FFFFFF',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '1rem',
                textDecoration: 'none',
                boxShadow: '0 6px 16px rgba(234, 88, 12, 0.25)'
              }}
            >
              🚩 संकल्पात सहभागी व्हा
            </Link>
            <Link
              to="/vision"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 26px',
                background: '#FFFFFF',
                color: '#EA580C',
                border: '2px solid #EA580C',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '1rem',
                textDecoration: 'none'
              }}
            >
              🎯 आमचे व्हिजन पहा
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px 80px' }}>
        {/* Category Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap',
            justifyContent: 'center',
            marginBottom: '40px'
          }}
        >
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                padding: '10px 20px',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '0.92rem',
                border: activeCategory === cat.id ? '2px solid #EA580C' : '1.5px solid #FED7AA',
                background: activeCategory === cat.id ? '#EA580C' : '#FFFFFF',
                color: activeCategory === cat.id ? '#FFFFFF' : '#C2410C',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: activeCategory === cat.id ? '0 4px 12px rgba(234, 88, 12, 0.2)' : 'none'
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Objectives Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
          {filteredObjectives.map((obj) => (
            <div
              key={obj.id}
              style={{
                background: '#FFFFFF',
                border: '2px solid #FED7AA',
                borderRadius: '18px',
                padding: '28px',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 6px 20px rgba(234, 88, 12, 0.06)',
                position: 'relative',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
            >
              {/* Card Header Badge */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '38px',
                    height: '38px',
                    background: '#FFF7ED',
                    border: '2px solid #EA580C',
                    borderRadius: '50%',
                    fontWeight: 900,
                    fontSize: '1.1rem',
                    color: '#EA580C'
                  }}
                >
                  {obj.num}
                </span>
                <span
                  style={{
                    padding: '4px 12px',
                    background: '#FFF7ED',
                    border: '1px solid #FED7AA',
                    borderRadius: '50px',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    color: '#EA580C'
                  }}
                >
                  {obj.badge}
                </span>
              </div>

              {/* Title */}
              <h2
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: '#EA580C',
                  marginBottom: '12px',
                  lineHeight: 1.35
                }}
              >
                {obj.title}
              </h2>

              {/* Target & Timeline */}
              <div
                style={{
                  display: 'flex',
                  gap: '16px',
                  background: '#FFF7ED',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  marginBottom: '16px',
                  border: '1px solid #FED7AA',
                  fontSize: '0.85rem'
                }}
              >
                <div>
                  <div style={{ color: '#C2410C', fontSize: '0.75rem', fontWeight: 700 }}>लक्ष्य / Target</div>
                  <div style={{ color: '#EA580C', fontWeight: 900 }}>{obj.target}</div>
                </div>
                <div style={{ borderLeft: '1px solid #FED7AA', paddingLeft: '16px' }}>
                  <div style={{ color: '#C2410C', fontSize: '0.75rem', fontWeight: 700 }}>कालावधी / Timeline</div>
                  <div style={{ color: '#EA580C', fontWeight: 900 }}>{obj.timeline}</div>
                </div>
              </div>

              {/* Description */}
              <p style={{ color: '#C2410C', fontSize: '0.94rem', lineHeight: 1.6, marginBottom: '18px', flex: 1, fontWeight: 500 }}>
                {obj.desc}
              </p>

              {/* Bullet Points */}
              <div style={{ borderTop: '1px dashed #FED7AA', paddingTop: '16px' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#EA580C', marginBottom: '8px' }}>
                  📌 मुख्य कृती योजना:
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {obj.points.map((pt, idx) => (
                    <li
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px',
                        fontSize: '0.86rem',
                        color: '#C2410C',
                        marginBottom: '6px',
                        lineHeight: 1.45,
                        fontWeight: 600
                      }}
                    >
                      <span style={{ color: '#EA580C', fontWeight: 900 }}>✓</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Call to Action */}
        <div
          style={{
            marginTop: '60px',
            background: 'linear-gradient(135deg, #FFF7ED 0%, #FFFFFF 100%)',
            border: '2px solid #EA580C',
            borderRadius: '24px',
            padding: '40px 24px',
            textAlign: 'center',
            boxShadow: '0 10px 30px rgba(234, 88, 12, 0.1)'
          }}
        >
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#EA580C', marginBottom: '12px' }}>
            या ऐतिहासिक उद्दिष्टपूर्तीत आपले योगदान द्या!
          </h2>
          <p
            style={{
              color: '#C2410C',
              fontSize: '1.05rem',
              maxWidth: '700px',
              margin: '0 auto 24px',
              lineHeight: 1.6,
              fontWeight: 600
            }}
          >
            प्रत्येक मराठा बांधवाने आपल्या कौशल्यानुसार, वेळेनुसार आणि क्षमतेनुसार या १० उद्दिष्टांमध्ये सक्रिय सहभाग घेऊन समाज परिवर्तनाचा भाग व्हावे.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <Link
              to="/register"
              style={{
                padding: '14px 32px',
                background: '#EA580C',
                color: '#FFFFFF',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '1.05rem',
                textDecoration: 'none',
                boxShadow: '0 6px 18px rgba(234, 88, 12, 0.3)'
              }}
            >
              🚩 आजच नोंदणी करा
            </Link>
            <Link
              to="/contact"
              style={{
                padding: '14px 28px',
                background: '#FFFFFF',
                color: '#EA580C',
                border: '2px solid #EA580C',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '1.05rem',
                textDecoration: 'none'
              }}
            >
              ☎️ जिल्हा समन्वयकांशी संपर्क साधा
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
