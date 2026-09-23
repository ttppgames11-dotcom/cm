/**
 * Connect Maratha — Community, Member Portal, Business, Donation & Events wiring
 * Reads/writes through CMDB (assets/js/cm-data.js). Loaded on every page,
 * each block below only activates when its target elements exist on the page.
 */

document.addEventListener('DOMContentLoaded', () => {
  if (!window.CMDB) return;

  // =====================================================================
  // Reusable bits
  // =====================================================================
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function sanitizeHTML(html) {
    if (typeof html !== 'string') return '';
    return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
               .replace(/\s*on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');
  }

  function setHTML(target, html) {
    const el = typeof target === 'string' ? document.getElementById(target) : target;
    if (!el) return;
    if (!html) {
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

  function qrImg(data, size) {
    size = size || 150;
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}`;
  }

  // ---------------------------------------------------------------------
  // Reusable report modal — any element with data-report="type|id|label"
  // ---------------------------------------------------------------------
  function ensureReportModal() {
    let modal = document.getElementById('cmReportModal');
    if (modal) return modal;
    modal = document.createElement('div');
    modal.className = 'cm-modal';
    modal.id = 'cmReportModal';setHTML(modal, `
      <div class="cm-modal-box">
        <div class="cm-modal-header">
          <h3>🚩 तक्रार नोंदवा (Report)</h3>
          <button type="button" class="cm-modal-close">✕</button>
        </div>
        <form id="cmReportForm">
          <div class="cm-modal-body">
            <div id="cmReportTarget" style="font-weight:700; color:var(--maroon-950); margin-bottom:10px;"></div>
            <label>कारण निवडा:</label>
            <select id="cmReportReason">
              <option>अयोग्य / आक्षेपार्ह मजकूर</option>
              <option>फसवी जाहिरात / स्पॅम</option>
              <option>खोटी माहिती</option>
              <option>छळ / गैरवर्तन</option>
              <option>इतर</option>
            </select>
            <label>सविस्तर माहिती (ऐच्छिक):</label>
            <textarea id="cmReportDetail" rows="3" placeholder="अधिक तपशील येथे लिहा..."></textarea>
          </div>
          <div class="cm-modal-footer">
            <button type="button" class="btn btn-outline" id="cmReportCancel">रद्द करा</button>
            <button type="submit" class="btn btn-primary">तक्रार सबमिट करा</button>
          </div>
        </form>
      </div>`);
    document.body.appendChild(modal);
    const close = () => modal.classList.remove('open');
    modal.querySelector('.cm-modal-close').addEventListener('click', close);
    modal.querySelector('#cmReportCancel').addEventListener('click', close);
    modal.addEventListener('click', e => { if (e.target === modal) close(); });
    modal.querySelector('#cmReportForm').addEventListener('submit', e => {
      e.preventDefault();
      const type = modal.dataset.type, id = modal.dataset.id, label = modal.dataset.label;
      const reason = modal.querySelector('#cmReportReason').value + (modal.querySelector('#cmReportDetail').value.trim() ? ' — ' + modal.querySelector('#cmReportDetail').value.trim() : '');
      CMDB.fileReport(type, id, label, reason);
      close();
      toast('तक्रार नोंदवली गेली. आमची टीम समीक्षा करेल.', 'info');
    });
    return modal;
  }

  document.addEventListener('click', e => {
    const trigger = e.target.closest('[data-report]');
    if (!trigger) return;
    e.preventDefault();
    const [type, id, label] = trigger.dataset.report.split('|');
    const modal = ensureReportModal();
    modal.dataset.type = type;
    modal.dataset.id = id;
    modal.dataset.label = label;
    modal.querySelector('#cmReportTarget').textContent = `तक्रारीचा विषय: ${label}`;
    modal.classList.add('open');
  });

  // =====================================================================
  // 1. Member Directory (cm-directory-people.html)
  // =====================================================================
  const peopleGrid = document.querySelector('#peopleGrid');
  if (peopleGrid && document.querySelector('#cmPeopleSearch')) {
    const searchInput = document.querySelector('#cmPeopleSearch');
    const me = CMDB.currentMember();
    let currentFilter = 'all';

    function actionLabel(m) {
      if (CMDB.isConnected(m.id)) return { txt: '✓ Connected', cls: 'done' };
      return { txt: 'Connect करा', cls: '' };
    }

    function followLabel(m) {
      if (CMDB.isFollowing(m.id)) return { txt: '✓ Following', cls: 'btn-outline' };
      return { txt: '+ Follow', cls: 'btn-outline' };
    }

    function getFilteredMembers() {
      const queryText = (searchInput ? searchInput.value : '').trim();
      let list = CMDB.searchMembers(queryText);
      const cityMap = { pune: 'पुणे', mumbai: 'मुंबई', nashik: 'नाशिक' };
      if (cityMap[currentFilter]) {
        list = list.filter(m => m.city === cityMap[currentFilter]);
      } else if (currentFilter === 'outside') {
        list = list.filter(m => m.state !== 'महाराष्ट्र');
      }
      return list;
    }

    function renderPeople() {
      const list = getFilteredMembers();
      setHTML(peopleGrid, '');
      const otherMembers = list.filter(m => m.id !== me.id);
      if (!otherMembers.length) {
        setHTML(peopleGrid, `
          <div style="grid-column: 1 / -1; text-align: center; padding: 36px 20px; background: var(--paper-2); border-radius: var(--radius); border: 1px dashed var(--line);">
            <div style="font-size:2.4rem; margin-bottom:10px;">🔍</div>
            <h3 style="margin-bottom:6px; color:var(--maroon-950);">कोणताही सदस्य सापडला नाही</h3>
            <p style="font-size:0.9rem; color:var(--muted); margin-bottom:14px;">तुमच्या शोध निकषांशी जुळणारे सदस्य उपलब्ध नाहीत.</p>
            <button id="cmResetSearchBtn" class="btn btn-outline" style="padding:6px 16px; font-size:0.85rem;">सर्व सदस्य पाहा</button>
          </div>
        `);
        const resetBtn = peopleGrid.querySelector('#cmResetSearchBtn');
        if (resetBtn) {
          resetBtn.addEventListener('click', () => {
            if (searchInput) searchInput.value = '';
            currentFilter = 'all';
            document.querySelectorAll('.tabs[data-tabs="#peopleGrid"] .tab').forEach(t => {
              t.classList.toggle('active', t.dataset.filter === 'all');
            });
            renderPeople();
          });
        }
        return;
      }

      otherMembers.forEach(m => {
        const card = document.createElement('div');
        card.className = 'profile-card';
        card.dataset.name = m.name;
        const act = actionLabel(m);
        const flw = followLabel(m);
        const isVer = m.verified && (m.verified.profile || m.verified.mobile);
        const skillsPreview = (m.skills || []).slice(0, 2).map(s => `<span class="tag" style="font-size:0.7rem; padding:2px 6px;">${esc(s)}</span>`).join(' ');

        setHTML(card, `
          <div>
            <a href="cm-profile.html?id=${encodeURIComponent(m.id)}" style="text-decoration:none; color:inherit;">
              <div class="avatar">${m.avatar || m.name.charAt(0)}</div>
              <div class="name">
                ${esc(m.name)} ${isVer ? '<span title="पडताळलेले सदस्य" style="color:var(--success); font-size:0.85rem;">✔</span>' : ''}
              </div>
              ${m.tier ? `<span class="tier-badge">${esc(m.tier)} सदस्य</span>` : ''}
              <div class="role">${esc(m.profession || 'सदस्य')} ${m.business ? '· ' + esc(m.business) : ''} · 📍 ${esc(m.city)}</div>
              ${skillsPreview ? `<div class="tag-list" style="justify-content:center; margin-bottom:8px;">${skillsPreview}</div>` : ''}
            </a>
          </div>
          <div>
            <div style="display:flex; gap:6px; margin-top:8px;">
              <button class="cta cm-connect-btn ${act.cls}" data-id="${m.id}" style="flex:1; border:none; margin-top:0;">${act.txt}</button>
              <button class="btn ${flw.cls} cm-follow-btn" data-id="${m.id}" style="padding:6px 10px; font-size:0.78rem;">${flw.txt}</button>
            </div>
            <div style="margin-top:10px; display:flex; gap:12px; justify-content:center; font-size:0.78rem;">
              <a href="cm-messages.html?to=${encodeURIComponent(m.id)}" style="color:var(--saffron-700); font-weight:700;">💬 संदेश</a>
              <span data-report="profile|${m.id}|${esc(m.name)}" style="color:var(--muted); cursor:pointer;">🚩 तक्रार</span>
            </div>
          </div>
        `);
        peopleGrid.appendChild(card);
      });
    }

    renderPeople();

    if (searchInput) {
      searchInput.addEventListener('input', renderPeople);
    }
    const searchBtn = document.querySelector('#cmPeopleSearchBtn');
    if (searchBtn) {
      searchBtn.addEventListener('click', renderPeople);
    }

    document.querySelectorAll('.tabs[data-tabs="#peopleGrid"] .tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.tabs[data-tabs="#peopleGrid"] .tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentFilter = tab.dataset.filter || 'all';
        renderPeople();
      });
    });

    peopleGrid.addEventListener('click', e => {
      const connBtn = e.target.closest('.cm-connect-btn');
      if (connBtn) {
        const nowConnected = CMDB.toggleConnect(connBtn.dataset.id);
        toast(nowConnected ? 'Connect विनंती पाठवली!' : 'Connect रद्द केले.', nowConnected ? 'success' : 'info');
        renderPeople();
        return;
      }
      const flwBtn = e.target.closest('.cm-follow-btn');
      if (flwBtn) {
        const nowFollowed = CMDB.toggleFollow(flwBtn.dataset.id);
        toast(nowFollowed ? 'Follow केले!' : 'Unfollow केले.', nowFollowed ? 'success' : 'info');
        renderPeople();
        return;
      }
    });
  }

  // =====================================================================
  // 2. Profile page (cm-profile.html)
  // =====================================================================
  const profileRoot = document.querySelector('#cmProfileRoot');
  if (profileRoot) {
    const params = new URLSearchParams(window.location.search);
    const targetId = params.get('id') || CMDB.currentUserId();
    const isMe = targetId === CMDB.currentUserId();
    const m = isMe ? CMDB.currentMember() : CMDB.getMember(targetId);

    if (!m) {setHTML(profileRoot, '<div class="notice">सदस्य सापडला नाही.</div>');
    } else {
      const verifiedBadges = [
        m.verified && m.verified.mobile ? '✔ मोबाईल पडताळणी' : '',
        m.verified && m.verified.email ? '✔ ईमेल पडताळणी' : '',
        m.verified && m.verified.profile ? '✔ प्रोफाईल पडताळणी' : ''
      ].filter(Boolean).join(' &nbsp; ');setHTML(profileRoot, `
        <div class="feature-card" style="height:auto; padding:24px; display:flex; gap:20px; flex-wrap:wrap; align-items:center;">
          <div style="font-size:3.2rem; width:88px; height:88px; border-radius:50%; background:var(--paper-2); display:flex; align-items:center; justify-content:center; border:2px solid var(--gold-400);">${m.avatar || m.name.charAt(0)}</div>
          <div style="flex:1; min-width:220px;">
            <h2 style="margin:0;">${esc(m.name)} ${isMe ? '<span style="font-size:0.8rem; color:var(--saffron-700);">(तुम्ही)</span>' : ''}</h2>
            <div class="muted" style="margin:4px 0;">${esc(m.profession || 'सदस्य')} ${m.business ? '· ' + esc(m.business) : ''}</div>
            <div class="muted" style="font-size:0.85rem;">📍 ${esc(m.city)}, ${esc(m.district)}, ${esc(m.state)}, ${esc(m.country)} · 🗣️ ${esc(m.lang)}</div>
            <div style="font-size:0.78rem; color:var(--success); font-weight:600; margin-top:6px;">${verifiedBadges}</div>
          </div>
          <div id="cmProfileActions" style="display:flex; gap:8px; flex-wrap:wrap;"></div>
        </div>

        <div class="grid grid-2" style="margin-top:20px; align-items:start;">
          <div class="info-box-card">
            <h4>माझ्याबद्दल</h4>
            <p>${esc(m.about) || '<span class="muted">माहिती उपलब्ध नाही.</span>'}</p>
          </div>
          <div class="info-box-card">
            <h4>शिक्षण व कौशल्ये</h4>
            <p><strong>शिक्षण:</strong> ${esc(m.education) || '-'}</p>
            <div class="tag-list">${(m.skills || []).map(s => `<span class="tag">${esc(s)}</span>`).join('') || '<span class="muted">नमूद नाही</span>'}</div>
          </div>
          <div class="info-box-card">
            <h4>आवडीचे विषय</h4>
            <div class="tag-list">${(m.interests || []).map(s => `<span class="tag">${esc(s)}</span>`).join('') || '<span class="muted">नमूद नाही</span>'}</div>
          </div>
          <div class="info-box-card">
            <h4>स्वयंसेवा आवड</h4>
            <div class="tag-list">${(m.volunteer || []).map(s => `<span class="tag">${esc(s)}</span>`).join('') || '<span class="muted">नमूद नाही</span>'}</div>
          </div>
        </div>

        <div class="stat-strip" style="margin-top:20px;">
          <div class="cell"><div class="num">${(m.connections || []).length}</div><div class="lbl">Connections</div></div>
          <div class="cell"><div class="num">${(m.followers || []).length}</div><div class="lbl">Followers</div></div>
          <div class="cell"><div class="num">${(m.following || []).length}</div><div class="lbl">Following</div></div>
          <div class="cell"><div class="num">${esc(m.tier)}</div><div class="lbl">सदस्यत्व</div></div>
        </div>
      `);

      const actions = profileRoot.querySelector('#cmProfileActions');
      if (isMe) {setHTML(actions, `<a href="cm-profile-edit.html" class="btn btn-primary" style="padding:8px 16px; font-size:0.85rem;">✎ प्रोफाईल संपादित करा</a>`);
      } else {
        const connected = CMDB.isConnected(m.id);
        const following = CMDB.isFollowing(m.id);setHTML(actions, `
          <button class="btn ${connected ? 'btn-outline' : 'btn-primary'}" id="cmActConnect" style="padding:8px 16px; font-size:0.85rem;">${connected ? '✓ Connected' : 'Connect करा'}</button>
          <button class="btn btn-outline" id="cmActFollow" style="padding:8px 16px; font-size:0.85rem;">${following ? '✓ Following' : '+ Follow'}</button>
          <a href="cm-messages.html?to=${encodeURIComponent(m.id)}" class="btn btn-outline" style="padding:8px 16px; font-size:0.85rem;">💬 संदेश पाठवा</a>
          <span class="btn btn-outline" data-report="profile|${m.id}|${esc(m.name)}" style="padding:8px 16px; font-size:0.85rem; color:var(--danger); border-color:var(--danger); cursor:pointer;">🚩 Report</span>
        `);
        actions.querySelector('#cmActConnect').addEventListener('click', () => {
          const now = CMDB.toggleConnect(m.id);
          toast(now ? 'Connect विनंती पाठवली!' : 'Connect रद्द केले.');
          window.location.reload();
        });
        actions.querySelector('#cmActFollow').addEventListener('click', () => {
          const now = CMDB.toggleFollow(m.id);
          toast(now ? 'Follow केले!' : 'Unfollow केले.');
          window.location.reload();
        });
      }
    }
  }

  // Profile edit form (cm-profile-edit.html)
  const editForm = document.querySelector('#cmProfileEditForm');
  if (editForm) {
    const m = CMDB.currentMember();
    const setVal = (sel, val) => { const el = editForm.querySelector(sel); if (el) el.value = val || ''; };
    setVal('#peName', m.name); setVal('#peCity', m.city); setVal('#peDistrict', m.district);
    setVal('#peState', m.state); setVal('#peCountry', m.country); setVal('#peLang', m.lang);
    setVal('#peProfession', m.profession); setVal('#peBusiness', m.business);
    setVal('#peSkills', (m.skills || []).join(', '));
    setVal('#peEducation', m.education);
    setVal('#peInterests', (m.interests || []).join(', '));
    setVal('#peAbout', m.about);
    setVal('#peVolunteer', (m.volunteer || []).join(', '));
    setVal('#peSocial', Object.values(m.social || {}).join(', '));

    editForm.addEventListener('submit', e => {
      e.preventDefault();
      CMDB.upsertCurrentMember({
        name: editForm.querySelector('#peName').value.trim() || m.name,
        city: editForm.querySelector('#peCity').value.trim(),
        district: editForm.querySelector('#peDistrict').value.trim(),
        state: editForm.querySelector('#peState').value.trim(),
        country: editForm.querySelector('#peCountry').value.trim(),
        lang: editForm.querySelector('#peLang').value.trim(),
        profession: editForm.querySelector('#peProfession').value.trim(),
        business: editForm.querySelector('#peBusiness').value.trim(),
        skills: editForm.querySelector('#peSkills').value.split(',').map(s => s.trim()).filter(Boolean),
        education: editForm.querySelector('#peEducation').value.trim(),
        interests: editForm.querySelector('#peInterests').value.split(',').map(s => s.trim()).filter(Boolean),
        about: editForm.querySelector('#peAbout').value.trim(),
        volunteer: editForm.querySelector('#peVolunteer').value.split(',').map(s => s.trim()).filter(Boolean),
        verified: Object.assign({}, m.verified, { profile: true })
      });
      localStorage.setItem('cm_user_name', editForm.querySelector('#peName').value.trim() || m.name);
      localStorage.setItem('cm_user_city', editForm.querySelector('#peCity').value.trim());
      toast('प्रोफाईल यशस्वीरीत्या अद्ययावत झाले!', 'success');
      setTimeout(() => { window.location.href = 'cm-profile.html'; }, 800);
    });
  }

  // =====================================================================
  // 3. Messages (cm-messages.html)
  // =====================================================================
  const msgRoot = document.querySelector('#cmMessagesRoot');
  if (msgRoot) {
    const listEl = msgRoot.querySelector('#cmConvList');
    const threadEl = msgRoot.querySelector('#cmThread');
    const params = new URLSearchParams(window.location.search);
    let activeTarget = params.get('to') || null;

    function otherPartyId(conv) {
      return conv.participants.find(p => p !== 'ME' && p !== CMDB.currentUserId());
    }

    function renderList() {
      const convs = CMDB.getConversations();
      // ensure a conversation exists for activeTarget so it shows immediately
      if (activeTarget) CMDB.getOrCreateConversation(activeTarget);
      const all = CMDB.getConversations();setHTML(listEl, '');
      if (!all.length) {setHTML(listEl, '<div class="notice">अद्याप कोणतेही संभाषण नाही.</div>');
        return;
      }
      all.forEach(conv => {
        const otherId = otherPartyId(conv);
        const other = CMDB.getMember(otherId) || { name: otherId, avatar: '👤' };
        const last = conv.messages[conv.messages.length - 1];
        const row = document.createElement('div');
        row.className = 'list-row cm-conv-row';
        row.dataset.id = otherId;
        row.style.cursor = 'pointer';
        row.style.marginBottom = '8px';
        if (otherId === activeTarget) row.style.borderColor = 'var(--gold-500)';setHTML(row, `
          <div class="thumb">${other.avatar || '👤'}</div>
          <div class="content">
            <h4 style="font-size:0.95rem;">${esc(other.name)}</h4>
            <div class="meta" style="font-size:0.78rem;">${last ? esc(last.text).slice(0, 40) : 'संभाषण सुरू करा'}</div>
          </div>
        `);
        listEl.appendChild(row);
      });
      if (!activeTarget && all.length) activeTarget = otherPartyId(all[0]);
    }

    function renderThread() {
      if (!activeTarget) {setHTML(threadEl, '<div class="notice">डावीकडून संभाषण निवडा.</div>');
        return;
      }
      const other = CMDB.getMember(activeTarget) || { name: activeTarget, avatar: '👤' };
      const conv = CMDB.getOrCreateConversation(activeTarget);setHTML(threadEl, `
        <div style="display:flex; align-items:center; gap:10px; padding-bottom:12px; border-bottom:1px solid var(--line); margin-bottom:12px;">
          <div style="font-size:1.6rem;">${other.avatar || '👤'}</div>
          <div>
            <a href="cm-profile.html?id=${encodeURIComponent(other.id || activeTarget)}" style="font-weight:700; color:var(--maroon-950);">${esc(other.name)}</a>
            <div class="muted" style="font-size:0.8rem;">${esc(other.city || '')}</div>
          </div>
        </div>
        <div id="cmThreadStream" style="height:320px; overflow-y:auto; display:flex; flex-direction:column; gap:10px; padding:6px;"></div>
        <form id="cmThreadForm" style="display:flex; gap:8px; margin-top:12px;">
          <input type="text" id="cmThreadInput" placeholder="संदेश टाईप करा..." style="margin-bottom:0; flex:1;">
          <button type="submit" class="btn btn-primary" style="padding:8px 18px;">पाठवा ✈️</button>
        </form>
      `);
      const stream = threadEl.querySelector('#cmThreadStream');
      conv.messages.forEach(msg => {
        const mine = msg.from === 'ME' || msg.from === CMDB.currentUserId();
        const bubble = document.createElement('div');
        bubble.style.cssText = `align-self:${mine ? 'flex-end' : 'flex-start'}; background:${mine ? 'var(--gold-400)' : '#fff'}; color:${mine ? 'var(--maroon-950)' : 'inherit'}; border:1px solid var(--line); border-radius:10px; padding:8px 12px; max-width:75%; font-size:0.85rem;`;
        bubble.textContent = msg.text;
        stream.appendChild(bubble);
      });
      stream.scrollTop = stream.scrollHeight;

      threadEl.querySelector('#cmThreadForm').addEventListener('submit', e => {
        e.preventDefault();
        const input = threadEl.querySelector('#cmThreadInput');
        const text = input.value.trim();
        if (!text) return;
        CMDB.sendMessage(activeTarget, text);
        input.value = '';
        renderThread();
        renderList();
        setTimeout(() => {
          CMDB.simulateReply(activeTarget, 'आपला संदेश मिळाला! लवकरच सविस्तर उत्तर देतो. 🙏');
          renderThread();
          renderList();
        }, 900);
      });
    }

    listEl.addEventListener('click', e => {
      const row = e.target.closest('.cm-conv-row');
      if (!row) return;
      activeTarget = row.dataset.id;
      renderList();
      renderThread();
    });

    renderList();
    renderThread();
  }

  // =====================================================================
  // 4. Community feed (cm-community.html / feed section on directory page)
  // =====================================================================
  const feedRoot = document.querySelector('#cmFeedRoot');
  if (feedRoot) {
    function renderFeed() {
      const posts = CMDB.getFeedPosts();setHTML(feedRoot, '');
      posts.forEach(p => feedRoot.appendChild(renderPostCard(p)));
    }

    function renderPostCard(p) {
      const author = CMDB.getMember(p.authorId) || { name: 'सदस्य', avatar: '👤' };
      const liked = (p.likes || []).includes(CMDB.currentUserId());
      const el = document.createElement('div');
      el.className = 'info-box-card';
      el.style.marginBottom = '14px';setHTML(el, `
        <div style="display:flex; gap:10px; align-items:center; margin-bottom:8px;">
          <div style="font-size:1.6rem;">${author.avatar || '👤'}</div>
          <div>
            <a href="cm-profile.html?id=${encodeURIComponent(p.authorId)}" style="font-weight:700; color:var(--maroon-950);">${esc(author.name)}</a>
            <div class="muted" style="font-size:0.76rem;">${CMDB.timeAgo(p.ts)}</div>
          </div>
        </div>
        <p style="margin-bottom:10px;">${esc(p.text)}</p>
        <div style="display:flex; gap:16px; font-size:0.85rem; border-top:1px solid var(--line); padding-top:8px;">
          <span class="cm-like-btn" data-id="${p.id}" style="cursor:pointer; color:${liked ? 'var(--danger)' : 'var(--muted)'}; font-weight:600;">❤️ ${(p.likes || []).length} Like</span>
          <span class="cm-comment-toggle" data-id="${p.id}" style="cursor:pointer; color:var(--muted); font-weight:600;">💬 ${(p.comments || []).length} Comment</span>
          <span style="cursor:pointer; color:var(--muted); font-weight:600;" onclick="navigator.share ? navigator.share({title:'Connect Maratha', text: this.dataset.text}) : (function(){})();" data-text="${esc(p.text)}">🔗 Share</span>
          <span data-report="post|${p.id}|समुदाय पोस्ट" style="cursor:pointer; color:var(--muted); font-weight:600; margin-left:auto;">🚩</span>
        </div>
        <div class="cm-comments" data-id="${p.id}" style="display:none; margin-top:10px; border-top:1px dashed var(--line); padding-top:10px;">
          ${(p.comments || []).map(c => {
            const cAuthor = CMDB.getMember(c.authorId) || { name: 'सदस्य' };
            return `<div style="font-size:0.82rem; margin-bottom:6px;"><strong>${esc(cAuthor.name)}:</strong> ${esc(c.text)}</div>`;
          }).join('')}
          <form class="cm-comment-form" data-id="${p.id}" style="display:flex; gap:8px; margin-top:8px;">
            <input type="text" placeholder="टिप्पणी लिहा..." style="margin-bottom:0; flex:1; font-size:0.85rem;">
            <button type="submit" class="btn btn-outline" style="padding:6px 14px; font-size:0.8rem;">पाठवा</button>
          </form>
        </div>
      `);
      return el;
    }

    feedRoot.addEventListener('click', e => {
      const like = e.target.closest('.cm-like-btn');
      if (like) {
        CMDB.togglePostLike(like.dataset.id);
        renderFeed();
        return;
      }
      const toggle = e.target.closest('.cm-comment-toggle');
      if (toggle) {
        const box = feedRoot.querySelector(`.cm-comments[data-id="${toggle.dataset.id}"]`);
        if (box) box.style.display = box.style.display === 'none' ? 'block' : 'none';
      }
    });

    feedRoot.addEventListener('submit', e => {
      const form = e.target.closest('.cm-comment-form');
      if (!form) return;
      e.preventDefault();
      const input = form.querySelector('input');
      if (!input.value.trim()) return;
      CMDB.addComment(form.dataset.id, input.value.trim());
      renderFeed();
    });

    const postForm = document.querySelector('#cmNewPostForm');
    if (postForm) {
      postForm.addEventListener('submit', e => {
        e.preventDefault();
        const input = postForm.querySelector('#cmNewPostText');
        if (!input.value.trim()) return;
        CMDB.addFeedPost(input.value.trim());
        input.value = '';
        renderFeed();
        toast('पोस्ट प्रकाशित झाली!', 'success');
      });
    }

    renderFeed();
  }

  // =====================================================================
  // 5. Groups list (cm-groups.html) — supports one or more grids, each
  //    optionally scoped to a group type via [data-type]
  // =====================================================================
  document.querySelectorAll('[id^="cmGroupGrid"]').forEach(grid => {
    function renderGroups() {
      const type = grid.dataset.type || null;
      const groups = CMDB.raw().groups.filter(g => !type || g.type === type);setHTML(grid, '');
      groups.forEach(g => {
        const joined = CMDB.isGroupMember(g.id);
        const card = document.createElement('div');
        card.className = 'info-box-card';setHTML(card, `
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <span class="tag" style="background:var(--maroon-900); color:var(--gold-300);">${esc(g.category)}</span>
            <span class="muted" style="font-size:0.75rem;">${(g.members || []).length} सदस्य</span>
          </div>
          <h4 style="margin:0 0 6px;">${g.cover || ''} ${esc(g.name)}</h4>
          <p class="muted" style="font-size:0.84rem; margin-bottom:12px;">${esc(g.desc)}</p>
          <div style="display:flex; gap:8px;">
            <a href="cm-group-detail.html?id=${encodeURIComponent(g.id)}" class="btn btn-outline" style="padding:6px 14px; font-size:0.8rem;">गट पाहा</a>
            <button class="btn ${joined ? 'btn-outline' : 'btn-primary'} cm-join-btn" data-id="${g.id}" style="padding:6px 14px; font-size:0.8rem;">${joined ? '✓ सामील' : 'सामील व्हा'}</button>
          </div>
        `);
        grid.appendChild(card);
      });
    }
    renderGroups();

    grid.addEventListener('click', e => {
      const btn = e.target.closest('.cm-join-btn');
      if (!btn) return;
      const joined = CMDB.toggleJoinGroup(btn.dataset.id);
      toast(joined ? 'तुम्ही गटात सामील झालात!' : 'तुम्ही गट सोडले.', joined ? 'success' : 'info');
      renderGroups();
    });
  });

  // =====================================================================
  // 6. Group detail (cm-group-detail.html)
  // =====================================================================
  const groupDetailRoot = document.querySelector('#cmGroupDetailRoot');
  if (groupDetailRoot) {
    const gid = new URLSearchParams(window.location.search).get('id');
    const g = CMDB.getGroup(gid);
    if (!g) {setHTML(groupDetailRoot, '<div class="notice">गट सापडला नाही.</div>');
    } else {
      function renderGroupDetail() {
        const joined = CMDB.isGroupMember(g.id);
        const posts = CMDB.getGroupPosts(g.id);setHTML(groupDetailRoot, `
          <div class="feature-card" style="height:auto; padding:22px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:14px;">
            <div>
              <span class="tag" style="background:var(--maroon-900); color:var(--gold-300);">${esc(g.category)}</span>
              <h2 style="margin:8px 0 4px;">${g.cover || ''} ${esc(g.name)}</h2>
              <p class="muted">${esc(g.desc)}</p>
              <div class="muted" style="font-size:0.82rem; margin-top:6px;">${(g.members || []).length} सदस्य ${g.district && g.district !== '-' ? '· 📍 ' + esc(g.district) : ''}</div>
            </div>
            <button class="btn ${joined ? 'btn-outline' : 'btn-primary'}" id="cmGroupJoinBtn" style="padding:8px 18px;">${joined ? '✓ सामील आहात' : 'गटात सामील व्हा'}</button>
          </div>

          ${joined ? `
          <form id="cmGroupPostForm" style="margin:20px 0;">
            <div class="form-card" style="padding:16px;">
              <textarea id="cmGroupPostText" rows="2" placeholder="गटासाठी काही शेअर करा..." style="margin-bottom:10px;"></textarea>
              <button type="submit" class="btn btn-primary" style="padding:8px 20px; font-size:0.85rem;">पोस्ट करा</button>
            </div>
          </form>` : `<div class="notice" style="margin:20px 0;">पोस्ट करण्यासाठी आधी गटात सामील व्हा.</div>`}

          <div id="cmGroupPosts"></div>
        `);

        const postsEl = groupDetailRoot.querySelector('#cmGroupPosts');
        if (!posts.length) {setHTML(postsEl, '<div class="notice">अद्याप कोणतीही पोस्ट नाही. पहिली पोस्ट तुम्ही करा!</div>');
        }
        posts.forEach(p => {
          const author = CMDB.getMember(p.authorId) || { name: 'सदस्य', avatar: '👤' };
          const liked = (p.likes || []).includes(CMDB.currentUserId());
          const card = document.createElement('div');
          card.className = 'info-box-card';
          card.style.marginBottom = '12px';setHTML(card, `
            <div style="display:flex; gap:10px; align-items:center; margin-bottom:8px;">
              <div style="font-size:1.4rem;">${author.avatar || '👤'}</div>
              <div>
                <a href="cm-profile.html?id=${encodeURIComponent(p.authorId)}" style="font-weight:700; color:var(--maroon-950);">${esc(author.name)}</a>
                <div class="muted" style="font-size:0.75rem;">${CMDB.timeAgo(p.ts)}</div>
              </div>
            </div>
            <p style="margin-bottom:8px;">${esc(p.text)}</p>
            <div style="display:flex; gap:14px; font-size:0.82rem; border-top:1px solid var(--line); padding-top:8px;">
              <span class="cm-gp-like" data-id="${p.id}" style="cursor:pointer; color:${liked ? 'var(--danger)' : 'var(--muted)'}; font-weight:600;">❤️ ${(p.likes || []).length}</span>
              <span class="muted">💬 ${(p.comments || []).length} टिप्पणी</span>
              <span data-report="post|${p.id}|गट पोस्ट" style="cursor:pointer; color:var(--muted); margin-left:auto;">🚩</span>
            </div>
          `);
          postsEl.appendChild(card);
        });

        const joinBtn = groupDetailRoot.querySelector('#cmGroupJoinBtn');
        joinBtn.addEventListener('click', () => {
          const now = CMDB.toggleJoinGroup(g.id);
          toast(now ? 'तुम्ही गटात सामील झालात!' : 'तुम्ही गट सोडले.');
          renderGroupDetail();
        });

        const postForm = groupDetailRoot.querySelector('#cmGroupPostForm');
        if (postForm) {
          postForm.addEventListener('submit', e => {
            e.preventDefault();
            const ta = groupDetailRoot.querySelector('#cmGroupPostText');
            if (!ta.value.trim()) return;
            CMDB.addGroupPost(g.id, ta.value.trim());
            renderGroupDetail();
          });
        }

        groupDetailRoot.querySelectorAll('.cm-gp-like').forEach(btn => {
          btn.addEventListener('click', () => { CMDB.togglePostLike(btn.dataset.id); renderGroupDetail(); });
        });
      }
      renderGroupDetail();
    }
  }

  // =====================================================================
  // 7. Business directory listing (cm-business-directory.html)
  // =====================================================================
  const bizGridDynamic = document.querySelector('#bizGrid[data-dynamic]');
  if (bizGridDynamic) {
    function renderBizGrid() {setHTML(bizGridDynamic, '');
      CMDB.raw().businesses.forEach(b => {
        const card = document.createElement('div');
        card.className = 'profile-card';
        card.dataset.cat = b.cat;
        card.dataset.name = b.name;setHTML(card, `
          <a href="cm-business-profile.html?id=${encodeURIComponent(b.id)}" style="text-decoration:none; color:inherit;">
            <div class="avatar">${b.photo || '🏢'}</div>
            <div class="name">${esc(b.name)}</div>
            <div class="role">${esc(b.owner)} · ${esc(b.city)} <span style="display:block; color:var(--gold-500); font-size:0.75rem;">⭐ ${b.rating || 5}</span></div>
            <span class="cta">प्रोफाईल पहा</span>
          </a>
        `);
        bizGridDynamic.appendChild(card);
      });
    }
    renderBizGrid();
  }

  // Business profile (cm-business-profile.html)
  const bizProfileRoot = document.querySelector('#cmBizProfileRoot');
  if (bizProfileRoot) {
    const bid = new URLSearchParams(window.location.search).get('id');
    const b = CMDB.getBusiness(bid);
    if (!b) {setHTML(bizProfileRoot, `
        <div class="biz-not-found">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <h3 style="margin:0 0 8px; color:var(--gray-700);">व्यवसाय सापडला नाही</h3>
          <p style="margin:0;">हे व्यवसाय अस्तित्वात नाही किंवा हटवले गेले आहे.</p>
          <a href="cm-business-directory.html" class="btn btn-primary" style="margin-top:16px; display:inline-flex;">← निर्देशिकेवर परत जा</a>
        </div>`);
    } else {
      // Helper functions
      function getCategoryLabel(cat) {
        const labels = {
          restaurant: '🍽️ भोजनालय / कॅफे',
          it: '💻 IT आणि सॉफ्टवेअर',
          realestate: '🏠 रिअल एस्टेट',
          manufacturer: '🏭 उत्पादक',
          travel: '🚌 प्रवास आणि टूर्स',
          retail: '🛍️ रिटेल / दुकान',
          services: '🔧 सेवा',
          healthcare: '🏥 आरोग्य सेवा',
          education: '🎓 शिक्षण',
          finance: '💰 वित्त / बॅंकिंग',
          other: '📦 इतर'
        };
        return labels[cat] || cat;
      }

      function getCategoryIcon(cat) {
        const icons = {
          restaurant: '🍽️',
          it: '💻',
          realestate: '🏠',
          manufacturer: '🏭',
          travel: '🚌',
          retail: '🛍️',
          services: '🔧',
          healthcare: '🏥',
          education: '🎓',
          finance: '💰',
          other: '📦'
        };
        return icons[cat] || '🏢';
      }

      function isOpenNow(hours) {
        if (!hours) return null;
        const now = new Date();
        const day = now.getDay(); // 0 = Sunday
        const time = now.getHours() * 60 + now.getMinutes();
        // Simple check - in real app would parse hours string
        return null; // Unknown
      }

      function formatStars(rating) {
        const full = Math.floor(rating);
        const half = rating % 1 >= 0.5;
        const empty = 5 - full - (half ? 1 : 0);
        return '⭐'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
      }

      function renderBizProfile() {
        const me = CMDB.currentMember();
        const reviewCount = (b.reviews || []).length;
        const avgRating = reviewCount > 0
          ? (b.reviews.reduce((s, r) => s + r.rating, 0) / reviewCount).toFixed(1)
          : (b.rating || 5).toFixed(1);setHTML(bizProfileRoot, `
          <!-- Hero Section -->
          <div class="biz-hero">
            <div class="biz-hero-content">
              <div class="biz-hero-icon">${b.photo || getCategoryIcon(b.cat)}</div>
              <div class="biz-hero-main">
                <div class="biz-hero-category">${getCategoryIcon(b.cat)} ${getCategoryLabel(b.cat)}</div>
                <h1 class="biz-hero-title">${esc(b.name)}</h1>
                <div class="biz-hero-meta">
                  <span>👤 मालक: <strong>${esc(b.owner)}</strong></span>
                  <span>📍 ${esc(b.city)}${b.district ? ', ' + esc(b.district) : ''}${b.state ? ', ' + esc(b.state) : ''}</span>
                  ${b.verified ? '<span class="biz-verified-badge">✓ पडताळलेले</span>' : ''}
                </div>
                <div class="biz-hero-rating">
                  <span class="stars">${formatStars(avgRating)}</span>
                  <span class="count"><strong>${avgRating}</strong> · ${reviewCount} पुनरावलोकने</span>
                </div>
                 <div class="biz-hero-actions">
                  <a class="biz-btn biz-btn-primary" href="cm-create-referral.html" style="background:var(--gold-400); color:black; font-weight:700;">🤝 + संदर्भ द्या (Give Referral)</a>
                  <a class="biz-btn biz-btn-secondary" href="cm-one-to-one-meetings.html">☕ भेट मागवा (Request Intro)</a>
                  <a class="biz-btn biz-btn-secondary" href="https://wa.me/91${b.whatsapp || b.phone}" target="_blank" rel="noopener">💬 WhatsApp</a>
                  <a class="biz-btn biz-btn-secondary" href="tel:${b.phone}">📞 कॉल</a>
                  ${b.website ? `<a class="biz-btn biz-btn-secondary" href="${b.website}" target="_blank" rel="noopener">🌐 वेबसाईट</a>` : ''}
                  <div class="biz-share-dropdown">
                    <button class="biz-btn biz-btn-ghost" aria-label="शेअर करा">🔗 शेअर</button>
                    <div class="biz-share-menu">
                      <button class="biz-share-item" onclick="nativeShare()">📱 नेटिव शेअर</button>
                      <button class="biz-share-item" onclick="copyLink()">📋 लिंक कॉपी करा</button>
                      <button class="biz-share-item" onclick="shareWhatsApp()">💬 WhatsApp वर शेअर</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Business Sangam & Referral Stats Bar -->
          <div class="biz-stats-bar" style="grid-template-columns: repeat(5, 1fr);">
            <div class="biz-stat">
              <div class="biz-stat-value">${reviewCount}</div>
              <div class="biz-stat-label">पुनरावलोकने</div>
            </div>
            <div class="biz-stat">
              <div class="biz-stat-value">${avgRating}</div>
              <div class="biz-stat-label">औसत रेटिंग</div>
            </div>
            <div class="biz-stat">
              <div class="biz-stat-value" style="color:var(--maroon-900);">१४</div>
              <div class="biz-stat-label">प्राप्त संदर्भ (Referrals)</div>
            </div>
            <div class="biz-stat">
              <div class="biz-stat-value" style="color:#2e7d32;">₹१२.५ ला</div>
              <div class="biz-stat-label">बंद झालेला व्यापार</div>
            </div>
            <div class="biz-stat">
              <div class="biz-stat-value">${b.offers ? 'सक्रिय' : 'नाही'}</div>
              <div class="biz-stat-label">ऑफर/सवलत</div>
            </div>
          </div>

          <!-- Ideal Customer & Target Industries Section -->
          <div style="padding:16px 24px 0;">
            <div style="background:#fff3e0; border:1px solid #ffe0b2; padding:16px; border-radius:12px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
              <div>
                <strong style="color:#e65100; font-size:0.95rem;">🎯 आदर्श ग्राहक व लक्ष्यित उद्योग (Ideal Customer Profile)</strong>
                <p style="margin-top:4px; font-size:0.9rem; color:#444;">सध्या ५० ते ५०० कर्मचारी असणारे MSME उद्योग, रिअल्टर डेव्हलपर्स व नवउद्योजक.</p>
              </div>
              <div>
                <a href="cm-create-referral.html" class="btn btn-primary" style="font-weight:700;">+ क्लायंट संदर्भ पाठवा</a>
              </div>
            </div>
          </div>

          <!-- Offer Badge -->
          ${b.offers ? `<div style="padding:0 24px 16px; display:flex; justify-content:center;">
            <div class="biz-offer-badge">🎁 ${esc(b.offers)}</div>
          </div>` : ''}

          <!-- Main Content Grid -->
          <div style="display:grid; grid-template-columns: 1fr 320px; gap:24px; margin-top:24px;">
            <div>
              <!-- About / Description -->
              ${b.description ? `
              <div class="biz-section">
                <div class="biz-section-header">
                  <h3 class="biz-section-title">📝 व्यवसाय बद्दल</h3>
                </div>
                <div class="biz-section-body">
                  <p class="biz-description">${esc(b.description)}</p>
                </div>
              </div>` : ''}

              <!-- Services -->
              ${(b.services || []).length ? `
              <div class="biz-section">
                <div class="biz-section-header">
                  <h3 class="biz-section-title">🛠️ सेवा व सुविधा</h3>
                </div>
                <div class="biz-section-body">
                  <div style="display:flex; flex-wrap:wrap; gap:8px;">
                    ${(b.services || []).map(s => `<span class="biz-tag">${esc(s)}</span>`).join('')}
                  </div>
                </div>
              </div>` : ''}

              <!-- Hours -->
              <div class="biz-section">
                <div class="biz-section-header">
                  <h3 class="biz-section-title">🕐 कामकाजाच्या वेळा</h3>
                </div>
                <div class="biz-section-body">
                  ${b.hours ? `
                    <div style="display:flex; flex-direction:column; gap:0;">
                      <div class="biz-hours-row">
                        <span class="biz-hours-day">सोमवार - शनिवार</span>
                        <span class="biz-hours-time">${esc(b.hours)}</span>
                      </div>
                      <div class="biz-hours-row">
                        <span class="biz-hours-day">रविवार</span>
                        <span class="biz-hours-time">${b.sundayHours || 'बंद'}</span>
                      </div>
                    </div>
                    <div style="margin-top:12px; padding:12px; background:var(--orange-50); border-radius:10px; border:1px solid var(--orange-200);">
                      <div style="display:flex; align-items:center; gap:8px; font-weight:600; color:var(--orange-700);">
                        <span style="width:10px; height:10px; border-radius:50%; background:var(--orange-400);"></span>
                        वेळा बदलू शकतात, कृपया भेट द्यापूर्वी कॉल करून पडताळा.
                      </div>
                    </div>
                  ` : '<p class="muted" style="margin:0;">वेळा उपलब्ध नाही</p>'}
                </div>
              </div>

              <!-- Contact Details -->
              <div class="biz-section">
                <div class="biz-section-header">
                  <h3 class="biz-section-title">📞 संपर्क माहिती</h3>
                </div>
                <div class="biz-section-body">
                  <div class="biz-grid-2">
                    <div class="biz-info-card">
                      <div class="biz-info-label">फोन / WhatsApp</div>
                      <div class="biz-info-value">
                        <a href="tel:${b.phone}" style="color:inherit; text-decoration:none;">${esc(b.phone)}</a>
                        ${b.whatsapp && b.whatsapp !== b.phone ? `<br><a href="https://wa.me/91${b.whatsapp}" target="_blank" rel="noopener" style="color:var(--orange-600); text-decoration:none; font-size:0.85rem;">WhatsApp: ${esc(b.whatsapp)}</a>` : ''}
                      </div>
                    </div>
                    <div class="biz-info-card">
                      <div class="biz-info-label">ईमेल</div>
                      <div class="biz-info-value">
                        ${b.email ? `<a href="mailto:${b.email}" style="color:inherit; text-decoration:none;">${esc(b.email)}</a>` : '<span class="muted">नमूद नाही</span>'}
                      </div>
                    </div>
                    <div class="biz-info-card">
                      <div class="biz-info-label">वेबसाईट</div>
                      <div class="biz-info-value">
                        ${b.website ? `<a href="${b.website}" target="_blank" rel="noopener" style="color:var(--orange-600); text-decoration:none;">${esc(b.website)}</a>` : '<span class="muted">नमूद नाही</span>'}
                      </div>
                    </div>
                    <div class="biz-info-card">
                      <div class="biz-info-label">पत्ता</div>
                      <div class="biz-info-value">
                        ${b.address ? esc(b.address) : '<span class="muted">नमूद नाही</span>'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Map -->
              <div class="biz-section">
                <div class="biz-section-header">
                  <h3 class="biz-section-title">🗺️ स्थान</h3>
                </div>
                <div class="biz-section-body" style="padding:0;">
                  <div class="biz-map-container">
                    ${b.lat && b.lng ? `
                      <iframe width="100%" height="100%" frameborder="0" style="border:0;" src="https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${encodeURIComponent(b.lat + ',' + b.lng)}" allowfullscreen></iframe>
                    ` : `
                      <div class="biz-map-placeholder">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                          <circle cx="12" cy="10" r="3"/>
                        </svg>
                        <span>नकाशा उपलब्ध नाही</span>
                        ${b.address ? `<button class="biz-btn biz-btn-secondary" style="padding:8px 16px; font-size:0.85rem; margin-top:8px;" onclick="openInMaps()">नकाशात पहा</button>` : ''}
                      </div>
                    `}
                  </div>
                </div>
              </div>

              <!-- Gallery placeholder -->
              ${(b.gallery || []).length ? `
              <div class="biz-section">
                <div class="biz-section-header">
                  <h3 class="biz-section-title">🖼️ फोटो गॅलरी</h3>
                </div>
                <div class="biz-section-body" style="padding-top:16px;">
                  <div class="biz-gallery">
                    ${(b.gallery || []).map(img => `<div class="biz-gallery-item"><img src="${esc(img)}" alt="${esc(b.name)}" loading="lazy"></div>`).join('')}
                  </div>
                </div>
              </div>` : ''}

              <!-- Reviews -->
              <div class="biz-section">
                <div class="biz-section-header">
                  <h3 class="biz-section-title">⭐ ग्राहक पुनरावलोकने</h3>
                </div>
                <div class="biz-section-body">
                  <div id="cmBizReviews">
                    ${(b.reviews || []).length ? (b.reviews || []).map(r => `
                      <div class="biz-review-card">
                        <div class="biz-review-header">
                          <div class="biz-review-author">
                            <div class="biz-review-avatar">${esc(r.name).charAt(0).toUpperCase()}</div>
                            <div>
                              <div class="biz-review-name">${esc(r.name)}</div>
                              <div class="biz-review-date">${r.date ? new Date(r.date).toLocaleDateString('mr-IN') : ''}</div>
                            </div>
                          </div>
                          <div class="biz-review-stars">${formatStars(r.rating)} <strong>${r.rating}</strong></div>
                        </div>
                        <p class="biz-review-text">${esc(r.text)}</p>
                      </div>
                    `).join('') : '<p class="muted" style="text-align:center; padding:20px 0;">अद्याप पुनरावलोकन नाही. पहिली पुनरावलोकन तुम्ही लिहा!</p>'}
                  </div>
                  
                  <!-- Review Form -->
                  <form id="cmBizReviewForm" class="biz-review-form">
                    <div class="field-row">
                      <div>
                        <label>तुमचे नाव</label>
                        <input type="text" id="cmRevName" placeholder="तुमचे नाव" value="${esc(me.name)}" required>
                      </div>
                      <div>
                        <label>रेटिंग</label>
                        <select id="cmRevRating" required>
                          <option value="5">⭐⭐⭐⭐⭐ - उत्कृष्ट</option>
                          <option value="4">⭐⭐⭐⭐ - चांगले</option>
                          <option value="3">⭐⭐⭐ - साधे</option>
                          <option value="2">⭐⭐ - निराशाजनक</option>
                          <option value="1">⭐ - खूप वाईट</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label>तुमचा अनुभव</label>
                      <textarea id="cmRevText" rows="3" placeholder="तुमचा अनुभव तपशीलात लिहा..." required></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary btn-submit" style="padding:10px 22px;">✍️ पुनरावलोकन सबमिट करा</button>
                  </form>
                </div>
              </div>
            </div>

            <!-- Sidebar -->
            <div>
              <!-- Quick Contact Card -->
              <div class="biz-section" style="margin-bottom:16px;">
                <div class="biz-section-body" style="text-align:center; padding:24px;">
                  <div style="font-size:3rem; margin-bottom:12px;">${b.photo || getCategoryIcon(b.cat)}</div>
                  <h4 style="margin:0 0 6px; color:var(--gray-800);">${esc(b.name)}</h4>
                  <p class="muted" style="margin:0 0 16px; font-size:0.85rem;">${getCategoryLabel(b.cat)} · ${esc(b.city)}</p>
                  <div style="display:flex; flex-direction:column; gap:8px;">
                    <a class="biz-btn biz-btn-primary" href="https://wa.me/91${b.whatsapp || b.phone}" target="_blank" rel="noopener" style="justify-content:center;">💬 WhatsApp</a>
                    <a class="biz-btn biz-btn-secondary" href="tel:${b.phone}" style="justify-content:center;">📞 कॉल करा</a>
                    ${b.website ? `<a class="biz-btn biz-btn-secondary" href="${b.website}" target="_blank" rel="noopener" style="justify-content:center;">🌐 वेबसाईट भेट द्या</a>` : ''}
                    <button class="biz-btn biz-btn-ghost" data-report="business|${b.id}|${esc(b.name)}" style="justify-content:center; cursor:pointer;">🚩 तक्रार नोंदवा</button>
                  </div>
                </div>
              </div>

              <!-- Quick Info -->
              <div class="biz-section" style="margin-bottom:16px;">
                <div class="biz-section-body" style="padding:20px;">
                  <div style="display:flex; flex-direction:column; gap:14px;">
                    <div class="biz-info-card" style="display:flex; align-items:flex-start; gap:12px; padding:14px;">
                      <div style="width:40px; height:40px; border-radius:10px; background:linear-gradient(135deg, var(--orange-400), var(--orange-600)); display:flex; align-items:center; justify-content:center; color:var(--white); font-size:1.1rem;">📍</div>
                      <div>
                        <div class="biz-info-label">पत्ता</div>
                        <div class="biz-info-value" style="font-size:0.85rem;">${b.address ? esc(b.address) : '<span class="muted">नमूद नाही</span>'}</div>
                      </div>
                    </div>
                    <div class="biz-info-card" style="display:flex; align-items:flex-start; gap:12px; padding:14px;">
                      <div style="width:40px; height:40px; border-radius:10px; background:linear-gradient(135deg, var(--orange-400), var(--orange-600)); display:flex; align-items:center; justify-content:center; color:var(--white); font-size:1.1rem;">⏰</div>
                      <div>
                        <div class="biz-info-label">वेळा</div>
                        <div class="biz-info-value" style="font-size:0.85rem;">${esc(b.hours) || '<span class="muted">नमूद नाही</span>'}</div>
                      </div>
                    </div>
                    ${b.email ? `
                    <div class="biz-info-card" style="display:flex; align-items:flex-start; gap:12px; padding:14px;">
                      <div style="width:40px; height:40px; border-radius:10px; background:linear-gradient(135deg, var(--orange-400), var(--orange-600)); display:flex; align-items:center; justify-content:center; color:var(--white); font-size:1.1rem;">✉️</div>
                      <div>
                        <div class="biz-info-label">ईमेल</div>
                        <div class="biz-info-value" style="font-size:0.85rem;"><a href="mailto:${b.email}" style="color:var(--orange-600);">${esc(b.email)}</a></div>
                      </div>
                    </div>` : ''}
                  </div>
                </div>
              </div>

              <!-- Save/Bookmark -->
              <div class="biz-section">
                <div class="biz-section-body" style="padding:20px; text-align:center;">
                  <button id="cmBizBookmark" class="biz-btn biz-btn-secondary" style="width:100%; justify-content:center; padding:14px;" onclick="toggleBookmark()">
                    <span id="bookmarkIcon">🔖</span> <span id="bookmarkText">सेव करा</span>
                  </button>
                  <p class="muted" style="margin:10px 0 0; font-size:0.75rem;">तुमच्या सेव्ह केलेल्या व्यवसायांमध्ये दिसेल</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Related Businesses -->
          ${renderRelatedBusinesses(b)}
        `);

        // Event listeners
        setupEventListeners();
      }

      function renderRelatedBusinesses(currentBiz) {
        const allBiz = CMDB.raw().businesses.filter(biz => biz.id !== currentBiz.id && (biz.cat === currentBiz.cat || biz.city === currentBiz.city));
        if (!allBiz.length) return '';
        const related = allBiz.slice(0, 3);
        return `
          <div class="biz-section" style="margin-top:24px;">
            <div class="biz-section-header">
              <h3 class="biz-section-title">🔗 संबंधित व्यवसाय</h3>
            </div>
            <div class="biz-section-body" style="padding-top:16px;">
              <div class="biz-related-grid">
                ${related.map(rb => `
                  <a href="cm-business-profile.html?id=${encodeURIComponent(rb.id)}" class="biz-related-card">
                    <div class="biz-related-icon">${rb.photo || getCategoryIcon(rb.cat)}</div>
                    <div class="biz-related-name">${esc(rb.name)}</div>
                    <div class="biz-related-meta">
                      <span>${rb.owner}</span>
                      <span>⭐ ${rb.rating || 5}</span>
                    </div>
                  </a>
                `).join('')}
              </div>
            </div>
          </div>
        `;
      }

      function setupEventListeners() {
        // Review form
        const reviewForm = bizProfileRoot.querySelector('#cmBizReviewForm');
        if (reviewForm) {
          reviewForm.addEventListener('submit', e => {
            e.preventDefault();
            const name = bizProfileRoot.querySelector('#cmRevName').value.trim();
            const rating = parseInt(bizProfileRoot.querySelector('#cmRevRating').value, 10);
            const text = bizProfileRoot.querySelector('#cmRevText').value.trim();
            if (!name || !text) return;
            CMDB.addBusinessReview(b.id, name, rating, text);
            toast('पुनरावलोकन जतन झाले!', 'success');
            renderBizProfile();
          });
        }

        // Bookmark
        window.toggleBookmark = function() {
          const btn = bizProfileRoot.querySelector('#cmBizBookmark');
          const icon = bizProfileRoot.querySelector('#bookmarkIcon');
          const text = bizProfileRoot.querySelector('#bookmarkText');
          const saved = CMDB.toggleBookmark('business', b.id);
          if (saved) {
            icon.textContent = '✅';
            text.textContent = 'सेव झाले';
            btn.classList.remove('biz-btn-secondary');
            btn.classList.add('biz-btn-primary');
            toast('व्यवसाय सेव्ह केले!', 'success');
          } else {
            icon.textContent = '🔖';
            text.textContent = 'सेव करा';
            btn.classList.remove('biz-btn-primary');
            btn.classList.add('biz-btn-secondary');
            toast('सेव्ह काढले.', 'info');
          }
        };

        // Check bookmark status
        const bookmarks = CMDB.getBookmarks('business') || [];
        if (bookmarks.includes(b.id)) {
          setTimeout(() => {
            const btn = bizProfileRoot.querySelector('#cmBizBookmark');
            const icon = bizProfileRoot.querySelector('#bookmarkIcon');
            const text = bizProfileRoot.querySelector('#bookmarkText');
            if (btn && icon && text) {
              icon.textContent = '✅';
              text.textContent = 'सेव झाले';
              btn.classList.remove('biz-btn-secondary');
              btn.classList.add('biz-btn-primary');
            }
          }, 0);
        }

        // Global functions for share
        window.copyLink = function() {
          navigator.clipboard.writeText(window.location.href).then(() => {
            toast('लिंक कॉपी झाला!', 'success');
          });
        };

        window.shareWhatsApp = function() {
          const url = `https://wa.me/?text=${encodeURIComponent('Connect Maratha वर ' + b.name + ' पहा: ' + window.location.href)}`;
          window.open(url, '_blank');
        };

        window.openInMaps = function() {
          const addr = encodeURIComponent(b.address || b.name + ', ' + b.city);
          window.open(`https://www.google.com/maps/search/?api=1&query=${addr}`, '_blank');
        };

        window.nativeShare = function() {
          if (navigator.share) {
            navigator.share({
              title: b.name,
              text: 'Connect Maratha वर ' + b.name + ' पहा',
              url: window.location.href
            }).catch(() => {});
          } else {
            copyLink();
          }
        };
      }

      renderBizProfile();
    }
  }

  // List-business form → save into CMDB (in addition to legacy localStorage list)
  const listBizForm = document.querySelector('#cmListBizForm');
  if (listBizForm) {
    listBizForm.addEventListener('submit', e => {
      e.preventDefault();
      const biz = {
        name: listBizForm.querySelector('#lbName').value.trim(),
        owner: listBizForm.querySelector('#lbOwner').value.trim(),
        cat: listBizForm.querySelector('#lbCat').value,
        city: listBizForm.querySelector('#lbCity').value.trim(),
        phone: listBizForm.querySelector('#lbPhone').value.trim(),
        whatsapp: listBizForm.querySelector('#lbPhone').value.trim(),
        photo: '🏢', website: '', hours: '', services: [], offers: ''
      };
      if (!biz.name || !biz.owner) { toast('कृपया व्यवसायाचे नाव व मालकाचे नाव भरा.', 'info'); return; }
      const saved = CMDB.addBusiness(biz);
      toast('व्यवसाय यशस्वीरीत्या नोंदवला गेला!', 'success');
      setTimeout(() => { window.location.href = 'cm-business-profile.html?id=' + encodeURIComponent(saved.id); }, 800);
    });
  }

  // =====================================================================
  // 8. Donation campaigns (cm-donation.html) + campaign detail
  // =====================================================================
  const campGridDynamic = document.querySelector('#campGrid[data-dynamic]');
  if (campGridDynamic) {
    function pct(c) { return Math.min(100, Math.round((c.collected / c.target) * 100)); }
    function renderCampaigns() {setHTML(campGridDynamic, '');
      CMDB.raw().campaigns.forEach(c => {
        const card = document.createElement('div');
        card.className = 'feature-card';
        card.dataset.cat = c.cat;
        card.style.cssText = 'height:auto; margin-bottom:16px; display:flex; flex-wrap:wrap;';setHTML(card, `
          <div class="media" style="flex:1; min-width:200px; height:160px;">${c.icon} ${esc(c.title)}</div>
          <div class="body" style="flex:2; min-width:240px; padding:18px;">
            <strong style="font-size:1.05rem;">${esc(c.title)}</strong>
            <div class="progress-track"><div class="progress-fill" style="width:${pct(c)}%"></div></div>
            <div class="campaign-meta"><span>₹${c.collected.toLocaleString('en-IN')} जमा · ${c.donors.toLocaleString('en-IN')} देणगीदार</span><span>लक्ष्य ₹${c.target.toLocaleString('en-IN')}</span></div>
            <div style="display:flex; gap:8px; margin-top:14px; flex-wrap:wrap;">
              <button class="btn btn-primary cm-donate-btn" data-id="${c.id}">Donate Now</button>
              <a class="btn btn-outline" href="cm-campaign-detail.html?id=${encodeURIComponent(c.id)}">पारदर्शकता तपशील पहा →</a>
            </div>
          </div>
        `);
        campGridDynamic.appendChild(card);
      });
    }
    renderCampaigns();

    function ensureDonateModal() {
      let modal = document.getElementById('cmDonateModal');
      if (modal) return modal;
      modal = document.createElement('div');
      modal.className = 'cm-modal';
      modal.id = 'cmDonateModal';setHTML(modal, `
        <div class="cm-modal-box">
          <div class="cm-modal-header"><h3>❤️ देणगी द्या</h3><button type="button" class="cm-modal-close">✕</button></div>
          <form id="cmDonateForm">
            <div class="cm-modal-body">
              <div id="cmDonateCampTitle" style="font-weight:700; margin-bottom:12px; color:var(--maroon-950);"></div>
              <label>रक्कम (₹):</label>
              <input type="number" id="cmDonateAmt" min="50" value="500" required>
              <label>तुमचे नाव:</label>
              <input type="text" id="cmDonateName" required>
            </div>
            <div class="cm-modal-footer">
              <button type="button" class="btn btn-outline" id="cmDonateCancel">रद्द करा</button>
              <button type="submit" class="btn btn-primary">✓ देणगी जमा करा</button>
            </div>
          </form>
        </div>`);
      document.body.appendChild(modal);
      const close = () => modal.classList.remove('open');
      modal.querySelector('.cm-modal-close').addEventListener('click', close);
      modal.querySelector('#cmDonateCancel').addEventListener('click', close);
      modal.addEventListener('click', e => { if (e.target === modal) close(); });
      return modal;
    }

    campGridDynamic.addEventListener('click', e => {
      const btn = e.target.closest('.cm-donate-btn');
      if (!btn) return;
      const c = CMDB.getCampaign(btn.dataset.id);
      const modal = ensureDonateModal();
      modal.querySelector('#cmDonateCampTitle').textContent = `मोहीम: ${c.title}`;
      modal.querySelector('#cmDonateName').value = CMDB.currentMember().name;
      modal.classList.add('open');
      modal.querySelector('#cmDonateForm').onsubmit = ev => {
        ev.preventDefault();
        const amt = parseInt(modal.querySelector('#cmDonateAmt').value, 10) || 500;
        const name = modal.querySelector('#cmDonateName').value.trim();
        const recId = CMDB.donate(c.id, amt, name);
        modal.classList.remove('open');
        toast(`धन्यवाद! ₹${amt.toLocaleString('en-IN')} देणगी जमा झाली. पावती: ${recId}`, 'success');
        renderCampaigns();
      };
    });
  }

  const campDetailRoot = document.querySelector('#cmCampaignDetailRoot');
  if (campDetailRoot) {
    const cid = new URLSearchParams(window.location.search).get('id');
    const c = CMDB.getCampaign(cid);
    if (!c) {setHTML(campDetailRoot, '<div class="notice">मोहीम सापडली नाही.</div>');
    } else {
      const pct = Math.min(100, Math.round((c.collected / c.target) * 100));
      const totalExpense = (c.expenses || []).reduce((s, x) => s + x.amount, 0);setHTML(campDetailRoot, `
        <div class="hero short" style="min-height:200px; border-radius:12px; overflow:hidden; margin-bottom:20px;">
          <img src="${c.cover}" alt="${esc(c.title)}" class="hero-bg-img">
          <div class="hero-overlay"></div>
          <div class="wrap hero-content" style="padding:24px;">
            <div class="eyebrow">${c.icon} पारदर्शकता अहवाल</div>
            <h1 style="font-size:1.9rem;">${esc(c.title)}</h1>
          </div>
        </div>
        <p style="margin-bottom:16px;">${esc(c.desc)}</p>
        <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
        <div class="campaign-meta" style="margin-bottom:20px;"><span>₹${c.collected.toLocaleString('en-IN')} जमा · ${c.donors.toLocaleString('en-IN')} देणगीदार</span><span>लक्ष्य ₹${c.target.toLocaleString('en-IN')}</span></div>
        <button class="btn btn-primary cm-donate-btn" data-id="${c.id}" style="margin-bottom:28px;">Donate Now</button>

        <div class="grid grid-2" style="align-items:start;">
          <div class="info-box-card">
            <h4>खर्चाचा तपशील (Utilization)</h4>
            <table style="width:100%; font-size:0.86rem; border-collapse:collapse;">
              ${(c.expenses || []).map(x => `<tr><td style="padding:6px 0; border-bottom:1px solid var(--line);">${esc(x.item)}</td><td style="padding:6px 0; border-bottom:1px solid var(--line); text-align:right; font-weight:600;">₹${x.amount.toLocaleString('en-IN')}</td></tr>`).join('')}
              <tr><td style="padding:8px 0; font-weight:700;">एकूण खर्च</td><td style="padding:8px 0; text-align:right; font-weight:700;">₹${totalExpense.toLocaleString('en-IN')}</td></tr>
            </table>
          </div>
          <div class="info-box-card">
            <h4>प्रकल्प अद्ययावत (Updates)</h4>
            ${(c.updates || []).map(u => `<div style="margin-bottom:10px;"><strong>${u.date}</strong><div class="muted" style="font-size:0.86rem;">${esc(u.text)}</div></div>`).join('') || '<p class="muted">अद्याप कोणतेही अपडेट नाही.</p>'}
          </div>
        </div>

        <div class="info-box-card" style="margin-top:20px;">
          <h4>देणगीदार पावती नोंदी (Receipts)</h4>
          <div id="cmReceiptList">
            ${(c.receipts || []).slice(0, 10).map(r => `<div style="display:flex; justify-content:space-between; font-size:0.85rem; border-bottom:1px solid var(--line); padding:6px 0;"><span>${esc(r.donor)} — ${r.date}</span><span style="font-weight:700;">₹${r.amount.toLocaleString('en-IN')} <span class="muted">(${r.id})</span></span></div>`).join('') || '<p class="muted">अद्याप पावती नोंद नाही.</p>'}
          </div>
        </div>

        <div class="notice safe" style="margin-top:20px;">🧾 सर्व आकडेवारी दर्शनी उदाहरण स्वरूपात आहे. वास्तविक निधीसंकलनासाठी लागू कायदेशीर/कर नियमांनुसार अधिकृत पावती व अंतिम लेखापरीक्षण अहवाल दिला जाईल.</div>
      `);
      campDetailRoot.addEventListener('click', e => {
        const btn = e.target.closest('.cm-donate-btn');
        if (!btn) return;
        const amt = parseInt(prompt('देणगी रक्कम (₹) टाका:', '500'), 10);
        if (!amt || amt < 1) return;
        const recId = CMDB.donate(c.id, amt, CMDB.currentMember().name);
        toast(`धन्यवाद! पावती क्रमांक: ${recId}`, 'success');
        window.location.reload();
      });
    }
  }

  // =====================================================================
  // 9. Events registration with QR ticket (cm-events.html)
  // =====================================================================
  const eventRegForm = document.querySelector('#cmEventRegForm');
  if (eventRegForm) {
    const eventSelect = eventRegForm.querySelector('#cmEventSelect');
    if (eventSelect) {setHTML(eventSelect, CMDB.raw().events.map(ev => `<option value="${ev.id}">${esc(ev.title)} — ${ev.date} (${esc(ev.venue)})</option>`).join(''));
    }
    eventRegForm.addEventListener('submit', e => {
      e.preventDefault();
      const evId = eventSelect ? eventSelect.value : CMDB.raw().events[0].id;
      const name = eventRegForm.querySelector('#cmEventName').value.trim();
      const phone = eventRegForm.querySelector('#cmEventPhone').value.trim();
      const city = eventRegForm.querySelector('#cmEventCity').value.trim();
      if (!name || !phone) { toast('कृपया नाव व मोबाईल नंबर भरा.', 'info'); return; }
      const ticketId = CMDB.registerForEvent(evId, name, phone, city);
      const ev = CMDB.getEvent(evId);
      const box = document.querySelector('#cmTicketBox');setHTML(box, `
        <div class="info-box-card" style="text-align:center; margin-top:20px;">
          <h4>✓ नोंदणी यशस्वी — ई-तिकीट</h4>
          <img src="${qrImg('CONNECT-MARATHA|' + ev.title + '|' + ticketId)}" alt="QR Ticket" style="margin:12px auto; display:block;">
          <p><strong>${esc(ev.title)}</strong><br>${esc(name)} · ${ev.date} · ${esc(ev.venue)}</p>
          <p class="muted">तिकीट क्रमांक: <code>${ticketId}</code></p>
        </div>
      `);
      box.style.display = 'block';
      toast(`नोंदणी यशस्वी! तिकीट क्रमांक: ${ticketId}`, 'success');
      eventRegForm.reset();
    });
  }

  // =====================================================================
  // 10. Dashboard — Member Portal (cm-dashboard.html)
  // =====================================================================
  const portalRoot = document.querySelector('#cmPortalRoot');
  if (portalRoot) {
    const me = CMDB.currentMember();
    const notifs = CMDB.getNotifications();
    const savedForts = CMDB.getBookmarks('forts');
    const savedArticles = CMDB.getBookmarks('articles');
    const myGroups = CMDB.raw().groups.filter(g => (g.members || []).includes(me.id));
    const myPosts = CMDB.getFeedPosts().filter(p => p.authorId === me.id);
    const bizDash = typeof CMDB.getBusinessDashboard === 'function' ? CMDB.getBusinessDashboard(me.id) : null;setHTML(portalRoot, `
      <div class="grid grid-2" style="align-items:start; margin-bottom:20px;">
        <div class="info-box-card">
          <h4>🔔 सूचना (${notifs.length})</h4>
          ${notifs.slice(0, 5).map(n => `<div style="font-size:0.85rem; border-bottom:1px solid var(--line); padding:6px 0;">${esc(n.text)} <span class="muted">· ${CMDB.timeAgo(n.ts)}</span></div>`).join('') || '<p class="muted">कोणतीही नवीन सूचना नाही.</p>'}
        </div>
        <div class="info-box-card">
          <h4>🧑‍🤝‍🧑 माझे गट (${myGroups.length})</h4>
          ${myGroups.map(g => `<div style="font-size:0.85rem; border-bottom:1px solid var(--line); padding:6px 0;"><a href="cm-group-detail.html?id=${encodeURIComponent(g.id)}">${g.cover} ${esc(g.name)}</a></div>`).join('') || '<p class="muted">तुम्ही अद्याप कोणत्याही गटात सामील नाही. <a href="cm-groups.html">गट पाहा →</a></p>'}
        </div>
        <div class="info-box-card">
          <h4>🏰 Saved किल्ले (${savedForts.length})</h4>
          ${savedForts.map(f => `<div style="font-size:0.85rem; border-bottom:1px solid var(--line); padding:6px 0;">${esc(f.label)}</div>`).join('') || '<p class="muted">अद्याप कोणताही किल्ला Save केलेला नाही.</p>'}
        </div>
        <div class="info-box-card">
          <h4>📰 Saved लेख (${savedArticles.length})</h4>
          ${savedArticles.map(f => `<div style="font-size:0.85rem; border-bottom:1px solid var(--line); padding:6px 0;">${esc(f.label)}</div>`).join('') || '<p class="muted">अद्याप कोणताही लेख Save केलेला नाही.</p>'}
        </div>
      </div>
      ${bizDash ? `
      <div class="info-box-card" style="margin-bottom:20px;">
        <div class="section-head" style="margin-bottom:10px;">
          <div>
            <span class="eyebrow-sm">व्यवसाय संगम</span>
            <h4 style="margin:0;">माझे व्यवसाय नेटवर्क डॅशबोर्ड</h4>
          </div>
        </div>
        <div class="kpi-grid">
          <div class="kpi-card"><div class="kpi-label">माझे मंडळ</div><div class="kpi-value">${bizDash.chapter ? esc(bizDash.chapter.marathiName) : 'अद्याप नाही'}</div></div>
          <div class="kpi-card"><div class="kpi-label">दिलेल्या संधी</div><div class="kpi-value">${bizDash.opportunitiesGiven}</div></div>
          <div class="kpi-card"><div class="kpi-label">मिळालेल्या संधी</div><div class="kpi-value">${bizDash.opportunitiesReceived}</div></div>
          <div class="kpi-card"><div class="kpi-label">Closed Value</div><div class="kpi-value">₹${Number(bizDash.closedValue || 0).toLocaleString('en-IN')}</div></div>
          <div class="kpi-card"><div class="kpi-label">1-to-1 भेटी</div><div class="kpi-value">${bizDash.meetings.length}</div></div>
          <div class="kpi-card"><div class="kpi-label">योगदान गुण</div><div class="kpi-value">${bizDash.contributionScore}</div></div>
        </div>
        <div style="display:flex; flex-wrap:wrap; gap:10px;">
          <a href="cm-my-business-mandal.html" class="btn btn-outline">🏢 माझे मंडळ</a>
          <a href="cm-business-opportunities.html" class="btn btn-outline">🤝 व्यवसाय संधी</a>
          <a href="cm-one-to-one-meetings.html" class="btn btn-outline">👥 एक-ते-एक भेटी</a>
          <a href="cm-business-membership-application.html" class="btn btn-primary">📝 सदस्यत्व अर्ज</a>
        </div>
      </div>` : ''}
      <div class="grid grid-2" style="align-items:start; margin-top:20px; margin-bottom:20px;">
        <div class="info-box-card">
          <h4>🛠️ सेवा चौकशा</h4>
          ${(typeof CMDB.listServiceEnquiries === 'function' ? CMDB.listServiceEnquiries(me.id) : []).slice(0,5).map(s => `<div style="font-size:0.85rem; border-bottom:1px solid var(--line); padding:6px 0;">${esc(s.service)} <span class="muted">· ${esc(s.provider)} · ${esc(s.status)}</span></div>`).join('') || '<p class="muted">अद्याप कोणतीही सेवा चौकशी नाही. <a href="cm-services.html">सेवा पहा →</a></p>'}
        </div>
        <div class="info-box-card">
          <h4>📦 सेवा विनंत्या / बुकिंग</h4>
          ${(typeof CMDB.listServiceRequests === 'function' ? CMDB.listServiceRequests(me.id) : []).slice(0,5).map(s => `<div style="font-size:0.85rem; border-bottom:1px solid var(--line); padding:6px 0;">${esc(s.service)} <span class="muted">· ${esc(s.provider)} · ${esc(s.status)}</span></div>`).join('') || '<p class="muted">अद्याप कोणतेही booking नाही.</p>'}
        </div>
      </div>
      <div class="info-box-card">
        <h4>📝 माझ्या पोस्ट (${myPosts.length})</h4>
        ${myPosts.map(p => `<div style="font-size:0.85rem; border-bottom:1px solid var(--line); padding:6px 0;">${esc(p.text)} <span class="muted">· ${CMDB.timeAgo(p.ts)} · ❤️ ${(p.likes || []).length}</span></div>`).join('') || `<p class="muted">तुम्ही अद्याप कोणतीही पोस्ट केलेली नाही. <a href="cm-community.html">आताच पोस्ट करा →</a></p>`}
      </div>
    `);
  }

  // =====================================================================
  // 11. व्यवसाय संगम / मंडळ / opportunities / 1-to-1 / application
  // =====================================================================
  function currency(v) {
    return '₹' + Number(v || 0).toLocaleString('en-IN');
  }

  function memberName(id) {
    const m = CMDB.getMember(id);
    return m ? m.name : '—';
  }

  const businessSangamRoot = document.querySelector('#cmBusinessSangamRoot');
  if (businessSangamRoot) {
    const chapters = CMDB.getChapters();
    const totals = chapters.reduce((acc, ch) => {
      acc.members += (ch.capacity - ch.openSeats);
      acc.business += ch.totalClosedValue || 0;
      acc.opportunities += ch.monthlyOpportunities || 0;
      return acc;
    }, { members: 0, business: 0, opportunities: 0 });setHTML(businessSangamRoot, `
      <section>
        <div class="stat-strip">
          <div class="cell"><div class="num">${chapters.length}</div><div class="lbl">सक्रिय व्यवसाय मंडळे</div></div>
          <div class="cell"><div class="num">${totals.members}</div><div class="lbl">सदस्य व्यवसायिक</div></div>
          <div class="cell"><div class="num">${currency(totals.business)}</div><div class="lbl">निर्माण झालेला व्यवसाय</div></div>
          <div class="cell"><div class="num">${totals.opportunities}</div><div class="lbl">या महिन्यातील संधी</div></div>
        </div>
      </section>
      <section>
        <div class="section-head"><div><span class="eyebrow-sm">स्थानिक व्यवसाय नेटवर्क</span><h2>सक्रिय व्यवसाय मंडळे</h2></div></div>
        <div style="margin-bottom:16px;"><input id="cmChapterSearchPublic" type="text" placeholder="मंडळ / शहर शोधा..." style="width:min(420px,100%);"></div>
        <div class="grid grid-3" id="cmPublicChapterGrid">
          ${chapters.map(ch => `
            <div class="profile-card" data-name="${esc((ch.marathiName + ' ' + ch.city + ' ' + ch.territory).toLowerCase())}" style="text-align:left; align-items:flex-start;">
              <div class="avatar">🏢</div>
              <div class="name">${esc(ch.marathiName)}</div>
              <div class="role">${esc(ch.territory)} · ${esc(ch.meetingDay)} · ${esc(ch.meetingTime)}</div>
              <div class="tag-list" style="margin:10px 0;">
                <span class="tag">सदस्य: ${ch.capacity - ch.openSeats}</span>
                <span class="tag">Open Seats: ${ch.openSeats}</span>
                <span class="tag">Visitors: ${ch.visitors}</span>
              </div>
              <p style="font-size:0.84rem; color:var(--ink-soft); margin-bottom:10px;">या महिन्यातील व्यवसाय: <strong>${currency(ch.monthlyBusiness)}</strong></p>
              <div style="display:flex; gap:8px; flex-wrap:wrap; width:100%; margin-top:6px;">
                <a href="cm-my-business-mandal.html?chapter=${encodeURIComponent(ch.id)}" class="cta">माझे मंडळ दृश्य</a>
                <a href="cm-chapter-detail.html?chapter=${encodeURIComponent(ch.id)}" class="btn btn-outline" style="padding:8px 14px; font-size:0.8rem;">तपशील पहा</a>
              </div>
            </div>`).join('')}
        </div>
      </section>
      <section>
        <div class="section-head"><div><span class="eyebrow-sm">Workflow</span><h2>व्यवसाय संगम कसे काम करते?</h2></div></div>
        <div class="info-cards-grid">
          <div class="info-box-card"><h4>🏢 व्यवसाय मंडळ</h4><p>शहरनिहाय विश्वासाधारित chapter system with seat logic.</p></div>
          <div class="info-box-card"><h4>🤝 व्यवसाय संधी</h4><p>Trackable opportunity CRM with quality, follow-up and value.</p></div>
          <div class="info-box-card"><h4>👥 एक-ते-एक भेट</h4><p>Collaboration building meetings for deeper understanding and better introductions.</p></div>
        </div>
      </section>`);

    const search = businessSangamRoot.querySelector('#cmChapterSearchPublic');
    if (search) {
      search.addEventListener('input', () => {
        const q = search.value.trim().toLowerCase();
        businessSangamRoot.querySelectorAll('#cmPublicChapterGrid .profile-card').forEach(card => {
          card.style.display = !q || card.dataset.name.includes(q) ? '' : 'none';
        });
      });
    }
  }

  const mandalRoot = document.querySelector('#cmMandalRoot');
  if (mandalRoot) {
    const params = new URLSearchParams(window.location.search);
    const chapterMember = CMDB.getChapterMemberForUser(CMDB.currentUserId());
    const chapter = CMDB.getChapter(params.get('chapter') || (chapterMember && chapterMember.chapterId) || 'CH01');
    const seats = CMDB.getProfessionSeats(chapter.id);
    const members = CMDB.getChapterMembers(chapter.id);setHTML(mandalRoot, `
      <div class="section-head"><div><span class="eyebrow-sm">माझे मंडळ</span><h2>${esc(chapter.marathiName)}</h2></div><a href="cm-business-sangam.html" class="more-link">व्यवसाय संगम मुख्य पृष्ठ →</a></div>
      <div class="stat-strip">
        <div class="cell"><div class="num">${chapter.capacity - chapter.openSeats}</div><div class="lbl">एकूण सदस्य</div></div>
        <div class="cell"><div class="num">${chapter.openSeats}</div><div class="lbl">Open Seats</div></div>
        <div class="cell"><div class="num">${currency(chapter.monthlyBusiness)}</div><div class="lbl">या महिन्यातील व्यवसाय</div></div>
        <div class="cell"><div class="num">${chapter.monthlyOpportunities}</div><div class="lbl">या महिन्यातील संधी</div></div>
      </div>
      <section><div class="grid grid-2" style="gap:18px;"><div class="form-card"><h3 style="margin-bottom:10px; color:var(--maroon-900);">आगामी सभा</h3><p>📅 ${esc(chapter.meetingDay)} · ⏰ ${esc(chapter.meetingTime)} · 📍 ${esc(chapter.venue)}</p><div class="tag-list" style="margin-top:10px;"><span class="tag">एक मिनिट परिचय</span><span class="tag">Visitor Slot: 2</span><span class="tag">Training: AI for Business</span></div></div><div class="form-card"><h3 style="margin-bottom:10px; color:var(--maroon-900);">माझी भूमिका</h3><p><strong>भूमिका:</strong> ${chapterMember ? esc(chapterMember.role) : 'अद्याप सदस्य नाही'}<br><strong>व्यवसाय श्रेणी:</strong> ${chapterMember ? esc(chapterMember.profession) : '—'}<br><strong>Mentor:</strong> ${chapterMember && chapterMember.mentorId ? esc(memberName(chapterMember.mentorId)) : '—'}</p></div></div></section>
      <section><div class="section-head"><h2>मंडळ सदस्य</h2></div><div class="grid grid-4">${members.map(m => `<div class="profile-card"><div class="avatar">👤</div><div class="name">${esc(memberName(m.memberId))}</div><div class="role">${esc(m.profession)} / ${esc(m.specialty)}</div></div>`).join('')}</div></section>
      <section><div class="section-head"><h2>Open Seats</h2></div><div class="info-cards-grid">${seats.filter(s => s.status !== 'occupied').map(s => `<div class="info-box-card"><h4>${esc(s.category)}</h4><p>${esc(s.specialty)}</p><div class="tag-list"><span class="tag">${s.status === 'approval' ? 'विशेष मंजुरी' : 'उपलब्ध'}</span></div></div>`).join('') || '<div class="notice">सध्या कोणतीही seat उपलब्ध नाही.</div>'}</div></section>`);
  }

  const opportunitiesRoot = document.querySelector('#cmOpportunitiesRoot');
  if (opportunitiesRoot) {
    function statusClass(status) {
      const s = String(status || '').toLowerCase();
      if (s === 'new') return 'new';
      if (s === 'won' || s === 'completed') return 'won';
      if (s === 'lost') return 'cancelled';
      return 'active';
    }
    function renderOpportunities() {
      const list = CMDB.listOpportunities({ memberId: CMDB.currentUserId() });setHTML(opportunitiesRoot, `
        <div class="section-head"><div><span class="eyebrow-sm">दिलेल्या व मिळालेल्या संधी</span><h2>व्यवसाय संधी व्यवस्थापन</h2></div><a href="cm-business-sangam.html" class="more-link">मुख्य पृष्ठ →</a></div>
        <div class="tabs" data-tabs="#opportunityGrid"><button class="tab active" data-filter="all">सर्व</button><button class="tab" data-filter="new">नवीन</button><button class="tab" data-filter="active">चर्चा / प्रस्ताव</button><button class="tab" data-filter="won">व्यवसाय निश्चित</button><button class="tab" data-filter="cancelled">रद्द</button></div>
        <div id="opportunityGrid">${list.map(o => `<div class="list-row" data-cat="${statusClass(o.status)}" data-name="${esc((o.id + ' ' + o.requirement + ' ' + o.location).toLowerCase())}"><div class="thumb">${esc(o.qualityGrade)}</div><div class="content"><h4>${esc(o.id)} · ${esc(o.requirement)}</h4><div class="meta">देणारे: ${esc(memberName(o.creator))} · मिळणारे: ${esc(memberName(o.recipient))} · शहर: ${esc(o.location)}</div><div class="meta">Expected Value: ${currency(o.estimatedValue)} · स्थिती: ${esc(o.status)} · Follow-up: ${esc(o.followUpDate || '—')}</div></div></div>`).join('')}</div>
        <div class="notice">ℹ️ Quality-based opportunity model: A = अत्यंत योग्य, B = योग्य, C = संभाव्य, D = प्राथमिक माहिती.</div>
        <section>
          <div class="section-head"><h2>नवीन व्यवसाय संधी तयार करा</h2></div>
          <form id="cmOpportunityForm" class="form-card sangam-form-grid">
            <div class="field"><label>कोणाला द्यायची?</label><select id="oppRecipient">${CMDB.raw().members.filter(m => m.id !== CMDB.currentUserId()).map(m => `<option value="${m.id}">${esc(m.name)} · ${esc(m.profession || 'सदस्य')}</option>`).join('')}</select></div>
            <div class="field"><label>श्रेणी</label><input id="oppCategory" placeholder="उदा. Digital Marketing"></div>
            <div class="field full"><label>गरज</label><textarea id="oppRequirement" rows="2" placeholder="ग्राहकाची गरज लिहा..."></textarea></div>
            <div class="field"><label>शहर</label><input id="oppLocation" value="${esc(CMDB.currentMember().city)}"></div>
            <div class="field"><label>Expected Value (₹)</label><input id="oppValue" type="number" min="0" value="50000"></div>
            <div class="field"><label>Quality Grade</label><select id="oppGrade"><option>A</option><option selected>B</option><option>C</option><option>D</option></select></div>
            <div class="field"><label>Follow-up Date</label><input id="oppFollowUp" type="date"></div>
            <div class="field full"><label>नोंदी</label><textarea id="oppNotes" rows="2"></textarea></div>
            <div class="field full"><button type="submit" class="btn btn-primary">🤝 व्यवसाय संधी सेव्ह करा</button></div>
          </form>
        </section>`);

      const tabs = opportunitiesRoot.querySelectorAll('.tab');
      tabs.forEach(tab => tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const filter = tab.dataset.filter;
        opportunitiesRoot.querySelectorAll('#opportunityGrid .list-row').forEach(row => {
          row.style.display = (filter === 'all' || row.dataset.cat === filter) ? '' : 'none';
        });
      }));

      const form = opportunitiesRoot.querySelector('#cmOpportunityForm');
      form.addEventListener('submit', e => {
        e.preventDefault();
        CMDB.createOpportunity({
          chapterId: (CMDB.getChapterMemberForUser(CMDB.currentUserId()) || {}).chapterId || 'CH01',
          recipient: form.querySelector('#oppRecipient').value,
          category: form.querySelector('#oppCategory').value.trim(),
          requirement: form.querySelector('#oppRequirement').value.trim(),
          location: form.querySelector('#oppLocation').value.trim(),
          estimatedValue: parseInt(form.querySelector('#oppValue').value, 10) || 0,
          qualityGrade: form.querySelector('#oppGrade').value,
          followUpDate: form.querySelector('#oppFollowUp').value,
          notes: form.querySelector('#oppNotes').value.trim(),
          prospect: form.querySelector('#oppRequirement').value.trim()
        });
        toast('व्यवसाय संधी यशस्वीरीत्या तयार झाली!', 'success');
        renderOpportunities();
      });
    }
    renderOpportunities();
  }

  const oneToOneRoot = document.querySelector('#cmOneToOneRoot');
  if (oneToOneRoot) {
    function renderOneToOnes() {
      const meetings = CMDB.getOneToOneMeetings(CMDB.currentUserId());setHTML(oneToOneRoot, `
        <div class="section-head"><div><span class="eyebrow-sm">Collaboration Engine</span><h2>एक-ते-एक व्यवसाय भेटी</h2></div><a href="cm-business-sangam.html" class="more-link">व्यवसाय संगम →</a></div>
        <section><div class="grid grid-2" style="gap:20px;"><div class="form-card"><h3 style="margin-bottom:14px; color:var(--maroon-900);">Meeting Request</h3><form id="cmOneToOneForm" class="sangam-form-grid"><div class="field"><label>To Member</label><select id="otoRecipient">${CMDB.raw().members.filter(m => m.id !== CMDB.currentUserId()).map(m => `<option value="${m.id}">${esc(m.name)}</option>`).join('')}</select></div><div class="field"><label>Mode</label><select id="otoMode"><option>Offline</option><option>Online</option></select></div><div class="field"><label>Date</label><input id="otoDate" type="date"></div><div class="field"><label>Time</label><input id="otoTime" type="text" placeholder="11:30 AM"></div><div class="field full"><label>Purpose</label><input id="otoPurpose" placeholder="भेटीचा उद्देश"></div><div class="field full"><label>Discussion Topics</label><textarea id="otoTopics" rows="3" placeholder="SME clients, GST referrals..."></textarea></div><div class="field full"><label>Location / Online link note</label><input id="otoLocation" placeholder="शिवाजीनगर / Google Meet"></div><div class="field full"><button class="btn btn-primary" type="submit">भेट विनंती पाठवा</button></div></form></div><div class="form-card"><h3 style="margin-bottom:14px; color:var(--maroon-900);">Suggested Collaboration</h3><div class="tag-list"><span class="tag">Digital Marketing ↔ CA</span><span class="tag">Architect ↔ Lawyer</span><span class="tag">Builder ↔ Supplier</span></div><p style="margin-top:12px;">System identified potential business chain based on profile overlap, profession seats and opportunity history.</p></div></div></section>
        <section><div class="section-head"><h2>Scheduled Meetings</h2></div>${meetings.map((m, i) => `<div class="list-row" style="margin-top:${i ? 12 : 0}px;"><div class="thumb">${i + 1}</div><div class="content"><h4>${esc(memberName(m.requesterId))} ↔ ${esc(memberName(m.recipientId))}</h4><div class="meta">${esc(m.date)} · ${esc(m.time)} · ${esc(m.location)}</div><div class="meta">विषय: ${esc(m.topics || m.purpose)} · स्थिती: ${esc(m.status)}</div></div></div>`).join('') || '<div class="notice">अद्याप कोणतीही भेट शेड्यूल केलेली नाही.</div>'}</section>`);

      oneToOneRoot.querySelector('#cmOneToOneForm').addEventListener('submit', e => {
        e.preventDefault();
        CMDB.createOneToOneMeeting({
          chapterId: (CMDB.getChapterMemberForUser(CMDB.currentUserId()) || {}).chapterId || 'CH01',
          recipientId: oneToOneRoot.querySelector('#otoRecipient').value,
          mode: oneToOneRoot.querySelector('#otoMode').value,
          date: oneToOneRoot.querySelector('#otoDate').value,
          time: oneToOneRoot.querySelector('#otoTime').value.trim(),
          purpose: oneToOneRoot.querySelector('#otoPurpose').value.trim(),
          topics: oneToOneRoot.querySelector('#otoTopics').value.trim(),
          location: oneToOneRoot.querySelector('#otoLocation').value.trim(),
          status: 'requested'
        });
        toast('एक-ते-एक भेट विनंती तयार झाली!', 'success');
        renderOneToOnes();
      });
    }
    renderOneToOnes();
  }

  const chapterDetailRoot = document.querySelector('#cmChapterDetailRoot');
  if (chapterDetailRoot) {
    const params = new URLSearchParams(window.location.search);
    const detail = CMDB.getChapterPublicDetail(params.get('chapter') || 'CH01');
    if (!detail) {setHTML(chapterDetailRoot, '<div class="notice">व्यवसाय मंडळ सापडले नाही.</div>');
    } else {setHTML(chapterDetailRoot, `
        <div class="section-head"><div><span class="eyebrow-sm">व्यवसाय मंडळ तपशील</span><h2>${esc(detail.chapter.marathiName)}</h2></div><a href="cm-business-sangam.html" class="more-link">← सर्व मंडळे</a></div>
        <div class="kpi-grid">
          <div class="kpi-card"><div class="kpi-label">क्षेत्र</div><div class="kpi-value">${esc(detail.chapter.territory)}</div></div>
          <div class="kpi-card"><div class="kpi-label">सभा</div><div class="kpi-value">${esc(detail.chapter.meetingDay)} · ${esc(detail.chapter.meetingTime)}</div></div>
          <div class="kpi-card"><div class="kpi-label">Monthly Business</div><div class="kpi-value">${currency(detail.chapter.monthlyBusiness)}</div></div>
          <div class="kpi-card"><div class="kpi-label">Monthly Opportunities</div><div class="kpi-value">${detail.chapter.monthlyOpportunities}</div></div>
        </div>
        <div class="grid grid-2" style="gap:20px; align-items:start;">
          <div class="info-box-card"><h4>मंडळ परिचय</h4><p>${esc(detail.chapter.description)}</p><div class="tag-list"><span class="tag">Venue: ${esc(detail.chapter.venue)}</span><span class="tag">Visitors: ${detail.chapter.visitors}</span><span class="tag">Open Seats: ${detail.openSeats.length}</span></div></div>
          <div class="info-box-card"><h4>Leadership</h4><p><strong>अध्यक्ष:</strong> ${esc((CMDB.getMember(detail.chapter.leaders.president) || {}).name || '—')}</p><p><strong>उपाध्यक्ष:</strong> ${esc((CMDB.getMember(detail.chapter.leaders.vicePresident) || {}).name || '—')}</p><p><strong>सचिव:</strong> ${esc((CMDB.getMember(detail.chapter.leaders.secretary) || {}).name || '—')}</p></div>
        </div>
        <section><div class="section-head"><h2>Seat Map</h2></div><div class="info-cards-grid">${detail.seats.map(s => `<div class="info-box-card"><h4>${esc(s.category)}</h4><p>${esc(s.specialty)}</p><div class="tag-list"><span class="tag">${s.status === 'occupied' ? 'भरलेले' : (s.status === 'approval' ? 'मंजुरी आवश्यक' : 'उपलब्ध')}</span>${s.memberId ? `<span class="tag">${esc((CMDB.getMember(s.memberId) || {}).name || '')}</span>` : ''}</div></div>`).join('')}</div></section>
        <section><div class="section-head"><h2>मंडळ सदस्य</h2></div><div class="grid grid-3">${detail.members.map(m => `<a class="profile-card" href="cm-profile.html?id=${encodeURIComponent(m.memberId)}" style="text-align:left; align-items:flex-start;"><div class="avatar">${esc((m.member && m.member.avatar) || '👤')}</div><div class="name">${esc((m.member && m.member.name) || m.memberId)}</div><div class="role">${esc(m.profession)} · ${esc(m.specialty)}</div></a>`).join('')}</div></section>
        <section><div class="section-head"><h2>अलीकडील व्यवसाय संधी</h2></div>${detail.opportunities.slice(0,5).map(o => `<div class="list-row" style="margin-bottom:12px;"><div class="thumb">${esc(o.qualityGrade)}</div><div class="content"><h4>${esc(o.id)} · ${esc(o.requirement)}</h4><div class="meta">${esc((CMDB.getMember(o.creator) || {}).name || '')} → ${esc((CMDB.getMember(o.recipient) || {}).name || '')} · ${esc(o.location)}</div><div class="meta">${currency(o.estimatedValue)} · ${esc(o.status)}</div></div></div>`).join('') || '<div class="notice">अद्याप संधी नाहीत.</div>'}</section>
      `);
    }
  }

  const unifiedSearchRoot = document.querySelector('#cmUnifiedSearchRoot');
  if (unifiedSearchRoot) {
    function renderUnifiedSearch(query) {
      const res = query ? CMDB.unifiedSearch(query) : { members: [], businesses: [], chapters: [], events: [], campaigns: [] };
      const whoHelp = query ? CMDB.whoCanHelpMe(query) : [];setHTML(unifiedSearchRoot, `
        <div class="section-head"><div><span class="eyebrow-sm">Global Search Intelligence</span><h2>मराठा शोध व 'मला कोण मदत करू शकते?' इंजिन</h2></div></div>
        
        <!-- Who Can Help Me Search Box -->
        <div class="form-card" style="margin-bottom:20px; background: linear-gradient(135deg, #fff3e0, #ffe0b2); border: 1px solid var(--saffron-500);">
          <label style="font-weight:700; color:var(--maroon-900); font-size:1.1rem; display:block; margin-bottom:8px;">💡 "मला कोण मदत करू शकते?" (Who Can Help Me? Search)</label>
          <p style="color:#666; font-size:0.9rem; margin-bottom:12px;">तुमची व्यावसायिक किंवा वैयक्तिक गरज नैसर्गिक भाषेत टाका (उदा. <em>"पुण्यात स्टार्टअप टॅक्स हाताळणारा CA"</em> किंवा <em>"वेब डेव्हलपर"</em>)</p>
          <div style="display:flex; gap:8px;">
            <input id="cmUnifiedSearchInput" class="form-control" value="${esc(query || '')}" placeholder="उदा. CA पुणे, डिजिटल मार्केटिंग, वकील, ट्रेकिंग मार्गदर्शक..." style="flex:1; padding:12px; border-radius:8px; border:1px solid #ccc; font-size:1rem;">
            <button class="btn btn-primary" onclick="renderUnifiedSearch(document.getElementById('cmUnifiedSearchInput').value.trim())">शोधा 🔎</button>
          </div>
        </div>

        <!-- Best Match Cards (Who Can Help Me Results) -->
        ${whoHelp.length > 0 ? `
          <div class="form-card" style="margin-bottom:24px; border-left:5px solid #2e7d32; background:#f1f8e9;">
            <h3 style="color:#2e7d32; margin-bottom:12px;">🌟 सर्वोत्कृष्ट जुळणारे (BEST MATCHES FOR YOU)</h3>
            <div class="grid grid-2" style="gap:16px;">
              ${whoHelp.slice(0, 4).map(w => `
                <div style="background:white; padding:16px; border-radius:8px; border:1px solid #c8e6c9;">
                  <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                    <div>
                      <span class="badge badge-success">${w.type === 'member' ? 'तज्ज्ञ सदस्य' : 'व्यवसाय'}</span>
                      <h4 style="margin-top:6px; margin-bottom:2px; color:var(--maroon-900);">${esc(w.name)}</h4>
                      <p style="color:#555; font-size:0.9rem;">${esc(w.title)}</p>
                      <small style="color:#777;">📍 ${esc(w.location)}</small>
                    </div>
                    <div style="text-align:right;">
                      <span style="font-weight:700; color:#e65100;">⭐ ${w.rating}</span>
                      <div style="font-size:0.75rem; color:#555; margin-top:4px;">परस्पर संपर्क: <strong>${w.mutualConnections}</strong></div>
                    </div>
                  </div>
                  <div style="margin-top:12px; display:flex; gap:8px;">
                    <a href="cm-one-to-one-meetings.html" class="btn btn-primary btn-sm" style="flex:1; text-align:center;">🤝 भेट / परिचय मागा</a>
                    <a href="${w.type === 'member' ? 'cm-profile.html?id=' + w.id : 'cm-business-profile.html?id=' + w.id}" class="btn btn-outline btn-sm">प्रोफाईल पहा</a>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        ${query ? `
        <div class="grid grid-2" style="gap:18px; align-items:start;">
          <div class="info-box-card"><h4>👥 सदस्य (Members) (${res.members.length})</h4>${res.members.slice(0,8).map(m => `<div style="padding:6px 0; border-bottom:1px solid var(--line);"><a href="cm-profile.html?id=${encodeURIComponent(m.id)}">${esc(m.name)}</a> <span class="muted">· ${esc(m.city)} · ${esc(m.profession || '-')}</span></div>`).join('') || '<div class="muted">काही सापडले नाही.</div>'}</div>
          <div class="info-box-card"><h4>🏢 व्यवसाय (Businesses) (${res.businesses.length})</h4>${res.businesses.slice(0,8).map(b => `<div style="padding:6px 0; border-bottom:1px solid var(--line);"><a href="cm-business-profile.html?id=${encodeURIComponent(b.id)}">${esc(b.name)}</a> <span class="muted">· ${esc(b.city)} · ${esc(b.owner)}</span></div>`).join('') || '<div class="muted">काही सापडले नाही.</div>'}</div>
          <div class="info-box-card"><h4>🏛️ व्यवसाय मंडळे (${res.chapters.length})</h4>${res.chapters.slice(0,8).map(c => `<div style="padding:6px 0; border-bottom:1px solid var(--line);"><a href="cm-chapter-detail.html?chapter=${encodeURIComponent(c.id)}">${esc(c.marathiName)}</a> <span class="muted">· ${esc(c.city)} · ${esc(c.territory)}</span></div>`).join('') || '<div class="muted">काही सापडले नाही.</div>'}</div>
          <div class="info-box-card"><h4>📅 कार्यक्रम (${res.events.length})</h4>${res.events.slice(0,8).map(e => `<div style="padding:6px 0; border-bottom:1px solid var(--line);">${esc(e.title)} <span class="muted">· ${esc(e.date)} · ${esc(e.venue)}</span></div>`).join('') || '<div class="muted">काही सापडले नाही.</div>'}</div>
        </div>` : '<div class="notice">शोध सुरू करण्यासाठी वर काहीतरी टाइप करा.</div>'}`);

      const input = unifiedSearchRoot.querySelector('#cmUnifiedSearchInput');
      if (input) {
        input.addEventListener('keyup', (e) => {
          if (e.key === 'Enter') renderUnifiedSearch(input.value.trim());
        });
      }
    }
    window.renderUnifiedSearch = renderUnifiedSearch;
    renderUnifiedSearch(new URLSearchParams(window.location.search).get('q') || '');
  }

  const businessMembershipRoot = document.querySelector('#cmBusinessMembershipRoot');
  if (businessMembershipRoot) {
    const me = CMDB.currentMember();
    function renderApplications() {
      const apps = CMDB.getBusinessApplications(me.id);setHTML(businessMembershipRoot, `
        <div class="section-head"><div><span class="eyebrow-sm">Application → Verification → Approval</span><h2>Connect Maratha व्यवसाय सदस्यत्व अर्ज</h2></div><a href="cm-business-sangam.html" class="more-link">व्यवसाय संगम →</a></div>
        <div class="form-card">
          <form id="cmBusinessMembershipForm" class="sangam-form-grid">
            <div class="field"><label>पूर्ण नाव</label><input id="bmFullName" value="${esc(me.name)}"></div>
            <div class="field"><label>शहर / जिल्हा</label><input id="bmCity" value="${esc(me.city)}"></div>
            <div class="field"><label>व्यवसायाचे नाव</label><input id="bmBusinessName" placeholder="उदा. सह्याद्री ग्रोथ मीडिया"></div>
            <div class="field"><label>व्यवसाय श्रेणी</label><input id="bmCategory" placeholder="Digital Marketing"></div>
            <div class="field"><label>Specialty</label><input id="bmSpecialty" placeholder="Full Service Agency"></div>
            <div class="field"><label>मंडळ</label><select id="bmChapter">${CMDB.getChapters().map(ch => `<option value="${ch.id}">${esc(ch.marathiName)}</option>`).join('')}</select></div>
            <div class="field full"><label>माझा आदर्श ग्राहक</label><textarea id="bmIdealCustomer" rows="3"></textarea></div>
            <div class="field full"><label>मला कोणत्या प्रकारच्या व्यवसाय संधी हव्यात?</label><textarea id="bmWanted" rows="2"></textarea></div>
            <div class="field full"><label>मी कोणत्या व्यवसायांना संधी देऊ शकतो?</label><textarea id="bmCanRefer" rows="2"></textarea></div>
            <div class="field"><label>GSTIN / Registration</label><input id="bmGstin"></div>
            <div class="field"><label>Website</label><input id="bmWebsite"></div>
            <div class="field full"><div class="notice safe">✅ Workflow: अर्ज → Business category check → Profession seat availability → Verification → Interview → Mandal approval → Onboarding.</div></div>
            <div class="field full"><button class="btn btn-primary btn-block" type="submit">अर्ज सबमिट करा</button></div>
          </form>
        </div>
        <section>
          <div class="section-head"><h2>माझे अर्ज</h2></div>
          ${apps.map(a => `<div class="list-row" style="margin-bottom:12px;"><div class="thumb">📝</div><div class="content"><h4>${esc(a.businessName || 'नवीन अर्ज')}</h4><div class="meta">${esc(a.category)} · ${esc(a.specialty)} · ${esc((CMDB.getChapter(a.chapterId) || {}).marathiName || '')}</div><div class="meta">स्थिती: ${esc(a.status)} · दिनांक: ${esc(a.submittedOn)}</div></div></div>`).join('') || '<div class="notice">अद्याप कोणताही अर्ज सबमिट केलेला नाही.</div>'}
        </section>`);

      businessMembershipRoot.querySelector('#cmBusinessMembershipForm').addEventListener('submit', e => {
        e.preventDefault();
        CMDB.submitBusinessMembershipApplication({
          fullName: businessMembershipRoot.querySelector('#bmFullName').value.trim(),
          city: businessMembershipRoot.querySelector('#bmCity').value.trim(),
          businessName: businessMembershipRoot.querySelector('#bmBusinessName').value.trim(),
          category: businessMembershipRoot.querySelector('#bmCategory').value.trim(),
          specialty: businessMembershipRoot.querySelector('#bmSpecialty').value.trim(),
          chapterId: businessMembershipRoot.querySelector('#bmChapter').value,
          idealCustomer: businessMembershipRoot.querySelector('#bmIdealCustomer').value.trim(),
          referralsWanted: businessMembershipRoot.querySelector('#bmWanted').value.trim(),
          canRefer: businessMembershipRoot.querySelector('#bmCanRefer').value.trim(),
          gstin: businessMembershipRoot.querySelector('#bmGstin').value.trim(),
          website: businessMembershipRoot.querySelector('#bmWebsite').value.trim()
        });
        toast('व्यवसाय सदस्यत्व अर्ज यशस्वीरीत्या सबमिट झाला!', 'success');
        renderApplications();
      });
    }
    renderApplications();
  }

  // Save/unsave fort or article buttons anywhere: [data-bookmark="forts|id|label"]
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-bookmark]');
    if (!btn) return;
    e.preventDefault();
    const [kind, id, label] = btn.dataset.bookmark.split('|');
    const saved = CMDB.toggleBookmark(kind, id, label);
    toast(saved ? 'Save केले!' : 'Save काढले.', saved ? 'success' : 'info');
    btn.textContent = saved ? '★ Saved' : '☆ Save करा';
  });

  document.querySelectorAll('[data-bookmark]').forEach(btn => {
    const [kind, id] = btn.dataset.bookmark.split('|');
    if (CMDB.isBookmarked(kind, id)) btn.textContent = '★ Saved';
  });

  // =====================================================================
  // 11. Registration → persist full profile into CMDB on final step
  // =====================================================================
  const regStepForm = document.querySelector('.step-form');
  if (regStepForm && document.querySelector('#regFullName')) {
    const finishBtn = regStepForm.querySelector('.step-panel:last-child [data-next], .step-panel:last-child a.btn-primary');
    const applyBtn = regStepForm.querySelectorAll('[data-next]');
    applyBtn.forEach(btn => {
      btn.addEventListener('click', () => {
        const panel = btn.closest('.step-panel');
        if (!panel) return;
        // Persist whatever fields exist on this panel into CMDB progressively
        const patch = {};
        const grab = (sel) => { const el = panel.querySelector(sel); return el ? el.value.trim() : null; };
        if (grab('#regFullName')) patch.name = grab('#regFullName');
        if (grab('#regCity')) { patch.city = grab('#regCity'); patch.district = grab('#regCity'); }
        if (grab('#regProfession')) patch.profession = grab('#regProfession');
        if (grab('#regBusiness')) patch.business = grab('#regBusiness');
        if (grab('#regSkills')) patch.skills = grab('#regSkills').split(',').map(s => s.trim()).filter(Boolean);
        if (grab('#regEducation')) patch.education = grab('#regEducation');
        if (grab('#regInterests')) patch.interests = [grab('#regInterests')];
        if (grab('#regAbout')) patch.about = grab('#regAbout');
        if (grab('#regVolunteer')) patch.volunteer = grab('#regVolunteer').split(',').map(s => s.trim()).filter(Boolean);
        if (Object.keys(patch).length) CMDB.upsertCurrentMember(patch);
      });
    });
  }

  // =====================================================================
  // 12. Membership tier display + selection sync with CMDB (cm-membership.html)
  // =====================================================================
  const priceCards = document.querySelectorAll('.price-card');
  if (priceCards.length && document.title.indexOf('सदस्यत्व') !== -1) {
    const me = CMDB.currentMember();
    priceCards.forEach(card => {
      const tierName = card.querySelector('h4') ? card.querySelector('h4').textContent.trim() : '';
      if (tierName && tierName === me.tier) {
        const btn = card.querySelector('.btn');
        if (btn) btn.textContent = '✓ सध्याची योजना';
        card.style.borderColor = 'var(--gold-500)';
      }
      const btn = card.querySelector('.btn');
      if (btn) {
        btn.addEventListener('click', () => {
          if (!tierName) return;
          CMDB.upsertCurrentMember({ tier: tierName });
        });
      }
    });
  }
});
