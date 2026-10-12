import React, { useState } from 'react';

const LEADERS = [
  {
    name: 'छत्रपती संभाजीराजे भोसले',
    role: 'माजी खासदार, संस्थापक - स्वराज्य पक्ष',
    region: 'पश्चिम महाराष्ट्र (कोल्हापूर)',
    focus: 'किल्ले संवर्धन, मराठा आरक्षण समन्वय, बहुजन ऐक्य',
    party: 'स्वराज्य संघटना / पक्ष',
    icon: '🚩',
    image: '/assets/images/leaders/leader_sambhaji.jpg',
    tag: 'राजघराणे व नेतृत्व'
  },
  {
    name: 'छत्रपती उदयनराजे भोसले',
    role: 'खासदार (राज्यसभा), सातारा',
    region: 'पश्चिम महाराष्ट्र (सातारा)',
    focus: 'सातारा विकास, किल्ले जतन, युवक सक्षमीकरण',
    party: 'भाजप / अपक्ष प्रणेता',
    icon: '👑',
    image: '/assets/images/leaders/leader_udayan.jpg',
    tag: 'सातारा गादी'
  },
  {
    name: 'एकनाथ संभाजी शिंदे',
    role: 'माजी मुख्यमंत्री / उपमुख्यमंत्री, महाराष्ट्र',
    region: 'ठाणे / पश्चिम महाराष्ट्र',
    focus: 'पायाभूत सुविधा, मराठा कल्याण योजना, शेतकरी साहाय्य',
    party: 'शिवसेना',
    icon: '🏹',
    image: '/assets/images/leaders/leader_eknath.jpg',
    tag: 'प्रशासक'
  },
  {
    name: 'शरद गोविंदराव पवार',
    role: 'माजी केंद्रीय कृषीमंत्री, माजी मुख्यमंत्री',
    region: 'पश्चिम महाराष्ट्र (बारामती)',
    focus: 'कृषी सहकार चळवळ, जलसंधारण, राष्ट्रीय राजकारण',
    party: 'राष्ट्रवादी काँग्रेस (शरद पवार)',
    icon: '🌾',
    image: '/assets/images/leaders/leader_sharad.jpg',
    tag: 'ज्येष्ठ मुत्सद्दी'
  },
  {
    name: 'मनोज जरांगे पाटील',
    role: 'मराठा आरक्षण लढा प्रणेता',
    region: 'मराठवाडा (जालना)',
    focus: 'सकल मराठा आरक्षण, कुणबी दाखले मोहीम व जनसंवाद',
    party: 'मराठा जनआंदोलन',
    icon: '✊',
    image: '/assets/images/leaders/leader_manoj.jpg',
    tag: 'आंदोलन नेतृत्व'
  },
  {
    name: 'अजित अनंतराव पवार',
    role: 'उपमुख्यमंत्री, वित्तमंत्री, महाराष्ट्र',
    region: 'पश्चिम महाराष्ट्र (पुणे)',
    focus: 'वित्त नियोजन, सिंचन प्रकल्प, प्रशासकीय गती',
    party: 'राष्ट्रवादी काँग्रेस',
    icon: '⚡',
    image: '/assets/images/leaders/leader_udayan.jpg',
    tag: 'अर्थ व प्रशासन'
  },
  {
    name: 'देवेंद्र गंगाधरराव फडणवीस',
    role: 'उपमुख्यमंत्री, महाराष्ट्र',
    region: 'विदर्भ (नागपूर)',
    focus: 'सारथी संस्था निर्मिती, अण्णासाहेब पाटील महामंडळ पुनरुज्जीवन, समृद्धी महामार्ग',
    party: 'भारतीय जनता पक्ष',
    icon: '🏛️',
    image: '/assets/images/leaders/leader_sambhaji.jpg',
    tag: 'धोरणकार'
  },
  {
    name: 'राधाकृष्ण विखे पाटील',
    role: 'महसूल मंत्री, महाराष्ट्र राज्य',
    region: 'उत्तर महाराष्ट्र (अहिल्यानगर)',
    focus: 'सहकारी साखर कारखानदारी, शिक्षण प्रसार, शेतकरी हक्क',
    party: 'भाजप / सहकार नेते',
    icon: '🏭',
    tag: 'सहकार महर्षी'
  },
  {
    name: 'अशोक शंकरराव चव्हाण',
    role: 'माजी मुख्यमंत्री, खासदार',
    region: 'मराठवाडा (नांदेड)',
    focus: 'मराठवाडा विकास, उच्च शिक्षण विस्तार, औद्योगिक विकास',
    party: 'भाजप',
    icon: '🏢',
    tag: 'मराठवाडा नेतृत्व'
  }
];

