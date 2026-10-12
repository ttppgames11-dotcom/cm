import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function EventsCalendarPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDistrict, setSelectedDistrict] = useState('सर्व');
  const [loading, setLoading] = useState(true);

  // RSVP Modal
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [rsvpData, setRsvpData] = useState({ name: user?.name || '', phone: user?.phone || '', seats: 1 });
  const [rsvpSuccess, setRsvpSuccess] = useState(null);

  // Add Event Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    category: 'सामाजिक मेळावा',
    date: '',
    time: 'सकाळी १०:००',
    venue: '',
    district: 'पुणे',
    desc: '',
    organizer: 'Connect Maratha'
  });

  useEffect(() => {
    loadEvents();
  }, [selectedCategory, selectedDistrict]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const res = await api.events.getAll({
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        district: selectedDistrict !== 'सर्व' ? selectedDistrict : undefined
      });
      if (res && res.events) {
        setEvents(res.events);
      }
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRsvpSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEvent) return;

    try {
      const res = await api.events.rsvp(selectedEvent.id, {
        member_id: user?.id || 'M1001',
        member_name: rsvpData.name || 'मराठा बांधव',
        phone: rsvpData.phone,
        seats: rsvpData.seats
      });

      setRsvpSuccess({
        title: selectedEvent.title,
        date: selectedEvent.date,
        venue: selectedEvent.venue,
        seats: rsvpData.seats,
        passId: 'PASS-' + Math.floor(1000 + Math.random() * 9000)
      });

      // Update count locally
      setEvents(events.map(ev => ev.id === selectedEvent.id ? { ...ev, rsvp_count: res.rsvp_count } : ev));
    } catch (err) {
      alert('उपस्थिती नोंदणी करताना त्रुटी: ' + err.message);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const res = await api.events.create(newEvent);
      if (res && res.event) {
        alert('कार्यक्रम यशस्वीरित्या जोडला गेला! 🚩');
        setEvents([...events, res.event]);
        setShowAddModal(false);
        setNewEvent({
          title: '',
          category: 'सामाजिक मेळावा',
          date: '',
          time: 'सकाळी १०:००',
          venue: '',
          district: 'पुणे',
          desc: '',
          organizer: 'Connect Maratha'
        });
      }
    } catch (err) {
      alert('कार्यक्रम जोडताना त्रुटी: ' + err.message);
    }
  };

  return (
    <div style={{ background: '#FBF5EC', minHeight: '100vh', padding: '36px 0' }}>
      <div className="container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
        
        {/* Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #C73800, #E65100)',
          borderRadius: '16px',
          color: '#fff',
          padding: '32px',
          marginBottom: '28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: '0 10px 25px rgba(199,56,0,0.2)'
        }}>
          <div>
            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700 }}>
              📅 मराठा दिनदर्शिका व मेळावे
            </span>
            <h1 style={{ fontSize: '2.2rem', margin: '10px 0 6px', fontFamily: 'Baloo 2' }}>
              आगामी मराठा मेळावे, शिवजयंती व स्नेहसंमेलन
            </h1>
            <p style={{ margin: 0, opacity: 0.92, fontSize: '1.05rem', maxWidth: '65ch' }}>
              शिवराज्याभिषेक शक ३५२, दुर्ग स्वच्छता मोहीम, उद्योग संगम आणि राज्यभरातील सामाजिक कार्यक्रमांची अधिकृत सूची.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary"
            style={{ background: '#fff', color: '#C73800', border: 'none', padding: '12px 24px', fontWeight: 800, borderRadius: '8px', fontSize: '1rem', cursor: 'pointer' }}>
            + कार्यक्रम प्रस्तावित करा
          </button>
        </div>

        {/* Filters */}
        <div style={{ background: '#fff', borderRadius: '14px', padding: '18px 24px', border: '1px solid #E5E7EB', marginBottom: '28px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 700, color: '#C73800', fontSize: '0.9rem' }}>वर्गवारी:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #D1D5DB', background: '#fff', fontSize: '0.9rem' }}>
              <option value="all">सर्व कार्यक्रम</option>
              <option value="ऐतिहासिक महोत्सव">ऐतिहासिक महोत्सव</option>
              <option value="उद्योग संगम">उद्योग संगम</option>
              <option value="दुर्ग संवर्धन">दुर्ग संवर्धन</option>
              <option value="सामाजिक मेळावा">सामाजिक मेळावा</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 700, color: '#C73800', fontSize: '0.9rem' }}>जिल्हा:</span>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #D1D5DB', background: '#fff', fontSize: '0.9rem' }}>
              <option value="सर्व">संपूर्ण महाराष्ट्र</option>
              <option value="रायगड">रायगड</option>
              <option value="पुणे">पुणे</option>
              <option value="मुंबई">मुंबई</option>
              <option value="सातारा">सातारा</option>
              <option value="कोल्हापूर">कोल्हापूर</option>
              <option value="नाशिक">नाशिक</option>
            </select>
          </div>
        </div>

        {/* Events Cards */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#888' }}>
            कार्यक्रम दिनदर्शिका लोड होत आहे... ⏳
          </div>
        ) : events.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: '14px', padding: '60px', textAlign: 'center', color: '#666' }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📅</div>
            <h2>कोणताही कार्यक्रम आढळला नाही</h2>
            <p>कृपया वेगळा जिल्हा किंवा वर्गवारी निवडून पहा.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '24px' }}>
            {events.map(ev => (
              <div
                key={ev.id}
                style={{
                  background: '#fff',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '1px solid #E5E7EB',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                <div>
                  {/* Banner Image */}
                  <div style={{ height: '180px', position: 'relative', overflow: 'hidden' }}>
                    <img
                      src={ev.banner || '/assets/images/meeting.jpg'}
                      alt={ev.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.target.src = '/assets/images/meeting.jpg'; }}
                    />
                    <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', color: '#fff', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700 }}>
                      🚩 {ev.category}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '12px' }}>
                      <div style={{ background: '#FFF3E0', border: '2px solid #FFB74D', borderRadius: '10px', padding: '6px 12px', textAlign: 'center', minWidth: '65px' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#C73800' }}>तारीख</div>
                        <div style={{ fontSize: '1rem', fontWeight: 800, color: '#D84315' }}>{ev.date.split('-')[2] || '०६'}</div>
                        <div style={{ fontSize: '0.7rem', color: '#666' }}>{ev.date.split('-')[1] || 'जून'}</div>
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.25rem', margin: '0 0 4px', color: '#1F2937', fontWeight: 700 }}>
                          {ev.title}
                        </h3>
                        <div style={{ fontSize: '0.85rem', color: '#6B7280' }}>
                          आयोजक: <strong>{ev.organizer}</strong>
                        </div>
                      </div>
                    </div>

                    <div style={{ background: '#F9FAFB', borderRadius: '8px', padding: '10px 12px', marginBottom: '14px', fontSize: '0.85rem', color: '#4B5563', lineHeight: 1.5 }}>
                      <div>⏰ वेळ: <strong>{ev.time}</strong></div>
                      <div>📍 ठिकाण: <strong>{ev.venue}</strong> ({ev.district})</div>
                    </div>

                    <p style={{ fontSize: '0.9rem', color: '#4B5563', lineHeight: 1.6, margin: '0 0 16px' }}>
                      {ev.desc}
                    </p>
                  </div>
                </div>

                {/* Footer Action */}
                <div style={{ padding: '16px 20px', background: '#FFF8F2', borderTop: '1px solid #FFE0B2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.85rem', color: '#C73800', fontWeight: 700 }}>
                    👥 {ev.rsvp_count || 0} बांधव उपस्थित राहणार
                  </div>

                  <button
                    onClick={() => { setSelectedEvent(ev); setRsvpSuccess(null); }}
                    className="btn btn-primary"
                    style={{ background: '#C73800', border: 'none', color: '#fff', padding: '8px 18px', borderRadius: '6px', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer' }}>
                    नोंदणी करा (RSVP) 🎟️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal: RSVP */}
        {selectedEvent && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
            <div style={{ background: '#fff', borderRadius: '16px', maxWidth: '480px', width: '100%', padding: '28px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
              
              {rsvpSuccess ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🎉</div>
                  <h3 style={{ color: '#2E7D32', fontSize: '1.4rem', margin: '0 0 10px' }}>
                    उपस्थिती नोंदणी यशस्वी!
                  </h3>
                  <p style={{ color: '#555', fontSize: '0.95rem', margin: '0 0 16px' }}>
                    <strong>{rsvpSuccess.title}</strong> साठी आपले डिजिटल प्रवेशपत्र तयार झाले आहे.
                  </p>

                  <div style={{ background: '#F0FDF4', border: '2px dashed #86EFAC', borderRadius: '10px', padding: '16px', marginBottom: '20px', textAlign: 'left' }}>
                    <div><strong>प्रवेशिका क्र.:</strong> {rsvpSuccess.passId}</div>
                    <div><strong>तारीख:</strong> {rsvpSuccess.date}</div>
                    <div><strong>ठिकाण:</strong> {rsvpSuccess.venue}</div>
                    <div><strong>एकूण व्यक्ती:</strong> {rsvpSuccess.seats} व्यक्ती</div>
                  </div>

                  <button
                    onClick={() => setSelectedEvent(null)}
                    style={{ background: '#C73800', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>
                    पूर्ण झाले
                  </button>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '1.3rem', margin: 0, color: '#C73800' }}>
                      🎟️ कार्यक्रमासाठी उपस्थिती नोंदवा
                    </h3>
                    <button onClick={() => setSelectedEvent(null)} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer' }}>✕</button>
                  </div>

                  <p style={{ fontSize: '0.9rem', color: '#555', marginBottom: '16px' }}>
                    <strong>{selectedEvent.title}</strong>
                  </p>

                  <form onSubmit={handleRsvpSubmit}>
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>नाव *</label>
                      <input
                        type="text"
                        required
                        value={rsvpData.name}
                        onChange={(e) => setRsvpData({ ...rsvpData, name: e.target.value })}
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                      />
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>मोबाईल नंबर *</label>
                      <input
                        type="tel"
                        required
                        value={rsvpData.phone}
                        onChange={(e) => setRsvpData({ ...rsvpData, phone: e.target.value })}
                        placeholder="9876500000"
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                      />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>उपस्थित राहणाऱ्यांची संख्या (Seats):</label>
                      <select
                        value={rsvpData.seats}
                        onChange={(e) => setRsvpData({ ...rsvpData, seats: Number(e.target.value) })}
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB', background: '#fff' }}>
                        <option value="1">१ व्यक्ती (फक्त मी)</option>
                        <option value="2">२ व्यक्ती (कुटुंब/मित्र)</option>
                        <option value="3">३ व्यक्ती</option>
                        <option value="4">४ व्यक्ती</option>
                        <option value="5">५+ व्यक्ती (ग्रुप)</option>
                      </select>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                      <button type="button" onClick={() => setSelectedEvent(null)} style={{ background: '#F3F4F6', border: 'none', padding: '8px 16px', borderRadius: '6px' }}>रद्द</button>
                      <button type="submit" style={{ background: '#C73800', color: '#fff', border: 'none', padding: '8px 24px', borderRadius: '6px', fontWeight: 700 }}>नोंदवा 🎟️</button>
                    </div>
                  </form>
                </div>
              )}

            </div>
          </div>
        )}

        {/* Modal: Propose New Event */}
        {showAddModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
            <div style={{ background: '#fff', borderRadius: '16px', maxWidth: '540px', width: '100%', padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, color: '#C73800' }}>🚩 नवीन कार्यक्रम प्रस्तावित करा</h3>
                <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer' }}>✕</button>
              </div>

              <form onSubmit={handleCreateEvent}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>कार्यक्रमाचे शीर्षक *</label>
                  <input
                    type="text"
                    required
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    placeholder="उदा. शिवजयंती उत्सव, रक्तदान शिबिर"
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>तारीख *</label>
                    <input
                      type="date"
                      required
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>वेळ</label>
                    <input
                      type="text"
                      value={newEvent.time}
                      onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>ठिकाण (Venue) *</label>
                    <input
                      type="text"
                      required
                      value={newEvent.venue}
                      onChange={(e) => setNewEvent({ ...newEvent, venue: e.target.value })}
                      placeholder="उदा. शिवाजी मंदिर सभागृह"
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>जिल्हा</label>
                    <input
                      type="text"
                      value={newEvent.district}
                      onChange={(e) => setNewEvent({ ...newEvent, district: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>सविस्तर वर्णन</label>
                  <textarea
                    rows="3"
                    value={newEvent.desc}
                    onChange={(e) => setNewEvent({ ...newEvent, desc: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB', fontFamily: 'inherit' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setShowAddModal(false)} style={{ background: '#F3F4F6', border: 'none', padding: '8px 16px', borderRadius: '6px' }}>रद्द</button>
                  <button type="submit" style={{ background: '#C73800', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '6px', fontWeight: 700 }}>प्रस्तावित करा 🚀</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
