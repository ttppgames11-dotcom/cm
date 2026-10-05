import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function BalidanMaasPage() {
  const [pledgeTaken, setPledgeTaken] = useState(false);
  const [pledgeCount, setPledgeCount] = useState(16743);

  const handlePledge = () => {
    if (!pledgeTaken) {
      setPledgeTaken(true);
      setPledgeCount(prev => prev + 1);
    }
  };

  return (
    <div style={{ background: '#F8F5F0', minHeight: 'calc(100vh - 120px)', padding: '36px 16px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* Solemn Hero Banner */}
        <div style={{
          position: 'relative',
          borderRadius: '20px',
          overflow: 'hidden',
          color: '#FFF',
          padding: '44px 32px',
          border: '2px solid #DD8A2E',
          boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
          marginBottom: '32px'
        }}>
          {/* Tulapur Background Image with Crystal Clear Visibility */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'url(/assets/images/balidan/tulapur-sangam.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center 35%',
            zIndex: 0
          }} />
          {/* Subtle balanced gradient overlay for high contrast without hiding the picture */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, rgba(20,2,4,0.72) 0%, rgba(35,6,12,0.60) 45%, rgba(10,2,3,0.78) 100%)',
            backdropFilter: 'brightness(0.95)',
            zIndex: 1
          }} />

          <div style={{ position: 'relative', zIndex: 2, textShadow: '0 2px 8px rgba(0,0,0,0.85)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{
                background: '#C9701C',
                color: '#FFF',
                padding: '4px 12px',
                borderRadius: '16px',
                fontSize: '0.8rem',
                fontWeight: 800,
                textTransform: 'uppercase'
              }}>
                🕯️ ऐतिहासिक स्मृती पर्व
              </span>
              <span style={{ color: '#F0B866', fontSize: '0.88rem', fontWeight: 600 }}>
                फाल्गुन शुद्ध प्रतिपदा ते फाल्गुन अमावास्या
              </span>
            </div>

            <h1 style={{
              fontFamily: "'Baloo 2', 'Noto Sans Devanagari', sans-serif",
              fontSize: 'clamp(1.8rem, 4vw, 2.7rem)',
              fontWeight: 800,
              margin: '8px 0 12px',
              color: '#FFF',
              lineHeight: 1.3
            }}>
              छत्रपती संभाजी महाराज बलिदान मास व स्मृती दालन
            </h1>

            <p style={{ color: '#E6DDCE', fontSize: '1.05rem', maxWidth: '760px', lineHeight: 1.6, margin: '0 0 24px' }}>
              "मरण आले तरी चालेल, पण स्वाभिमान व स्वराज्य सोडणार नाही!" — मोगल आक्रमक औरंगजेबाच्या अमानुष छळाला न झुकता मातृभूमी व धर्मासाठी सर्वोच्च बलिदान देणारे अद्वितीय युगपुरुष धर्मवीर छत्रपती संभाजी महाराज.
            </p>
            <p style={{ color: '#D8CDBC', fontSize: '0.92rem', maxWidth: '760px', lineHeight: 1.6, margin: '0 0 24px' }}>
              या स्मृती पर्वातून त्यांच्या शौर्याबरोबरच साहित्यिक योगदान, राज्यकारभार, स्वराज्याचे संरक्षण आणि कठीण काळातील निर्णय समजून घेण्याची संधी मिळते.
            </p>

            {/* Pledge Button */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={handlePledge}
                disabled={pledgeTaken}
                style={{
                  padding: '13px 28px',
                  background: pledgeTaken ? '#4CAF50' : 'linear-gradient(135deg, #E65100 0%, #EA580C 100%)',
                  color: '#FFF',
                  border: 'none',
                  borderRadius: '30px',
                  fontSize: '1rem',
                  fontWeight: 800,
                  cursor: pledgeTaken ? 'default' : 'pointer',
                  boxShadow: '0 6px 20px rgba(230,81,0,0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                {pledgeTaken ? '✓ आपण बलिदान मास संकल्प केला आहे!' : '🕯️ मी बलिदान मास संकल्प करतो'}
              </button>
              <div style={{ color: '#F0B866', fontSize: '0.9rem', fontWeight: 700 }}>
                🚩 आतापर्यंत <strong>{pledgeCount.toLocaleString('mr-IN')}</strong> बांधवांनी संकल्प केला आहे
              </div>
            </div>
          </div>
        </div>

        {/* 3 Pillars of Balidan Maas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '36px' }}>
          
          {/* Card 1: 128 Undefeated Battles */}
          <div style={{ background: '#FFF', borderRadius: '16px', overflow: 'hidden', border: '1px solid #E6DDCE', boxShadow: '0 6px 20px rgba(0,0,0,0.05)', borderTop: '4px solid #DD8A2E', display: 'flex', flexDirection: 'column' }}>
            <div style={{ width: '100%', height: '200px', position: 'relative', overflow: 'hidden', background: '#2A0709' }}>
              <img 
                src="/assets/images/maratha-battles-palkhed.jpg" 
                alt="१२८ लढायांमध्ये अपराजित रणसंग्राम" 
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(30,5,8,0.7) 0%, transparent 60%)' }} />
              <div style={{ position: 'absolute', bottom: '12px', left: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.6rem' }}>⚔️</span>
                <span style={{ color: '#FFF', fontWeight: 800, fontSize: '0.85rem', background: 'rgba(201,112,28,0.9)', padding: '3px 10px', borderRadius: '12px' }}>अपराजित योद्धा</span>
              </div>
            </div>
            <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: '1.3rem', color: '#3D0D0D', margin: '0 0 10px' }}>
                १२८ लढायांमध्ये अपराजित रणधुरंधर
              </h3>
              <p style={{ color: '#5C534B', fontSize: '0.9rem', lineHeight: 1.6, margin: '0 0 12px' }}>
                छत्रपती संभाजी महाराजांनी आपल्या ९ वर्षांच्या संपूर्ण कारकिर्दीत एकाच वेळी ५ महाशत्रूंविरुद्ध (मुघल सल्तनत, आदिलशाही, कुतुबशाही, सिद्दी व जंजिऱ्याचे आरमार, आणि गोव्याचे पोर्तुगीज) अखंड युद्ध लढले आणि एकाही युद्धात पराभव स्वीकारला नाही.
              </p>
              <ul style={{ color: '#5C534B', fontSize: '0.86rem', lineHeight: 1.65, margin: '0 0 16px', paddingLeft: '18px' }}>
                <li><strong>बुरहानपूर विजय:</strong> मुघलांची दक्षिणेतील श्रीमंत व्यापारी राजधानी लुटून औरंगजेबाच्या अर्थव्यवस्थेला जबरदस्त तडाखा दिला.</li>
                <li><strong>पोर्तुगीज धडा:</strong> गोव्याचे व्हाइसरॉय एल् कॉँडे दी अल्व्होर याला मांडवी नदीत बुडता बुडता पळता भुई थोडी केली.</li>
                <li><strong>जंजिरा मोहीम:</strong> सिद्दीचा पाडाव करण्यासाठी समुद्रात थेट पाषाणाचा सेतू बांधण्याची धाडसी युद्धयोजना राबवली.</li>
              </ul>
              <div style={{ marginTop: 'auto', paddingTop: '14px', borderTop: '1px solid #F0E6D8', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#9A4E12', fontSize: '0.82rem', fontWeight: 700 }}>
                <span>🚩 ९ वर्षे अविरत रणसंग्राम</span>
                <span>शौर्य • रणनीती • पराक्रम</span>
              </div>
            </div>
          </div>

          {/* Card 2: Sanskrit Scholar & Budhabhushanam */}
          <div style={{ background: '#FFF', borderRadius: '16px', overflow: 'hidden', border: '1px solid #E6DDCE', boxShadow: '0 6px 20px rgba(0,0,0,0.05)', borderTop: '4px solid #7A1C1C', display: 'flex', flexDirection: 'column' }}>
            <div style={{ width: '100%', height: '200px', position: 'relative', overflow: 'hidden', background: '#2A0709' }}>
              <img 
                src="/assets/images/balidan/sambhaji-budhabhushan.jpg" 
                alt="संस्कृत महापंडित छत्रपती संभाजी महाराज - बुधभूषणम् ग्रंथकार" 
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 25%', display: 'block' }} 
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(30,5,8,0.7) 0%, transparent 60%)' }} />
              <div style={{ position: 'absolute', bottom: '12px', left: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.6rem' }}>📚</span>
                <span style={{ color: '#FFF', fontWeight: 800, fontSize: '0.85rem', background: 'rgba(122,28,28,0.9)', padding: '3px 10px', borderRadius: '12px' }}>प्रज्ञावंत विचारवंत</span>
              </div>
            </div>
            <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: '1.3rem', color: '#3D0D0D', margin: '0 0 10px' }}>
                संस्कृत महापंडित व 'बुधभूषणम्' ग्रंथकार
              </h3>
              <p style={{ color: '#5C534B', fontSize: '0.9rem', lineHeight: 1.6, margin: '0 0 12px' }}>
                अवघ्या १४ व्या वर्षी संस्कृतमध्ये 'बुधभूषणम्' या अप्रतिम राजनितीपर ग्रंथाची रचना करणारे छत्रपती संभाजीराजे हे केवळ पराक्रमी योद्धेच नव्हे तर १६ भाषांचे प्रकांड पंडित, कवी आणि तत्त्वज्ञ होते.
              </p>
              <ul style={{ color: '#5C534B', fontSize: '0.86rem', lineHeight: 1.65, margin: '0 0 16px', paddingLeft: '18px' }}>
                <li><strong>बुधभूषणम् ग्रंथ:</strong> राजाचे कर्तव्य, मंत्रीमंडळ रचना, न्यायव्यवस्था, दुर्गसंरक्षण व सैन्याची गुप्तचर यंत्रणा यावर अमूल्य मार्गदर्शन.</li>
                <li><strong>साहित्यिक रचना:</strong> नखशिखा, नायिकाभेद व सातसतक या ब्रज व संस्कृत काव्यांची अद्वितीय रचना.</li>
                <li><strong>विद्वानांचा राजाश्रय:</strong> कविकुलगुरु कलश, गागाभट्ट व अनेक ज्ञानवंतांचा आदर सन्मान करून स्वराज्यात ज्ञानसंवर्धन केले.</li>
              </ul>
              <div style={{ marginTop: 'auto', paddingTop: '14px', borderTop: '1px solid #F0E6D8', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#7A1C1C', fontSize: '0.82rem', fontWeight: 700 }}>
                <span>📖 १६ भाषांचे ज्ञान</span>
                <span>राजधर्म • नीती • बुद्धिमत्ता</span>
              </div>
            </div>
          </div>

          {/* Card 3: Tulapur & Vadhu Budruk Memorial */}
          <div style={{ background: '#FFF', borderRadius: '16px', overflow: 'hidden', border: '1px solid #E6DDCE', boxShadow: '0 6px 20px rgba(0,0,0,0.05)', borderTop: '4px solid #DD8A2E', display: 'flex', flexDirection: 'column' }}>
            <div style={{ width: '100%', height: '200px', position: 'relative', overflow: 'hidden', background: '#2A0709' }}>
              <img 
                src="/assets/images/balidan/tulapur-sangam.jpg" 
                alt="तुळापूर व वधू बुद्रुक बलिदान समाधी तीर्थ" 
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 35%', display: 'block' }} 
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(30,5,8,0.7) 0%, transparent 60%)' }} />
              <div style={{ position: 'absolute', bottom: '12px', left: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.6rem' }}>🚩</span>
                <span style={{ color: '#FFF', fontWeight: 800, fontSize: '0.85rem', background: 'rgba(201,112,28,0.9)', padding: '3px 10px', borderRadius: '12px' }}>अमर समाधी तीर्थ</span>
              </div>
            </div>
            <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: '1.3rem', color: '#3D0D0D', margin: '0 0 10px' }}>
                तुळापूर व वधू बुद्रुक समाधी तीर्थ
              </h3>
              <p style={{ color: '#5C534B', fontSize: '0.9rem', lineHeight: 1.6, margin: '0 0 12px' }}>
                भीमा आणि इंद्रायणी नदीच्या संगमावरील तुळापूर येथे ११ मार्च १६८९ (फाल्गुन अमावास्या) रोजी संभाजी महाराजांनी धर्माभिमान व स्वराज्यासाठी अमानुष छळ सहन करत सर्वोच्च आत्मबलिदान दिले.
              </p>
              <ul style={{ color: '#5C534B', fontSize: '0.86rem', lineHeight: 1.65, margin: '0 0 16px', paddingLeft: '18px' }}>
                <li><strong>अढळ निष्ठा:</strong> डोळे काढले, जीभ कापली तरी औरंगजेबापुढे स्वराज्य व स्वाभिमानाचा त्याग करण्यास स्पष्ट नकार दिला.</li>
                <li><strong>वीर शिवले शिंदेंचे शौर्य:</strong> औरंगजेबाच्या मरणदंडाची पर्वा न करता वधू बुद्रुक येथे राजांचे देहावशेष शिवून अंत्यसंस्कार केले.</li>
                <li><strong>महाराष्ट्राची चेतना:</strong> या बलिदानानंतर संतापलेल्या अवघ्या मराठ्यांनी २७ वर्षे अखंड लढा देऊन मुघल साम्राज्याला दख्खनच्या मातीत गाडले.</li>
              </ul>
              <div style={{ marginTop: 'auto', paddingTop: '14px', borderTop: '1px solid #F0E6D8', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#9A4E12', fontSize: '0.82rem', fontWeight: 700 }}>
                <span>🕯️ ११ मार्च १६८९</span>
                <span>स्वाभिमान • राष्ट्रभक्ती • अढळ निष्ठा</span>
              </div>
            </div>
          </div>

        </div>

        {/* 40-Day Observance Guide */}
        <div style={{ background: '#FFF', borderRadius: '20px', padding: '32px', border: '1px solid #E6DDCE', boxShadow: '0 8px 30px rgba(0,0,0,0.05)', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
            <h2 style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: '1.6rem', color: '#3D0D0D', margin: 0 }}>
              🕯️ बलिदान मास आचरण मार्गदर्शक व ऐतिहासिक महत्त्व (४० दिवस संकल्प)
            </h2>
            <span style={{ background: '#FDF3E6', border: '1px solid #F0B866', color: '#C9701C', padding: '4px 14px', borderRadius: '16px', fontSize: '0.84rem', fontWeight: 700 }}>
              फाल्गुन शुद्ध प्रतिपदा ते फाल्गुन अमावास्या
            </span>
          </div>

          {/* Featured Visual Banner of Balidan Maas Commemoration */}
          <div style={{
            position: 'relative',
            borderRadius: '16px',
            overflow: 'hidden',
            marginBottom: '26px',
            border: '2px solid #E6B566',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
          }}>
            <img 
              src="/assets/images/balidan/balidan-maas-smruti.jpg" 
              alt="बलिदान मास दीपोत्सव व सामूहिक शंभू स्मृती" 
              style={{ width: '100%', height: '340px', objectFit: 'cover', objectPosition: 'center 40%', display: 'block' }}
            />
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(20,2,4,0.92) 0%, rgba(20,2,4,0.3) 60%, transparent 100%)'
            }} />
            <div style={{ position: 'absolute', bottom: '20px', left: '24px', right: '24px', color: '#FFF' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#C9701C', padding: '3px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 800, marginBottom: '8px' }}>
                🚩 अखंड स्वाभिमान चेतना
              </div>
              <h3 style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: '1.4rem', margin: '0 0 6px', color: '#FFF' }}>
                आपण बलिदान मास का पाळतो? — अमानुष छळ, पण अढळ निष्ठा!
              </h3>
              <p style={{ margin: 0, fontSize: '0.92rem', color: '#F0E6D8', lineHeight: 1.5, maxWidth: '850px' }}>
                संगमेश्वर येथे फितुरीने कैद झाल्यावर औरंगजेबाने बहादूरगड (धर्मवीरगड) येथे छत्रपती संभाजी महाराज आणि कविकुलगुरु कलश यांची विदूषकाचे कपडे घालून धिंड काढली. धर्मांतर करा, स्वराज्य आणि खजिना मुघलांच्या स्वाधीन करा या मागण्या शंभूराजांनी लाथाडल्या. सलग ४० दिवस डोळे काढणे, जीभ कापणे, नखे उपटणे आणि कातडी सोलण्याचे क्रूर अत्याचार झाले; तरीही राजांचा स्वाभिमान अढळ राहिला.
              </p>
            </div>
          </div>

          <p style={{ color: '#5C534B', lineHeight: 1.65, margin: '0 0 20px', fontSize: '0.94rem' }}>
            बलिदान मास हे केवळ दुःखाचे किंवा शोकाचे प्रतीक नसून, तो अन्यायाविरुद्ध पेटून उठण्याचा, राष्ट्राभिमान जागवण्याचा आणि शिव-शंभू विचारांवर चालण्याचा संकल्प पर्व आहे. या ४० दिवसांत सर्व समाजघटकांनी खालील रचनात्मक आचरणांमधून समाजसेवेचा आदर्श उभा करावा:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
            <div style={{ padding: '18px', borderRadius: '14px', background: '#FDF3E6', border: '1px solid #F0B866' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '1.3rem' }}>🪔</span>
                <span style={{ fontWeight: 800, color: '#C9701C', fontSize: '0.96rem' }}>१. रोज सकाळी दीप प्रज्वलन व स्मरण</span>
              </div>
              <div style={{ fontSize: '0.86rem', color: '#5C534B', lineHeight: 1.6 }}>
                घरासमोर, देवघरात किंवा कार्यालयात छत्रपती संभाजी महाराजांच्या प्रतिमेपुढे एक तुपाचा/तेलाचा दीप प्रज्वलित करावा. घरातील मुलांना शंभूराजांच्या स्वाभिमानाची व बलिदानाची महती सांगावी.
              </div>
            </div>

            <div style={{ padding: '18px', borderRadius: '14px', background: '#FDF3E6', border: '1px solid #F0B866' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '1.3rem' }}>📖</span>
                <span style={{ fontWeight: 800, color: '#C9701C', fontSize: '0.96rem' }}>२. शिव-शंभू चरित्राचे नित्य वाचन</span>
              </div>
              <div style={{ fontSize: '0.86rem', color: '#5C534B', lineHeight: 1.6 }}>
                कुटुंबासमवेत रोज किमान १५-२० मिनिटे छत्रपती संभाजी महाराजांच्या पराक्रमाचा व बुधभूषणम् ग्रंथाचा अभ्यास करावा. विकृत काल्पनिक साहित्याऐवजी इतिहास संशोधकांनी लिहिलेले अधिकृत ग्रंथ अभ्यासावेत.
              </div>
            </div>

            <div style={{ padding: '18px', borderRadius: '14px', background: '#FDF3E6', border: '1px solid #F0B866' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '1.3rem' }}>🧘</span>
                <span style={{ fontWeight: 800, color: '#C9701C', fontSize: '0.96rem' }}>३. संपूर्ण व्यसनमुक्ती व साधेपणा</span>
              </div>
              <div style={{ fontSize: '0.86rem', color: '#5C534B', lineHeight: 1.6 }}>
                या ४० दिवसांच्या स्मृतीपर्वात मद्यपान, तंबाखू, मांसाहार व अपशब्द यांचा स्वेच्छेने त्याग करून संयम, साधेपणा व व्यायामाची दिनचर्या स्वीकारावी. मनाचा व शरीराचा स्वाभिमान जागा ठेवावा.
              </div>
            </div>

            <div style={{ padding: '18px', borderRadius: '14px', background: '#FDF3E6', border: '1px solid #F0B866' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '1.3rem' }}>🩸</span>
                <span style={{ fontWeight: 800, color: '#C9701C', fontSize: '0.96rem' }}>४. रक्तदान, दुर्ग संवर्धन व सेवा</span>
              </div>
              <div style={{ fontSize: '0.86rem', color: '#5C534B', lineHeight: 1.6 }}>
                बलिदान मासाचे औचित्य साधून महारक्तदान शिबिरे भरवावीत, सह्याद्रीतील ऐतिहासिक गडकिल्ल्यांवर जाऊन स्वच्छता व संवर्धन श्रमदान करावे, आणि गरजू विद्यार्थ्यांना शैक्षणिक साहित्याचे वाटप करावे.
              </div>
            </div>

            <div style={{ padding: '18px', borderRadius: '14px', background: '#FDF3E6', border: '1px solid #F0B866' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '1.3rem' }}>🚶‍♂️</span>
                <span style={{ fontWeight: 800, color: '#C9701C', fontSize: '0.96rem' }}>५. तुळापूर-वधू बुद्रुक समाधी तीर्थयात्रा</span>
              </div>
              <div style={{ fontSize: '0.86rem', color: '#5C534B', lineHeight: 1.6 }}>
                बलिदान मासादरम्यान संगम स्थळ तुळापूर व समाधी भूमी वधू बुद्रुक (पुणे) येथे प्रत्यक्ष भेट देऊन नतमस्तक व्हावे. शिवले शहाजी पाटील (शिंदे) यांच्या त्यागाचे स्मरण करून समाधीस पुष्पहार अर्पण करावा.
              </div>
            </div>

            <div style={{ padding: '18px', borderRadius: '14px', background: '#FDF3E6', border: '1px solid #F0B866' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '1.3rem' }}>🏛️</span>
                <span style={{ fontWeight: 800, color: '#C9701C', fontSize: '0.96rem' }}>६. ग्रंथदान, व्याख्याने व युवा प्रबोधन</span>
              </div>
              <div style={{ fontSize: '0.86rem', color: '#5C534B', lineHeight: 1.6 }}>
                शाळा, महाविद्यालये व वाचनालयांमध्ये संभाजी महाराजांच्या जीवनावरील ऐतिहासिक पुस्तके भेट द्यावीत. तरुण पिढीमध्ये राष्ट्रप्रेम व स्वधर्मनिष्ठा जागृत करण्यासाठी तज्ज्ञ इतिहासकारांची अभ्यासपूर्ण व्याख्याने आयोजित करावीत.
              </div>
            </div>

            <div style={{ padding: '18px', borderRadius: '14px', background: '#FDF3E6', border: '1px solid #F0B866' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '1.3rem' }}>🗡️</span>
                <span style={{ fontWeight: 800, color: '#C9701C', fontSize: '0.96rem' }}>७. स्वाभिमान प्रतिज्ञा व शस्त्र-कला सन्मान</span>
              </div>
              <div style={{ fontSize: '0.86rem', color: '#5C534B', lineHeight: 1.6 }}>
                फाल्गुन अमावास्येला (बलिदान दिन) 'आम्ही छत्रपतींचे निष्ठावंत पाईक राहू आणि स्वराज्याचा स्वाभिमान कधीही झुकू देणार नाही' अशी सामूहिक प्रतिज्ञा घ्यावी. लाठी-काठी, दांडपट्टा अशा पारंपरिक मर्दानी खेळांचा सराव व सन्मान करावा.
              </div>
            </div>

            <div style={{ padding: '18px', borderRadius: '14px', background: '#FDF3E6', border: '1px solid #F0B866' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '1.3rem' }}>✊</span>
                <span style={{ fontWeight: 800, color: '#C9701C', fontSize: '0.96rem' }}>८. २७ वर्षांचा स्वातंत्र्य लढा व धडा</span>
              </div>
              <div style={{ fontSize: '0.86rem', color: '#5C534B', lineHeight: 1.6 }}>
                संभाजी महाराजांच्या बलिदानानंतर खचून न जाता अवघ्या महाराष्ट्राने संताजी घोरपडे, धनाजी जाधव, छत्रपती राजाराम महाराज व महाराणी ताराबाई यांच्या नेतृत्वाखाली मोगलांचा दख्खनमध्ये पुरता नायनाट केला — हा ऐतिहासिक पराक्रम घरोघरी सांगावा.
              </div>
            </div>

            <div style={{ padding: '18px', borderRadius: '14px', background: '#FDF3E6', border: '1px solid #F0B866' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '1.3rem' }}>🌾</span>
                <span style={{ fontWeight: 800, color: '#C9701C', fontSize: '0.96rem' }}>९. शेतकरी, कष्टकरी व समाज एकता</span>
              </div>
              <div style={{ fontSize: '0.86rem', color: '#5C534B', lineHeight: 1.6 }}>
                संभाजी महाराजांनी शेतकऱ्यांना करसवलत आणि बी-बियाणे पुरवून दुष्काळात पाठीशी उभे केले होते. त्या प्रेरणेतून या मासात ग्रामीण भागात दुष्काळग्रस्त शेतकरी, कष्टकरी आणि विधवा भगिनींना थेट आर्थिक व अन्नधान्य मदत करावी.
              </div>
            </div>
          </div>

          <div style={{ marginTop: '28px', textAlign: 'center' }}>
            <Link
              to="/history/sambhaji-maharaj"
              style={{
                display: 'inline-block',
                padding: '12px 28px',
                background: '#5C1414',
                color: '#FFF',
                borderRadius: '8px',
                fontWeight: 700,
                textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(92,20,20,0.3)'
              }}>
              छत्रपती संभाजी महाराज सविस्तर चरित्र वाचा →
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