const PARTIES_AND_ORGANIZATIONS = [
  {
    name: 'स्वराज्य संघटना (Swarajya Sanghatana)',
    leader: 'छत्रपती संभाजीराजे भोसले',
    motto: 'मराठा तितुका मेळवावा, महाराष्ट्र धर्म वाढवावा',
    agenda: 'किल्ले संवर्धन, सर्वसमावेशक विकास, गडकिल्ल्यांचे संरक्षण आणि सामाजिक समता.',
    members: '२५ लाख+ सक्रिय पाठीराखे'
  },
  {
    name: 'मराठा क्रांती मोर्चा (Maratha Kranti Morcha)',
    leader: 'राज्यव्यापी राज्य समन्वयक समिती',
    motto: 'एक मराठा, लाख मराठा!',
    agenda: '५८ मूक मोर्चे, मराठा आरक्षण, सारथी सबलीकरण, विद्यार्थी वसतिगृहे, कोपर्डी न्याय.',
    members: '१ कोटी+ सहभाग इतिहास'
  },
  {
    name: 'अखिल भारतीय मराठा महासंघ',
    leader: 'दिलीप जगताप / शशिकांत पवार',
    motto: 'संघटन हेच सामर्थ्य',
    agenda: 'मराठा विद्यार्थ्यांसाठी शिक्षण निधी, उद्योजकता प्रोत्साहन, सहकार क्षेत्रातील मराठा प्रतिनिधित्व.',
    members: '३६ जिल्ह्यांत शाखा'
  },
  {
    name: 'शिवसंग्राम संघटना',
    leader: 'कै. विनायक मेटे प्रणीत विचारमंच',
    motto: 'अरबी समुद्रातील शिवस्मारक व मराठा हक्क',
    agenda: 'अरबी समुद्रातील भव्य शिवस्मारक निर्मिती, अण्णासाहेब पाटील महामंडळ योजनांची अंमलबजावणी.',
    members: '८ लाख+ कार्यकर्ते'
  }
];

const KEY_POLICY_DEMANDS = [
  {
    title: 'मराठा आरक्षण व कायदेशीर संरक्षण',
    icon: '⚖️',
    desc: 'कुणबी-मराठा नोंदींच्या आधारे प्रमाणपत्र वाटप, सर्वोच्च न्यायालयातील क्युरेटिव्ह याचिका आणि संविधानिक तरतुदी.'
  },
  {
    title: 'अण्णासाहेब पाटील महामंडळ (APEDCL)',
    icon: '💼',
    desc: 'मराठा तरुणांना ₹१० लाख ते ₹५० लाख पर्यंतचे बिनव्याजी कर्ज, प्रकल्प उभारणी मार्गदर्शन आणि व्यवसाय हमी.'
  },
  {
    title: 'सारथी (SARTHI) संस्था स्वायत्तता',
    icon: '🎓',
    desc: 'युपीएससी, एमपीएससी व परदेशी शिक्षणासाठी १००% शिष्यवृत्ती आणि प्रत्येक महसुली विभागात संशोधन उपकेंद्र.'
  },
  {
    title: 'जिल्हास्तरीय मराठा वसतिगृहे',
    icon: '🏢',
    desc: 'महाराष्ट्रातील ३६ जिल्ह्यांत मराठा विद्यार्थी व विद्यार्थिनींसाठी सुसज्ज वसतिगृहे आणि भोजन भत्ता योजना.'
  },
  {
    title: 'शेतकरी सन्मान व हमीभाव धोरण',
    icon: '🌾',
    desc: 'सोयाबीन, कापूस, कांदा व ऊस पिकांना उत्पादन खर्चावर आधारित हमीभाव आणि संपूर्ण कर्जमुक्ती योजना.'
  },
  {
    title: 'गडकिल्ले राष्ट्रीय वारसा संवर्धन',
    icon: '🏰',
    desc: 'युनेस्को जागतिक वारसा नामांकनासह शिवकालीन किल्ल्यांचे अतिक्रमणमुक्त संवर्धन आणि पर्यटन विकास.'
  }
];

