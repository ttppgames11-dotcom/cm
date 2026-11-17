import React from 'react';
import { Link } from 'react-router-dom';
import { useMagazineAdmin } from '../context/MagazineAdminContext';

export default function AdminDashboardPage() {
  const { issues, articles, authors, advertisements, subscriptions, approvals, packages } = useMagazineAdmin();

  // Metrics
  const totalIssues = issues.length;
  const publishedIssues = issues.filter(i => i.status === 'published').length;
  const draftIssues = issues.filter(i => i.status === 'draft').length;
  const totalArticles = articles.length;
  const totalAuthors = authors.length;
  const totalAds = advertisements.length;
  const activeSubs = subscriptions.filter(s => s.status === 'active').length;
  const pendingApprovals = approvals.filter(a => a.status === 'pending').length;
  const totalListings = packages.reduce((acc, p) => acc + (p.salesCount || 0), 0);

  // Modern SaaS Stats
  const statCards = [
    { marathi: "मासिक अंक (Issues)", english: "Total Editions", value: totalIssues, sub: `${publishedIssues} लाईव्ह, ${draftIssues} मसुदा`, icon: "📖", color: "#F4510B", link: "/admin/issues" },
    { marathi: "प्रकाशित लेख (Articles)", english: "Editorial Stories", value: totalArticles, sub: "१० स्तंभांमध्ये वाटप", icon: "✍️", color: "#2563EB", link: "/admin/articles" },
    { marathi: "लेखक व प्रतिनिधी (Authors)", english: "Contributors Network", value: totalAuthors, sub: "३६ जिल्ह्यांमधील लेखक", icon: "👥", color: "#7C3AED", link: "/admin/authors" },
    { marathi: "सक्रिय जाहिराती (Ads)", english: "Commercial Slots", value: totalAds, sub: "प्रिंट + डिजिटल स्लॉट्स", icon: "📢", color: "#059669", link: "/admin/advertisements" },
    { marathi: "सक्रिय वर्गणीदार (Subs)", english: "Active Subscribers", value: activeSubs, sub: "वार्षिक वाचक सदस्य", icon: "🎟️", color: "#D97706", link: "/admin/subscriptions" },
    { marathi: "प्रलंबित मंजुऱ्या (Approvals)", english: "Pending Editorial", value: pendingApprovals, sub: "तपासणी आवश्यक", icon: "🛡️", color: "#E11D48", link: "/admin/approvals" },
    { marathi: "बिझनेस नोंदणी (Listings)", english: "Business Listings", value: totalListings, sub: "प्रस्तावित पॅकेजेस नेटवर्क", icon: "💼", color: "#0284C7", link: "/admin/business" },
    { marathi: "अंदाजे वाचक पोहोच (Reach)", english: "Monthly Readership", value: "५०,०००+", sub: "मासिक डिजिटल वाचक संख्या", icon: "📈", color: "#4F46E5", link: "/admin/analytics" }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* SaaS Hero Welcome Banner with High Contrast */}
      <div style={{
        backgroundColor: '#0F172A',
        borderRadius: '16px',
        padding: '30px 36px',
        color: '#FFFFFF',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '24px',
        border: '1px solid #1E293B',
        boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.15)'
      }}>
        <div style={{ flex: '1 1 500px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <span style={{
              background: '#F4510B',
              color: '#FFFFFF',
              fontSize: '0.74rem',
              fontWeight: 800,
              padding: '4px 12px',
              borderRadius: '9999px',
              textTransform: 'uppercase',
              letterSpacing: '0.8px'
            }}>
              सस्नेह नमस्कार, जय शिवराय
            </span>
            <span style={{ color: '#94A3B8', fontSize: '0.82rem', fontWeight: 600 }}>
              CONNECT MARATHA CENTRAL PLATFORM
            </span>
          </div>

          <h1 style={{ fontSize: '1.85rem', fontWeight: 900, margin: '0 0 8px', letterSpacing: '-0.3px', color: '#FFFFFF', lineHeight: 1.25 }}>
            मासिक पत्रिका व्यवस्थापन व प्रशासकीय मुख्य डॅशबोर्ड
          </h1>

          <p style={{ color: '#CBD5E1', fontSize: '0.92rem', margin: 0, lineHeight: 1.55, maxWidth: '680px', fontWeight: 400 }}>
            अंक निर्मिती, संपादकीय लेख मंजुरी, १०-पानी डिजिटल रीडर मांडणी, लेखक नेटवर्क व जाहिरात महसूल व्यवस्थापन.
          </p>
        </div>

        {/* Quick Top Actions */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link to="/admin/issues" className="cm-btn cm-btn-primary" style={{ padding: '11px 22px', fontSize: '0.92rem' }}>
            <span>+ नवीन मासिक अंक तयार करा</span>
          </Link>
          <Link to="/admin/articles" className="cm-btn cm-btn-secondary" style={{ padding: '11px 20px', fontSize: '0.92rem', background: '#1E293B', color: '#FFFFFF', borderColor: '#334155' }}>
            <span>+ नवीन लेख जोडा</span>
          </Link>
        </div>
      </div>

      {/* 8 Clean Stat Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '20px'
      }}>
        {statCards.map((card, idx) => (
          <Link 
            key={idx} 
            to={card.link}
            style={{ textDecoration: 'none', color: 'inherit' }}
            className="cm-card"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
              <div>
                <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0F172A', display: 'block' }}>
                  {card.marathi}
                </span>
                <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>
                  {card.english}
                </span>
              </div>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: `${card.color}14`,
                color: card.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                flexShrink: 0
              }}>
                {card.icon}
              </div>
            </div>

            <div style={{ fontSize: '2.1rem', fontWeight: 900, color: '#0F172A', lineHeight: 1.1, marginBottom: '6px' }}>
              {card.value}
            </div>

            <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>
              {card.sub}
            </span>
          </Link>
        ))}
      </div>

      {/* Main 2-Column Split: Active Issues & Editorial Approvals */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.2fr 0.8fr',
        gap: '24px',
        alignItems: 'start'
      }}>
        {/* Left: Monthly Issues Live Status */}
        <div className="cm-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: '0 0 2px' }}>
                📖 मासिक आवृत्त्या व्यवस्थापन (Monthly Issues)
              </h3>
              <span style={{ fontSize: '0.78rem', color: '#64748B' }}>सक्रिय आणि आगामी अंकांचे थेट व्यवस्थापन</span>
            </div>
            <Link to="/admin/issues" style={{ color: '#F4510B', fontSize: '0.84rem', fontWeight: 700, textDecoration: 'none' }}>
              सर्व अंक पहा ➔
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {issues.map(iss => (
              <div 
                key={iss.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '14px 18px',
                  borderRadius: '12px',
                  border: '1.5px solid #F1F5F9',
                  background: '#FFFFFF',
                  transition: 'all 0.18s ease'
                }}
              >
                <img 
                  src={iss.coverImage} 
                  alt={iss.title} 
                  style={{ width: '56px', height: '74px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #E2E8F0', flexShrink: 0 }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span className={`cm-badge cm-badge-${iss.status}`}>
                      {iss.status === 'published' ? '● प्रकाशित (LIVE)' : iss.status === 'draft' ? '● मसुदा (Draft)' : '● अर्काईव्ह'}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>
                      {iss.volume} • {iss.issueNo} ({iss.month} {iss.year})
                    </span>
                  </div>
                  <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0F172A', margin: '0 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {iss.title}
                  </h4>
                  <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                    {iss.totalPages} पाने • {iss.articlesCount} लेख • {iss.views.toLocaleString()} वाचक
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  <Link to="/admin/designer" className="cm-btn cm-btn-outline-primary" style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
                    १०-पान डिझायनर
                  </Link>
                  <Link to="/admin/issues" className="cm-btn cm-btn-secondary" style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
                    संपादित
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Editorial Approvals & Quick Shortcuts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Editorial Approvals Widget */}
          <div className="cm-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.08rem', fontWeight: 800, color: '#0F172A', margin: '0 0 2px' }}>
                  🛡️ संपादकीय मंजुरी कार्य (Approvals)
                </h3>
                <span style={{ fontSize: '0.76rem', color: '#64748B' }}>पुनरावलोकनासाठी आलेले मसुदे</span>
              </div>
              <Link to="/admin/approvals" style={{ color: '#F4510B', fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none' }}>
                पहा ({approvals.length}) ➔
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {approvals.slice(0, 3).map(app => (
                <div key={app.id} style={{ padding: '14px', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span className={`cm-badge cm-badge-${app.status}`}>
                      {app.currentStage}
                    </span>
                    <span style={{ fontSize: '0.74rem', color: '#64748B' }}>{app.submittedDate}</span>
                  </div>
                  <h5 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0F172A', margin: '0 0 4px', lineHeight: 1.3 }}>
                    {app.articleTitle}
                  </h5>
                  <span style={{ fontSize: '0.76rem', color: '#64748B' }}>
                    लेखक: {app.author} • {app.category}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick SaaS Shortcuts */}
          <div className="cm-card" style={{ background: '#FFFDF9', borderColor: '#FFD4C2' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#F4510B', margin: '0 0 14px' }}>
              ⚡ जलद प्रशासकीय कृती (Quick Shortcuts)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <Link to="/admin/issues" className="cm-btn cm-btn-secondary" style={{ fontSize: '0.82rem', padding: '10px', background: '#FFF' }}>
                📖 अंक तयार करा
              </Link>
              <Link to="/admin/designer" className="cm-btn cm-btn-secondary" style={{ fontSize: '0.82rem', padding: '10px', background: '#FFF' }}>
                🎨 १०-पान डिझाइन
              </Link>
              <Link to="/admin/advertisements" className="cm-btn cm-btn-secondary" style={{ fontSize: '0.82rem', padding: '10px', background: '#FFF' }}>
                📢 जाहिरात नोंदवा
              </Link>
              <Link to="/admin/media" className="cm-btn cm-btn-secondary" style={{ fontSize: '0.82rem', padding: '10px', background: '#FFF' }}>
                🖼️ मीडिया अपलोड
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
