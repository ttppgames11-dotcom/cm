/**
 * Connect Maratha — Admin CRM / ERP Console (cm-admin.html)
 * 100% Vanilla JS. Reads/writes exclusively through CMDB (assets/js/cm-data.js)
 * so every change here is instantly visible on the member-facing pages too.
 */
(function () {
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  function sanitizeHTML(html) {
    if (typeof html !== 'string') return '';
    return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
               .replace(/\s*on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');
  }

  function setHTML(target, html) {
    const el = typeof target === 'string' ? document.getElementById(target) : target;
    if (!el) return;
    if (html === '' || html == null) {
      el.textContent = '';
      return;
    }
    try {
      const doc = new DOMParser().parseFromString(sanitizeHTML(html), 'text/html');
      el.replaceChildren(...Array.from(doc.body.childNodes));
    } catch (e) {
      el.textContent = '';
    }
  }

  function toast(msg, type) {
    if (typeof showToast === 'function') showToast(msg, type || 'success');
  }

  function inr(n) {
    return '₹' + (Number(n) || 0).toLocaleString('en-IN');
  }

  let adminRoleMode = 'super-admin';

  const STORAGE_KEYS = {
    heritageCms: 'connectmaratha_heritage_cms',
    marketingSegments: 'connectmaratha_marketing_segments',
    marketingCampaigns: 'connectmaratha_marketing_campaigns',
    bloodRequests: 'connectmaratha_blood_requests',
    volunteerImpact: 'connectmaratha_volunteer_impact'
  };

  function readJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function writeJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function csvEscape(value) {
    const s = String(value == null ? '' : value);
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }

  function downloadCsv(filename, rows) {
    const csv = rows.map(row => row.map(csvEscape).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function roleViewAccess(role, view) {
    const financeOnly = ['subscriptions', 'funds', 'donations', 'finance', 'income', 'expenses', 'commissions', 'approvals', 'analytics', 'saved-filters'];
    const auditOnly = ['audit'];
    if (role === 'super-admin') return true;
    if (role === 'finance-admin') return financeOnly.includes(view) || view === 'dashboard' || view === 'member-intelligence' || auditOnly.includes(view);
    if (role === 'finance-head') return financeOnly.includes(view) || view === 'dashboard' || view === 'member-intelligence' || auditOnly.includes(view) || view === 'reports';
    if (role === 'audit-officer') return financeOnly.includes(view) || auditOnly.includes(view) || view === 'member-intelligence' || view === 'dashboard';
    if (role === 'business-admin') return ['dashboard', 'businesses', 'chapters', 'opportunities', 'meetings', 'applications', 'members', 'member-intelligence'].includes(view);
    return true;
  }

  function applyRoleMode() {
    document.querySelectorAll('.admin-nav-item[data-view]').forEach(a => {
      const allowed = roleViewAccess(adminRoleMode, a.dataset.view);
      a.style.display = allowed ? '' : 'none';
    });
  }

  function renderRoleSummary() {
    const root = document.getElementById('adminRoleSummary');
    if (!root) return;
    const labels = {
      'super-admin': 'Super Admin',
      'finance-admin': 'Finance Admin',
      'finance-head': 'Finance Head',
      'audit-officer': 'Audit Officer',
      'business-admin': 'Business Admin'
    };
    setHTML(root, `<h3 style="margin-bottom:8px;">Current Demo Role: ${esc(labels[adminRoleMode] || adminRoleMode)}</h3><div class="muted">Role-based visibility is simulated in this static CRM demo. Sensitive finance/funds views are emphasized for finance roles and restricted for non-finance modes.</div>`);
  }

  // -----------------------------------------------------------------------
  // View switching
  // -----------------------------------------------------------------------
  const VIEWS = ['dashboard', 'members', 'groups', 'businesses', 'chapters', 'opportunities', 'meetings', 'applications', 'leads', 'followups', 'service-enquiries', 'service-bookings', 'seva', 'volunteers', 'heritage-cms', 'marketing-crm', 'blood-connect', 'subscriptions', 'campaigns', 'receipts', 'funds', 'donations', 'finance', 'income', 'expenses', 'commissions', 'approvals', 'events', 'member-intelligence', 'analytics', 'saved-filters', 'reports', 'audit'];

  function showView(name) {
    if (!VIEWS.includes(name)) name = 'dashboard';
    VIEWS.forEach(v => {
      const el = document.getElementById('view-' + v);
      if (el) el.classList.toggle('active', v === name);
    });
    document.querySelectorAll('.admin-nav-item[data-view]').forEach(a => {
      a.classList.toggle('active', a.dataset.view === name);
    });
    renderView(name);
  }

  function currentViewFromHash() {
    const h = (window.location.hash || '#dashboard').replace('#', '');
    return VIEWS.includes(h) ? h : 'dashboard';
  }

  function renderView(name) {
    switch (name) {
      case 'dashboard': renderDashboard(); break;
      case 'members': renderMembers(); break;
      case 'groups': renderGroups(); break;
      case 'businesses': renderBusinesses(); break;
      case 'chapters': renderChapters(); break;
      case 'opportunities': renderOpportunities(); break;
      case 'meetings': renderMeetings(); break;
      case 'applications': renderApplications(); break;
      case 'leads': renderLeads(); break;
      case 'followups': renderFollowups(); break;
      case 'service-enquiries': renderServiceEnquiries(); break;
      case 'service-bookings': renderServiceBookings(); break;
      case 'seva': renderSeva(); break;
      case 'volunteers': renderVolunteers(); break;
      case 'heritage-cms': renderHeritageCms(); break;
      case 'marketing-crm': renderMarketingCrm(); break;
      case 'blood-connect': renderBloodConnect(); break;
      case 'subscriptions': renderSubscriptions(); break;
      case 'campaigns': renderCampaigns(); break;
      case 'receipts': renderReceipts(); break;
      case 'funds': renderFunds(); break;
      case 'donations': renderDonations(); break;
      case 'finance': renderFinance(); break;
      case 'income': renderIncome(); break;
      case 'expenses': renderExpenses(); break;
      case 'commissions': renderCommissions(); break;
      case 'approvals': renderApprovals(); break;
      case 'events': renderEvents(); break;
      case 'member-intelligence': renderMemberIntelligence(); break;
      case 'analytics': renderAnalytics(); break;
      case 'saved-filters': renderSavedFilters(); break;
      case 'reports': renderReports(); break;
      case 'audit': renderAudit(); break;
    }
  }

  // -----------------------------------------------------------------------
  // Dashboard
  // -----------------------------------------------------------------------
  function renderDashboard() {
    const s = CMDB.adminStats();
    const tiles = [
      ['एकूण सदस्य', s.totalMembers],
      ['Verified सदस्य', s.verifiedMembers],
      ['व्यवसाय', s.businesses],
      ['Verified व्यवसाय', s.verifiedBusinesses],
      ['Open Leads', s.openLeads],
      ['Open Seva Requests', s.openSeva],
      ['Pending Reports', s.pendingReports],
      ['एकूण देणगी', inr(s.totalDonations)],
      ['आगामी Events', s.upcomingEvents],
      ['व्यवसाय संधी (Open)', s.openOpportunities],
      ['व्यवसाय मंडळे', s.chapters],
      ['1-to-1 भेटी', s.oneToOnes],
      ['Membership अर्ज', s.businessApplications],
      ['Service Enquiries', s.serviceEnquiries],
      ['Service Bookings', s.serviceRequests],
      ['Volunteers', s.volunteers],
      ['Transactions', s.transactionCount],
      ['Fund Accounts', s.fundAccounts],
      ['Month Net Revenue', inr(s.monthlyNetRevenue)],
      ['Month Expenses', inr(s.monthlyExpenses)],
      ['Pending Settlements', s.pendingSettlements],
      ['Groups', s.groups]
    ];
    setHTML('dashStats', tiles.map(([l, n]) =>
      `<div class="stat-tile clickable" data-dash-drill="${esc(l)}"><div class="n">${esc(n)}</div><div class="l">${esc(l)}</div></div>`
    ).join(''));
    renderRoleSummary();
    document.querySelectorAll('[data-dash-drill]').forEach(tile => {
      tile.addEventListener('click', () => {
        const label = tile.dataset.dashDrill;
        if (label.includes('सदस्य')) window.location.hash = 'members';
        else if (label.includes('व्यवसाय')) window.location.hash = 'businesses';
        else if (label.includes('Leads')) window.location.hash = 'leads';
        else if (label.includes('Seva')) window.location.hash = 'seva';
        else if (label.includes('देणगी') || label.includes('Fund') || label.includes('Transactions') || label.includes('Revenue') || label.includes('Expenses') || label.includes('Settlements')) window.location.hash = 'finance';
        else if (label.includes('Events')) window.location.hash = 'events';
        else if (label.includes('1-to-1')) window.location.hash = 'meetings';
        else if (label.includes('Opportunities') || label.includes('संधी')) window.location.hash = 'opportunities';
        else if (label.includes('Groups')) window.location.hash = 'groups';
      });
    });
  }

  function renderHeritageCms() {
    const defaultItems = [
      { id: 'heritage-1', title: 'शिवाजी महाराज – राजकीय व सामाजिक चित्रण', type: 'Figure profile', author: 'Dr. Anirudha Kulkarni', updated: '2026-09-08', review: 'Approved', sources: 14 },
      { id: 'heritage-2', title: 'रायगड किल्ल्यांची स्थापत्यवादी माहिती', type: 'Fort article', author: 'Sanket Patil', updated: '2026-09-07', review: 'Pending review', sources: 8 },
      { id: 'heritage-3', title: 'महाराष्ट्रातील गड-तटबंदी कालरेखा', type: 'Timeline', author: 'Priya Nimbalkar', updated: '2026-09-05', review: 'Needs source check', sources: 6 },
      { id: 'heritage-4', title: 'मराठा वीरांगनांची योगदान', type: 'Gallery', author: 'Vandana Mane', updated: '2026-09-03', review: 'Draft', sources: 3 }
    ];
    const rows = readJson(STORAGE_KEYS.heritageCms, defaultItems);
    const stats = [
      ['Published pages', rows.length],
      ['Pending reviews', rows.filter(item => item.review === 'Pending review' || item.review === 'Needs source check').length],
      ['Source checks', rows.reduce((sum, item) => sum + Number(item.sources || 0), 0)],
      ['Editors online', 4],
      ['Fort articles', rows.filter(item => item.type === 'Fort article').length],
      ['Updated this week', rows.filter(item => !item.updated || item.updated >= '2026-09-01').length]
    ];
    setHTML('heritageCmsStats', stats.map(([label, value]) => `
      <div class="stat-tile"><div class="n">${esc(value)}</div><div class="l">${esc(label)}</div></div>
    `).join(''));

    setHTML('heritageCmsTbody', rows.map(row => `
      <tr>
        <td>${esc(row.title)}</td>
        <td>${esc(row.type)}</td>
        <td>${esc(row.author)}</td>
        <td>${esc(row.updated)}</td>
        <td><span class="admin-badge ${row.review === 'Approved' ? 'ok' : row.review === 'Pending review' ? 'warn' : 'danger'}">${esc(row.review)}</span></td>
        <td>${esc(row.sources)}</td>
        <td>
          <div style="display:flex; gap:6px; flex-wrap:wrap;">
            <button type="button" class="btn btn-outline mini-btn" data-heritage-edit="${esc(row.id)}">Edit</button>
            <button type="button" class="btn btn-outline mini-btn" style="color:var(--danger); border-color:var(--danger);" data-heritage-delete="${esc(row.id)}">Delete</button>
          </div>
        </td>
      </tr>
    `).join(''));

    document.querySelectorAll('[data-heritage-edit]').forEach(btn => {
      btn.addEventListener('click', () => openHeritageEditor(btn.dataset.heritageEdit));
    });
    document.querySelectorAll('[data-heritage-delete]').forEach(btn => {
      btn.addEventListener('click', () => {
        const next = rows.filter(item => item.id !== btn.dataset.heritageDelete);
        writeJson(STORAGE_KEYS.heritageCms, next);
        renderHeritageCms();
        toast('Heritage item deleted.', 'info');
      });
    });

    document.getElementById('addHeritageCmsBtn').onclick = () => openHeritageEditor();
  }

  function openHeritageEditor(id = null) {
    const rows = readJson(STORAGE_KEYS.heritageCms, []);
    const item = rows.find(entry => entry.id === id) || { id: `heritage-${Date.now()}`, title: '', type: 'Fort article', author: '', updated: new Date().toISOString().slice(0, 10), review: 'Draft', sources: 0 };
    const panel = document.getElementById('heritageCmsEditor');
    setHTML(panel, `
      <div class="admin-panel" style="margin-bottom:16px;">
        <h3 style="margin-bottom:12px;">${id ? '✏️ Edit Heritage Item' : '➕ New Heritage Item'}</h3>
        <form id="heritageCmsForm" class="admin-form-grid">
          <div><label>Title</label><input name="title" value="${esc(item.title)}" required></div>
          <div><label>Type</label><select name="type"><option ${item.type === 'Figure profile' ? 'selected' : ''}>Figure profile</option><option ${item.type === 'Fort article' ? 'selected' : ''}>Fort article</option><option ${item.type === 'Timeline' ? 'selected' : ''}>Timeline</option><option ${item.type === 'Gallery' ? 'selected' : ''}>Gallery</option></select></div>
          <div><label>Author</label><input name="author" value="${esc(item.author)}"></div>
          <div><label>Updated</label><input type="date" name="updated" value="${esc(item.updated || new Date().toISOString().slice(0, 10))}"></div>
          <div><label>Review</label><select name="review"><option ${item.review === 'Draft' ? 'selected' : ''}>Draft</option><option ${item.review === 'Pending review' ? 'selected' : ''}>Pending review</option><option ${item.review === 'Approved' ? 'selected' : ''}>Approved</option><option ${item.review === 'Needs source check' ? 'selected' : ''}>Needs source check</option></select></div>
          <div><label>Sources</label><input type="number" name="sources" value="${esc(item.sources || 0)}"></div>
          <div style="align-self:end;"><button type="submit" class="btn btn-primary" style="width:100%;">Save</button></div>
          <div style="align-self:end;"><button type="button" class="btn btn-outline" id="cancelHeritageCms" style="width:100%;">Cancel</button></div>
        </form>
      </div>
    `);
    const form = document.getElementById('heritageCmsForm');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const nextItem = {
        id: item.id,
        title: String(fd.get('title') || '').trim(),
        type: String(fd.get('type') || 'Fort article'),
        author: String(fd.get('author') || '').trim(),
        updated: String(fd.get('updated') || new Date().toISOString().slice(0, 10)),
        review: String(fd.get('review') || 'Draft'),
        sources: Number(fd.get('sources') || 0)
      };
      const nextRows = id ? rows.map(entry => entry.id === id ? nextItem : entry) : [nextItem, ...rows];
      writeJson(STORAGE_KEYS.heritageCms, nextRows);
      setHTML(panel, '');
      renderHeritageCms();
      toast('Heritage item saved.', 'success');
    });
    document.getElementById('cancelHeritageCms').addEventListener('click', () => { setHTML(panel, ''); });
  }

  function renderMarketingCrm() {
    const defaultSegments = [
      { id: 'segment-1', segment: 'Founders & Professionals', members: '42,800', engagement: 'High', channel: 'LinkedIn + WhatsApp', priority: 'High', conversion: '18.4%' },
      { id: 'segment-2', segment: 'Youth & Students', members: '65,100', engagement: 'Very high', channel: 'Instagram + SMS', priority: 'High', conversion: '14.9%' },
      { id: 'segment-3', segment: 'Business owners', members: '28,400', engagement: 'High', channel: 'Referral + outreach', priority: 'High', conversion: '21.6%' }
    ];
    const defaultCampaigns = [
      { id: 'camp-1', campaign: 'Shivaji Vision Series', reach: '1,20,000', clicks: '18,200', leads: '2,480', ctr: '15.1%', status: 'Live' },
      { id: 'camp-2', campaign: 'Fort Restoration Drive', reach: '86,000', clicks: '11,400', leads: '1,120', ctr: '13.2%', status: 'Scaling' },
      { id: 'camp-3', campaign: 'Business Connect Week', reach: '73,000', clicks: '9,500', leads: '860', ctr: '13.0%', status: 'Optimizing' }
    ];
    const segments = readJson(STORAGE_KEYS.marketingSegments, defaultSegments);
    const campaigns = readJson(STORAGE_KEYS.marketingCampaigns, defaultCampaigns);

    const stats = [
      ['Audience reach', `${segments.reduce((sum, item) => sum + Number(String(item.members).replace(/,/g, '')), 0).toLocaleString('en-IN')} `],
      ['Active segments', segments.length],
      ['Qualified leads', campaigns.reduce((sum, item) => sum + Number(String(item.leads).replace(/,/g, '')), 0)],
      ['Avg CTR', '4.8%'],
      ['Campaign ROAS', '3.9x'],
      ['Conversion rate', '11.2%']
    ];
    setHTML('marketingCrmStats', stats.map(([label, value]) => `
      <div class="stat-tile"><div class="n">${esc(value)}</div><div class="l">${esc(label)}</div></div>
    `).join(''));

    setHTML('marketingSegmentsTbody', segments.map(item => `
      <tr>
        <td>${esc(item.segment)}</td>
        <td>${esc(item.members)}</td>
        <td>${esc(item.engagement)}</td>
        <td>${esc(item.channel)}</td>
        <td><span class="admin-badge ${item.priority === 'Critical' ? 'danger' : 'warn'}">${esc(item.priority)}</span></td>
        <td>${esc(item.conversion)}</td>
        <td>
          <div style="display:flex; gap:6px; flex-wrap:wrap;">
            <button type="button" class="btn btn-outline mini-btn" data-segment-edit="${esc(item.id)}">Edit</button>
            <button type="button" class="btn btn-outline mini-btn" style="color:var(--danger); border-color:var(--danger);" data-segment-delete="${esc(item.id)}">Delete</button>
          </div>
        </td>
      </tr>
    `).join(''));

    document.querySelectorAll('[data-segment-edit]').forEach(btn => btn.addEventListener('click', () => openMarketingSegmentEditor(btn.dataset.segmentEdit)));
    document.querySelectorAll('[data-segment-delete]').forEach(btn => btn.addEventListener('click', () => {
      const next = segments.filter(item => item.id !== btn.dataset.segmentDelete);
      writeJson(STORAGE_KEYS.marketingSegments, next);
      renderMarketingCrm();
      toast('Segment deleted.', 'info');
    }));
    document.getElementById('addMarketingSegmentBtn').onclick = () => openMarketingSegmentEditor();
    if (document.getElementById('addMarketingSegmentBtnSecondary')) document.getElementById('addMarketingSegmentBtnSecondary').onclick = () => openMarketingSegmentEditor();
    if (document.getElementById('addMarketingCampaignBtn')) document.getElementById('addMarketingCampaignBtn').onclick = () => openMarketingCampaignEditor();

    setHTML('marketingCampaignsTbody', campaigns.map(item => `
      <tr>
        <td>${esc(item.campaign)}</td>
        <td>${esc(item.reach)}</td>
        <td>${esc(item.clicks)}</td>
        <td>${esc(item.leads)}</td>
        <td>${esc(item.ctr)}</td>
        <td><span class="admin-badge ok">${esc(item.status)}</span></td>
        <td>
          <div style="display:flex; gap:6px; flex-wrap:wrap;">
            <button type="button" class="btn btn-outline mini-btn" data-campaign-edit="${esc(item.id)}">Edit</button>
            <button type="button" class="btn btn-outline mini-btn" style="color:var(--danger); border-color:var(--danger);" data-campaign-delete="${esc(item.id)}">Delete</button>
          </div>
        </td>
      </tr>
    `).join(''));

    document.querySelectorAll('[data-campaign-edit]').forEach(btn => btn.addEventListener('click', () => openMarketingCampaignEditor(btn.dataset.campaignEdit)));
    document.querySelectorAll('[data-campaign-delete]').forEach(btn => btn.addEventListener('click', () => {
      const next = campaigns.filter(item => item.id !== btn.dataset.campaignDelete);
      writeJson(STORAGE_KEYS.marketingCampaigns, next);
      renderMarketingCrm();
      toast('Campaign deleted.', 'info');
    }));
  }

  function openMarketingSegmentEditor(id = null) {
    const rows = readJson(STORAGE_KEYS.marketingSegments, []);
    const item = rows.find(entry => entry.id === id) || { id: `segment-${Date.now()}`, segment: '', members: '0', engagement: 'Medium', channel: '', priority: 'Medium', conversion: '0%' };
    const panel = document.getElementById('marketingEditor');
    setHTML(panel, `
      <div class="admin-panel" style="margin-bottom:16px;">
        <h3 style="margin-bottom:12px;">${id ? '✏️ Edit Segment' : '➕ New Segment'}</h3>
        <form id="marketingSegmentForm" class="admin-form-grid">
          <div><label>Segment</label><input name="segment" value="${esc(item.segment)}" required></div>
          <div><label>Members</label><input name="members" value="${esc(item.members)}"></div>
          <div><label>Engagement</label><input name="engagement" value="${esc(item.engagement)}"></div>
          <div><label>Primary channel</label><input name="channel" value="${esc(item.channel)}"></div>
          <div><label>Priority</label><select name="priority"><option ${item.priority === 'High' ? 'selected' : ''}>High</option><option ${item.priority === 'Medium' ? 'selected' : ''}>Medium</option><option ${item.priority === 'Critical' ? 'selected' : ''}>Critical</option></select></div>
          <div><label>Conversion</label><input name="conversion" value="${esc(item.conversion)}"></div>
          <div style="align-self:end;"><button type="submit" class="btn btn-primary" style="width:100%;">Save</button></div>
          <div style="align-self:end;"><button type="button" class="btn btn-outline" id="cancelMarketingSegment" style="width:100%;">Cancel</button></div>
        </form>
      </div>
    `);
    const form = document.getElementById('marketingSegmentForm');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const nextItem = {
        id: item.id,
        segment: String(fd.get('segment') || '').trim(),
        members: String(fd.get('members') || '0'),
        engagement: String(fd.get('engagement') || 'Medium'),
        channel: String(fd.get('channel') || ''),
        priority: String(fd.get('priority') || 'Medium'),
        conversion: String(fd.get('conversion') || '0%')
      };
      const nextRows = id ? rows.map(entry => entry.id === id ? nextItem : entry) : [nextItem, ...rows];
      writeJson(STORAGE_KEYS.marketingSegments, nextRows);
      setHTML(panel, '');
      renderMarketingCrm();
      toast('Marketing segment saved.', 'success');
    });
    document.getElementById('cancelMarketingSegment').addEventListener('click', () => setHTML(panel, ''));
  }

  function openMarketingCampaignEditor(id = null) {
    const rows = readJson(STORAGE_KEYS.marketingCampaigns, []);
    const item = rows.find(entry => entry.id === id) || { id: `camp-${Date.now()}`, campaign: '', reach: '0', clicks: '0', leads: '0', ctr: '0%', status: 'Live' };
    const panel = document.getElementById('marketingEditor');
    setHTML(panel, `
      <div class="admin-panel" style="margin-bottom:16px;">
        <h3 style="margin-bottom:12px;">${id ? '✏️ Edit Campaign' : '➕ New Campaign'}</h3>
        <form id="marketingCampaignForm" class="admin-form-grid">
          <div><label>Campaign</label><input name="campaign" value="${esc(item.campaign)}" required></div>
          <div><label>Reach</label><input name="reach" value="${esc(item.reach)}"></div>
          <div><label>Clicks</label><input name="clicks" value="${esc(item.clicks)}"></div>
          <div><label>Leads</label><input name="leads" value="${esc(item.leads)}"></div>
          <div><label>CTR</label><input name="ctr" value="${esc(item.ctr)}"></div>
          <div><label>Status</label><select name="status"><option ${item.status === 'Live' ? 'selected' : ''}>Live</option><option ${item.status === 'Scaling' ? 'selected' : ''}>Scaling</option><option ${item.status === 'Optimizing' ? 'selected' : ''}>Optimizing</option></select></div>
          <div style="align-self:end;"><button type="submit" class="btn btn-primary" style="width:100%;">Save</button></div>
          <div style="align-self:end;"><button type="button" class="btn btn-outline" id="cancelMarketingCampaign" style="width:100%;">Cancel</button></div>
        </form>
      </div>
    `);
    const form = document.getElementById('marketingCampaignForm');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const nextItem = {
        id: item.id,
        campaign: String(fd.get('campaign') || '').trim(),
        reach: String(fd.get('reach') || '0'),
        clicks: String(fd.get('clicks') || '0'),
        leads: String(fd.get('leads') || '0'),
        ctr: String(fd.get('ctr') || '0%'),
        status: String(fd.get('status') || 'Live')
      };
      const nextRows = id ? rows.map(entry => entry.id === id ? nextItem : entry) : [nextItem, ...rows];
      writeJson(STORAGE_KEYS.marketingCampaigns, nextRows);
      setHTML(panel, '');
      renderMarketingCrm();
      toast('Campaign saved.', 'success');
    });
    document.getElementById('cancelMarketingCampaign').addEventListener('click', () => setHTML(panel, ''));
  }

  function renderBloodConnect() {
    const defaultRequests = [
      { id: 'blood-1', request: 'Pune trauma case', district: 'Pune', blood: 'O+', deadline: 'Today, 18:30', volunteers: 12, status: 'Responding' },
      { id: 'blood-2', request: 'Emergency surgery support', district: 'Nashik', blood: 'B+', deadline: 'Today, 21:00', volunteers: 8, status: 'Matched' },
      { id: 'blood-3', request: 'Child cancer transfusion', district: 'Mumbai', blood: 'A-', deadline: 'Tomorrow, 08:00', volunteers: 14, status: 'Pending' }
    ];
    const defaultVolunteerImpact = [
      { id: 'impact-1', volunteer: 'Rohit Kulkarni', city: 'Pune', hours: '42h', campaigns: 6, donations: 14, score: 94 },
      { id: 'impact-2', volunteer: 'Sakshi Jadhav', city: 'Nashik', hours: '36h', campaigns: 5, donations: 9, score: 89 },
      { id: 'impact-3', volunteer: 'Mangesh Pawar', city: 'Mumbai', hours: '31h', campaigns: 4, donations: 12, score: 83 }
    ];
    const requests = readJson(STORAGE_KEYS.bloodRequests, defaultRequests);
    const impact = readJson(STORAGE_KEYS.volunteerImpact, defaultVolunteerImpact);

    const stats = [
      ['Active donors', 820],
      ['Emergency requests', requests.length],
      ['Units matched', requests.filter(item => item.status === 'Matched' || item.status === 'Volunteer ready').length * 18],
      ['Volunteer hours', `${impact.reduce((sum, item) => sum + Number(String(item.hours).replace(/h/g, '')), 0)}h`],
      ['Critical matches', requests.filter(item => item.status === 'Matched').length + 1],
      ['Districts covered', new Set(requests.map(item => item.district)).size]
    ];
    setHTML('bloodConnectStats', stats.map(([label, value]) => `
      <div class="stat-tile"><div class="n">${esc(value)}</div><div class="l">${esc(label)}</div></div>
    `).join(''));

    setHTML('bloodRequestsTbody', requests.map(item => `
      <tr>
        <td>${esc(item.request)}</td>
        <td>${esc(item.district)}</td>
        <td>${esc(item.blood)}</td>
        <td>${esc(item.deadline)}</td>
        <td>${esc(item.volunteers)}</td>
        <td><span class="admin-badge ${item.status === 'Matched' || item.status === 'Volunteer ready' ? 'ok' : item.status === 'Pending' ? 'warn' : 'danger'}">${esc(item.status)}</span></td>
        <td>
          <div style="display:flex; gap:6px; flex-wrap:wrap;">
            <button type="button" class="btn btn-outline mini-btn" data-blood-edit="${esc(item.id)}">Edit</button>
            <button type="button" class="btn btn-outline mini-btn" style="color:var(--danger); border-color:var(--danger);" data-blood-delete="${esc(item.id)}">Delete</button>
          </div>
        </td>
      </tr>
    `).join(''));

    document.querySelectorAll('[data-blood-edit]').forEach(btn => btn.addEventListener('click', () => openBloodRequestEditor(btn.dataset.bloodEdit)));
    document.querySelectorAll('[data-blood-delete]').forEach(btn => btn.addEventListener('click', () => {
      const next = requests.filter(item => item.id !== btn.dataset.bloodDelete);
      writeJson(STORAGE_KEYS.bloodRequests, next);
      renderBloodConnect();
      toast('Blood request deleted.', 'info');
    }));
    document.getElementById('addBloodRequestBtn').onclick = () => openBloodRequestEditor();
    if (document.getElementById('addBloodRequestBtnSecondary')) document.getElementById('addBloodRequestBtnSecondary').onclick = () => openBloodRequestEditor();
    if (document.getElementById('addVolunteerImpactBtn')) document.getElementById('addVolunteerImpactBtn').onclick = () => openVolunteerImpactEditor();

    setHTML('volunteerImpactTbody', impact.map(item => `
      <tr>
        <td>${esc(item.volunteer)}</td>
        <td>${esc(item.city)}</td>
        <td>${esc(item.hours)}</td>
        <td>${esc(item.campaigns)}</td>
        <td>${esc(item.donations)}</td>
        <td>${esc(item.score)}/100</td>
        <td>
          <div style="display:flex; gap:6px; flex-wrap:wrap;">
            <button type="button" class="btn btn-outline mini-btn" data-impact-edit="${esc(item.id)}">Edit</button>
            <button type="button" class="btn btn-outline mini-btn" style="color:var(--danger); border-color:var(--danger);" data-impact-delete="${esc(item.id)}">Delete</button>
          </div>
        </td>
      </tr>
    `).join(''));
    document.querySelectorAll('[data-impact-edit]').forEach(btn => btn.addEventListener('click', () => openVolunteerImpactEditor(btn.dataset.impactEdit)));
    document.querySelectorAll('[data-impact-delete]').forEach(btn => btn.addEventListener('click', () => {
      const next = impact.filter(item => item.id !== btn.dataset.impactDelete);
      writeJson(STORAGE_KEYS.volunteerImpact, next);
      renderBloodConnect();
      toast('Volunteer impact entry deleted.', 'info');
    }));
  }

  function openBloodRequestEditor(id = null) {
    const rows = readJson(STORAGE_KEYS.bloodRequests, []);
    const item = rows.find(entry => entry.id === id) || { id: `blood-${Date.now()}`, request: '', district: '', blood: 'O+', deadline: '', volunteers: 0, status: 'Pending' };
    const panel = document.getElementById('bloodEditor');
    setHTML(panel, `
      <div class="admin-panel" style="margin-bottom:16px;">
        <h3 style="margin-bottom:12px;">${id ? '✏️ Edit Blood Request' : '➕ New Blood Request'}</h3>
        <form id="bloodRequestForm" class="admin-form-grid">
          <div><label>Request</label><input name="request" value="${esc(item.request)}" required></div>
          <div><label>District</label><input name="district" value="${esc(item.district)}"></div>
          <div><label>Blood group</label><select name="blood"><option ${item.blood === 'O+' ? 'selected' : ''}>O+</option><option ${item.blood === 'O-' ? 'selected' : ''}>O-</option><option ${item.blood === 'A+' ? 'selected' : ''}>A+</option><option ${item.blood === 'A-' ? 'selected' : ''}>A-</option><option ${item.blood === 'B+' ? 'selected' : ''}>B+</option><option ${item.blood === 'B-' ? 'selected' : ''}>B-</option><option ${item.blood === 'AB+' ? 'selected' : ''}>AB+</option><option ${item.blood === 'AB-' ? 'selected' : ''}>AB-</option></select></div>
          <div><label>Needed by</label><input name="deadline" value="${esc(item.deadline)}"></div>
          <div><label>Volunteers</label><input type="number" name="volunteers" value="${esc(item.volunteers || 0)}"></div>
          <div><label>Status</label><select name="status"><option ${item.status === 'Responding' ? 'selected' : ''}>Responding</option><option ${item.status === 'Matched' ? 'selected' : ''}>Matched</option><option ${item.status === 'Pending' ? 'selected' : ''}>Pending</option><option ${item.status === 'Volunteer ready' ? 'selected' : ''}>Volunteer ready</option></select></div>
          <div style="align-self:end;"><button type="submit" class="btn btn-primary" style="width:100%;">Save</button></div>
          <div style="align-self:end;"><button type="button" class="btn btn-outline" id="cancelBloodRequest" style="width:100%;">Cancel</button></div>
        </form>
      </div>
    `);
    const form = document.getElementById('bloodRequestForm');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const nextItem = {
        id: item.id,
        request: String(fd.get('request') || '').trim(),
        district: String(fd.get('district') || ''),
        blood: String(fd.get('blood') || 'O+'),
        deadline: String(fd.get('deadline') || ''),
        volunteers: Number(fd.get('volunteers') || 0),
        status: String(fd.get('status') || 'Pending')
      };
      const nextRows = id ? rows.map(entry => entry.id === id ? nextItem : entry) : [nextItem, ...rows];
      writeJson(STORAGE_KEYS.bloodRequests, nextRows);
      setHTML(panel, '');
      renderBloodConnect();
      toast('Blood request saved.', 'success');
    });
    document.getElementById('cancelBloodRequest').addEventListener('click', () => setHTML(panel, ''));
  }

  function openVolunteerImpactEditor(id = null) {
    const rows = readJson(STORAGE_KEYS.volunteerImpact, []);
    const item = rows.find(entry => entry.id === id) || { id: `impact-${Date.now()}`, volunteer: '', city: '', hours: '0h', campaigns: 0, donations: 0, score: 0 };
    const panel = document.getElementById('bloodEditor');
    setHTML(panel, `
      <div class="admin-panel" style="margin-bottom:16px;">
        <h3 style="margin-bottom:12px;">${id ? '✏️ Edit Volunteer Impact' : '➕ New Volunteer Impact'}</h3>
        <form id="volunteerImpactForm" class="admin-form-grid">
          <div><label>Volunteer</label><input name="volunteer" value="${esc(item.volunteer)}" required></div>
          <div><label>City</label><input name="city" value="${esc(item.city)}"></div>
          <div><label>Hours</label><input name="hours" value="${esc(item.hours)}"></div>
          <div><label>Campaigns</label><input type="number" name="campaigns" value="${esc(item.campaigns || 0)}"></div>
          <div><label>Donations</label><input type="number" name="donations" value="${esc(item.donations || 0)}"></div>
          <div><label>Impact score</label><input type="number" name="score" value="${esc(item.score || 0)}"></div>
          <div style="align-self:end;"><button type="submit" class="btn btn-primary" style="width:100%;">Save</button></div>
          <div style="align-self:end;"><button type="button" class="btn btn-outline" id="cancelVolunteerImpact" style="width:100%;">Cancel</button></div>
        </form>
      </div>
    `);
    const form = document.getElementById('volunteerImpactForm');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const nextItem = {
        id: item.id,
        volunteer: String(fd.get('volunteer') || '').trim(),
        city: String(fd.get('city') || ''),
        hours: String(fd.get('hours') || '0h'),
        campaigns: Number(fd.get('campaigns') || 0),
        donations: Number(fd.get('donations') || 0),
        score: Number(fd.get('score') || 0)
      };
      const nextRows = id ? rows.map(entry => entry.id === id ? nextItem : entry) : [nextItem, ...rows];
      writeJson(STORAGE_KEYS.volunteerImpact, nextRows);
      setHTML(panel, '');
      renderBloodConnect();
      toast('Volunteer impact saved.', 'success');
    });
    document.getElementById('cancelVolunteerImpact').addEventListener('click', () => setHTML(panel, ''));
  }

  // -----------------------------------------------------------------------
  // Members
  // -----------------------------------------------------------------------
  let memberSortKey = 'name';
  let memberQuery = '';

  function renderMembers() {
    const db = CMDB.raw();
    let list = db.members.slice();
    if (memberQuery) {
      const q = memberQuery.toLowerCase();
      list = list.filter(m => [m.name, m.city, m.profession, m.business].join(' ').toLowerCase().includes(q));
    }
    list.sort((a, b) => String(a[memberSortKey] || '').localeCompare(String(b[memberSortKey] || ''), 'mr'));

    setHTML('membersTbody', list.map(m => `
      <tr class="clickable" data-member-id="${esc(m.id)}">
        <td><strong>${esc(m.name)}</strong><div style="font-size:0.74rem; color:var(--muted);">${esc(m.id)}</div></td>
        <td>${esc(m.city)}</td>
        <td>${esc(m.profession || '-')}${m.business ? ' · ' + esc(m.business) : ''}</td>
        <td><span class="admin-badge">${esc(m.tier || 'Basic')}</span></td>
        <td>${m.verified && m.verified.profile ? '<span class="admin-badge ok">✓ Verified</span>' : '<span class="admin-badge warn">Unverified</span>'}</td>
      </tr>
    `).join('') || `<tr><td colspan="5" style="text-align:center; color:var(--muted); padding:20px;">कोणतेही सदस्य सापडले नाहीत.</td></tr>`);

    document.querySelectorAll('#membersTbody tr[data-member-id]').forEach(tr => {
      tr.addEventListener('click', () => openMember360(tr.dataset.memberId));
    });
  }

  function openMember360(id) {
    const db = CMDB.raw();
    const m = CMDB.getMember(id);
    const detail = CMDB.getMember360(id);
    if (!m || !detail) return;
    const groups = db.groups.filter(g => (g.members || []).includes(id));
    const posts = db.feedPosts.filter(p => p.authorId === id).length + db.groupPosts.filter(p => p.authorId === id).length;
    const connections = (m.connections || []).length;
    const chapterName = detail.chapterMember ? ((CMDB.getChapter(detail.chapterMember.chapterId) || {}).marathiName || '-') : '-';
    const fin = CMDB.getMemberIntelligence({}).find(x => x.id === id) || { totalPaid: 0, subscriptionPaid: 0, donations: 0, servicesUsed: 0, commissionGenerated: 0, refunds: 0, outstanding: 0 };

    setHTML('memberDetailPanel', `
      <div class="admin-panel">
        <div style="display:flex; justify-content:space-between; align-items:start; gap:10px; flex-wrap:wrap;">
          <div>
            <h3>${esc(m.avatar || '🙂')} ${esc(m.name)} <span style="font-size:0.75rem; color:var(--muted); font-weight:500;">(${esc(m.id)})</span></h3>
            <div style="font-size:0.85rem; color:var(--muted); margin-top:4px;">${esc(m.city)}, ${esc(m.district)} · ${esc(m.profession || '-')}</div>
          </div>
          <span class="admin-close-x" id="closeMemberPanel">✕ बंद करा</span>
        </div>
        <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(140px,1fr)); gap:10px; margin:14px 0;">
          <div class="stat-tile"><div class="n">${groups.length}</div><div class="l">Groups</div></div>
          <div class="stat-tile"><div class="n">${connections}</div><div class="l">Connections</div></div>
          <div class="stat-tile"><div class="n">${posts}</div><div class="l">Posts</div></div>
          <div class="stat-tile"><div class="n">${(m.followers || []).length}</div><div class="l">Followers</div></div>
          <div class="stat-tile"><div class="n">${detail.opportunitiesGiven.length}</div><div class="l">Given Opportunities</div></div>
          <div class="stat-tile"><div class="n">${detail.opportunitiesReceived.length}</div><div class="l">Received Opportunities</div></div>
          <div class="stat-tile"><div class="n">${detail.meetings.length}</div><div class="l">1-to-1 Meetings</div></div>
          <div class="stat-tile"><div class="n">${detail.donations.length}</div><div class="l">Donations</div></div>
          <div class="stat-tile"><div class="n">${inr(fin.totalPaid)}</div><div class="l">Total Paid</div></div>
          <div class="stat-tile"><div class="n">${inr(fin.subscriptionPaid)}</div><div class="l">Subscription Paid</div></div>
          <div class="stat-tile"><div class="n">${inr(fin.servicesUsed)}</div><div class="l">Services Used</div></div>
          <div class="stat-tile"><div class="n">${inr(fin.outstanding)}</div><div class="l">Outstanding</div></div>
        </div>
        <div style="margin-bottom:10px;"><strong>गट:</strong> ${groups.map(g => `<span class="tag">${esc(g.name)}</span>`).join(' ') || '-'}</div>
        <div style="margin-bottom:10px;"><strong>व्यवसाय मंडळ:</strong> ${esc(chapterName)} ${detail.chapterMember ? `· <span class="tag">${esc(detail.chapterMember.profession)}</span>` : ''}</div>
        <div class="admin-form-grid" style="margin-bottom:14px;">
          <div class="admin-panel" style="margin:0;"><h4 style="margin-bottom:8px;">💼 व्यवसाय संधी</h4>${detail.opportunitiesGiven.concat(detail.opportunitiesReceived).slice(0,4).map(o => `<div style="font-size:0.82rem; border-bottom:1px solid var(--line); padding:6px 0;">${esc(o.id)} · ${esc(o.requirement)} <span class="admin-badge">${esc(o.status)}</span></div>`).join('') || '<div class="muted">नोंदी नाहीत.</div>'}</div>
          <div class="admin-panel" style="margin:0;"><h4 style="margin-bottom:8px;">👥 1-to-1 भेटी</h4>${detail.meetings.slice(0,4).map(mt => `<div style="font-size:0.82rem; border-bottom:1px solid var(--line); padding:6px 0;">${esc(mt.date)} · ${esc(mt.purpose || mt.topics || '')} <span class="admin-badge">${esc(mt.status)}</span></div>`).join('') || '<div class="muted">नोंदी नाहीत.</div>'}</div>
          <div class="admin-panel" style="margin:0;"><h4 style="margin-bottom:8px;">❤️ Donations</h4>${detail.donations.slice(0,4).map(d => `<div style="font-size:0.82rem; border-bottom:1px solid var(--line); padding:6px 0;">${esc(d.campaignTitle)} · ${inr(d.amount)} <span class="muted">(${esc(d.date)})</span></div>`).join('') || '<div class="muted">नोंदी नाहीत.</div>'}</div>
          <div class="admin-panel" style="margin:0;"><h4 style="margin-bottom:8px;">🙏 Seva</h4>${detail.sevaRequests.slice(0,4).map(s => `<div style="font-size:0.82rem; border-bottom:1px solid var(--line); padding:6px 0;">${esc(s.category)} · ${esc(s.location)} <span class="admin-badge">${esc(s.status)}</span></div>`).join('') || '<div class="muted">नोंदी नाहीत.</div>'}</div>
          <div class="admin-panel" style="margin:0;"><h4 style="margin-bottom:8px;">🛠️ Service Enquiries</h4>${(detail.serviceEnquiries || []).slice(0,4).map(s => `<div style="font-size:0.82rem; border-bottom:1px solid var(--line); padding:6px 0;">${esc(s.service)} · ${esc(s.provider)} <span class="admin-badge">${esc(s.status)}</span></div>`).join('') || '<div class="muted">नोंदी नाहीत.</div>'}</div>
          <div class="admin-panel" style="margin:0;"><h4 style="margin-bottom:8px;">📦 Service Bookings</h4>${(detail.serviceRequests || []).slice(0,4).map(s => `<div style="font-size:0.82rem; border-bottom:1px solid var(--line); padding:6px 0;">${esc(s.service)} · ${esc(s.provider)} <span class="admin-badge">${esc(s.status)}</span></div>`).join('') || '<div class="muted">नोंदी नाहीत.</div>'}</div>
          <div class="admin-panel" style="margin:0;"><h4 style="margin-bottom:8px;">💰 Financial Summary</h4><div style="font-size:0.82rem; line-height:1.7;">Subscription: <strong>${inr(fin.subscriptionPaid)}</strong><br>Donations: <strong>${inr(fin.donations)}</strong><br>Services: <strong>${inr(fin.servicesUsed)}</strong><br>Commission: <strong>${inr(fin.commissionGenerated)}</strong><br>Refunds: <strong>${inr(fin.refunds)}</strong><br>Outstanding: <strong>${inr(fin.outstanding)}</strong></div></div>
        </div>
        <form id="memberEditForm" class="admin-form-grid">
          <div><label>Tier</label>
            <select name="tier">
              ${['Basic', 'Silver', 'Gold', 'Platinum'].map(t => `<option ${m.tier === t ? 'selected' : ''}>${t}</option>`).join('')}
            </select>
          </div>
          <div><label>Profile Verified</label>
            <select name="verifiedProfile">
              <option value="true" ${m.verified && m.verified.profile ? 'selected' : ''}>Verified</option>
              <option value="false" ${!(m.verified && m.verified.profile) ? 'selected' : ''}>Unverified</option>
            </select>
          </div>
          <div style="align-self:end;"><button type="submit" class="btn btn-primary" style="width:100%;">💾 जतन करा</button></div>
        </form>
      </div>
    `);

    document.getElementById('closeMemberPanel').addEventListener('click', () => {
      setHTML('memberDetailPanel', '');
    });
    document.getElementById('memberEditForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const verified = Object.assign({}, m.verified, { profile: fd.get('verifiedProfile') === 'true' });
      CMDB.adminUpdateMember(id, { tier: fd.get('tier'), verified: verified });
      toast('सदस्य माहिती अपडेट झाली.', 'success');
      renderMembers();
      openMember360(id);
    });
  }

  // -----------------------------------------------------------------------
  // Groups
  // -----------------------------------------------------------------------
  function renderGroups() {
    const db = CMDB.raw();
    setHTML('groupsTbody', db.groups.map(g => `
      <tr>
        <td><strong>${esc(g.cover || '')} ${esc(g.name)}</strong></td>
        <td>${esc(g.type)}</td>
        <td>${esc(g.district || '-')}</td>
        <td>${(g.members || []).length}</td>
      </tr>
    `).join(''));
  }

  // -----------------------------------------------------------------------
  // Businesses
  // -----------------------------------------------------------------------
  let bizQuery = '';
  let chapterQuery = '';
  let oppQuery = '';
  let oppStatusFilter = '';
  let meetingQuery = '';
  let applicationQuery = '';
  let applicationStatusFilter = '';
  let subscriptionQuery = '';
  let subscriptionStatusFilter = '';
  let subscriptionTypeFilter = '';
  let donationQuery = '';
  let donationCityFilter = '';
  let expenseQuery = '';
  let expenseCategoryFilter = '';
  let commissionQuery = '';
  let commissionStatusFilter = '';
  let intelQuery = '';
  let intelStateFilter = '';
  let intelDistrictFilter = '';
  let intelCityFilter = '';
  let intelInterestFilter = '';
  let intelProfessionFilter = '';
  const financeFilters = { query: '', quick: '', month: '', year: '', state: '', city: '', direction: '', type: '', paymentStatus: '', amountRange: '' };

  function renderBusinesses() {
    const db = CMDB.raw();
    let list = db.businesses.slice();
    if (bizQuery) {
      const q = bizQuery.toLowerCase();
      list = list.filter(b => [b.name, b.city, b.owner].join(' ').toLowerCase().includes(q));
    }
    setHTML('bizTbody', list.map(b => `
      <tr>
        <td><strong>${esc(b.photo || '')} ${esc(b.name)}</strong></td>
        <td>${esc(b.owner)}</td>
        <td>${esc(b.city)}</td>
        <td>${esc(b.cat)}</td>
        <td>⭐ ${esc(b.rating)}</td>
        <td>${b.verified ? '<span class="admin-badge ok">✓ Verified</span>' : '<span class="admin-badge warn">अ-सत्यापित</span>'}</td>
        <td><button class="btn btn-outline mini-btn" data-biz-toggle="${esc(b.id)}">${b.verified ? 'Un-verify' : 'Verify करा'}</button></td>
      </tr>
    `).join('') || `<tr><td colspan="7" style="text-align:center; color:var(--muted); padding:20px;">व्यवसाय सापडले नाहीत.</td></tr>`);

    document.querySelectorAll('[data-biz-toggle]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.bizToggle;
        const b = CMDB.getBusiness(id);
        CMDB.setBusinessVerified(id, !(b && b.verified));
        toast('व्यवसाय स्थिती अपडेट झाली.', 'success');
        renderBusinesses();
      });
    });
  }

  // -----------------------------------------------------------------------
  // Chapters / Meetings / Applications
  // -----------------------------------------------------------------------
  function renderChapters() {
    let list = CMDB.getChapters();
    if (chapterQuery) {
      const q = chapterQuery.toLowerCase();
      list = list.filter(ch => [ch.marathiName, ch.city, ch.territory].join(' ').toLowerCase().includes(q));
    }
    setHTML('chaptersTbody', list.map(ch => `
      <tr class="clickable" data-chapter-id="${esc(ch.id)}">
        <td><strong>${esc(ch.marathiName)}</strong></td>
        <td>${esc(ch.city)}</td>
        <td>${esc(ch.meetingDay)} · ${esc(ch.meetingTime)}</td>
        <td>${esc(ch.capacity - ch.openSeats)}</td>
        <td>${esc(ch.openSeats)}</td>
        <td>${inr(ch.monthlyBusiness)}</td>
      </tr>
    `).join('') || `<tr><td colspan="6" style="text-align:center; color:var(--muted); padding:20px;">अद्याप कोणतेही मंडळ नाही.</td></tr>`);

    document.querySelectorAll('[data-chapter-id]').forEach(row => {
      row.addEventListener('click', () => openChapterDetail(row.dataset.chapterId));
    });
  }

  function openChapterDetail(id) {
    const chapter = CMDB.getChapter(id);
    if (!chapter) return;
    const seats = CMDB.getProfessionSeats(id);
    const members = CMDB.getChapterMembers(id);
    setHTML('chapterDetailPanel', `
      <div class="admin-panel">
        <div style="display:flex; justify-content:space-between; align-items:start; gap:10px; flex-wrap:wrap;">
          <div>
            <h3>${esc(chapter.marathiName)}</h3>
            <div style="font-size:0.85rem; color:var(--muted); margin-top:4px;">${esc(chapter.territory)} · ${esc(chapter.venue)}</div>
          </div>
          <span class="admin-close-x" id="closeChapterPanel">✕ बंद करा</span>
        </div>
        <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(140px,1fr)); gap:10px; margin:14px 0;">
          <div class="stat-tile"><div class="n">${members.length}</div><div class="l">Members</div></div>
          <div class="stat-tile"><div class="n">${chapter.openSeats}</div><div class="l">Open Seats</div></div>
          <div class="stat-tile"><div class="n">${inr(chapter.monthlyBusiness)}</div><div class="l">Monthly Business</div></div>
          <div class="stat-tile"><div class="n">${chapter.monthlyOpportunities}</div><div class="l">Monthly Opportunities</div></div>
        </div>
        <div style="margin-bottom:8px;"><strong>Leadership:</strong> अध्यक्ष ${esc((CMDB.getMember(chapter.leaders.president) || {}).name || '—')} · उपाध्यक्ष ${esc((CMDB.getMember(chapter.leaders.vicePresident) || {}).name || '—')} · सचिव ${esc((CMDB.getMember(chapter.leaders.secretary) || {}).name || '—')}</div>
        <div style="margin-bottom:8px;"><strong>Members:</strong> ${members.map(m => `<span class="tag">${esc((CMDB.getMember(m.memberId) || {}).name || m.memberId)} · ${esc(m.profession)}</span>`).join(' ') || '-'}</div>
        <div class="admin-panel" style="margin:10px 0 0; padding:14px;">
          <h4 style="margin-bottom:10px;">👑 Leadership Control</h4>
          <div class="admin-form-grid">
            <div><label>अध्यक्ष</label><select id="leadPresident">${CMDB.raw().members.map(m => `<option value="${m.id}" ${chapter.leaders.president === m.id ? 'selected' : ''}>${esc(m.name)}</option>`).join('')}</select></div>
            <div><label>उपाध्यक्ष</label><select id="leadVicePresident">${CMDB.raw().members.map(m => `<option value="${m.id}" ${chapter.leaders.vicePresident === m.id ? 'selected' : ''}>${esc(m.name)}</option>`).join('')}</select></div>
            <div><label>सचिव</label><select id="leadSecretary">${CMDB.raw().members.map(m => `<option value="${m.id}" ${chapter.leaders.secretary === m.id ? 'selected' : ''}>${esc(m.name)}</option>`).join('')}</select></div>
            <div style="align-self:end;"><button class="btn btn-primary" id="saveLeadershipBtn" style="width:100%;">Leadership Save</button></div>
          </div>
        </div>
        <div style="margin-top:10px;"><strong>Seats:</strong></div>
        <div class="admin-table-wrap" style="margin-top:10px;">
          <table class="admin-table">
            <thead><tr><th>Category</th><th>Specialty</th><th>Status</th><th>Assigned Member</th><th>Action</th></tr></thead>
            <tbody>
              ${seats.map(s => `<tr>
                <td>${esc(s.category)}</td>
                <td>${esc(s.specialty)}</td>
                <td><span class="admin-badge ${s.status === 'occupied' ? 'ok' : 'warn'}">${s.status === 'occupied' ? 'भरलेले' : (s.status === 'approval' ? 'मंजुरी' : 'उपलब्ध')}</span></td>
                <td>${esc((CMDB.getMember(s.memberId) || {}).name || '-')}</td>
                <td>${s.status === 'occupied' ? `<button class="btn btn-outline mini-btn" data-seat-release="${esc(s.id)}">Release</button>` : `<select class="admin-select" data-seat-assign="${esc(s.id)}"><option value="">Assign member</option>${CMDB.raw().members.map(m => `<option value="${m.id}">${esc(m.name)}</option>`).join('')}</select>`}</td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>`);
    document.getElementById('closeChapterPanel').addEventListener('click', () => {
      setHTML('chapterDetailPanel', '');
    });
    const saveLeadershipBtn = document.getElementById('saveLeadershipBtn');
    if (saveLeadershipBtn) {
      saveLeadershipBtn.addEventListener('click', () => {
        chapter.leaders = {
          president: document.getElementById('leadPresident').value,
          vicePresident: document.getElementById('leadVicePresident').value,
          secretary: document.getElementById('leadSecretary').value
        };
        CMDB.persist();
        CMDB.logAudit('update', 'chapterLeadership', chapter.id, null, chapter.leaders);
        toast('Leadership अपडेट झाली.', 'success');
        renderChapters();
        openChapterDetail(id);
      });
    }

    document.querySelectorAll('[data-seat-assign]').forEach(sel => {
      sel.addEventListener('change', () => {
        if (!sel.value) return;
        CMDB.assignProfessionSeat(sel.dataset.seatAssign, sel.value);
        toast('Seat यशस्वीरीत्या assign झाली.', 'success');
        renderChapters();
        openChapterDetail(id);
        renderDashboard();
      });
    });
    document.querySelectorAll('[data-seat-release]').forEach(btn => {
      btn.addEventListener('click', () => {
        CMDB.releaseProfessionSeat(btn.dataset.seatRelease);
        toast('Seat release केली.', 'info');
        renderChapters();
        openChapterDetail(id);
        renderDashboard();
      });
    });
  }

  function renderMeetings() {
    let list = CMDB.getOneToOneMeetings();
    if (meetingQuery) {
      const q = meetingQuery.toLowerCase();
      list = list.filter(m => [
        (CMDB.getMember(m.requesterId) || {}).name,
        (CMDB.getMember(m.recipientId) || {}).name,
        m.purpose,
        m.topics
      ].join(' ').toLowerCase().includes(q));
    }
    setHTML('meetingsTbody', list.map(m => `
      <tr>
        <td>${esc((CMDB.getMember(m.requesterId) || {}).name || m.requesterId)}</td>
        <td>${esc((CMDB.getMember(m.recipientId) || {}).name || m.recipientId)}</td>
        <td>${esc(m.date)} · ${esc(m.time)}</td>
        <td>${esc(m.mode)}</td>
        <td>${esc(m.purpose || m.topics || '-')}</td>
        <td><span class="admin-badge">${esc(m.status)}</span></td>
      </tr>
    `).join('') || `<tr><td colspan="6" style="text-align:center; color:var(--muted); padding:20px;">अद्याप कोणत्याही 1-to-1 भेटी नाहीत.</td></tr>`);
  }

  function renderApplications() {
    let list = CMDB.getBusinessApplications();
    if (applicationQuery) {
      const q = applicationQuery.toLowerCase();
      list = list.filter(a => [a.fullName, a.businessName, a.category, a.specialty].join(' ').toLowerCase().includes(q));
    }
    if (applicationStatusFilter) {
      list = list.filter(a => String(a.status) === applicationStatusFilter);
    }
    setHTML('applicationsTbody', list.map(a => `
      <tr>
        <td>${esc(a.fullName)}</td>
        <td>${esc(a.businessName || '-')}</td>
        <td>${esc(a.category || '-')}<div style="font-size:0.74rem; color:var(--muted);">${esc(a.specialty || '')}</div></td>
        <td>${esc((CMDB.getChapter(a.chapterId) || {}).marathiName || '-')}</td>
        <td><span class="admin-badge ${a.status === 'approved' ? 'ok' : (a.status === 'rejected' ? 'danger' : 'warn')}">${esc(a.status)}</span></td>
        <td>${esc(a.submittedOn || '-')}</td>
        <td>
          <div style="display:flex; gap:6px; flex-wrap:wrap;">
            <button class="btn btn-outline mini-btn" data-app-status="${esc(a.id)}|under-review">Review</button>
            <button class="btn btn-primary mini-btn" data-app-status="${esc(a.id)}|approved">Approve</button>
            <button class="btn btn-outline mini-btn" style="color:var(--danger); border-color:var(--danger);" data-app-status="${esc(a.id)}|rejected">Reject</button>
          </div>
        </td>
      </tr>
    `).join('') || `<tr><td colspan="7" style="text-align:center; color:var(--muted); padding:20px;">अद्याप कोणतेही अर्ज नाहीत.</td></tr>`);

    document.querySelectorAll('[data-app-status]').forEach(btn => {
      btn.addEventListener('click', () => {
        const [id, status] = btn.dataset.appStatus.split('|');
        CMDB.updateBusinessApplication(id, { status: status });
        toast('अर्ज स्थिती अपडेट झाली.', 'success');
        renderApplications();
        renderDashboard();
      });
    });
  }

  // -----------------------------------------------------------------------
  // Opportunities
  // -----------------------------------------------------------------------
  function renderOpportunities() {
    let list = CMDB.listOpportunities();
    if (oppQuery) {
      const q = oppQuery.toLowerCase();
      list = list.filter(o => [o.category, o.requirement, o.location].join(' ').toLowerCase().includes(q));
    }
    if (oppStatusFilter) {
      list = list.filter(o => String(o.status) === oppStatusFilter);
    }
    setHTML('oppTbody', list.map(o => `
      <tr>
        <td>${esc(o.category)}</td>
        <td>${esc(o.requirement)}<div style="font-size:0.74rem; color:var(--muted);">${esc((CMDB.getMember(o.creator) || {}).name || '')} → ${esc((CMDB.getMember(o.recipient) || {}).name || '')}</div></td>
        <td>${esc(o.location || '-')}</td>
        <td>${inr(o.estimatedValue)}</td>
        <td><span class="admin-badge">${esc(o.priority)}</span> <span class="admin-badge">${esc(o.qualityGrade || '')}</span></td>
        <td>
          <select class="admin-select" data-opp-status="${esc(o.id)}">
            ${['New', 'Contacted', 'Qualified', 'Discussion', 'Proposal', 'Negotiation', 'Won', 'Completed', 'Lost'].map(s => `<option ${o.status === s ? 'selected' : ''}>${s}</option>`).join('')}
          </select>
        </td>
        <td><button class="btn btn-outline mini-btn" data-opp-del="${esc(o.id)}">🗑️</button></td>
      </tr>
    `).join('') || `<tr><td colspan="7" style="text-align:center; color:var(--muted); padding:20px;">अद्याप कोणतीही संधी नाही.</td></tr>`);

    document.querySelectorAll('[data-opp-status]').forEach(sel => {
      sel.addEventListener('change', () => {
        CMDB.updateOpportunity(sel.dataset.oppStatus, { status: sel.value });
        toast('स्थिती अपडेट झाली.', 'success');
        renderDashboard();
      });
    });
    document.querySelectorAll('[data-opp-del]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (confirm('ही संधी नोंद हटवायची आहे का?')) {
          CMDB.deleteOpportunity(btn.dataset.oppDel);
          toast('संधी हटवली.', 'info');
          renderOpportunities();
        }
      });
    });
  }

  function bindOppForm() {
    const form = document.getElementById('oppForm');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      CMDB.createOpportunity({
        chapterId: (CMDB.getChapters()[0] || {}).id || '',
        recipient: (CMDB.raw().members[1] || {}).id || '',
        category: fd.get('category'), requirement: fd.get('requirement'),
        location: fd.get('location'), estimatedValue: Number(fd.get('estimatedValue')) || 0,
        priority: fd.get('priority'), qualityGrade: 'B'
      });
      form.reset();
      toast('व्यवसाय संधी जोडली गेली.', 'success');
      renderOpportunities();
      renderDashboard();
    });
  }

  // -----------------------------------------------------------------------
  // Leads
  // -----------------------------------------------------------------------
  const LEAD_STATUSES = ['New', 'Contacted', 'Qualified', 'Meeting', 'Proposal', 'Negotiation', 'Converted', 'Closed'];

  function renderLeads() {
    const list = CMDB.listLeads();
    setHTML('leadsTbody', list.map(l => `
      <tr>
        <td class="clickable" data-lead-open="${esc(l.id)}"><strong>${esc(l.name)}</strong><div style="font-size:0.74rem; color:var(--muted);">${esc(l.mobile || l.email || '')}</div></td>
        <td>${esc(l.type)}</td>
        <td>${esc(l.location || '-')}</td>
        <td>${esc(l.assignedTo || '-')}</td>
        <td><span class="admin-badge">${esc(l.priority)}</span></td>
        <td>${inr(l.expectedValue)}</td>
        <td>
          <select class="admin-select" data-lead-status="${esc(l.id)}">
            ${LEAD_STATUSES.map(s => `<option ${l.status === s ? 'selected' : ''}>${s}</option>`).join('')}
          </select>
        </td>
        <td><button class="btn btn-outline mini-btn" data-lead-del="${esc(l.id)}">🗑️</button></td>
      </tr>
    `).join('') || `<tr><td colspan="8" style="text-align:center; color:var(--muted); padding:20px;">अद्याप कोणताही Lead नाही.</td></tr>`);

    document.querySelectorAll('[data-lead-status]').forEach(sel => {
      sel.addEventListener('change', () => {
        CMDB.setLeadStatus(sel.dataset.leadStatus, sel.value);
        toast('Lead स्थिती अपडेट झाली.', 'success');
        renderDashboard();
      });
    });
    document.querySelectorAll('[data-lead-del]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (confirm('हा Lead हटवायचा आहे का?')) {
          CMDB.deleteLead(btn.dataset.leadDel);
          toast('Lead हटवला.', 'info');
          renderLeads();
          setHTML('leadDetailPanel', '');
        }
      });
    });
    document.querySelectorAll('[data-lead-open]').forEach(td => {
      td.addEventListener('click', () => openLeadDetail(td.dataset.leadOpen));
    });
  }

  function openLeadDetail(id) {
    const lead = CMDB.getLead(id);
    if (!lead) return;
    const fus = CMDB.listFollowups(id);
    setHTML('leadDetailPanel', `
      <div class="admin-panel">
        <div style="display:flex; justify-content:space-between; align-items:start; gap:10px; flex-wrap:wrap;">
          <h3>📇 ${esc(lead.name)} — Follow-ups</h3>
          <span class="admin-close-x" id="closeLeadPanel">✕ बंद करा</span>
        </div>
        <div style="margin:10px 0;">
          ${fus.length ? fus.map(f => `
            <div style="padding:8px 0; border-bottom:1px solid var(--line); font-size:0.85rem;">
              <strong>${esc(f.date)}</strong> — ${esc(f.purpose)} <span class="admin-badge">${esc(f.status)}</span>
              ${f.outcome ? `<div style="color:var(--muted); margin-top:2px;">परिणाम: ${esc(f.outcome)}</div>` : ''}
            </div>
          `).join('') : '<div style="color:var(--muted); font-size:0.85rem;">अद्याप follow-up नाही.</div>'}
        </div>
        <form id="fuForm" class="admin-form-grid">
          <div><label>तारीख</label><input type="date" name="date" required></div>
          <div><label>Purpose</label><input type="text" name="purpose" required></div>
          <div><label>Outcome</label><input type="text" name="outcome"></div>
          <div><label>Assigned To</label><input type="text" name="assignedTo" value="${esc(lead.assignedTo || '')}"></div>
          <div style="align-self:end;"><button type="submit" class="btn btn-primary" style="width:100%;">+ Follow-up जोडा</button></div>
        </form>
      </div>
    `);
    document.getElementById('closeLeadPanel').addEventListener('click', () => {
      setHTML('leadDetailPanel', '');
    });
    document.getElementById('fuForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      CMDB.createFollowup({
        leadId: id, date: fd.get('date'), purpose: fd.get('purpose'),
        outcome: fd.get('outcome'), assignedTo: fd.get('assignedTo'), status: 'Done'
      });
      toast('Follow-up जोडले गेले.', 'success');
      openLeadDetail(id);
    });
  }

  function bindLeadForm() {
    const form = document.getElementById('leadForm');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      CMDB.createLead({
        name: fd.get('name'), mobile: fd.get('mobile'), email: fd.get('email'),
        location: fd.get('location'), type: fd.get('type'), category: fd.get('category'),
        requirement: fd.get('requirement'), assignedTo: fd.get('assignedTo'),
        priority: fd.get('priority'), expectedValue: Number(fd.get('expectedValue')) || 0,
        followUpDate: fd.get('followUpDate'), source: 'Admin Manual'
      });
      form.reset();
      toast('नवीन Lead जोडला गेला.', 'success');
      renderLeads();
      renderDashboard();
    });
  }

  // -----------------------------------------------------------------------
  // Follow-ups (global list)
  // -----------------------------------------------------------------------
  function renderFollowups() {
    const list = CMDB.listFollowups();
    setHTML('followupsTbody', list.map(f => {
      const lead = CMDB.getLead(f.leadId);
      return `
      <tr>
        <td>${esc(lead ? lead.name : f.leadId || f.memberId || '-')}</td>
        <td>${esc(f.date)}</td>
        <td>${esc(f.purpose)}</td>
        <td>${esc(f.outcome || '-')}</td>
        <td>${esc(f.assignedTo || '-')}</td>
        <td><span class="admin-badge">${esc(f.status)}</span></td>
      </tr>`;
    }).join('') || `<tr><td colspan="6" style="text-align:center; color:var(--muted); padding:20px;">अद्याप कोणतेही follow-up नाही.</td></tr>`);
  }

  // -----------------------------------------------------------------------
  // Service Enquiries / Bookings
  // -----------------------------------------------------------------------
  function renderServiceEnquiries() {
    const list = CMDB.listServiceEnquiries();
    setHTML('serviceEnquiriesTbody', list.map(s => `
      <tr>
        <td><strong>${esc(s.service)}</strong></td>
        <td>${esc(s.provider || '-')}</td>
        <td>${esc(s.location || '-')}</td>
        <td>${esc(s.budget || s.price || '-')}</td>
        <td>${esc(s.preferredDate || '-')} · ${esc(s.preferredTime || '-')}</td>
        <td><span class="admin-badge">${esc(s.status || 'Enquiry')}</span></td>
      </tr>
    `).join('') || `<tr><td colspan="6" style="text-align:center; color:var(--muted); padding:20px;">अद्याप कोणतीही सेवा चौकशी नाही.</td></tr>`);
  }

  function renderServiceBookings() {
    const list = CMDB.listServiceRequests();
    setHTML('serviceBookingsTbody', list.map(s => `
      <tr>
        <td><strong>${esc(s.service)}</strong></td>
        <td>${esc(s.provider || '-')}</td>
        <td>${esc(s.preferredDate || '-')} · ${esc(s.preferredTime || '-')}</td>
        <td><span class="admin-badge">${esc(s.status || 'Booked')}</span></td>
        <td>
          <select class="admin-select" data-service-booking-status="${esc(s.id)}">
            ${['Booked', 'Qualified', 'Provider Contact', 'Quote Sent', 'Accepted', 'In Progress', 'Completed', 'Cancelled'].map(st => `<option ${s.status === st ? 'selected' : ''}>${st}</option>`).join('')}
          </select>
        </td>
      </tr>
    `).join('') || `<tr><td colspan="5" style="text-align:center; color:var(--muted); padding:20px;">अद्याप कोणतीही सेवा बुकिंग नाही.</td></tr>`);

    document.querySelectorAll('[data-service-booking-status]').forEach(sel => {
      sel.addEventListener('change', () => {
        CMDB.updateServiceRequest(sel.dataset.serviceBookingStatus, { status: sel.value });
        toast('Service booking स्थिती अपडेट झाली.', 'success');
        renderServiceBookings();
        renderDashboard();
      });
    });
  }

  // -----------------------------------------------------------------------
  // Seva
  // -----------------------------------------------------------------------
  const SEVA_FLOW = ['New', 'Verified', 'Assigned', 'InProgress', 'Resolved', 'Closed'];

  function nextSevaStatus(s) {
    const idx = SEVA_FLOW.indexOf(s);
    return idx >= 0 && idx < SEVA_FLOW.length - 1 ? SEVA_FLOW[idx + 1] : null;
  }

  function renderSeva() {
    const list = CMDB.listSevaRequests();
    setHTML('sevaTbody', list.map(s => {
      const next = nextSevaStatus(s.status);
      return `
      <tr>
        <td><strong>${esc(s.requesterName)}</strong></td>
        <td>${esc(s.category)}</td>
        <td>${esc(s.location || '-')}</td>
        <td>${esc(s.description || '-')}</td>
        <td>${esc(s.assignedVolunteer || '-')}</td>
        <td><span class="admin-badge ${s.status === 'Resolved' || s.status === 'Closed' ? 'ok' : 'warn'}">${esc(s.status)}</span></td>
        <td>${next ? `<button class="btn btn-outline mini-btn" data-seva-next="${esc(s.id)}">${esc(next)} →</button>` : '<span style="color:var(--muted); font-size:0.78rem;">पूर्ण</span>'}</td>
      </tr>`;
    }).join('') || `<tr><td colspan="7" style="text-align:center; color:var(--muted); padding:20px;">अद्याप कोणतीही विनंती नाही.</td></tr>`);

    document.querySelectorAll('[data-seva-next]').forEach(btn => {
      btn.addEventListener('click', () => {
        const s = CMDB.getSevaRequest(btn.dataset.sevaNext);
        const next = nextSevaStatus(s.status);
        if (next) {
          CMDB.setSevaStatus(s.id, next);
          toast(`स्थिती "${next}" वर अपडेट झाली.`, 'success');
          renderSeva();
          renderDashboard();
        }
      });
    });
  }

  function bindSevaForm() {
    const form = document.getElementById('sevaForm');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      CMDB.createSevaRequest({
        category: fd.get('category'), requesterName: fd.get('requesterName'),
        location: fd.get('location'), description: fd.get('description')
      });
      form.reset();
      toast('सेवा विनंती नोंदवली गेली.', 'success');
      renderSeva();
      renderDashboard();
    });
  }

  // -----------------------------------------------------------------------
  // Volunteers
  // -----------------------------------------------------------------------
  function renderVolunteers() {
    const list = CMDB.listVolunteers();
    setHTML('volTbody', list.map(v => `
      <tr>
        <td>${esc(v.memberId || '-')}</td>
        <td>${(Array.isArray(v.skills) ? v.skills : String(v.skills || '').split(',')).map(s => `<span class="tag">${esc(s.trim())}</span>`).join(' ')}</td>
        <td>${esc(v.city || '-')}</td>
        <td>${esc(v.availability || '-')}</td>
        <td>${esc(v.tasksCompleted || 0)}</td>
      </tr>
    `).join('') || `<tr><td colspan="5" style="text-align:center; color:var(--muted); padding:20px;">अद्याप कोणताही स्वयंसेवक नाही.</td></tr>`);
  }

  function bindVolForm() {
    const form = document.getElementById('volForm');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      CMDB.createVolunteer({
        memberId: fd.get('memberId'), skills: String(fd.get('skills') || '').split(',').map(s => s.trim()).filter(Boolean),
        city: fd.get('city'), availability: fd.get('availability')
      });
      form.reset();
      toast('स्वयंसेवक जोडला गेला.', 'success');
      renderVolunteers();
      renderDashboard();
    });
  }

  // -----------------------------------------------------------------------
  // Finance / Funds / Subscriptions / Intelligence
  // -----------------------------------------------------------------------
  function uniqueValues(list, key) {
    return Array.from(new Set(list.map(x => x && x[key]).filter(Boolean))).sort((a, b) => String(a).localeCompare(String(b), 'mr'));
  }

  function fillSelect(id, values, selected, placeholder) {
    const el = document.getElementById(id);
    if (!el) return;
    const opts = [`<option value="">${esc(placeholder || 'All')}</option>`].concat(values.map(v => `<option value="${esc(v)}" ${String(v) === String(selected || '') ? 'selected' : ''}>${esc(v)}</option>`));
    setHTML(el, opts.join(''));
  }

  function renderSubscriptions() {
    const list = CMDB.listSubscriptions({ query: subscriptionQuery, status: subscriptionStatusFilter, membershipType: subscriptionTypeFilter });
    const all = CMDB.listSubscriptions();
    fillSelect('subscriptionStatusFilter', uniqueValues(all, 'status'), subscriptionStatusFilter, 'All Status');
    fillSelect('subscriptionTypeFilter', uniqueValues(all, 'membershipType'), subscriptionTypeFilter, 'All Types');
    const stats = {
      active: list.filter(s => s.status === 'Active').length,
      newSubs: list.filter(s => s.status === 'Active' && String(s.startDate || '').startsWith('2026-09')).length,
      renewals: list.filter(s => s.status === 'Active').length,
      expired: list.filter(s => s.status === 'Expired').length,
      failed: list.filter(s => s.status === 'Pending').length,
      mrr: list.filter(s => s.recurring === 'Monthly').reduce((sum, s) => sum + (s.amount || 0), 0),
      arr: list.filter(s => s.recurring === 'Annual').reduce((sum, s) => sum + (s.amount || 0), 0)
    };
    setHTML('subscriptionStats', [
      ['Active', stats.active], ['New', stats.newSubs], ['Renewals', stats.renewals], ['Expired', stats.expired], ['Failed/Pending', stats.failed], ['MRR', inr(stats.mrr)], ['ARR', inr(stats.arr)]
    ].map(([l, n]) => `<div class="stat-tile"><div class="n">${esc(n)}</div><div class="l">${esc(l)}</div></div>`).join(''));
    setHTML('subscriptionTbody', list.map(s => `
      <tr>
        <td><code>${esc(s.id)}</code></td>
        <td>${esc(s.memberName)}</td>
        <td>${esc(s.plan)}</td>
        <td>${esc(s.membershipType)}</td>
        <td>${esc(s.city)}</td>
        <td>${inr(s.amount)}</td>
        <td><span class="admin-badge ${s.status === 'Active' ? 'ok' : (s.status === 'Expired' ? 'danger' : 'warn')}">${esc(s.status)}</span></td>
        <td>${esc(s.expiryDate)}</td>
      </tr>`).join('') || `<tr><td colspan="8" style="text-align:center; color:var(--muted); padding:20px;">No subscriptions found.</td></tr>`);
  }

  function renderFunds() {
    const list = CMDB.listFundAccounts();
    const totals = list.reduce((acc, f) => {
      acc.received += f.totalReceived || 0;
      acc.spent += f.totalSpent || 0;
      acc.pending += f.pendingExpenses || 0;
      acc.available += (f.openingBalance || 0) + (f.totalReceived || 0) - (f.totalSpent || 0) - (f.pendingExpenses || 0) - (f.refunds || 0);
      return acc;
    }, { received: 0, spent: 0, pending: 0, available: 0 });
    setHTML('fundStats', [
      ['Fund Accounts', list.length], ['Total Received', inr(totals.received)], ['Total Spent', inr(totals.spent)], ['Pending Expenses', inr(totals.pending)], ['Available Balance', inr(totals.available)]
    ].map(([l, n]) => `<div class="stat-tile"><div class="n">${esc(n)}</div><div class="l">${esc(l)}</div></div>`).join(''));
    setHTML('fundsTbody', list.map(f => {
      const available = (f.openingBalance || 0) + (f.totalReceived || 0) - (f.totalSpent || 0) - (f.pendingExpenses || 0) - (f.refunds || 0);
      return `<tr>
        <td><strong>${esc(f.name)}</strong></td>
        <td>${inr(f.openingBalance)}</td>
        <td>${inr(f.totalReceived)}</td>
        <td>${inr(f.totalApproved)}</td>
        <td>${inr(f.totalSpent)}</td>
        <td>${inr(f.refunds)}</td>
        <td>${inr(f.pendingExpenses)}</td>
        <td><strong>${inr(available)}</strong></td>
      </tr>`;
    }).join(''));
  }

  function renderDonations() {
    const finance = CMDB.getDonationFinance({ query: donationQuery, city: donationCityFilter });
    fillSelect('donationCityFilter', uniqueValues(CMDB.filterTransactions({ type: 'Donation' }), 'city'), donationCityFilter, 'All Cities');
    setHTML('donationStats', [
      ['Total Donations', inr(finance.totalDonations)], ['Today', inr(finance.todayDonations)], ['This Month', inr(finance.monthDonations)], ['Failed', finance.failedDonations], ['Refunded', inr(finance.refundedDonations)], ['Pending Settlement', finance.pendingSettlement]
    ].map(([l, n]) => `<div class="stat-tile"><div class="n">${esc(n)}</div><div class="l">${esc(l)}</div></div>`).join(''));
    setHTML('donationCampaignTbody', finance.campaignWise.map(c => `
      <tr>
        <td><strong>${esc(c.title)}</strong></td>
        <td>${inr(c.collected)}</td>
        <td>${esc(c.donors)}</td>
        <td>${inr(c.utilized)}</td>
        <td>${inr(c.unutilized)}</td>
      </tr>`).join(''));
    setHTML('donationTbody', finance.entries.map(d => `
      <tr>
        <td><code>${esc(d.id)}</code></td>
        <td>${esc(d.payerReceiverName)}</td>
        <td>${esc(d.campaignTitle)}</td>
        <td>${esc(d.city || '-')}</td>
        <td>${inr(d.amount)}</td>
        <td><span class="admin-badge">${esc(d.paymentStatus)}</span></td>
        <td>${esc(d.settlementStatus || '-')}</td>
      </tr>`).join('') || `<tr><td colspan="7" style="text-align:center; color:var(--muted); padding:20px;">No donation entries found.</td></tr>`);
  }

  function renderFinance() {
    const stats = CMDB.getFinanceDashboard(financeFilters);
    const role = CMDB.getFinanceRoleDefinition();
    const years = CMDB.getYearsFromTransactions();
    fillSelect('financeYear', years, financeFilters.year, 'All');
    fillSelect('financeCity', uniqueValues(CMDB.filterTransactions({}), 'city'), financeFilters.city, 'All');
    const list = CMDB.filterTransactions(financeFilters);
    setHTML('financeStats', [
      ['Today Collection', inr(stats.today.collection)], ['Today Expenses', inr(stats.today.expenses)], ['Today Donations', inr(stats.today.donations)], ['Today Subscriptions', inr(stats.today.subscriptions)], ['Today Service Revenue', inr(stats.today.services)], ['Today Commission', inr(stats.today.commission)], ['Today Refunds', inr(stats.today.refunds)], ['Pending Settlements', stats.today.pendingSettlements], ['Failed Txns', stats.today.failedTransactions], ['Today Net', inr(stats.today.netCollection)], ['Month Gross', inr(stats.month.grossRevenue)], ['Month Net', inr(stats.month.netRevenue)], ['Month Expenses', inr(stats.month.expenses)], ['Gateway Charges', inr(stats.month.gatewayCharges)], ['Tax/GST', inr(stats.month.tax)], ['Year Surplus', inr(stats.year.netSurplus)]
    ].map(([l, n]) => `<div class="stat-tile"><div class="n">${esc(n)}</div><div class="l">${esc(l)}</div></div>`).join(''));
    setHTML('financeRolePanel', `
      <h3 style="margin-bottom:10px;">${esc(role.role)}</h3>
      <div style="margin-bottom:10px; color:var(--muted);">${esc(role.responsibility)}</div>
      <div style="margin-bottom:10px;"><strong>Approval Levels:</strong> ${role.approvalLevels.map(a => `<span class="tag">${esc(a.range)} · ${esc(a.flow)}</span>`).join(' ')}</div>
      <div><strong>Restricted by default:</strong> ${role.restricted.map(x => `<span class="tag">${esc(x)}</span>`).join(' ')}</div>`);
    setHTML('financeTbody', list.map(t => `
      <tr>
        <td><code>${esc(t.id)}</code></td>
        <td>${esc(t.transactionDate)}<div style="font-size:0.74rem; color:var(--muted);">${esc(t.transactionTime || '')}</div></td>
        <td>${esc(t.transactionType)}<div style="font-size:0.74rem; color:var(--muted);">${esc(t.transactionCategory || '')}</div></td>
        <td>${esc(t.payerReceiverName)}</td>
        <td>${esc(t.sourceModule)}</td>
        <td>${inr(t.amount)}</td>
        <td>${inr(t.netAmount)}</td>
        <td><span class="admin-badge ${t.paymentStatus === 'Failed' ? 'danger' : (t.paymentStatus === 'Reconciled' || t.paymentStatus === 'Settled' ? 'ok' : 'warn')}">${esc(t.paymentStatus)}</span></td>
        <td>${esc(t.settlementStatus || '-')}</td>
        <td>${esc(t.reconciliationStatus || '-')}</td>
      </tr>`).join('') || `<tr><td colspan="10" style="text-align:center; color:var(--muted); padding:20px;">No transactions found.</td></tr>`);
    ensureExportBtn('financeExportBtn', 'finance-ledger.csv', [
      ['Txn ID','Date','Type','Payer / Receiver','Module','Amount','Net','Payment Status','Settlement','Reconciliation'],
      ...list.map(t => [t.id, t.transactionDate, t.transactionType, t.payerReceiverName, t.sourceModule, t.amount, t.netAmount, t.paymentStatus, t.settlementStatus, t.reconciliationStatus])
    ], 'financeStats');
  }

  function renderIncome() {
    const txns = CMDB.filterTransactions(Object.assign({}, financeFilters, { direction: 'Income' }));
    const grouped = {};
    txns.forEach(t => {
      const key = t.transactionType;
      grouped[key] = grouped[key] || { type: key, count: 0, gross: 0, net: 0, gateway: 0 };
      grouped[key].count += 1;
      grouped[key].gross += Number(t.amount || 0);
      grouped[key].net += Number(t.netAmount || t.amount || 0);
      grouped[key].gateway += Number(t.gatewayFee || 0);
    });
    const rows = Object.values(grouped).sort((a, b) => b.net - a.net);
    setHTML('incomeStats', [
      ['Income Sources', rows.length], ['Gross Income', inr(rows.reduce((s, r) => s + r.gross, 0))], ['Net Income', inr(rows.reduce((s, r) => s + r.net, 0))], ['Gateway Fees', inr(rows.reduce((s, r) => s + r.gateway, 0))]
    ].map(([l, n]) => `<div class="stat-tile"><div class="n">${esc(n)}</div><div class="l">${esc(l)}</div></div>`).join(''));
    setHTML('incomeTbody', rows.map(r => `
      <tr>
        <td><strong>${esc(r.type)}</strong></td>
        <td>${esc(r.count)}</td>
        <td>${inr(r.gross)}</td>
        <td>${inr(r.net)}</td>
        <td>${inr(r.gateway)}</td>
      </tr>`).join('') || `<tr><td colspan="5" style="text-align:center; color:var(--muted); padding:20px;">No income entries found.</td></tr>`);
    ensureExportBtn('incomeExportBtn', 'income-summary.csv', [
      ['Source','Transactions','Gross','Net','Gateway'],
      ...rows.map(r => [r.type, r.count, r.gross, r.net, r.gateway])
    ], 'incomeStats');
  }

  function renderExpenses() {
    const list = CMDB.listExpenses({ query: expenseQuery, category: expenseCategoryFilter });
    const all = CMDB.listExpenses();
    fillSelect('expenseCategoryFilter', uniqueValues(all, 'category'), expenseCategoryFilter, 'All Categories');
    setHTML('expenseStats', [
      ['Expense Entries', list.length], ['Total Expenses', inr(list.reduce((s, e) => s + (e.totalAmount || 0), 0))], ['Approved', list.filter(e => e.status === 'Approved' || e.status === 'Paid' || e.status === 'Settled').length], ['Pending Recon', list.filter(e => e.reconciliationStatus === 'Pending').length]
    ].map(([l, n]) => `<div class="stat-tile"><div class="n">${esc(n)}</div><div class="l">${esc(l)}</div></div>`).join(''));
    setHTML('expenseTbody', list.map(e => `
      <tr>
        <td><code>${esc(e.id)}</code></td>
        <td>${esc(e.expenseDate)}</td>
        <td>${esc(e.category)}<div style="font-size:0.74rem; color:var(--muted);">${esc(e.subcategory || '')}</div></td>
        <td>${esc(e.vendor)}</td>
        <td>${esc(e.city)}</td>
        <td>${inr(e.totalAmount)}</td>
        <td><span class="admin-badge">${esc(e.status)}</span></td>
        <td>${esc(e.reconciliationStatus || '-')}</td>
      </tr>`).join('') || `<tr><td colspan="8" style="text-align:center; color:var(--muted); padding:20px;">No expenses found.</td></tr>`);
    ensureExportBtn('expenseExportBtn', 'expense-ledger.csv', [
      ['Expense ID','Date','Category','Subcategory','Vendor','City','Total','Status','Reconciliation'],
      ...list.map(e => [e.id, e.expenseDate, e.category, e.subcategory, e.vendor, e.city, e.totalAmount, e.status, e.reconciliationStatus])
    ], 'expenseStats');
  }

  function renderCommissions() {
    const list = CMDB.listCommissions({ query: commissionQuery, status: commissionStatusFilter });
    fillSelect('commissionStatusFilter', uniqueValues(CMDB.listCommissions(), 'status'), commissionStatusFilter, 'All Status');
    setHTML('commissionStats', [
      ['Commission Entries', list.length], ['Gross Transaction', inr(list.reduce((s, c) => s + (c.grossTransaction || 0), 0))], ['Commission Amount', inr(list.reduce((s, c) => s + (c.commissionAmount || 0), 0))], ['Net Commission', inr(list.reduce((s, c) => s + (c.netCommission || 0), 0))]
    ].map(([l, n]) => `<div class="stat-tile"><div class="n">${esc(n)}</div><div class="l">${esc(l)}</div></div>`).join(''));
    setHTML('commissionTbody', list.map(c => `
      <tr>
        <td><code>${esc(c.id)}</code></td>
        <td>${esc(c.source)}</td>
        <td>${esc(c.sourceRecord)}</td>
        <td>${inr(c.grossTransaction)}</td>
        <td>${esc(c.commissionPercent)}%</td>
        <td>${inr(c.commissionAmount)}</td>
        <td>${inr(c.netCommission)}</td>
        <td><span class="admin-badge ${c.status === 'Reconciled' || c.status === 'Settled' ? 'ok' : 'warn'}">${esc(c.status)}</span></td>
      </tr>`).join('') || `<tr><td colspan="8" style="text-align:center; color:var(--muted); padding:20px;">No commissions found.</td></tr>`);
    ensureExportBtn('commissionExportBtn', 'commission-center.csv', [
      ['Commission ID','Source','Record','Gross','Commission %','Commission','Net','Status'],
      ...list.map(c => [c.id, c.source, c.sourceRecord, c.grossTransaction, c.commissionPercent, c.commissionAmount, c.netCommission, c.status])
    ], 'commissionStats');
  }

  function renderApprovals() {
    const role = CMDB.getFinanceRoleDefinition();
    const approvals = (CMDB.raw().financeApprovals || []).slice();
    setHTML('approvalRulesPanel', `<h3 style="margin-bottom:10px;">Approval Matrix</h3>${role.approvalLevels.map(a => `<div class="audit-row"><strong>${esc(a.range)}</strong> — ${esc(a.flow)}</div>`).join('')}`);
    setHTML('approvalTbody', approvals.map(a => `
      <tr>
        <td><code>${esc(a.id)}</code></td>
        <td>${esc(a.module)}</td>
        <td>${esc(a.recordId)}</td>
        <td>${inr(a.amount)}</td>
        <td>${esc(a.requestedBy)}</td>
        <td>${esc(a.requiredApproval)}</td>
        <td><span class="admin-badge ${a.status === 'Approved' ? 'ok' : 'warn'}">${esc(a.status)}</span></td>
        <td>${esc(a.approvedBy || '-')}</td>
      </tr>`).join('') || `<tr><td colspan="8" style="text-align:center; color:var(--muted); padding:20px;">No approval records found.</td></tr>`);
  }

  function renderMemberIntelligence() {
    const allMembers = CMDB.raw().members;
    fillSelect('intelDistrict', uniqueValues(allMembers, 'district'), intelDistrictFilter, 'All');
    fillSelect('intelCity', uniqueValues(allMembers, 'city'), intelCityFilter, 'All');
    fillSelect('intelProfession', uniqueValues(allMembers, 'profession'), intelProfessionFilter, 'All');
    fillSelect('intelInterest', Array.from(new Set(allMembers.flatMap(m => m.interests || []))).sort((a, b) => String(a).localeCompare(String(b), 'mr')), intelInterestFilter, 'All');
    const list = CMDB.getMemberIntelligence({ query: intelQuery, state: intelStateFilter, district: intelDistrictFilter, city: intelCityFilter, interest: intelInterestFilter, profession: intelProfessionFilter });
    setHTML('intelStats', [
      ['Matching Members', list.length], ['Active Subscriptions', list.filter(m => m.subscriptionStatus === 'Active').length], ['Businesses', list.reduce((s, m) => s + (m.businessesAdded || 0), 0)], ['Subscription Revenue', inr(list.reduce((s, m) => s + (m.subscriptionPaid || 0), 0))], ['Donations', inr(list.reduce((s, m) => s + (m.donations || 0), 0))], ['Services', inr(list.reduce((s, m) => s + (m.servicesUsed || 0), 0))]
    ].map(([l, n]) => `<div class="stat-tile"><div class="n">${esc(n)}</div><div class="l">${esc(l)}</div></div>`).join(''));
    setHTML('intelTbody', list.map(m => `
      <tr>
        <td><strong>${esc(m.name)}</strong><div style="font-size:0.74rem; color:var(--muted);">${esc(m.id)}</div></td>
        <td>${esc(m.city)}, ${esc(m.district)}</td>
        <td>${esc(m.profession || '-')}</td>
        <td>${esc((m.interests || []).slice(0, 2).join(', ') || '-')}</td>
        <td>${esc(m.subscriptionStatus || '-')}</td>
        <td>${inr(m.totalPaid)}</td>
        <td>${inr(m.donations)}</td>
        <td>${inr(m.servicesUsed)}</td>
        <td>${esc(m.opportunitiesGiven + m.opportunitiesReceived)}</td>
      </tr>`).join('') || `<tr><td colspan="9" style="text-align:center; color:var(--muted); padding:20px;">No matching members found.</td></tr>`);
  }

  function renderAnalytics() {
    const rows = CMDB.getLocationFinanceReport(financeFilters);
    setHTML('analyticsTbody', rows.map(r => `
      <tr>
        <td><strong>${esc(r.location)}</strong></td>
        <td>${esc(r.members)}</td>
        <td>${inr(r.subscription)}</td>
        <td>${inr(r.services)}</td>
        <td>${inr(r.commission)}</td>
        <td>${inr(r.donations)}</td>
        <td>${inr(r.expenses)}</td>
        <td><strong>${inr(r.net)}</strong></td>
      </tr>`).join('') || `<tr><td colspan="8" style="text-align:center; color:var(--muted); padding:20px;">No analytics available.</td></tr>`);
  }

  function ensureExportBtn(id, filename, rows, mountId) {
    let btn = document.getElementById(id);
    const mount = document.getElementById(mountId);
    if (!mount) return;
    if (!btn) {
      btn = document.createElement('button');
      btn.type = 'button';
      btn.id = id;
      btn.className = 'btn btn-outline';
      btn.style.cssText = 'margin-bottom:14px;';
      btn.textContent = '⬇ Export CSV';
      mount.parentNode.insertBefore(btn, mount.nextSibling);
    }
    btn.onclick = () => {
      downloadCsv(filename, rows);
      toast('CSV export तयार झाला.', 'success');
    };
  }

  function renderSavedFilters() {
    const rows = CMDB.getSavedFilters();
    setHTML('savedFiltersTbody', rows.map(f => `
      <tr>
        <td><strong>${esc(f.name)}</strong></td>
        <td>${esc(f.module)}</td>
        <td>${(f.conditions || []).map(c => `<span class="tag">${esc(c)}</span>`).join(' ')}</td>
      </tr>`).join('') || `<tr><td colspan="3" style="text-align:center; color:var(--muted); padding:20px;">No saved filters.</td></tr>`);
  }

  // -----------------------------------------------------------------------
  // Campaigns / Receipts
  // -----------------------------------------------------------------------
  function renderCampaigns() {
    const db = CMDB.raw();
    setHTML('campTbody', db.campaigns.map(c => {
      const pct = Math.min(100, Math.round((c.collected / c.target) * 100));
      return `
      <tr>
        <td><strong>${esc(c.icon || '')} ${esc(c.title)}</strong></td>
        <td>${inr(c.target)}</td>
        <td>${inr(c.collected)}</td>
        <td>${pct}%</td>
        <td>${esc(c.donors)}</td>
      </tr>`;
    }).join(''));
  }

  function renderReceipts() {
    const db = CMDB.raw();
    const rows = [];
    db.campaigns.forEach(c => {
      (c.receipts || []).forEach(r => {
        rows.push({ id: r.id, camp: c.title, donor: r.donor, amount: r.amount, date: r.date });
      });
    });
    setHTML('receiptsTbody', rows.map(r => `
      <tr>
        <td><code>${esc(r.id)}</code></td>
        <td>${esc(r.camp)}</td>
        <td>${esc(r.donor)}</td>
        <td>${inr(r.amount)}</td>
        <td>${esc(r.date)}</td>
      </tr>
    `).join('') || `<tr><td colspan="5" style="text-align:center; color:var(--muted); padding:20px;">अद्याप कोणतीही पावती नाही.</td></tr>`);
  }

  // -----------------------------------------------------------------------
  // Events
  // -----------------------------------------------------------------------
  function renderEvents() {
    const db = CMDB.raw();
    setHTML('eventsTbody', db.events.map(ev => `
      <tr class="clickable" data-event-open="${esc(ev.id)}">
        <td><strong>${esc(ev.title)}</strong></td>
        <td>${esc(ev.date)}</td>
        <td>${esc(ev.venue)}</td>
        <td>${(ev.registrations || []).length}</td>
      </tr>
    `).join(''));
    document.querySelectorAll('[data-event-open]').forEach(tr => {
      tr.addEventListener('click', () => openEventDetail(tr.dataset.eventOpen));
    });
  }

  function openEventDetail(id) {
    const ev = CMDB.getEvent(id);
    if (!ev) return;
    const regs = ev.registrations || [];
    setHTML('eventDetailPanel', `
      <div class="admin-panel">
        <div style="display:flex; justify-content:space-between; align-items:start; gap:10px; flex-wrap:wrap;">
          <h3>📋 ${esc(ev.title)} — नोंदणीकृत सदस्य (${regs.length})</h3>
          <span class="admin-close-x" id="closeEventPanel">✕ बंद करा</span>
        </div>
        <div style="margin-top:10px;">
          ${regs.length ? regs.map(r => `
            <div style="padding:7px 0; border-bottom:1px solid var(--line); font-size:0.85rem;">
              <strong>${esc(r.name)}</strong> · ${esc(r.phone || '-')} · ${esc(r.city || '-')} <span style="color:var(--muted);">(तिकीट: ${esc(r.ticketId)})</span>
            </div>
          `).join('') : '<div style="color:var(--muted); font-size:0.85rem;">अद्याप कोणतीही नोंदणी नाही.</div>'}
        </div>
      </div>
    `);
    document.getElementById('closeEventPanel').addEventListener('click', () => {
      setHTML('eventDetailPanel', '');
    });
  }

  // -----------------------------------------------------------------------
  // Reports / Moderation
  // -----------------------------------------------------------------------
  const REPORT_STATUSES = ['प्रलंबित', 'तपासणी सुरू', 'निकाली काढले', 'नाकारले'];

  function renderReports() {
    const db = CMDB.raw();
    setHTML('reportsTbody', db.reports.map(r => `
      <tr>
        <td>${esc(r.type)}</td>
        <td>${esc(r.targetLabel || r.targetId)}</td>
        <td>${esc(r.reason)}</td>
        <td><span class="admin-badge ${r.status === 'प्रलंबित' ? 'warn' : 'ok'}">${esc(r.status)}</span></td>
        <td>
          <select class="admin-select" data-report-status="${esc(r.id)}">
            ${REPORT_STATUSES.map(s => `<option ${r.status === s ? 'selected' : ''}>${s}</option>`).join('')}
          </select>
        </td>
      </tr>
    `).join('') || `<tr><td colspan="5" style="text-align:center; color:var(--muted); padding:20px;">कोणत्याही तक्रारी नाहीत.</td></tr>`);

    document.querySelectorAll('[data-report-status]').forEach(sel => {
      sel.addEventListener('change', () => {
        CMDB.setReportStatus(sel.dataset.reportStatus, sel.value);
        CMDB.logAudit('update', 'report', sel.dataset.reportStatus, null, { status: sel.value });
        toast('तक्रार स्थिती अपडेट झाली.', 'success');
        renderDashboard();
      });
    });
  }

  // -----------------------------------------------------------------------
  // Audit Log
  // -----------------------------------------------------------------------
  function renderAudit() {
    const log = CMDB.getAuditLog();
    setHTML('auditList', log.map(a => `
      <div class="audit-row">
        <strong>${esc(a.who)}</strong> ${esc(a.action)}d <span class="admin-badge">${esc(a.entity)}</span> ${esc(a.entityId)}
        <span style="float:right; color:var(--muted);">${esc(CMDB.timeAgo(a.ts))}</span>
      </div>
    `).join('') || `<div class="audit-row" style="text-align:center; color:var(--muted);">अद्याप कोणतीही नोंद नाही.</div>`);
  }

  // -----------------------------------------------------------------------
  // Init
  // -----------------------------------------------------------------------
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.admin-nav-item[data-view]').forEach(a => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.hash = a.dataset.view;
      });
    });

    window.addEventListener('hashchange', () => {
      const view = currentViewFromHash();
      if (!roleViewAccess(adminRoleMode, view)) {
        window.location.hash = 'dashboard';
        return;
      }
      showView(view);
    });

    document.getElementById('memberSearch').addEventListener('input', (e) => { memberQuery = e.target.value.trim(); renderMembers(); });
    document.getElementById('memberSort').addEventListener('change', (e) => { memberSortKey = e.target.value; renderMembers(); });
    document.getElementById('bizSearch').addEventListener('input', (e) => { bizQuery = e.target.value.trim(); renderBusinesses(); });
    if (document.getElementById('chapterSearch')) document.getElementById('chapterSearch').addEventListener('input', (e) => { chapterQuery = e.target.value.trim(); renderChapters(); });
    if (document.getElementById('oppSearch')) document.getElementById('oppSearch').addEventListener('input', (e) => { oppQuery = e.target.value.trim(); renderOpportunities(); });
    if (document.getElementById('oppStatusFilter')) document.getElementById('oppStatusFilter').addEventListener('change', (e) => { oppStatusFilter = e.target.value; renderOpportunities(); });
    if (document.getElementById('meetingSearch')) document.getElementById('meetingSearch').addEventListener('input', (e) => { meetingQuery = e.target.value.trim(); renderMeetings(); });
    if (document.getElementById('applicationSearch')) document.getElementById('applicationSearch').addEventListener('input', (e) => { applicationQuery = e.target.value.trim(); renderApplications(); });
    if (document.getElementById('applicationStatusFilter')) document.getElementById('applicationStatusFilter').addEventListener('change', (e) => { applicationStatusFilter = e.target.value; renderApplications(); });
    if (document.getElementById('subscriptionSearch')) document.getElementById('subscriptionSearch').addEventListener('input', (e) => { subscriptionQuery = e.target.value.trim(); renderSubscriptions(); });
    if (document.getElementById('subscriptionStatusFilter')) document.getElementById('subscriptionStatusFilter').addEventListener('change', (e) => { subscriptionStatusFilter = e.target.value; renderSubscriptions(); });
    if (document.getElementById('subscriptionTypeFilter')) document.getElementById('subscriptionTypeFilter').addEventListener('change', (e) => { subscriptionTypeFilter = e.target.value; renderSubscriptions(); });
    if (document.getElementById('donationSearch')) document.getElementById('donationSearch').addEventListener('input', (e) => { donationQuery = e.target.value.trim(); renderDonations(); });
    if (document.getElementById('donationCityFilter')) document.getElementById('donationCityFilter').addEventListener('change', (e) => { donationCityFilter = e.target.value; renderDonations(); });
    if (document.getElementById('expenseSearch')) document.getElementById('expenseSearch').addEventListener('input', (e) => { expenseQuery = e.target.value.trim(); renderExpenses(); });
    if (document.getElementById('expenseCategoryFilter')) document.getElementById('expenseCategoryFilter').addEventListener('change', (e) => { expenseCategoryFilter = e.target.value; renderExpenses(); });
    if (document.getElementById('commissionSearch')) document.getElementById('commissionSearch').addEventListener('input', (e) => { commissionQuery = e.target.value.trim(); renderCommissions(); });
    if (document.getElementById('commissionStatusFilter')) document.getElementById('commissionStatusFilter').addEventListener('change', (e) => { commissionStatusFilter = e.target.value; renderCommissions(); });
    if (document.getElementById('intelSearch')) document.getElementById('intelSearch').addEventListener('input', (e) => { intelQuery = e.target.value.trim(); renderMemberIntelligence(); });
    if (document.getElementById('intelState')) document.getElementById('intelState').addEventListener('change', (e) => { intelStateFilter = e.target.value; renderMemberIntelligence(); });
    if (document.getElementById('intelDistrict')) document.getElementById('intelDistrict').addEventListener('change', (e) => { intelDistrictFilter = e.target.value; renderMemberIntelligence(); });
    if (document.getElementById('intelCity')) document.getElementById('intelCity').addEventListener('change', (e) => { intelCityFilter = e.target.value; renderMemberIntelligence(); });
    if (document.getElementById('intelInterest')) document.getElementById('intelInterest').addEventListener('change', (e) => { intelInterestFilter = e.target.value; renderMemberIntelligence(); });
    if (document.getElementById('intelProfession')) document.getElementById('intelProfession').addEventListener('change', (e) => { intelProfessionFilter = e.target.value; renderMemberIntelligence(); });
    if (document.getElementById('financeApplyBtn')) document.getElementById('financeApplyBtn').addEventListener('click', () => {
      financeFilters.query = document.getElementById('financeSearch').value.trim();
      financeFilters.quick = document.getElementById('financeQuick').value;
      financeFilters.month = document.getElementById('financeMonth').value;
      financeFilters.year = document.getElementById('financeYear').value;
      financeFilters.state = document.getElementById('financeState').value;
      financeFilters.city = document.getElementById('financeCity').value;
      financeFilters.direction = document.getElementById('financeDirection').value;
      financeFilters.type = document.getElementById('financeType').value;
      financeFilters.paymentStatus = document.getElementById('financePaymentStatus').value;
      financeFilters.amountRange = document.getElementById('financeAmountRange').value;
      renderFinance();
      renderIncome();
      renderAnalytics();
    });
    if (document.getElementById('financeClearBtn')) document.getElementById('financeClearBtn').addEventListener('click', () => {
      ['financeSearch','financeQuick','financeMonth','financeYear','financeState','financeCity','financeDirection','financeType','financePaymentStatus','financeAmountRange'].forEach(id => {
        const el = document.getElementById(id); if (el) el.value = '';
      });
      Object.keys(financeFilters).forEach(k => financeFilters[k] = '');
      renderFinance();
      renderIncome();
      renderAnalytics();
    });
    if (document.getElementById('financeSaveFilterBtn')) document.getElementById('financeSaveFilterBtn').addEventListener('click', () => {
      const conditions = Object.entries(financeFilters).filter(([, v]) => v).map(([k, v]) => `${k} = ${v}`);
      CMDB.saveFilter('finance', `Finance Filter ${new Date().toLocaleTimeString('en-IN')}`, conditions);
      toast('Finance filter saved.', 'success');
      renderSavedFilters();
    });

    bindOppForm();
    bindLeadForm();
    bindSevaForm();
    bindVolForm();

    const roleSelect = document.getElementById('adminRoleMode');
    if (roleSelect) {
      roleSelect.addEventListener('change', (e) => {
        adminRoleMode = e.target.value;
        applyRoleMode();
        const current = currentViewFromHash();
        if (!roleViewAccess(adminRoleMode, current)) {
          window.location.hash = 'dashboard';
        } else {
          showView(current);
        }
        toast(`Role mode switched to ${adminRoleMode}.`, 'info');
      });
    }

    document.getElementById('adminRefreshBtn').addEventListener('click', () => {
      renderView(currentViewFromHash());
      toast('डेटा रिफ्रेश झाला.', 'info');
    });

    applyRoleMode();
    const initialView = currentViewFromHash();
    if (!roleViewAccess(adminRoleMode, initialView)) {
      window.location.hash = 'dashboard';
    } else {
      showView(initialView);
    }
  });
})();