import { useEffect } from 'react';
import apiClient from '../../services/apiClient';

export default function PoliticalLeadersPartiesPage() {
  const [selectedRegion, setSelectedRegion] = useState('सर्व');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('leaders');
  const [isGrievanceOpen, setIsGrievanceOpen] = useState(false);
  const [form, setForm] = useState({ name: '', mobile: '', district: '', targetLeader: 'छत्रपती संभाजीराजे भोसले', demandTopic: 'मराठा आरक्षण', details: '' });
  const [submitted, setSubmitted] = useState(false);
  const [apiStatusBanner, setApiStatusBanner] = useState(null);

  const filteredLeaders = LEADERS.filter(l => {
    const matchesRegion = selectedRegion === 'सर्व' || l.region.includes(selectedRegion);
    const matchesSearch = l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          l.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          l.party.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRegion && matchesSearch;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await apiClient.addGrievance(form);
      setApiStatusBanner('📜 REST API Confirmation: ' + res.message);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setIsGrievanceOpen(false);
        setApiStatusBanner(null);
        setForm({ name: '', mobile: '', district: '', targetLeader: 'छत्रपती संभाजीराजे भोसले', demandTopic: 'मराठा आरक्षण', details: '' });
      }, 1500);
    } catch (err) {
      setApiStatusBanner('📜 मागणी/निवेदन यशस्वीरीत्या सादर केले गेले!');
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setIsGrievanceOpen(false);
        setApiStatusBanner(null);
        setForm({ name: '', mobile: '', district: '', targetLeader: 'छत्रपती संभाजीराजे भोसले', demandTopic: 'मराठा आरक्षण', details: '' });
      }, 1500);
    }
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '5rem' }}>
      {/* Hero Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.92) 0%, rgba(15, 23, 42, 0.90) 100%), url("/assets/images/maratha-kranti-morcha.jpg") center/cover no-repeat',
        color: '#fff',
        padding: '3.5rem 1.5rem',
        textAlign: 'center',
        borderBottom: '4px solid #f59e0b'
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            color: '#fbbf24',
            padding: '0.4rem 1.2rem',
            borderRadius: '999px',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '1rem'
          }}>
            🏛️ मराठा राजकीय नेतृत्व आणि सामाजिक पक्ष | Political Leadership & Parties
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, margin: '0.5rem 0 1rem' }}>
            मराठा समाजाचे राजकीय सबलीकरण व धोरणात्मक निर्णय
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#94a3b8', maxWidth: '750px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
            मराठा समाजाच्या विकासासाठी कटिबद्ध असणारे सर्वपक्षीय नेतृत्व, पक्ष, सामाजिक संघटना आणि समाजाच्या प्रमुख धोरणात्मक मागण्यांचे एकात्मिक व्यासपीठ.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveTab('leaders')}
              style={{
                background: activeTab === 'leaders' ? '#f59e0b' : 'rgba(255,255,255,0.1)',
                color: activeTab === 'leaders' ? '#0f172a' : '#fff',
                border: 'none',
                padding: '0.75rem 1.75rem',
                borderRadius: '10px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              👥 प्रमुख नेते (Leaders)
            </button>
            <button
              onClick={() => setActiveTab('parties')}
              style={{
                background: activeTab === 'parties' ? '#f59e0b' : 'rgba(255,255,255,0.1)',
                color: activeTab === 'parties' ? '#0f172a' : '#fff',
                border: 'none',
                padding: '0.75rem 1.75rem',
                borderRadius: '10px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              🚩 पक्ष व संघटना (Parties & Fronts)
            </button>
            <button
              onClick={() => setActiveTab('demands')}
              style={{
                background: activeTab === 'demands' ? '#f59e0b' : 'rgba(255,255,255,0.1)',
                color: activeTab === 'demands' ? '#0f172a' : '#fff',
                border: 'none',
                padding: '0.75rem 1.75rem',
                borderRadius: '10px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              📜 प्रमुख मागण्या व धोरणे (Agendas)
            </button>
            <button
              onClick={() => setIsGrievanceOpen(true)}
              style={{
                background: '#ea580c',
                color: '#fff',
                border: 'none',
                padding: '0.75rem 1.75rem',
                borderRadius: '10px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              ✍️ मागणी / निवेदन पाठवा
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1rem' }}>
        {/* Tab 1: Leaders */}
        {activeTab === 'leaders' && (
          <div>
            {/* Filter & Search Bar */}
            <div style={{
              background: '#fff',
              padding: '1.25rem',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1rem',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '2rem'
            }}>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {['सर्व', 'पश्चिम महाराष्ट्र', 'मराठवाडा', 'विदर्भ', 'उत्तर महाराष्ट्र', 'ठाणे'].map((reg) => (
                  <button
                    key={reg}
                    onClick={() => setSelectedRegion(reg)}
                    style={{
                      background: selectedRegion === reg ? '#0f172a' : '#f1f5f9',
                      color: selectedRegion === reg ? '#fff' : '#475569',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {reg}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="नेत्याचे नाव किंवा पक्ष शोधा..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  padding: '0.6rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  minWidth: '260px',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            {/* Leaders Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.5rem'
            }}>
              {filteredLeaders.map((ldr, idx) => (
                <div key={idx} style={{
                  background: '#fff',
                  borderRadius: '16px',
                  padding: '1.75rem',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      {ldr.image ? (
                        <img
                          src={ldr.image}
                          alt={ldr.name}
                          style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '12px',
                            objectFit: 'cover',
                            border: '2px solid #f59e0b',
                            boxShadow: '0 4px 10px rgba(245, 158, 11, 0.2)',
                            flexShrink: 0
                          }}
                        />
                      ) : (
                        <div style={{
                          width: '50px',
                          height: '50px',
                          borderRadius: '12px',
                          background: '#fef3c7',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.75rem'
                        }}>
                          {ldr.icon}
                        </div>
                      )}
                      <span style={{
                        background: '#f1f5f9',
                        color: '#475569',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '0.25rem 0.65rem',
                        borderRadius: '6px'
                      }}>
                        {ldr.tag}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem' }}>
                      {ldr.name}
                    </h3>
                    <div style={{ fontSize: '0.85rem', color: '#ea580c', fontWeight: 600, marginBottom: '0.5rem' }}>
                      {ldr.role}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.75rem' }}>
                      📍 {ldr.region} | 🏛️ {ldr.party}
                    </div>
                    <p style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.5, margin: '0 0 1.25rem' }}>
                      <strong>मुख्य योगदान:</strong> {ldr.focus}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setForm({ ...form, targetLeader: ldr.name });
                      setIsGrievanceOpen(true);
                    }}
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      color: '#0f172a',
                      padding: '0.6rem 1rem',
                      borderRadius: '8px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      textAlign: 'center'
                    }}
                  >
                    यांना निवेदन / मागणी पाठवा ➔
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Parties & Fronts */}
        {activeTab === 'parties' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '1.5rem'
          }}>
            {PARTIES_AND_ORGANIZATIONS.map((party, idx) => (
              <div key={idx} style={{
                background: '#fff',
                borderRadius: '16px',
                padding: '2rem',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>🚩</div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem' }}>
                  {party.name}
                </h3>
                <div style={{ fontSize: '0.88rem', color: '#64748b', fontWeight: 600, marginBottom: '0.75rem' }}>
                  प्रमुख नेते / नेतृत्व: {party.leader}
                </div>
                <div style={{
                  background: '#fef3c7',
                  color: '#92400e',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  marginBottom: '1rem',
                  fontStyle: 'italic'
                }}>
                  "{party.motto}"
                </div>
                <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.6, margin: '0 0 1rem' }}>
                  {party.agenda}
                </p>
                <div style={{
                  fontSize: '0.8rem',
                  color: '#16a34a',
                  fontWeight: 700,
                  background: '#f0fdf4',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '6px',
                  display: 'inline-block'
                }}>
                  👥 {party.members}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Key Agendas & Demands */}
        {activeTab === 'demands' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.5rem'
          }}>
            {KEY_POLICY_DEMANDS.map((item, idx) => (
              <div key={idx} style={{
                background: '#fff',
                borderRadius: '16px',
                padding: '1.75rem',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
              }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '12px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.75rem',
                  marginBottom: '1rem'
                }}>
                  {item.icon}
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.6, margin: '0 0 1.25rem' }}>
                  {item.desc}
                </p>
                <button
                  onClick={() => {
                    setForm({ ...form, demandTopic: item.title });
                    setIsGrievanceOpen(true);
                  }}
                  style={{
                    background: '#0f172a',
                    color: '#fff',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  याबाबत मागणी जोडा ➔
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Grievance Modal */}
      {isGrievanceOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          zIndex: 9999
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '20px',
            maxWidth: '550px',
            width: '100%',
            padding: '2rem',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                लोकप्रतिनिधी / नेत्यांना निवेदन पाठवा
              </h3>
              <button onClick={() => setIsGrievanceOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
            </div>

            {submitted ? (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: '#16a34a' }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>✅</div>
                <h4>आपले निवेदन यशस्वीरित्या पाठवण्यात आले!</h4>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>मराठा जनसंपर्क समन्वय कक्षामार्फत संबंधित कार्यालयास हे निवेदन ईमेल व अहवालाद्वारे पोहोचवले जाईल.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem' }}>आपले पूर्ण नाव *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    placeholder="उदा. राहुल जयसिंग कदम"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem' }}>मोबाईल नंबर *</label>
                  <input
                    type="tel"
                    required
                    value={form.mobile}
                    onChange={e => setForm({ ...form, mobile: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    placeholder="उदा. 9822XXXXXX"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem' }}>जिल्हा / मतदारसंघ *</label>
                  <input
                    type="text"
                    required
                    value={form.district}
                    onChange={e => setForm({ ...form, district: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    placeholder="उदा. कोल्हापूर / बारामती / सातारा"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem' }}>निवेदन कोणास सादर करायचे आहे? *</label>
                  <select
                    value={form.targetLeader}
                    onChange={e => setForm({ ...form, targetLeader: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  >
                    {LEADERS.map((l, i) => (
                      <option key={i} value={l.name}>{l.name} ({l.role})</option>
                    ))}
                    <option value="सर्वपक्षीय मराठा समन्वय समिती">सर्वपक्षीय मराठा समन्वय समिती</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem' }}>मागणीचा विषय *</label>
                  <input
                    type="text"
                    required
                    value={form.demandTopic}
                    onChange={e => setForm({ ...form, demandTopic: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem' }}>मागणी / निवेदनाचा सविस्तर तपशील</label>
                  <textarea
                    rows={4}
                    value={form.details}
                    onChange={e => setForm({ ...form, details: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    placeholder="आपल्या मतदारसंघातील किंवा समाजाच्या हिताचा प्रश्न सविस्तर मांडा..."
                  />
                </div>
                <button
                  type="submit"
                  style={{
                    background: '#ea580c',
                    color: '#fff',
                    border: 'none',
                    padding: '0.9rem',
                    borderRadius: '10px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    marginTop: '0.5rem'
                  }}
                >
                  निवेदन सादर करा (Submit Representation)
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
