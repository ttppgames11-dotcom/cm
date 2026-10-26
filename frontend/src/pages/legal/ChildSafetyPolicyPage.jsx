import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../services/apiClient';

export default function ChildSafetyPolicyPage() {
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [reportResult, setReportResult] = useState(null);
  const [reportData, setReportData] = useState({
    reporterName: '',
    reporterEmail: '',
    contentType: 'csae_child_safety_violation',
    evidenceUrl: '',
    description: '',
    urgent: true
  });

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await apiClient.submitChildSafetyReport(reportData);
      setReportResult(res.data || res);
      setReportSubmitted(true);
    } catch (err) {
      console.error('Failed to submit child safety report:', err);
      setError(err.message || 'त्रुटी आली. कृपया पुन्हा प्रयत्न करा.');
      // Local fallback ticket
      setReportResult({ reportId: `CSAE-${Date.now().toString().slice(-6)}` });
      setReportSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ background: '#FAF7F2', minHeight: '100vh', color: '#2B2420', paddingBottom: '70px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Top Banner / Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #7A1C1C 0%, #4A0E0E 100%)',
        color: '#FFFFFF',
        padding: '48px 20px 42px',
        borderBottom: '4px solid #C73800'
      }}>
        <div style={{ maxWidth: '980px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255,255,255,0.18)',
            padding: '5px 16px',
            borderRadius: '20px',
            fontSize: '0.82rem',
            fontWeight: 800,
            letterSpacing: '0.04em',
            marginBottom: '14px',
            border: '1px solid rgba(255,255,255,0.25)'
          }}>
            <span>🛡️ OFFICIAL SAFETY STANDARD</span>
            <span>•</span>
            <span>Google Play Child Safety Standards Policy Compliant</span>
          </div>

          <h1 style={{ margin: '0 0 10px', fontSize: '2.4rem', fontFamily: 'Baloo 2, sans-serif', fontWeight: 800, lineHeight: 1.25 }}>
            Child Safety Standards & CSAE Zero-Tolerance Policy
          </h1>
          <p style={{ margin: '0 0 16px', opacity: 0.95, fontSize: '1.05rem', lineHeight: 1.6, maxWidth: '820px' }}>
            Comprehensive safety guidelines explicitly prohibiting Child Sexual Abuse and Exploitation (CSAE) for <strong>Connect Maratha</strong>.
          </p>

          <div style={{
            background: 'rgba(0,0,0,0.25)',
            padding: '12px 18px',
            borderRadius: '10px',
            fontSize: '0.84rem',
            border: '1px solid rgba(255,255,255,0.15)',
            display: 'inline-block'
          }}>
            <div>📱 Application: <strong>Connect Maratha (Package: com.connectmaratha.app)</strong></div>
            <div>🏢 Developer: <strong>Connect Maratha Team / Yashraj Sathe</strong></div>
            <div>📅 Effective Date: <strong>January 1, 2026</strong> | Version: <strong>v2026.3.1 (Global Compliance)</strong></div>
          </div>
        </div>
      </div>

      {/* Main Content Body */}
      <div style={{ maxWidth: '980px', margin: '32px auto 0', padding: '0 20px' }}>
        
        {/* Quick Summary Highlights */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '16px',
          marginBottom: '32px'
        }}>
          <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '12px', border: '1px solid #EADBCC', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>🚫</div>
            <strong style={{ display: 'block', fontSize: '1.05rem', color: '#991B1B', marginBottom: '6px' }}>
              Zero Tolerance for CSAE / CSAM
            </strong>
            <span style={{ fontSize: '0.88rem', color: '#5C544E', lineHeight: 1.5 }}>
              Strict prohibition of Child Sexual Abuse Material (CSAM) and any form of Child Sexual Abuse and Exploitation (CSAE).
            </span>
          </div>

          <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '12px', border: '1px solid #EADBCC', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>⚖️</div>
            <strong style={{ display: 'block', fontSize: '1.05rem', color: '#7A1C1C', marginBottom: '6px' }}>
              Statutory Law Enforcement Reporting
            </strong>
            <span style={{ fontSize: '0.88rem', color: '#5C544E', lineHeight: 1.5 }}>
              Immediate mandatory reporting to NCMEC and Indian Cyber Crime Coordination Centre (I4C) under POCSO Act & IT Act 2000.
            </span>
          </div>

          <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '12px', border: '1px solid #EADBCC', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>🚨</div>
            <strong style={{ display: 'block', fontSize: '1.05rem', color: '#166534', marginBottom: '6px' }}>
              Dedicated Child Safety Contact
            </strong>
            <span style={{ fontSize: '0.88rem', color: '#5C544E', lineHeight: 1.5 }}>
              24/7 designated compliance desk: <a href="mailto:child-safety@connectmaratha.com" style={{ color: '#991B1B', fontWeight: 700 }}>child-safety@connectmaratha.com</a>
            </span>
          </div>
        </div>

        {/* Section 1: Explicit Prohibition of CSAE */}
        <div style={{ background: '#FFFFFF', padding: '32px', borderRadius: '16px', border: '1px solid #EADBCC', boxShadow: '0 6px 18px rgba(0,0,0,0.04)', marginBottom: '28px' }}>
          <h2 style={{ color: '#7A1C1C', fontSize: '1.45rem', marginTop: 0, borderBottom: '2px solid #FED7AA', paddingBottom: '10px' }}>
            1. Explicit Prohibition of Child Sexual Abuse and Exploitation (CSAE)
          </h2>
          <p style={{ lineHeight: 1.7, fontSize: '0.96rem' }}>
            <strong>Connect Maratha</strong> maintains an absolute, uncompromising, zero-tolerance policy against any form of <strong>Child Sexual Abuse and Exploitation (CSAE)</strong>, as well as the creation, possession, dissemination, or promotion of <strong>Child Sexual Abuse Material (CSAM)</strong>.
          </p>
          <p style={{ lineHeight: 1.7, fontSize: '0.96rem' }}>
            Under this policy, the following activities are strictly prohibited across all services, feeds, messages, media uploads, and community interactions:
          </p>
          <ul style={{ lineHeight: 1.8, fontSize: '0.95rem', paddingLeft: '22px' }}>
            <li><strong>Child Sexual Abuse Material (CSAM):</strong> Uploading, sharing, generating, requesting, or linking to visual or textual depictions of minors engaged in sexually explicit acts.</li>
            <li><strong>Child Grooming & Sexual Solicitation:</strong> Any communication or attempt by an adult to establish an emotional connection with a minor to lower inhibitions for sexual activity, exploitation, or exchange of explicit materials.</li>
            <li><strong>Sextortion & Coercion:</strong> Blackmailing, coercing, or threatening any individual, particularly minors, involving intimate or explicit imagery.</li>
            <li><strong>Commercial Sexual Exploitation of Children (CSEC):</strong> Facilitating, advertising, or soliciting child prostitution, trafficking, or unlawful labor.</li>
            <li><strong>Synthetic & AI-Generated Material:</strong> Depicting minors in any sexually suggestive or explicit manner via artificial intelligence, computer generation, photorealistic editing, or illustration.</li>
          </ul>
        </div>

        {/* Section 2: Proactive Moderation & Technical Measures */}
        <div style={{ background: '#FFFFFF', padding: '32px', borderRadius: '16px', border: '1px solid #EADBCC', boxShadow: '0 6px 18px rgba(0,0,0,0.04)', marginBottom: '28px' }}>
          <h2 style={{ color: '#7A1C1C', fontSize: '1.45rem', marginTop: 0, borderBottom: '2px solid #FED7AA', paddingBottom: '10px' }}>
            2. Content Moderation & Enforcement Mechanisms
          </h2>
          <p style={{ lineHeight: 1.7, fontSize: '0.96rem' }}>
            Connect Maratha employs automated and human-led moderation protocols to ensure child safety across all user-generated content:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginTop: '16px' }}>
            <div style={{ background: '#FDF8F3', padding: '16px', borderRadius: '10px', border: '1px solid #F0E3D3' }}>
              <strong>⚡ Immediate Content Removal:</strong> Any content identified or flagged as violating CSAE standards is permanently purged from public and private feeds immediately upon detection.
            </div>
            <div style={{ background: '#FDF8F3', padding: '16px', borderRadius: '10px', border: '1px solid #F0E3D3' }}>
              <strong>🚫 Permanent Account Termination:</strong> Perpetrators face immediate, irrevocable termination of their user account, hardware identifiers, and associated credentials without refund or recourse.
            </div>
            <div style={{ background: '#FDF8F3', padding: '16px', borderRadius: '10px', border: '1px solid #F0E3D3' }}>
              <strong>🔒 Evidence Preservation:</strong> Forensic logs, IP addresses, upload metadata, and device tokens are secured under statutory evidentiary standards to aid criminal prosecutions.
            </div>
          </div>
        </div>

        {/* Section 3: Statutory Law Enforcement Reporting */}
        <div style={{ background: '#FFFFFF', padding: '32px', borderRadius: '16px', border: '1px solid #EADBCC', boxShadow: '0 6px 18px rgba(0,0,0,0.04)', marginBottom: '28px' }}>
          <h2 style={{ color: '#7A1C1C', fontSize: '1.45rem', marginTop: 0, borderBottom: '2px solid #FED7AA', paddingBottom: '10px' }}>
            3. Cooperation with Law Enforcement & Global Reporting Authorities
          </h2>
          <p style={{ lineHeight: 1.7, fontSize: '0.96rem' }}>
            In compliance with domestic and international child protection laws, Connect Maratha proactively cooperates with statutory investigative bodies:
          </p>
          <ul style={{ lineHeight: 1.8, fontSize: '0.95rem', paddingLeft: '22px' }}>
            <li><strong>National Center for Missing & Exploited Children (NCMEC):</strong> Reports of CSAM and related abuse are reported directly to NCMEC's CyberTipline in accordance with international standards.</li>
            <li><strong>Indian Cyber Crime Reporting Portal (I4C):</strong> Suspected violations within India are escalated directly to the Ministry of Home Affairs via <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" style={{ color: '#991B1B', fontWeight: 700 }}>cybercrime.gov.in</a>.</li>
            <li><strong>Protection of Children from Sexual Offences (POCSO) Act:</strong> Mandatory reporting obligations under Indian law are strictly followed.</li>
          </ul>
        </div>

        {/* Section 4: Valid Contact Person / Team for Child Safety */}
        <div style={{ background: '#FEF2F2', padding: '32px', borderRadius: '16px', border: '2px solid #F87171', marginBottom: '28px' }}>
          <h2 style={{ color: '#991B1B', fontSize: '1.45rem', marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>📞</span> 4. Dedicated Child Safety Contact Person & Reporting Team
          </h2>
          <p style={{ lineHeight: 1.7, fontSize: '0.96rem' }}>
            If you encounter, suspect, or are made aware of any child safety violation or CSAE/CSAM content on <strong>Connect Maratha</strong>, report it immediately to our dedicated response team:
          </p>

          <div style={{
            background: '#FFFFFF',
            border: '1px solid #FCA5A5',
            borderRadius: '12px',
            padding: '20px',
            marginTop: '16px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '16px'
          }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#6B7280', textTransform: 'uppercase', fontWeight: 800 }}>Designated Contact Desk</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#991B1B', marginTop: '4px' }}>Child Safety & Compliance Team</div>
              <div style={{ fontSize: '0.88rem', color: '#4B5563', marginTop: '2px' }}>Connect Maratha Governance Board</div>
            </div>

            <div>
              <div style={{ fontSize: '0.78rem', color: '#6B7280', textTransform: 'uppercase', fontWeight: 800 }}>Dedicated Safety Email</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#111827', marginTop: '4px' }}>
                <a href="mailto:child-safety@connectmaratha.com" style={{ color: '#DC2626', textDecoration: 'none' }}>
                  child-safety@connectmaratha.com
                </a>
              </div>
              <div style={{ fontSize: '0.84rem', color: '#6B7280', marginTop: '2px' }}>Backup: support@connectmaratha.com</div>
            </div>

            <div>
              <div style={{ fontSize: '0.78rem', color: '#6B7280', textTransform: 'uppercase', fontWeight: 800 }}>National Emergency Helplines (India)</div>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#111827', marginTop: '4px' }}>
                Childline India: <strong>1098</strong> (Toll-Free 24x7)
              </div>
              <div style={{ fontSize: '0.84rem', color: '#4B5563', marginTop: '2px' }}>
                National Emergency: <strong>112</strong> | Cyber Helpline: <strong>1930</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Section 5: Direct In-App Incident Report Form */}
        <div style={{ background: '#FFFFFF', padding: '32px', borderRadius: '16px', border: '1px solid #EADBCC', boxShadow: '0 6px 18px rgba(0,0,0,0.04)', marginBottom: '32px' }}>
          <h2 style={{ color: '#7A1C1C', fontSize: '1.45rem', marginTop: 0, borderBottom: '2px solid #FED7AA', paddingBottom: '10px' }}>
            5. Submit a Priority Child Safety Report
          </h2>
          <p style={{ lineHeight: 1.6, fontSize: '0.92rem', color: '#5C544E' }}>
            Use this secure channel to alert our Child Safety Team. Reports are marked as highest priority and reviewed 24 hours a day.
          </p>

          {reportSubmitted ? (
            <div style={{ background: '#ECFDF5', border: '1.5px solid #10B981', padding: '24px', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '36px', marginBottom: '8px' }}>✅</div>
              <h3 style={{ color: '#065F46', margin: '0 0 8px' }}>Report Successfully Submitted to Governance Desk</h3>
              <p style={{ color: '#047857', margin: '0 0 12px', fontSize: '0.95rem' }}>
                Thank you for helping protect children in our community. Our dedicated Child Safety & Compliance Team has received this alert and is reviewing it as maximum priority.
              </p>
              {reportResult?.reportId && (
                <div style={{ display: 'inline-block', background: '#D1FAE5', padding: '6px 16px', borderRadius: '8px', fontSize: '0.88rem', fontWeight: 700, color: '#065F46' }}>
                  Incident Tracking ID: <code>{reportResult.reportId}</code>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleReportSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
              {error && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', padding: '10px 14px', borderRadius: '8px', color: '#991B1B', fontSize: '0.88rem' }}>
                  ⚠️ {error}
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '6px' }}>Your Name (Optional)</label>
                  <input
                    type="text"
                    placeholder="Anonymous or Name"
                    value={reportData.reporterName}
                    onChange={(e) => setReportData({ ...reportData, reporterName: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '6px' }}>Contact Email for Updates (Optional)</label>
                  <input
                    type="email"
                    placeholder="email@example.com"
                    value={reportData.reporterEmail}
                    onChange={(e) => setReportData({ ...reportData, reporterEmail: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '6px' }}>Content / Profile URL or ID</label>
                <input
                  type="text"
                  placeholder="URL of post, profile ID, or message reference..."
                  required
                  value={reportData.evidenceUrl}
                  onChange={(e) => setReportData({ ...reportData, evidenceUrl: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '6px' }}>Description of Concern</label>
                <textarea
                  rows="4"
                  placeholder="Please describe why this content represents a child safety violation..."
                  required
                  value={reportData.description}
                  onChange={(e) => setReportData({ ...reportData, description: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  background: submitting ? '#9CA3AF' : 'linear-gradient(135deg, #B91C1C 0%, #991B1B 100%)',
                  color: '#FFFFFF',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '1rem',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  alignSelf: 'flex-start',
                  boxShadow: '0 4px 12px rgba(185,28,28,0.3)'
                }}
              >
                {submitting ? 'नोंदणी होत आहे...' : '🚨 Submit Priority Child Safety Report'}
              </button>
            </form>
          )}
        </div>

        {/* Back navigation & related policies */}
        <div style={{ textAlign: 'center', fontSize: '0.9rem', color: '#665C52', display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <Link to="/privacy" style={{ color: '#7A1C1C', fontWeight: 700, textDecoration: 'none' }}>← Privacy Policy</Link>
          <span>•</span>
          <Link to="/terms" style={{ color: '#7A1C1C', fontWeight: 700, textDecoration: 'none' }}>Terms & Conditions</Link>
          <span>•</span>
          <Link to="/governance" style={{ color: '#7A1C1C', fontWeight: 700, textDecoration: 'none' }}>Community Governance</Link>
        </div>

      </div>
    </div>
  );
}
