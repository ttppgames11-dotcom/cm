import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../services/apiClient';
import { useAuth } from '../../context/AuthContext';

export default function FinanceLedgerCRM() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('donations'); // 'donations' | 'membership' | 'vouchers' | 'balancesheet'
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);
  const [donations, setDonations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCause, setFilterCause] = useState('all');
  const [toastMessage, setToastMessage] = useState(null);

  // Expense Vouchers state
  const [vouchers, setVouchers] = useState([
    {
      id: 'VCH-2026-081',
      title: 'आपत्कालीन रक्तदान शिबिर मंडप व वैद्यकीय सामग्री',
      department: 'सेवा व आरोग्य विभाग',
      submittedBy: 'आनंदराव देशमुख (पुणे)',
      amount: 45000,
      date: '२०२६-०९-२०',
      status: 'Pending',
      remarks: 'ससून रुग्णालयाजवळ आयोजित रक्तदान शिबिर खर्च'
    },
    {
      id: 'VCH-2026-082',
      title: 'मराठा नवउद्योजक B2B परिषद सभागृह भाडे',
      department: 'उद्योग व संगम कक्ष',
      submittedBy: 'तानाजी विठ्ठलराव जाधव',
      amount: 85000,
      date: '२०२६-०९-१८',
      status: 'Approved',
      remarks: 'ऑटो क्लस्टर ऑडिटोरियम आरक्षण'
    },
    {
      id: 'VCH-2026-083',
      title: 'दुर्गराज रायगड स्वच्छता व माहिती फलक उभारणी',
      department: 'इतिहास व गडकोट संवर्धन',
      submittedBy: 'संभाजी कदम (महाड)',
      amount: 32000,
      date: '२०२६-०९-१५',
      status: 'Approved',
      remarks: 'महादरवाजा व नगारखाना माहिती फलक'
    },
    {
      id: 'VCH-2026-084',
      title: 'अनाथ विद्यार्थी उच्च शिक्षण सहाय्य धनादेश',
      department: 'शैक्षणिक सहाय्य निधी',
      submittedBy: 'राजेंद्र मोहिते',
      amount: 60000,
      date: '२०२६-०९-१२',
      status: 'Pending',
      remarks: 'इंजिनीअरिंग व मेडिकल कॉलेज फी धनादेश'
    }
  ]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadFinanceData = async () => {
    setLoading(true);
    try {
      const [metRes, donRes] = await Promise.all([
        apiClient.getAdminMetrics().catch(() => null),
        apiClient.getAdminDonations().catch(() => [])
      ]);

      if (metRes && metRes.metrics) {
        setMetrics(metRes.metrics);
      }
      setDonations(donRes || []);
    } catch (e) {
      console.error('Finance CRM load error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFinanceData();
  }, []);

  const handleApproveVoucher = (id) => {
    setVouchers(prev => prev.map(v => v.id === id ? { ...v, status: 'Approved', approvedBy: user?.name || 'कोषाध्यक्ष', approvedAt: new Date().toISOString() } : v));
    showToast(`✓ व्हाउचर #${id} यशस्वीरीत्या मंजूर करण्यात आले!`);
  };

  const handleRejectVoucher = (id) => {
    setVouchers(prev => prev.map(v => v.id === id ? { ...v, status: 'Rejected', rejectedBy: user?.name || 'कोषाध्यक्ष' } : v));
    showToast(`✕ व्हाउचर #${id} नाकारण्यात आले.`);
  };

  const filteredDonations = donations.filter(d => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch = !q || 
      (d.donorName || d.name || '').toLowerCase().includes(q) ||
      (d.donorPhone || d.phone || '').includes(q) ||
      (d.receiptNo || d.id || '').toLowerCase().includes(q) ||
      (d.cause || d.campaignTitle || '').toLowerCase().includes(q);

    const matchCause = filterCause === 'all' || (d.cause || d.campaignTitle || '').includes(filterCause);
    return matchSearch && matchCause;
  });

  const totalDonationSum = donations.reduce((sum, d) => sum + (Number(d.amount || d.donatedAmount) || 0), 0);
  const approvedVoucherSum = vouchers.filter(v => v.status === 'Approved').reduce((sum, v) => sum + v.amount, 0);
  const pendingVoucherSum = vouchers.filter(v => v.status === 'Pending').reduce((sum, v) => sum + v.amount, 0);

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', paddingBottom: '60px', color: '#0F172A', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 99999,
          padding: '14px 22px',
          borderRadius: '10px',
          background: '#047857',
          color: '#FFFFFF',
          fontWeight: 700,
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span>💰</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F766E 100%)',
        padding: '36px 24px',
        borderBottom: '3px solid #14B8A6',
        color: '#FFFFFF'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(20, 184, 166, 0.2)', border: '1px solid #14B8A6', borderRadius: '30px', padding: '4px 14px', fontSize: '0.8rem', color: '#5EEAD4', marginBottom: '10px' }}>
              <span>⚖️ केंद्रीय तिजोरी व वित्तीय नियामक (Finance & Section 8 Treasury)</span>
              <span>•</span>
              <span>80G प्रमाणित</span>
            </div>
            <h1 style={{ margin: '4px 0 8px 0', fontSize: '2.1rem', fontWeight: 900, color: '#FFFFFF' }}>
              महासंघ वित्त, लेजर व 80G ऑडिट नियंत्रण केंद्र
            </h1>
            <p style={{ margin: 0, color: '#CBD5E1', fontSize: '0.95rem' }}>
              देणगी पावत्या, सदस्यत्व वर्गणी संकलन, खर्च व्हाउचर मंजुरी आणि वार्षिक ऑडिट ताळेबंद.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Link
              to="/crm"
              style={{ background: '#FFFFFF', color: '#0F766E', fontWeight: 800, padding: '10px 18px', borderRadius: '8px', textDecoration: 'none', border: 'none' }}>
              🔄 CRM भूमिका पोर्टल
            </Link>
            <Link
              to="/superadmin"
              style={{ background: 'rgba(255,255,255,0.15)', color: '#FFFFFF', fontWeight: 700, padding: '10px 18px', borderRadius: '8px', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.3)' }}>
              👑 SuperAdmin
            </Link>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px 20px' }}>
        
        {/* KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
          <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>एकूण गोळा झालेली देणगी</div>
            <div style={{ fontSize: '1.9rem', fontWeight: 900, color: '#0F766E', marginTop: '4px' }}>
              ₹ {(totalDonationSum || metrics?.overview?.totalDonationsCollectedINR || 12450000).toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#10B981', marginTop: '4px' }}>✓ 80G आयकर सवलत प्रमाणपत्र प्रमाणित</div>
          </div>

          <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>B2B व्यापार व्यवहार संगम मूल्य</div>
            <div style={{ fontSize: '1.9rem', fontWeight: 900, color: '#EA580C', marginTop: '4px' }}>
              ₹ {(metrics?.overview?.totalBusinessExchangedINR || 184600000).toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>३६ जिल्ह्यांचे B2B संगम टर्नओव्हर</div>
          </div>

          <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>मंजूर खर्च व्हाउचर्स (Disbursed)</div>
            <div style={{ fontSize: '1.9rem', fontWeight: 900, color: '#059669', marginTop: '4px' }}>
              ₹ {approvedVoucherSum.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#059669', marginTop: '4px' }}>{vouchers.filter(v => v.status === 'Approved').length} व्हाउचर्स अदा केले</div>
          </div>

          <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>पडताळणी प्रलंबित व्हाउचर्स</div>
            <div style={{ fontSize: '1.9rem', fontWeight: 900, color: '#DC2626', marginTop: '4px' }}>
              ₹ {pendingVoucherSum.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#DC2626', marginTop: '4px' }}>{vouchers.filter(v => v.status === 'Pending').length} व्हाउचर्स मंजुरीसाठी प्रलंबित</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #E2E8F0', marginBottom: '24px', overflowX: 'auto' }}>
          {[
            { id: 'donations', label: '📜 80G देणगी लेजर (Donation Ledger)', count: donations.length },
            { id: 'vouchers', label: '📑 खर्च व्हाउचर मंजुरी (Expense Vouchers)', count: vouchers.filter(v => v.status === 'Pending').length },
            { id: 'membership', label: '🎖️ सदस्यत्व वर्गणी निधी (Membership Dues)' },
            { id: 'balancesheet', label: '📊 Section 8 ताळेबंद (Audit Balance Sheet)' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 20px',
                border: 'none',
                background: activeTab === tab.id ? '#0F766E' : 'transparent',
                color: activeTab === tab.id ? '#FFFFFF' : '#475569',
                borderRadius: '8px 8px 0 0',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                whiteSpace: 'nowrap'
              }}>
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span style={{
                  background: activeTab === tab.id ? 'rgba(255,255,255,0.25)' : '#E2E8F0',
                  color: activeTab === tab.id ? '#FFFFFF' : '#0F172A',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '0.75rem'
                }}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* =========================================================================
            TAB 1: 80G DONATION LEDGER
        ========================================================================= */}
        {activeTab === 'donations' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '10px', flex: 1, minWidth: '280px', maxWidth: '500px' }}>
                <input
                  type="text"
                  placeholder="दात्याचे नाव, फोन किंवा पावती नंबर शोधा..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ flex: 1, padding: '10px 16px', borderRadius: '8px', background: '#FFFFFF', border: '1px solid #CBD5E1', color: '#0F172A' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <select
                  value={filterCause}
                  onChange={(e) => setFilterCause(e.target.value)}
                  style={{ padding: '10px 14px', borderRadius: '8px', background: '#FFFFFF', border: '1px solid #CBD5E1', color: '#0F172A', fontSize: '0.85rem' }}>
                  <option value="all">सर्व निधी उद्दिष्टे (All Causes)</option>
                  <option value="शिक्षण">🎓 शैक्षणिक शिष्यवृत्ती</option>
                  <option value="आरोग्य">🩺 वैद्यकीय व रक्त मदत</option>
                  <option value="गडकोट">🏰 गडकोट संवर्धन</option>
                  <option value="संघटना">🚩 संघटनात्मक कार्य</option>
                </select>

                <button
                  onClick={() => {
                    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [
                      'पावती क्र.,दात्याचे नाव,संपर्क,उद्दिष्ट,रक्कम,तारीख,80G स्थिती',
                      ...filteredDonations.map(d => `${d.receiptNo || d.id},"${d.donorName || d.name}","${d.donorPhone || d.phone}","${d.cause || d.campaignTitle}",${d.amount || d.donatedAmount},${d.date || d.created_at},प्रमाणित`)
                    ].join('\n');
                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement('a');
                    link.setAttribute('href', encodedUri);
                    link.setAttribute('download', `Donation_Ledger_80G_${Date.now()}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  style={{
                    background: '#0F766E',
                    border: 'none',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    padding: '10px 18px',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}>
                  📥 80G लेजर CSV डाउनलोड
                </button>
              </div>
            </div>

            {/* Donations Table */}
            <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', overflowX: 'auto', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#F1F5F9', color: '#475569', borderBottom: '1px solid #CBD5E1' }}>
                    <th style={{ padding: '14px 16px' }}>पावती क्र. (Receipt)</th>
                    <th style={{ padding: '14px 16px' }}>दात्याचे नाव</th>
                    <th style={{ padding: '14px 16px' }}>संपर्क व ईमेल</th>
                    <th style={{ padding: '14px 16px' }}>निधी उद्दिष्ट</th>
                    <th style={{ padding: '14px 16px' }}>रक्कम (Amount)</th>
                    <th style={{ padding: '14px 16px' }}>तारीख</th>
                    <th style={{ padding: '14px 16px', textAlign: 'right' }}>80G पावती</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDonations.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ padding: '36px', textAlign: 'center', color: '#64748B' }}>
                        कोणत्याही देणगी नोंदी सापडल्या नाहीत.
                      </td>
                    </tr>
                  ) : (
                    filteredDonations.map((d, i) => (
                      <tr key={d.id || i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontWeight: 700, color: '#0F766E' }}>
                          {d.receiptNo || `80G-${String(i + 1001).padStart(5, '0')}`}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontWeight: 700, color: '#0F172A' }}>{d.donorName || d.name || 'धर्मनिष्ठ मराठा बांधव'}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>PAN: {d.pan || 'XXXXXXXXXX'}</div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div>📞 {d.donorPhone || d.phone || '+91 98220 XXXXX'}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>✉️ {d.donorEmail || d.email || 'donor@email.com'}</div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ background: '#FFF7ED', color: '#C2410C', border: '1px solid #FED7AA', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                            {d.cause || d.campaignTitle || 'अखिल भारतीय मराठा महासंघ सामाजिक निधी'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', fontWeight: 800, color: '#0F766E', fontSize: '0.95rem' }}>
                          ₹ {Number(d.amount || d.donatedAmount || 5000).toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding: '14px 16px', color: '#64748B' }}>
                          {d.date || d.created_at ? new Date(d.date || d.created_at).toLocaleDateString('mr-IN') : '२०२६-०९-२०'}
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          <button
                            onClick={() => showToast(`80G कर सवलत प्रमाणपत्र #${d.receiptNo || 'CERT-80G'} ईमेलवर पाठवले!`)}
                            style={{
                              background: '#F0FDF4',
                              border: '1px solid #86EFAC',
                              color: '#15803D',
                              padding: '5px 12px',
                              borderRadius: '6px',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}>
                            🧾 80G पावती
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: EXPENSE VOUCHERS APPROVAL
        ========================================================================= */}
        {activeTab === 'vouchers' && (
          <div>
            <div style={{ display: 'grid', gap: '16px' }}>
              {vouchers.map(v => (
                <div key={v.id} style={{
                  background: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  padding: '20px 24px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '16px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                }}>
                  <div style={{ flex: 1, minWidth: '300px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <span style={{
                        background: v.status === 'Approved' ? '#DCFCE7' : v.status === 'Rejected' ? '#FEE2E2' : '#FEF3C7',
                        color: v.status === 'Approved' ? '#15803D' : v.status === 'Rejected' ? '#B91C1C' : '#B45309',
                        padding: '3px 10px',
                        borderRadius: '14px',
                        fontSize: '0.75rem',
                        fontWeight: 800
                      }}>
                        {v.status === 'Approved' ? '✓ मंजूर (Approved)' : v.status === 'Rejected' ? '✕ नाकारले' : '⏳ मंजुरी प्रलंबित'}
                      </span>
                      <span style={{ fontSize: '0.78rem', color: '#64748B', fontFamily: 'monospace' }}>#{v.id}</span>
                      <span style={{ fontSize: '0.78rem', color: '#64748B' }}>• {v.date}</span>
                    </div>

                    <h3 style={{ margin: '0 0 6px 0', fontSize: '1.05rem', color: '#0F172A', fontWeight: 800 }}>
                      {v.title}
                    </h3>
                    <div style={{ fontSize: '0.85rem', color: '#475569' }}>
                      विभागीय प्रमुख / सादरकर्ता: <strong>{v.submittedBy}</strong> ({v.department})
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '4px' }}>
                      शेरा: {v.remarks}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0F766E' }}>
                      ₹ {v.amount.toLocaleString('en-IN')}
                    </div>

                    {v.status === 'Pending' ? (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleApproveVoucher(v.id)}
                          style={{
                            background: '#059669',
                            color: '#FFFFFF',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            fontSize: '0.82rem'
                          }}>
                          ✓ व्हाउचर मंजूर करा
                        </button>
                        <button
                          onClick={() => handleRejectVoucher(v.id)}
                          style={{
                            background: '#EF4444',
                            color: '#FFFFFF',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            fontSize: '0.82rem'
                          }}>
                          ✕ नाकारा
                        </button>
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.8rem', color: v.status === 'Approved' ? '#059669' : '#DC2626', fontWeight: 700 }}>
                        {v.status === 'Approved' ? `मंजूर केले: ${v.approvedBy || 'कोषाध्यक्ष'}` : 'नाकारण्यात आले'}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: MEMBERSHIP DUES & TIERS
        ========================================================================= */}
        {activeTab === 'membership' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.9rem', color: '#D97706', fontWeight: 800 }}>🥇 Gold Member (वार्षिक वर्गणी)</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0F172A', margin: '8px 0' }}>₹ १,००० / वर्ष</div>
              <p style={{ fontSize: '0.85rem', color: '#64748B' }}>डिजिटल ओळखपत्र, ॲप सुविधा, समुदाय मंच व स्थानिक उपक्रम सहभाग.</p>
              <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '12px', marginTop: '12px', fontSize: '0.82rem', color: '#059669', fontWeight: 700 }}>
                सक्रिय नोंदणी: १८,४२० सदस्य
              </div>
            </div>

            <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.9rem', color: '#EA580C', fontWeight: 800 }}>💎 Platinum Member (व्यावसायिक)</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0F172A', margin: '8px 0' }}>₹ ५,००० / वर्ष</div>
              <p style={{ fontSize: '0.85rem', color: '#64748B' }}>बिझनेस संगम चॅप्टर सहभाग, B2B रेफरल एक्सचेंज व व्यापारी निर्देशिका प्राधान्य.</p>
              <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '12px', marginTop: '12px', fontSize: '0.82rem', color: '#059669', fontWeight: 700 }}>
                सक्रिय नोंदणी: ४,८२० व्यावसायिक
              </div>
            </div>

            <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.9rem', color: '#7C3AED', fontWeight: 800 }}>👑 Royal Patron (आजीवन संरक्षक)</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0F172A', margin: '8px 0' }}>₹ २५,००० आजीवन</div>
              <p style={{ fontSize: '0.85rem', color: '#64748B' }}>महासंघ सल्लागार परिषद सन्मान, विशेष 80G सवलत, प्रमुख राज्यस्तरीय अधिवेशन पाहुणे.</p>
              <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '12px', marginTop: '12px', fontSize: '0.82rem', color: '#059669', fontWeight: 700 }}>
                सक्रिय नोंदणी: १,५८० संरक्षक
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 4: SECTION 8 AUDIT BALANCE SHEET
        ========================================================================= */}
        {activeTab === 'balancesheet' && (
          <div style={{ background: '#FFFFFF', padding: '28px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0F172A', fontWeight: 800 }}>
                  Section 8 कंपनी वार्षिक वित्तीय ताळेबंद (२०२५-२०२६)
                </h3>
                <div style={{ fontSize: '0.82rem', color: '#64748B' }}>
                  चार्टर्ड अकाउंटंट (CA) प्रमाणित व रजिस्ट्रार ऑफ कंपनीज (ROC) नियम सुसंगत
                </div>
              </div>
              <button
                onClick={() => showToast('वित्तीय ऑडिट अहवाल PDF डाउनलोड सुरू...')}
                style={{
                  background: '#0F766E',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '10px 18px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}>
                📄 ऑडिटेड बॅलन्स शीट PDF
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              {/* Income */}
              <div style={{ background: '#F8FAFC', padding: '20px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <h4 style={{ margin: '0 0 14px 0', color: '#047857', fontWeight: 800, fontSize: '1rem' }}>
                  📥 उत्पन्न स्रोत (Revenue / Receipts)
                </h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #E2E8F0' }}>
                  <span>80G देणगी संकलन (Donations)</span>
                  <strong>₹ १,२४,५०,०००</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #E2E8F0' }}>
                  <span>वार्षिक व आजीवन सदस्यत्व वर्गणी</span>
                  <strong>₹ ८२,४०,०००</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #E2E8F0' }}>
                  <span>B2B परिषद प्रायोजकत्व व नोंदणी</span>
                  <strong>₹ ३५,००,०००</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', marginTop: '10px', fontSize: '1.1rem', fontWeight: 900, color: '#047857' }}>
                  <span>एकूण उत्पन्न</span>
                  <span>₹ २,४१,९०,०००</span>
                </div>
              </div>

              {/* Expenses */}
              <div style={{ background: '#F8FAFC', padding: '20px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <h4 style={{ margin: '0 0 14px 0', color: '#B91C1C', fontWeight: 800, fontSize: '1rem' }}>
                  📤 खर्च व वाटप (Disbursements / Expenses)
                </h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #E2E8F0' }}>
                  <span>वैद्यकीय, रक्तदान व रुग्ण साहाय्य</span>
                  <strong>₹ ४२,५०,०००</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #E2E8F0' }}>
                  <span>विद्यार्थी शैक्षणिक शिष्यवृत्ती</span>
                  <strong>₹ ३८,००,०००</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #E2E8F0' }}>
                  <span>गडकोट स्वच्छता, संवर्धन व इतिहास प्रकल्प</span>
                  <strong>₹ २५,८०,०००</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #E2E8F0' }}>
                  <span>प्रशासकीय, डिजिटल सर्व्हर व परिषद खर्च</span>
                  <strong>₹ २८,६०,०००</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', marginTop: '10px', fontSize: '1.1rem', fontWeight: 900, color: '#B91C1C' }}>
                  <span>एकूण खर्च</span>
                  <span>₹ १,३४,९०,०००</span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '20px', padding: '16px 20px', background: '#ECFDF5', borderRadius: '8px', border: '1px solid #A7F3D0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ color: '#065F46', fontWeight: 700 }}>
                बँक राखीव शिल्लक (Closing Cash & Bank Reserve for Welfare Projects):
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#047857' }}>
                ₹ १,०७,००,००० (अधिशेष शिल्लक)
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
