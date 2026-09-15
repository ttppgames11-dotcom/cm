/**
 * Connect Maratha (कनेक्ट मराठा) — Core Client-Side Logic
 * 100% Pure Vanilla JavaScript - No Frameworks or External Libraries
 */

// Toast notification helper
function showToast(message, type = 'success') {
  let container = document.querySelector('.cm-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'cm-toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `cm-toast ${type}`;
  const icon = type === 'success' ? '✓' : 'ℹ';
  toast.innerHTML = `<span style="font-weight:700; color:var(--gold-400);">${icon}</span><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-16px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

document.addEventListener('DOMContentLoaded', () => {

  function initMobileDrawer() {
    const siteHeaderInner = document.querySelector('.site-header .site-header-inner');
    if (!siteHeaderInner || document.querySelector('.mobile-menu-btn')) return;

    const currentFile = window.location.pathname.split('/').pop() || 'index.html';
    const actionContainer = siteHeaderInner.querySelector('.header-actions');
    const menuBtn = document.createElement('button');
    menuBtn.type = 'button';
    menuBtn.className = 'mobile-menu-btn';
    menuBtn.setAttribute('aria-label', 'मोबाइल मेनू उघडा');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.innerHTML = '<span></span><span></span><span></span>';

    const backdrop = document.createElement('div');
    backdrop.className = 'mobile-nav-backdrop';

    const drawer = document.createElement('aside');
    drawer.className = 'mobile-nav-drawer';
    drawer.setAttribute('aria-hidden', 'true');
    drawer.innerHTML = `
      <div class="mobile-drawer-header">
        <a href="index.html" class="mobile-drawer-brand">
          <img src="assets/images/logo.png" alt="Connect Maratha Logo">
          <span>CONNECT मराठा</span>
        </a>
        <button type="button" class="mobile-drawer-close" aria-label="मेनू बंद करा">✕</button>
      </div>
      <nav class="mobile-drawer-nav">
        <div class="drawer-section-title">मुख्य विभाग</div>
        <a href="index.html">🏠 मुखपृष्ठ</a>
        <a href="cm-search.html">🔎 सर्वत्र शोध</a>
        <a href="cm-history.html">⚔️ मराठा इतिहास</a>
        <a href="cm-forts-map.html">🏰 गड-किल्ले</a>
        <a href="cm-warriors.html">🛡️ अमर शिलेदार</a>
        <a href="cm-directory-people.html">👥 समुदाय</a>
        <a href="cm-business-sangam.html">🤝 व्यवसाय संगम</a>
        <a href="cm-business-directory.html">🏢 व्यवसाय निर्देशिका</a>
        <a href="cm-services.html">🛠️ सेवा</a>
        <a href="cm-events.html">📅 कार्यक्रम</a>
        <a href="cm-donation.html">❤️ दान व निधी</a>
        <a href="cm-more.html">📂 अधिक विभाग</a>
        <div class="drawer-section-title">सदस्य क्षेत्र</div>
        <a href="cm-dashboard.html">📊 डॅशबोर्ड</a>
        <a href="cm-profile.html">👤 प्रोफाईल</a>
        <a href="cm-messages.html">💬 मेसेजेस</a>
        <a href="cm-login.html">🔐 लॉगिन</a>
        <a href="cm-register.html">🚩 नोंदणी</a>
      </nav>
      <div class="mobile-drawer-footer">
        <a href="cm-contact.html" class="btn btn-outline" style="width:100%; justify-content:center;">☎️ संपर्क व मदत</a>
      </div>
    `;

    document.body.appendChild(backdrop);
    document.body.appendChild(drawer);

    if (actionContainer) {
      actionContainer.appendChild(menuBtn);
    } else {
      siteHeaderInner.appendChild(menuBtn);
    }

    drawer.querySelectorAll('a').forEach(link => {
      const href = link.getAttribute('href') || '';
      if (href.split('/').pop() === currentFile) {
        link.classList.add('active');
      }
    });

    const closeBtn = drawer.querySelector('.mobile-drawer-close');

    function openDrawer() {
      menuBtn.classList.add('active');
      menuBtn.setAttribute('aria-expanded', 'true');
      backdrop.classList.add('open');
      drawer.classList.add('open');
      drawer.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closeDrawer() {
      menuBtn.classList.remove('active');
      menuBtn.setAttribute('aria-expanded', 'false');
      backdrop.classList.remove('open');
      drawer.classList.remove('open');
      drawer.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    menuBtn.addEventListener('click', () => {
      if (drawer.classList.contains('open')) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });

    closeBtn.addEventListener('click', closeDrawer);
    backdrop.addEventListener('click', closeDrawer);
    drawer.querySelectorAll('a').forEach(link => link.addEventListener('click', closeDrawer));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.classList.contains('open')) {
        closeDrawer();
      }
    });
  }

  initMobileDrawer();

  // 1. Universal Bottom Navigation Highlighting & Link Binding
  document.querySelectorAll('.bottom-nav').forEach(nav => {
    const currentFile = window.location.pathname.split('/').pop() || 'index.html';
    const links = nav.querySelectorAll('a');

    links.forEach(a => {
      const href = a.getAttribute('href');
      // Highlight active link accurately
      if (href) {
        const linkFile = href.split('/').pop();
        if (
          (currentFile === 'index.html' || currentFile === 'cm-home.html' || currentFile === '') &&
          (linkFile === 'index.html' || linkFile === 'cm-home.html')
        ) {
          a.classList.add('active');
        } else if (linkFile === currentFile) {
          a.classList.add('active');
        } else {
          a.classList.remove('active');
        }
      }
    });
  });

  // 2. Tab / Category Filter switching
  document.querySelectorAll('[data-tabs]').forEach(group => {
    const tabs = group.querySelectorAll('.tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const targetGrid = document.querySelector(group.dataset.tabs);
        const filter = tab.dataset.filter;
        if (targetGrid) {
          targetGrid.querySelectorAll('[data-cat]').forEach(card => {
            card.style.display = (filter === 'all' || card.dataset.cat === filter) ? '' : 'none';
          });
        }
      });
    });
  });

  // 3. Search-as-you-type filter
  document.querySelectorAll('[data-search]').forEach(input => {
    input.addEventListener('input', () => {
      const grid = document.querySelector(input.dataset.search);
      const q = input.value.trim().toLowerCase();
      if (!grid) return;
      grid.querySelectorAll('[data-name]').forEach(card => {
        const name = (card.dataset.name || '').toLowerCase();
        const text = card.textContent.toLowerCase();
        card.style.display = (name.includes(q) || text.includes(q)) ? '' : 'none';
      });
    });
  });

  // 4. District Chips Filter (Forts page: cm-forts-map.html)
  const districtMap = {
    'पुणे विभाग': ['पुणे', 'सातारा', 'कोल्हापूर', 'सांगली', 'सोलापूर'],
    'कोकण विभाग': ['रायगड', 'सिंधुदुर्ग', 'रत्नागिरी', 'ठाणे', 'मुंबई', 'जंजिरा'],
    'नाशिक विभाग': ['नाशिक', 'अहमदनगर', 'धुळे', 'जळगाव'],
    'औरंगाबाद विभाग': ['औरंगाबाद', 'छत्रपती संभाजीनगर', 'जालना', 'बीड', 'नांदेड'],
    'नागपूर विभाग': ['नागपूर', 'वर्धा', 'चंद्रपूर'],
    'अमरावती विभाग': ['अमरावती', 'अकोला', 'बुलढाणा']
  };

  document.querySelectorAll('.district-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.district-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      const fortGrid = document.querySelector('#fortGrid');
      if (fortGrid) {
        const chipText = chip.textContent.trim();
        const allowedKeywords = districtMap[chipText] || [];

        fortGrid.querySelectorAll('.feature-card').forEach(card => {
          const cardText = card.textContent;
          if (allowedKeywords.length === 0) {
            card.style.display = '';
          } else {
            const matches = allowedKeywords.some(kw => cardText.includes(kw));
            card.style.display = matches ? '' : 'none';
          }
        });
      }
    });
  });

  // 5. Multi-Step Form Navigation (cm-register.html)
  document.querySelectorAll('.step-form').forEach(form => {
    const steps = Array.from(form.querySelectorAll('.step'));
    const panels = Array.from(form.querySelectorAll('.step-panel'));
    let current = 0;

    function render() {
      steps.forEach((s, i) => {
        s.classList.toggle('active', i === current);
        s.classList.toggle('done', i < current);
      });
      panels.forEach((p, i) => p.classList.toggle('active', i === current));
    }

    form.querySelectorAll('[data-next]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        // If transitioning from step 1 to 2, read and save user details
        if (current === 0) {
          const nameInput = form.querySelector('input[type="text"]');
          if (nameInput && nameInput.value.trim()) {
            localStorage.setItem('cm_user_name', nameInput.value.trim());
          }
          showToast('OTP यशस्वीरीत्या पाठवला!', 'info');
        }

        if (current < panels.length - 1) {
          current++;
          render();
          window.scrollTo({ top: form.offsetTop - 80, behavior: 'smooth' });

          // On step 5 (final), update ID Card if present
          if (current === panels.length - 1) {
            const userName = localStorage.getItem('cm_user_name') || 'राहुल तानाजी भोसले';
            const randomId = 'CM' + Math.floor(10000000 + Math.random() * 90000000);

            // Bug fix: migrate the in-progress CMDB member (built up under the
            // pre-registration 'ME' id during steps 1-4) onto the new permanent
            // member ID, so profile data entered during registration is not lost.
            if (window.CMDB) {
              const inProgress = CMDB.currentMember();
              inProgress.id = randomId;
              CMDB.persist();
            }

            localStorage.setItem('cm_user_id', randomId);
            localStorage.setItem('cm_user_registered', 'true');

            const idEl = form.querySelector('.success-box strong');
            if (idEl) idEl.textContent = randomId;
            showToast('नोंदणी यशस्वी झाली! अभिनंदन!', 'success');
          }
        }
      });
    });

    form.querySelectorAll('[data-back]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (current > 0) {
          current--;
          render();
        }
      });
    });

    render();
  });

  // 6. Count-Up Animation for stats (<b data-countup="350">0</b>)
  const countEls = document.querySelectorAll('[data-countup]');
  if (countEls.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.countup, 10);
        const suffix = el.dataset.suffix || '';
        const duration = 1200;
        const start = performance.now();

        function tick(now) {
          const p = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(eased * target).toLocaleString('en-IN') + suffix;
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        io.unobserve(el);
      });
    }, { threshold: 0.3 });

    countEls.forEach(el => io.observe(el));
  }

  // 9. Interactive Donation Workflow (cm-donation.html) — legacy fallback,
  // only used on pages where the campaign grid is NOT rendered dynamically
  // by cm-connect.js (i.e. no [data-dynamic] campaign grid present).
  function openDonationModal(campTitle, card) {
    let modal = document.getElementById('donationModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.className = 'cm-modal';
      modal.id = 'donationModal';
      modal.innerHTML = `
        <div class="cm-modal-box">
          <div class="cm-modal-header">
            <h3>❤️ देणगी व मदत निधी</h3>
            <button type="button" class="cm-modal-close">✕</button>
          </div>
          <form id="donationForm">
            <div class="cm-modal-body">
              <div style="background:rgba(233,196,106,0.15); padding:12px 14px; border-radius:8px; border-left:3px solid var(--gold-500); margin-bottom:16px;">
                <div style="font-weight:700; color:var(--maroon-950); font-size:1.02rem;" id="donateCampTitle">मोहीम</div>
                <div style="font-size:0.82rem; color:var(--saffron-700); font-weight:600; margin-top:3px;">80G आयकर सवलत व डिजिटल पावती उपलब्ध</div>
              </div>
              <label>देणगी रक्कम (₹):</label>
              <div style="display:flex; gap:8px; margin-bottom:12px;">
                <button type="button" class="btn btn-outline donate-quick-amt" data-amt="250" style="padding:6px 12px; font-size:0.84rem;">₹२५०</button>
                <button type="button" class="btn btn-outline donate-quick-amt" data-amt="500" style="padding:6px 12px; font-size:0.84rem;">₹५००</button>
                <button type="button" class="btn btn-outline donate-quick-amt" data-amt="1000" style="padding:6px 12px; font-size:0.84rem;">₹१,०००</button>
                <button type="button" class="btn btn-outline donate-quick-amt" data-amt="5000" style="padding:6px 12px; font-size:0.84rem;">₹५,०००</button>
              </div>
              <input type="number" id="donateAmount" placeholder="रक्कम टाका (उदा. ५००)" value="500" required min="50">
              <label>तुमचे नाव:</label>
              <input type="text" id="donateDonorName" placeholder="उदा. राहुल भोसले" required>
              <label>मोबाईल क्रमांक:</label>
              <input type="tel" id="donateDonorPhone" placeholder="+91 XXXXX XXXXX" required>
            </div>
            <div class="cm-modal-footer">
              <button type="button" class="btn btn-outline" id="cancelDonationBtn">रद्द करा</button>
              <button type="submit" class="btn btn-primary">✓ देणगी जमा करा</button>
            </div>
          </form>
        </div>
      `;
      document.body.appendChild(modal);

      const closeModal = () => modal.classList.remove('open');
      modal.querySelector('.cm-modal-close').addEventListener('click', closeModal);
      modal.querySelector('#cancelDonationBtn').addEventListener('click', closeModal);
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
      });

      modal.querySelectorAll('.donate-quick-amt').forEach(btn => {
        btn.addEventListener('click', () => {
          modal.querySelector('#donateAmount').value = btn.dataset.amt;
        });
      });
    }

    modal.querySelector('#donateCampTitle').textContent = `मोहीम: ${campTitle}`;
    const savedName = localStorage.getItem('cm_user_name');
    if (savedName) modal.querySelector('#donateDonorName').value = savedName;
    modal.querySelector('#donateDonorPhone').value = '9876543210';

    modal.classList.add('open');

    const form = modal.querySelector('#donationForm');
    form.onsubmit = (e) => {
      e.preventDefault();
      const amt = parseInt(modal.querySelector('#donateAmount').value, 10) || 500;
      const recId = 'CM-REC-' + Math.floor(1000 + Math.random() * 9000);
      modal.classList.remove('open');
      showToast(`धन्यवाद! ₹${amt.toLocaleString('en-IN')} ची देणगी यशस्वीरित्या जमा झाली. पावती क्रमांक: ${recId}`, 'success');

      if (card) {
        const fill = card.querySelector('.progress-fill');
        if (fill) {
          const currentWidth = parseInt(fill.style.width, 10) || 50;
          fill.style.width = Math.min(currentWidth + 8, 100) + '%';
        }
      }
    };
  }

  document.querySelectorAll('#campGrid:not([data-dynamic]) .btn-primary').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const card = btn.closest('.feature-card');
      const campTitle = card ? card.querySelector('strong')?.textContent || 'गड संवर्धन मोहीम' : 'मोहीम';
      openDonationModal(campTitle, card);
    });
  });

  // 10. Event / Blood Donation RSVP (cm-events.html) — legacy fallback,
  // superseded by the QR-ticket flow in cm-connect.js (#cmEventRegForm)
  const rsvpBtn = document.querySelector('.form-card.narrow button.btn-primary:not(#cmEventRegForm button)');
  if (rsvpBtn && window.location.pathname.includes('cm-events') && !document.querySelector('#cmEventRegForm')) {
    rsvpBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const nameInput = document.querySelector('.form-card.narrow input[type="text"]');
      const name = nameInput && nameInput.value.trim() ? nameInput.value.trim() : 'सदस्य';
      const ticketId = 'CM-TKT-' + Math.floor(10000 + Math.random() * 90000);
      alert(`अभिनंदन ${name}!\nतुमची नोंदणी यशस्वी झाली आहे.\nतुमचा ई-तिकीट क्रमांक: ${ticketId}\nकृपया कार्यक्रमाच्या ठिकाणी हा क्रमांक दाखवा.`);
      if (nameInput) nameInput.value = '';
    });
  }

  // 11. Membership Plan Selection (cm-membership.html)
  document.querySelectorAll('.price-card .btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = btn.closest('.price-card');
      const tierName = card ? card.querySelector('h4').textContent : 'Gold';
      localStorage.setItem('cm_user_tier', tierName);
      showToast(`${tierName} सदस्यत्व योजना निवडली गेली आहे!`, 'success');
      setTimeout(() => {
        window.location.href = 'cm-dashboard.html';
      }, 1200);
    });
  });

  const demoUserProfiles = {
    member: {
      id: 'CM12345678',
      name: 'संजय शिवाजी पाटील',
      shortName: 'संजय',
      tier: 'Gold',
      phone: '9876543210',
      city: 'पुणे',
      roleLabel: 'General Member'
    },
    business: {
      id: 'CMBIZ202601',
      name: 'प्रिया देशमुख',
      shortName: 'प्रिया',
      tier: 'Platinum',
      phone: '9822004455',
      city: 'कोल्हापूर',
      roleLabel: 'Business Owner'
    },
    provider: {
      id: 'CMSRV202602',
      name: 'राहुल मोहिते',
      shortName: 'राहुल',
      tier: 'Silver',
      phone: '9766112233',
      city: 'सातारा',
      roleLabel: 'Service Provider'
    },
    karyakarta: {
      id: 'CMKAR202603',
      name: 'अभिजित भोसले',
      shortName: 'अभिजित',
      tier: 'Coordinator',
      phone: '9898989898',
      city: 'नाशिक',
      roleLabel: 'Coordinator'
    }
  };

  function getDemoProfile(role = 'member', loginId = '') {
    const base = demoUserProfiles[role] || demoUserProfiles.member;
    return {
      ...base,
      id: loginId || base.id
    };
  }

  function seedDemoSession(profile) {
    localStorage.setItem('cm_session', 'active');
    localStorage.setItem('cm_user_id', profile.id);
    localStorage.setItem('cm_user_name', profile.name);
    localStorage.setItem('cm_user_tier', profile.tier);
    localStorage.setItem('cm_user_role', profile.roleLabel);
    localStorage.setItem('cm_user_phone', profile.phone);
    localStorage.setItem('cm_user_city', profile.city);

    const existingBookings = JSON.parse(localStorage.getItem('cm_booked_services') || '[]');
    if (existingBookings.length === 0) {
      const demoBookings = [
        {
          id: 'CM-SRV-2101',
          title: 'IT सल्ला व वेबसाइट मार्गदर्शन',
          provider: 'अधिकृत डिजिटल सेवा केंद्र',
          price: '₹999',
          clientName: profile.name,
          clientPhone: profile.phone,
          clientCity: profile.city,
          date: '2026-09-15',
          time: 'दुपारी २ ते ५',
          status: 'मंजूर (Confirmed)',
          bookedOn: new Date().toLocaleDateString('mr-IN')
        },
        {
          id: 'CM-SRV-2102',
          title: 'कायदेशीर कागदपत्र सल्ला',
          provider: 'मराठा विधी सहायता कक्ष',
          price: '₹499',
          clientName: profile.name,
          clientPhone: profile.phone,
          clientCity: profile.city,
          date: '2026-09-18',
          time: 'सकाळी १० ते १',
          status: 'प्रलंबित (In Review)',
          bookedOn: new Date().toLocaleDateString('mr-IN')
        }
      ];
      localStorage.setItem('cm_booked_services', JSON.stringify(demoBookings));
    }
  }

  // 12. Dashboard Personalization (cm-dashboard.html)
  if (window.location.pathname.includes('cm-dashboard')) {
    if (!localStorage.getItem('cm_session')) {
      seedDemoSession(getDemoProfile('member'));
    }

    const savedName = localStorage.getItem('cm_user_name');
    if (savedName) {
      const welcomeH2 = document.querySelector('.wrap h2') || document.querySelector('.wrap h1');
      if (welcomeH2) welcomeH2.textContent = `नमस्कार, ${savedName.split(' ')[0]}! 👋`;
      const idName = document.querySelector('.id-card .name');
      if (idName) idName.textContent = savedName;
    }

    const savedId = localStorage.getItem('cm_user_id');
    if (savedId) {
      const idNo = document.querySelector('.id-card .id-no');
      if (idNo) idNo.textContent = `सदस्य क्र: ${savedId}`;
    }

    const savedTier = localStorage.getItem('cm_user_tier');
    if (savedTier) {
      const tierEl = document.querySelector('.id-card .tier');
      if (tierEl) tierEl.textContent = `⭐ ${savedTier} Member`;
      const planEl = document.querySelector('.feature-card strong');
      if (planEl) planEl.textContent = `${savedTier} Member`;
    }
  }

  // 13. Job Apply Interaction (cm-jobs.html)
  document.querySelectorAll('#jobGrid .btn-outline').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const row = btn.closest('.list-row');
      const jobTitle = row ? row.querySelector('h4').textContent : 'नोकरी';
      showToast(`"${jobTitle}" साठी तुमचा अर्ज पाठवला गेला आहे!`, 'success');
      btn.textContent = '✓ अर्ज केला';
      btn.style.borderColor = 'var(--success)';
      btn.style.color = 'var(--success)';
    });
  });

  // 14. Contact Form Submission (cm-contact.html)
  const contactBtn = document.querySelector('.form-card button.btn-primary');
  if (contactBtn && window.location.pathname.includes('cm-contact')) {
    contactBtn.addEventListener('click', (e) => {
      e.preventDefault();
      showToast('धन्यवाद! तुमचा संदेश आम्हाला मिळाला आहे. आमची टीम लवकरच संपर्क करेल.', 'success');
      document.querySelectorAll('.form-card input, .form-card textarea').forEach(inp => inp.value = '');
    });
  }

  // 15. Authentication & Login Flow (cm-login.html)
  const loginForm = document.querySelector('#loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const loginId = document.querySelector('#loginId').value.trim() || 'CM12345678';
      const role = document.querySelector('#loginRole').value || 'member';
      const loginPass = document.querySelector('#loginPass').value.trim();

      if (!loginPass) {
        showToast('कृपया डेमो पासवर्ड किंवा OTP टाका.', 'error');
        return;
      }

      const profile = getDemoProfile(role, loginId);
      seedDemoSession(profile);
      showToast(`लॉगिन यशस्वी! ${profile.shortName} यांचे डॅशबोर्ड उघडत आहे...`, 'success');
      setTimeout(() => {
        window.location.href = 'cm-dashboard.html';
      }, 1000);
    });

    const demoLoginBtn = document.querySelector('#demoLoginBtn');
    if (demoLoginBtn) {
      demoLoginBtn.addEventListener('click', () => {
        const profile = getDemoProfile('member');
        seedDemoSession(profile);
        showToast('Demo लॉगिन यशस्वी! डॅशबोर्ड उघडत आहे...', 'success');
        setTimeout(() => {
          window.location.href = 'cm-dashboard.html';
        }, 800);
      });
    }

    const forgotPassBtn = document.querySelector('#forgotPassBtn');
    if (forgotPassBtn) {
      forgotPassBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (typeof window.openPasswordResetModal === 'function') {
          window.openPasswordResetModal();
        }
      });
    }
  }

  // 16. Logout Flow (cm-dashboard.html)
  const logoutBtn = document.querySelector('#logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm('तुम्हाला खात्यातून बाहेर पडायचे आहे का?')) {
        localStorage.removeItem('cm_session');
        showToast('यशस्वीरित्या लॉगआउट झाले!', 'info');
        setTimeout(() => {
          window.location.href = 'cm-login.html';
        }, 800);
      }
    });
  }

  // 17. Universal Interactive Service Booking Engine
  function ensureBookingModal() {
    let modal = document.querySelector('#serviceBookingModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.className = 'cm-modal';
      modal.id = 'serviceBookingModal';
      modal.innerHTML = `
        <div class="cm-modal-box">
          <div class="cm-modal-header">
            <h3 id="modalServiceTitle">🛠️ सेवा ऑनलाइन बुकिंग</h3>
            <button type="button" class="cm-modal-close" id="closeBookingModal" aria-label="बंद करा">✕</button>
          </div>
          <form id="serviceBookingForm">
            <div class="cm-modal-body">
              <div style="background:rgba(233,196,106,0.15); padding:12px 14px; border-radius:8px; border-left:3px solid var(--gold-500); margin-bottom:16px;">
                <div style="font-weight:700; color:var(--maroon-950); font-size:1.02rem;" id="modalServiceProvider">प्रदाता: अधिकृत व्यावसायिक</div>
                <div style="font-size:0.85rem; color:var(--saffron-700); font-weight:600; margin-top:3px;" id="modalServicePrice">शुल्क: चर्चेनुसार</div>
              </div>
              <label>तुमचे पूर्ण नाव:</label>
              <input type="text" id="bookUserName" placeholder="उदा. विशाल मोहिते" required>
              <label>मोबाईल क्रमांक:</label>
              <input type="tel" id="bookUserPhone" placeholder="+91 XXXXX XXXXX" required>
              <label>शहर / जिल्हा:</label>
              <input type="text" id="bookUserCity" placeholder="उदा. पुणे / कोल्हापूर" required>
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                <div>
                  <label>अपेक्षित तारीख:</label>
                  <input type="date" id="bookDate" required>
                </div>
                <div>
                  <label>वेळ:</label>
                  <select id="bookTime">
                    <option value="सकाळी १० ते १">सकाळी १० ते १</option>
                    <option value="दुपारी २ ते ५">दुपारी २ ते ५</option>
                    <option value="संध्याकाळी ५ ते ८">संध्याकाळी ५ ते ८</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="cm-modal-footer">
              <button type="button" class="btn btn-outline" id="cancelBookingBtn">रद्द करा</button>
              <button type="submit" class="btn btn-primary">✓ बुकिंग निश्चित करा</button>
            </div>
          </form>
        </div>
      `;
      document.body.appendChild(modal);

      const closeModal = () => modal.classList.remove('open');
      const closeBtn = modal.querySelector('#closeBookingModal');
      const cancelBtn = modal.querySelector('#cancelBookingBtn');
      if (closeBtn) closeBtn.addEventListener('click', closeModal);
      if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
      });

      const form = modal.querySelector('#serviceBookingForm');
      if (form) {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          const tokenId = 'CM-SRV-' + Math.floor(1000 + Math.random() * 9000);
          const title = modal.querySelector('#modalServiceTitle').textContent.replace('🛠️ ', '').replace(' बुकिंग', '');
          const provider = modal.querySelector('#modalServiceProvider').textContent.replace('प्रदाता: ', '');
          const price = modal.querySelector('#modalServicePrice').textContent;
          const clientName = modal.querySelector('#bookUserName').value.trim();
          const clientPhone = modal.querySelector('#bookUserPhone').value.trim();
          const clientCity = modal.querySelector('#bookUserCity').value.trim();
          const bookDate = modal.querySelector('#bookDate').value;
          const bookTime = modal.querySelector('#bookTime').value;

          const newBooking = {
            id: tokenId,
            title: title,
            provider: provider,
            price: price,
            clientName: clientName,
            clientPhone: clientPhone,
            clientCity: clientCity,
            date: bookDate,
            time: bookTime,
            status: 'मंजूर (Confirmed)',
            bookedOn: new Date().toLocaleDateString('mr-IN')
          };

          const existingBookings = JSON.parse(localStorage.getItem('cm_booked_services') || '[]');
          existingBookings.unshift(newBooking);
          localStorage.setItem('cm_booked_services', JSON.stringify(existingBookings));

          if (window.CMDB && typeof CMDB.createServiceEnquiry === 'function') {
            CMDB.createServiceEnquiry({
              memberId: localStorage.getItem('cm_user_id') || 'ME',
              service: title,
              provider: provider,
              price: price,
              requirement: title,
              budget: price,
              location: clientCity,
              preferredDate: bookDate,
              preferredTime: bookTime,
              status: 'Booked'
            });
          }

          closeModal();
          showToast(`बुकिंग निश्चित झाले! टोकन क्रमांक: ${tokenId}`, 'success');

          setTimeout(() => {
            if (confirm(`अभिनंदन ${clientName}!\nतुमची सेवा यशस्वीरीत्या बुक झाली आहे.\nटोकन क्रमांक: ${tokenId}\n\nडॅशबोर्डवर सेवेचे तपशील पहायचे आहेत का?`)) {
              window.location.href = 'cm-dashboard.html#services';
            }
          }, 400);
        });
      }
    }
    return modal;
  }

  function openBookingModal(serviceTitle, providerName, price) {
    const modal = ensureBookingModal();
    const titleEl = modal.querySelector('#modalServiceTitle');
    const provEl = modal.querySelector('#modalServiceProvider');
    const priceEl = modal.querySelector('#modalServicePrice');
    const nameInput = modal.querySelector('#bookUserName');
    const phoneInput = modal.querySelector('#bookUserPhone');
    const dateInput = modal.querySelector('#bookDate');

    if (titleEl) titleEl.textContent = `🛠️ ${serviceTitle} बुकिंग`;
    if (provEl) provEl.textContent = `प्रदाता: ${providerName || 'अधिकृत व्यावसायिक'}`;
    if (priceEl) priceEl.textContent = `दर: ${price || 'चर्चेनुसार / विशेष सवलत'}`;

    const savedName = localStorage.getItem('cm_user_name');
    const savedPhone = localStorage.getItem('cm_user_phone');
    const cityInput = modal.querySelector('#bookUserCity');
    const savedCity = localStorage.getItem('cm_user_city');
    if (nameInput && savedName) nameInput.value = savedName;
    if (phoneInput && !phoneInput.value) phoneInput.value = savedPhone || '9876543210';
    if (cityInput && !cityInput.value) cityInput.value = savedCity || 'पुणे';

    if (dateInput && !dateInput.value) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      dateInput.value = tomorrow.toISOString().split('T')[0];
    }

    modal.classList.add('open');
  }

  // Attach universal delegation for booking buttons across all pages
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('a, button');
    if (!btn) return;
    const txt = btn.textContent.trim();
    if (
      btn.hasAttribute('data-book-service') ||
      txt === 'सेवा बुक करा' ||
      txt === 'सल्ला घ्या' ||
      txt === 'गाईड बुक करा' ||
      txt === 'तपशील पाहा'
    ) {
      e.preventDefault();
      const card = btn.closest('.info-box-card, .feature-card, .list-row, .service-card');
      const serviceTitle = btn.dataset.bookService || card?.querySelector('h4, h3, strong')?.textContent || 'मराठा अधिकृत सेवा';
      const provider = btn.dataset.provider || 'अखिल भारतीय मराठा महासंघ अधिकृत तज्ज्ञ';
      const price = btn.dataset.price || 'चर्चेनुसार / विशेष सवलत दर';
      openBookingModal(serviceTitle, provider, price);
    }
  });

  // Check URL param ?service= on services page
  if (window.location.pathname.includes('cm-services')) {
    const params = new URLSearchParams(window.location.search);
    const srvParam = params.get('service');
    if (srvParam) {
      setTimeout(() => {
        openBookingModal(decodeURIComponent(srvParam), 'अधिकृत मराठा महासंघ प्रदाता', 'विशेष सवलत दर');
      }, 300);
    }
  }

  // Handle Booking Form Submit
  const serviceBookingForm = document.querySelector('#serviceBookingForm');
  if (serviceBookingForm) {
    serviceBookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const tokenId = 'CM-SRV-' + Math.floor(1000 + Math.random() * 9000);
      const title = document.querySelector('#modalServiceTitle').textContent;
      const provider = document.querySelector('#modalServiceProvider').textContent.replace('प्रदाता: ', '');
      const price = document.querySelector('#modalServicePrice').textContent;
      const clientName = document.querySelector('#bookUserName').value.trim();
      const clientPhone = document.querySelector('#bookUserPhone').value.trim();
      const clientCity = document.querySelector('#bookUserCity').value.trim();
      const bookDate = document.querySelector('#bookDate').value;
      const bookTime = document.querySelector('#bookTime').value;

      const newBooking = {
        id: tokenId,
        title: title,
        provider: provider,
        price: price,
        clientName: clientName,
        clientPhone: clientPhone,
        clientCity: clientCity,
        date: bookDate,
        time: bookTime,
        status: 'मंजूर (Confirmed)',
        bookedOn: new Date().toLocaleDateString('mr-IN')
      };

      const existingBookings = JSON.parse(localStorage.getItem('cm_booked_services') || '[]');
      existingBookings.unshift(newBooking);
      localStorage.setItem('cm_booked_services', JSON.stringify(existingBookings));

      bookingModal.classList.remove('open');
      showToast(`बुकिंग निश्चित झाले! टोकन क्रमांक: ${tokenId}`, 'success');

      setTimeout(() => {
        if (confirm(`अभिनंदन! तुमची सेवा यशस्वीरीत्या बुक झाली आहे.\nटोकन क्रमांक: ${tokenId}\n\nडॅशबोर्डवर सेवेचे तपशील पहायचे आहेत का?`)) {
          window.location.href = 'cm-dashboard.html#services';
        }
      }, 500);
    });
  }

  // Handle Custom Service Demand Form (cm-services.html)
  const customServiceForm = document.querySelector('#customServiceForm');
  if (customServiceForm) {
    customServiceForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.querySelector('#custName').value.trim();
      const phone = document.querySelector('#custPhone').value.trim();
      const city = document.querySelector('#custCity').value.trim();
      const cat = document.querySelector('#custCat').value;
      const desc = document.querySelector('#custDesc').value.trim();
      const tokenId = 'CM-REQ-' + Math.floor(1000 + Math.random() * 9000);

      const customBooking = {
        id: tokenId,
        title: `${cat} (थेट मागणी)`,
        provider: 'समन्वयक नियुक्त होत आहे',
        price: 'कोटेशन प्रतीक्षेत',
        clientName: name,
        clientPhone: phone,
        clientCity: city,
        date: 'लवकरच',
        time: 'संपर्क केला जाईल',
        status: 'विनंती नोंदवली',
        bookedOn: new Date().toLocaleDateString('mr-IN'),
        notes: desc
      };

      const existingBookings = JSON.parse(localStorage.getItem('cm_booked_services') || '[]');
      existingBookings.unshift(customBooking);
      localStorage.setItem('cm_booked_services', JSON.stringify(existingBookings));

      if (window.CMDB && typeof CMDB.createServiceEnquiry === 'function') {
        CMDB.createServiceEnquiry({
          memberId: localStorage.getItem('cm_user_id') || 'ME',
          service: `${cat} (थेट मागणी)`,
          provider: 'समन्वयक नियुक्त होत आहे',
          price: 'कोटेशन प्रतीक्षेत',
          requirement: desc,
          budget: document.querySelector('#custBudget') ? document.querySelector('#custBudget').value.trim() : '',
          location: city,
          preferredDate: document.querySelector('#custDate') ? document.querySelector('#custDate').value : '',
          preferredTime: 'संपर्क केला जाईल',
          status: 'Enquiry'
        });
      }

      showToast(`तुमची सेवा मागणी यशस्वीरित्या नोंदवली गेली! टोकन: ${tokenId}`, 'success');
      showToast(`मागणी नोंदवली गेली! विनंती क्र: ${tokenId}`, 'success');
      alert(`धन्यवाद ${name}!\nतुमची सेवेची मागणी नोंदवली गेली आहे.\nटोकन क्र: ${tokenId}\nआमचे समन्वयक लवकरच आपल्याशी संपर्क करतील.`);
      customServiceForm.reset();
    });
  }

  // 18. Render Booked Services in Dashboard (cm-dashboard.html)
  const userServicesContainer = document.querySelector('#userServicesList');
  if (userServicesContainer && window.location.pathname.includes('cm-dashboard')) {
    const bookedServices = JSON.parse(localStorage.getItem('cm_booked_services') || '[]');

    if (bookedServices.length === 0) {
      userServicesContainer.innerHTML = `
        <div class="notice" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
          <div>
            <strong>तुम्ही अद्याप कोणतीही सेवा बुक केलेली नाही.</strong>
            <div class="d muted" style="margin-top:4px;">IT, CA, कायदेशीर सल्ला, शेती व वास्तू सेवा घरबसल्या बुक करा.</div>
          </div>
          <a href="cm-services.html" class="btn btn-primary" style="font-size:0.85rem; padding:8px 16px;">सेवा एक्सप्लोर करा →</a>
        </div>
      `;
    } else {
      userServicesContainer.innerHTML = '';
      bookedServices.forEach((srv, index) => {
        const isConfirmed = srv.status.includes('Confirmed') || srv.status.includes('मंजूर');
        const badgeClass = isConfirmed ? 'status-confirmed' : 'status-pending';
        const card = document.createElement('div');
        card.className = 'list-row';
        card.style.marginBottom = '12px';
        card.innerHTML = `
          <div class="thumb" style="font-size:1.4rem;">🛠️</div>
          <div class="content">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
              <h4 style="margin:0; font-size:1.05rem;">${srv.title}</h4>
              <span class="status-pill ${badgeClass}">${srv.status}</span>
            </div>
            <div class="meta" style="margin-top:5px; font-size:0.82rem;">
              <span>👤 प्रदाता: <strong>${srv.provider}</strong></span> · 
              <span>📅 तारीख: <strong>${srv.date}</strong> (${srv.time})</span> · 
              <span>🏷️ शुल्क: <strong>${srv.price}</strong></span>
            </div>
            <div style="font-size:0.75rem; color:var(--muted); margin-top:4px;">
              टोकन: <code>${srv.id}</code> · नोंदणी: ${srv.bookedOn} ${srv.clientCity ? '· शहर: ' + srv.clientCity : ''}
            </div>
          </div>
          <button class="btn btn-outline cancel-srv-btn" data-index="${index}" style="padding:6px 12px; font-size:0.75rem; color:var(--danger); border-color:var(--danger);">रद्द करा</button>
        `;
        userServicesContainer.appendChild(card);
      });

      // Attach cancel handlers
      userServicesContainer.querySelectorAll('.cancel-srv-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const idx = parseInt(btn.dataset.index, 10);
          if (confirm('तुम्हाला ही सेवा बुकिंग खरोखर रद्द करायची आहे का?')) {
            bookedServices.splice(idx, 1);
            localStorage.setItem('cm_booked_services', JSON.stringify(bookedServices));
            showToast('सेवा बुकिंग रद्द करण्यात आले.', 'info');
            setTimeout(() => window.location.reload(), 600);
          }
        });
      });
    }
  }

});

// Global Interactive Hero Heritage Switcher
window.switchHeroView = function(type) {
  const cardImg = document.getElementById('heroCardImg');
  const mainBg = document.getElementById('heroMainBg');
  const title = document.getElementById('heroCardTitle');
  const desc = document.getElementById('heroCardDesc');
  const badge = document.getElementById('heroBadge');
  const link = document.getElementById('heroCardLink');

  if (!cardImg) return;

  const data = {
    hero: {
      cardSrc: 'assets/images/maratha-hero.jpg',
      bgSrc: 'assets/images/maratha-samrajya.jpg',
      badge: '🚩 मराठा वीर (Maratha Hero)',
      title: 'छत्रपती शिवाजी महाराज — हिंदवी स्वराज्य संस्थापक',
      desc: 'रयतेचे कल्याण, ३५०+ अभेद्य गडकोट, गनिमी काव्याचे जनक आणि सार्वभौम मराठा साम्राज्याची पायाभरणी करणारे युगपुरुष.',
      link: 'cm-shivaji-maharaj.html'
    },
    samrajya: {
      cardSrc: 'assets/images/maratha-samrajya.jpg',
      bgSrc: 'assets/images/real-raigad-panoramic.jpg',
      badge: '⚔️ मराठा साम्राज्य (Maratha Empire)',
      title: 'अखंड मराठा साम्राज्य — अटकेपार भगवा ध्वज',
      desc: '१६७४ ते १८१८ पर्यंत भारतभर पसरलेले ३.९ दशलक्ष चौ. किमीचे विशाल साम्राज्य. अटकेपासून कटक व तंजावरपर्यंत मराठा सत्तेचा दरारा.',
      link: 'cm-history.html'
    },
    coronation: {
      cardSrc: 'assets/images/real-shivaji-coronation.jpg',
      bgSrc: 'assets/images/maratha-samrajya.jpg',
      badge: '👑 शिवराज्याभिषेक सोहळा (Coronation)',
      title: 'शिवराज्याभिषेक सोहळा — ६ जून १६७४',
      desc: 'दुर्गराज रायगडावर ३२ मण सुवर्ण सिंहासनावर संपन्न झालेला ऐतिहासिक वैदिक राज्याभिषेक. शिवराज्याभिषेक शक सुरू होऊन हिंदवी स्वराज्य अधिकृतपणे प्रस्थापित झाले.',
      link: 'cm-history.html'
    },
    map: {
      cardSrc: 'assets/images/real-maratha-expansion-map.jpg',
      bgSrc: 'assets/images/maratha-samrajya.jpg',
      badge: '🗺️ ऐतिहासिक नकाशा (Empire Map)',
      title: 'मराठा साम्राज्य विस्तार नकाशा (१७६०)',
      desc: 'छत्रपती शाहू महाराज व श्रीमंत बाजीराव पेशवे यांच्या काळात झालेला मराठा साम्राज्याचा प्रचंड भूभागीय विस्तार व मांडलिक राज्ये.',
      link: 'cm-history.html'
    }
  };

  const item = data[type];
  if (!item) return;

  cardImg.style.opacity = '0';
  setTimeout(() => {
    cardImg.src = item.cardSrc;
    cardImg.style.opacity = '1';
    if (title) title.textContent = item.title;
    if (desc) desc.textContent = item.desc;
    if (badge) badge.textContent = item.badge;
    if (link) link.href = item.link;
  }, 180);

  if (mainBg && item.bgSrc) {
    mainBg.src = item.bgSrc;
  }

  // Highlight active button
  const switcherBtns = document.querySelectorAll('.hero-real-card button');
  switcherBtns.forEach(btn => {
    const fnStr = btn.getAttribute('onclick') || '';
    if (fnStr.includes(`'${type}'`) || fnStr.includes(`"${type}"`)) {
      btn.classList.add('hero-btn-active');
    } else {
      btn.classList.remove('hero-btn-active');
    }
  });
};

// ==========================================================================
// 1. Live Ember Canvas Particle Generator (Hyper-Realistic Fire Embers)
// ==========================================================================
function initEmberCanvas() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  let canvas = document.getElementById('emberCanvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'emberCanvas';
    hero.appendChild(canvas);
  }

  const ctx = canvas.getContext('2d');
  let width, height;

  function resize() {
    width = canvas.width = hero.offsetWidth;
    height = canvas.height = hero.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const particles = [];
  const maxParticles = window.innerWidth < 768 ? 25 : 50;

  class Ember {
    constructor() {
      this.reset(true);
    }
    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : height + Math.random() * 20;
      this.size = Math.random() * 2.6 + 1.2;
      this.speedY = Math.random() * 1.3 + 0.6;
      this.speedX = (Math.random() - 0.5) * 0.9;
      this.opacity = Math.random() * 0.7 + 0.3;
      this.fadeSpeed = Math.random() * 0.007 + 0.003;
      this.colorType = Math.random();
    }
    update() {
      this.y -= this.speedY;
      this.x += this.speedX + Math.sin(this.y * 0.02) * 0.4;
      this.opacity -= this.fadeSpeed;
      if (this.y < -10 || this.opacity <= 0) {
        this.reset();
      }
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      if (this.colorType > 0.45) {
        ctx.fillStyle = `rgba(243, 112, 33, ${this.opacity})`;
        ctx.shadowColor = 'rgba(243, 112, 33, 0.85)';
      } else {
        ctx.fillStyle = `rgba(233, 196, 106, ${this.opacity})`;
        ctx.shadowColor = 'rgba(233, 196, 106, 0.9)';
      }
      ctx.shadowBlur = this.size * 2.5;
      ctx.fill();
    }
  }

  for (let i = 0; i < maxParticles; i++) {
    particles.push(new Ember());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }
    requestAnimationFrame(animate);
  }
  animate();
}

// ==========================================================================
// 2. Fullscreen Heritage HD Lightbox Modal System
// ==========================================================================
function initHeritageLightbox() {
  let lightbox = document.querySelector('.heritage-lightbox');
  if (!lightbox) {
    lightbox = document.createElement('div');
    lightbox.className = 'heritage-lightbox';
    lightbox.innerHTML = `
      <div class="lightbox-modal-content">
        <div class="lightbox-header">
          <h3 id="lightboxTitle">🚩 अस्सल ऐतिहासिक ठेवा (Real Heritage Archive)</h3>
          <button type="button" class="lightbox-close-btn" aria-label="बंद करा">✕</button>
        </div>
        <div class="lightbox-img-box">
          <img id="lightboxImg" src="" alt="Historical Heritage Artifact">
        </div>
        <div class="lightbox-footer-caption" id="lightboxCaption"></div>
      </div>
    `;
    document.body.appendChild(lightbox);
  }

  const lbImg = lightbox.querySelector('#lightboxImg');
  const lbTitle = lightbox.querySelector('#lightboxTitle');
  const lbCaption = lightbox.querySelector('#lightboxCaption');
  const closeBtn = lightbox.querySelector('.lightbox-close-btn');

  function openLightbox(src, title, desc, source) {
    lbImg.src = src;
    lbTitle.textContent = title || '🚩 अस्सल ऐतिहासिक ठेवा (Real Heritage Archive)';
    lbCaption.innerHTML = `
      <div style="font-size:1.05rem; font-weight:700; color:var(--gold-400); margin-bottom:4px;">${title || ''}</div>
      <div style="font-size:0.86rem; color:#FBF3E3; line-height:1.5;">${desc || ''}</div>
      ${source ? `<div style="margin-top:6px; font-size:0.78rem; color:var(--gold-300);">🏛️ ऐतिहासिक पुरावा / संदर्भ: <strong>${source}</strong></div>` : ''}
    `;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  closeBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
      closeLightbox();
    }
  });

  // Attach universal click listener to images across ALL cards and grids
  document.addEventListener('click', (e) => {
    if (e.target.closest('.heritage-lightbox') || e.target.closest('.cm-modal')) return;

    const trigger = e.target.closest('.lightbox-trigger, [data-lightbox]');
    const imgEl = e.target.tagName === 'IMG' ? e.target : null;
    const card = e.target.closest('.info-box-card, .hero-real-card, .heritage-photo-card, .hd-feature-card, .battle-card, .portrait-card, .fort-detail-header, .feature-card, .researcher-card');

    if (trigger || (card && imgEl && !imgEl.classList.contains('brand-logo') && !imgEl.src.includes('logo.png') && !imgEl.src.includes('logo_original_uncropped.png'))) {
      const img = imgEl || trigger?.querySelector('img') || card?.querySelector('img');
      if (img && img.src && !img.classList.contains('brand-logo') && !img.src.includes('logo.png') && !img.src.includes('logo_original_uncropped.png')) {
        const title = img.getAttribute('alt') || trigger?.getAttribute('data-title') || card?.querySelector('h4, h3, h2')?.textContent || 'अस्सल ऐतिहासिक वारसा';
        const desc = trigger?.getAttribute('data-desc') || card?.querySelector('p')?.textContent || '';
        const source = trigger?.getAttribute('data-source') || card?.dataset?.source || 'राष्ट्रीय व आंतरराष्ट्रीय ऐतिहासिक पुराभिलेखागार';
        openLightbox(img.src, title, desc, source);
      }
    }
  });
}

// ==========================================================================
// 3. Rajmudra Interactive Visualizer & Translation Reveal
// ==========================================================================
function initRajmudraInteractive() {
  const container = document.querySelector('.rajmudra-container');
  if (!container) return;

  container.classList.add('rajmudra-interactive-wrap');
  
  if (!container.querySelector('.rajmudra-seal-ring')) {
    const ring = document.createElement('div');
    ring.className = 'rajmudra-seal-ring';
    const seal = container.querySelector('.rajmudra-seal');
    if (seal) {
      seal.style.position = 'relative';
      seal.appendChild(ring);
    }
  }

  container.addEventListener('click', () => {
    showToast('🚩 "प्रतिपच्चंद्रलेखेव वर्धिष्णुर्विश्ववंदिता..." — लोककल्याणकारी शिवराजमुद्रा!', 'success');
  });
}

// ==========================================================================
// 4. Universal Responsive Mobile Navigation Drawer & Hamburger Toggle
// ==========================================================================
function initMobileNavigation() {
  const headerInner = document.querySelector('.site-header-inner');
  if (!headerInner) return;

  const headerActions = headerInner.querySelector('.header-actions');
  let mobileBtn = headerInner.querySelector('.mobile-menu-btn');
  if (!mobileBtn && headerActions) {
    mobileBtn = document.createElement('button');
    mobileBtn.type = 'button';
    mobileBtn.className = 'mobile-menu-btn';
    mobileBtn.id = 'mobileMenuToggle';
    mobileBtn.setAttribute('aria-label', 'मेनू उघडा');
    mobileBtn.innerHTML = '<span></span><span></span><span></span>';
    headerActions.appendChild(mobileBtn);
  }

  let backdrop = document.querySelector('.mobile-nav-backdrop');
  let drawer = document.querySelector('.mobile-nav-drawer');

  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.className = 'mobile-nav-backdrop';
    document.body.appendChild(backdrop);
  }

  if (!drawer) {
    drawer = document.createElement('div');
    drawer.className = 'mobile-nav-drawer';
    drawer.id = 'mobileNavDrawer';
    drawer.innerHTML = `
      <div class="mobile-drawer-header">
        <a href="index.html" class="mobile-drawer-brand">
          <img src="assets/images/logo.png" alt="Connect Maratha Logo">
          <span>CONNECT मराठा</span>
        </a>
        <button type="button" class="mobile-drawer-close" id="mobileDrawerClose" aria-label="मेनू बंद करा">✕</button>
      </div>
      <div class="mobile-drawer-nav">
        <span class="drawer-section-title">मुख्य दालन</span>
        <a href="index.html" class="drawer-nav-link">🏠 मुखपृष्ठ</a>
        <a href="cm-history.html" class="drawer-nav-link">⚔️ मराठा इतिहास ग्रंथालय</a>
        <a href="cm-forts-map.html" class="drawer-nav-link">🏰 ३५०+ गड-किल्ले नकाशा</a>
        <a href="cm-warriors.html" class="drawer-nav-link">🛡️ अमर वीर व वीरांगना</a>
        <a href="cm-services.html" class="drawer-nav-link">🛠️ सेवा व उद्योग निर्देशिका</a>

        <span class="drawer-section-title">उद्योग व रोजगार</span>
        <a href="cm-business-directory.html" class="drawer-nav-link">🏢 व्यवसाय निर्देशिका</a>
        <a href="cm-jobs.html" class="drawer-nav-link">🤝 रोजगार व करिअर संधी</a>
        <a href="cm-professionals.html" class="drawer-nav-link">👨‍⚖️ व्यावसायिक तज्ज्ञ व CA</a>

        <span class="drawer-section-title">Connect & Communication</span>
        <a href="cm-community.html" class="drawer-nav-link">💬 समाज फीड</a>
        <a href="cm-directory-people.html" class="drawer-nav-link">👥 समुदाय डिरेक्टरी</a>
        <a href="cm-groups.html" class="drawer-nav-link">🧑‍🤝‍🧑 समुदाय गट</a>
        <a href="cm-messages.html" class="drawer-nav-link">✉️ मेसेजेस</a>

        <span class="drawer-section-title">समुदाय व कल्याण</span>
        <a href="cm-education.html" class="drawer-nav-link">🎓 शैक्षणिक मदत व स्पर्धा परीक्षा</a>
        <a href="cm-donation.html" class="drawer-nav-link">❤️ दान व गड संवर्धन निधी</a>
        <a href="cm-events.html" class="drawer-nav-link">📅 कार्यक्रम व उपक्रम</a>
        <a href="cm-community-safety.html" class="drawer-nav-link">🚨 आपत्कालीन सुरक्षा कक्ष</a>
        <a href="cm-dashboard.html" class="drawer-nav-link">📊 माझे डॅशबोर्ड</a>
      </div>
      <div class="mobile-drawer-footer">
        <div style="display:flex; gap:8px;">
          <a href="cm-login.html" class="btn btn-outline" style="flex:1; text-align:center; padding:8px; font-size:0.88rem;">👤 लॉगिन</a>
          <a href="cm-register.html" class="btn btn-primary" style="flex:1; text-align:center; padding:8px; font-size:0.88rem;">🚩 नोंदणी</a>
        </div>
        <div style="font-size:0.75rem; color:var(--gold-300); text-align:center; margin-top:4px;">
          📞 समाज हेल्पलाईन: <strong>१८००-१२३-१६७४</strong>
        </div>
      </div>
    `;
    document.body.appendChild(drawer);
  }

  const currentFile = window.location.pathname.split('/').pop() || 'index.html';
  drawer.querySelectorAll('.drawer-nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href) {
      const linkFile = href.split('/').pop();
      if (
        (currentFile === 'index.html' || currentFile === 'cm-home.html' || currentFile === '') &&
        (linkFile === 'index.html' || linkFile === 'cm-home.html')
      ) {
        link.classList.add('active');
      } else if (linkFile === currentFile) {
        link.classList.add('active');
      }
    }
  });

  function openDrawer() {
    drawer.classList.add('open');
    backdrop.classList.add('open');
    if (mobileBtn) mobileBtn.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    backdrop.classList.remove('open');
    if (mobileBtn) mobileBtn.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (mobileBtn) {
    mobileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (drawer.classList.contains('open')) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });
  }

  const closeBtn = drawer.querySelector('#mobileDrawerClose');
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  backdrop.addEventListener('click', closeDrawer);

  drawer.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', closeDrawer);
  });
}

// ==========================================================================
// 5. Desktop Mega-Dropdown for "📂 अधिक विभाग ▾"
// ==========================================================================
function initDropdownMenus() {
  document.querySelectorAll('.desktop-nav').forEach(nav => {
    const moreLink = nav.querySelector('a[href="cm-more.html"]');
    if (moreLink && !moreLink.closest('.nav-dropdown')) {
      const dropdownWrap = document.createElement('div');
      dropdownWrap.className = 'nav-dropdown';
      moreLink.parentNode.insertBefore(dropdownWrap, moreLink);
      dropdownWrap.appendChild(moreLink);
      moreLink.className = 'dropdown-trigger';

      const menu = document.createElement('div');
      menu.className = 'nav-dropdown-menu';
      menu.innerHTML = `
        <span class="dropdown-cat-title">📜 इतिहास व संशोधन</span>
        <a href="cm-history.html">📖 मराठा इतिहास ग्रंथालय</a>
        <a href="cm-forts-map.html">🏰 ३५०+ गड-किल्ले नकाशा</a>
        <a href="cm-warriors.html">🛡️ अमर वीर व वीरांगना</a>
        <a href="cm-temples.html">🚩 संस्कृती व अध्यात्म</a>
        <span class="dropdown-cat-title">💼 उद्योग व रोजगार</span>
        <a href="cm-business-directory.html">🏢 व्यवसाय निर्देशिका</a>
        <a href="cm-jobs.html">🤝 रोजगार व करिअर संधी</a>
        <a href="cm-professionals.html">👨‍⚖️ व्यावसायिक तज्ज्ञ व CA</a>
        <span class="dropdown-cat-title">💬 Connect & Communication</span>
        <a href="cm-community.html">📝 समाज फीड</a>
        <a href="cm-groups.html">👥 समुदाय गट</a>
        <a href="cm-messages.html">✉️ मेसेजेस</a>
        <span class="dropdown-cat-title">🤝 समाज व कल्याण</span>
        <a href="cm-education.html">🎓 शैक्षणिक मदत व स्पर्धा परीक्षा</a>
        <a href="cm-donation.html">❤️ दान व गड संवर्धन निधी</a>
        <a href="cm-community-safety.html">🚨 आपत्कालीन सुरक्षा</a>
        <a href="cm-dashboard.html">📊 माझे डॅशबोर्ड</a>
      `;
      dropdownWrap.appendChild(menu);

      moreLink.addEventListener('click', (e) => {
        if (window.innerWidth >= 992) {
          e.preventDefault();
          dropdownWrap.classList.toggle('open');
        }
      });
    }
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-dropdown')) {
      document.querySelectorAll('.nav-dropdown.open').forEach(d => d.classList.remove('open'));
    }
  });
}

// ==========================================================================
// 6. Universal Interactive Modals Engine (Dead Link & Action Resolver)
// ==========================================================================
function initUniversalModals() {

  function createModal(id, title, bodyHtml, footerHtml) {
    let modal = document.getElementById(id);
    if (!modal) {
      modal = document.createElement('div');
      modal.className = 'cm-modal';
      modal.id = id;
      modal.innerHTML = `
        <div class="cm-modal-box">
          <div class="cm-modal-header">
            <h3>${title}</h3>
            <button type="button" class="cm-modal-close">✕</button>
          </div>
          <div class="cm-modal-body">${bodyHtml}</div>
          <div class="cm-modal-footer">${footerHtml}</div>
        </div>
      `;
      document.body.appendChild(modal);

      const closeModal = () => modal.classList.remove('open');
      modal.querySelector('.cm-modal-close').addEventListener('click', closeModal);
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
      });
    }
    return modal;
  }

  // A. Job Post Modal
  window.openJobPostModal = function() {
    const body = `
      <form id="jobPostForm">
        <label>नोकरीचे शीर्षक (Job Title):</label>
        <input type="text" id="newJobTitle" placeholder="उदा. Civil Site Engineer / Sales Officer" required>
        <label>कंपनी किंवा व्यवसायाचे नाव:</label>
        <input type="text" id="newJobCompany" placeholder="उदा. शिवतेज कन्स्ट्रक्शन्स" required>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div>
            <label>शहर / जिल्हा:</label>
            <input type="text" id="newJobCity" placeholder="उदा. पुणे / नाशिक" required>
          </div>
          <div>
            <label>श्रेणी:</label>
            <select id="newJobCat">
              <option value="it">IT / Softwares</option>
              <option value="sales">Sales & Marketing</option>
              <option value="govt">सरकारी / स्पर्धा परीक्षा</option>
              <option value="internship">इंटर्नशिप / ट्रेनी</option>
            </select>
          </div>
        </div>
        <label>वेतन / पॅकेज (Salary):</label>
        <input type="text" id="newJobSalary" placeholder="उदा. ₹3-5 LPA / ₹25,000 दरमहा" required>
        <button type="submit" class="btn btn-primary" style="width:100%; margin-top:8px; padding:10px;">✓ रिक्त जागा पोस्ट करा</button>
      </form>
    `;
    const modal = createModal('jobPostModal', '💼 नवीन नोकरी / रिक्त जागा पोस्ट करा', body, '<button type="button" class="btn btn-outline" onclick="document.getElementById(\'jobPostModal\').classList.remove(\'open\')">बंद करा</button>');
    modal.classList.add('open');

    const form = modal.querySelector('#jobPostForm');
    form.onsubmit = (e) => {
      e.preventDefault();
      const title = modal.querySelector('#newJobTitle').value.trim();
      const company = modal.querySelector('#newJobCompany').value.trim();
      const city = modal.querySelector('#newJobCity').value.trim();
      const cat = modal.querySelector('#newJobCat').value;
      const salary = modal.querySelector('#newJobSalary').value.trim();

      const newJob = { title, company, city, cat, salary };
      const customJobs = JSON.parse(localStorage.getItem('cm_custom_jobs') || '[]');
      customJobs.unshift(newJob);
      localStorage.setItem('cm_custom_jobs', JSON.stringify(customJobs));

      modal.classList.remove('open');
      showToast(`'${title}' रिक्त जागा यशस्वीरीत्या पोस्ट झाली!`, 'success');

      const jobGrid = document.querySelector('#jobGrid');
      if (jobGrid) {
        const row = document.createElement('div');
        row.className = 'list-row';
        row.dataset.cat = cat;
        row.dataset.name = title;
        row.style.marginBottom = '12px';
        row.innerHTML = `
          <div class="thumb">💼</div>
          <div class="content">
            <h4>${title}</h4>
            <div class="meta">${company} · ${city} · ${salary} <span style="color:var(--success); font-weight:700;">✓ नवीन पद</span></div>
          </div>
          <a class="btn btn-outline" href="#" onclick="event.preventDefault(); showToast('${title} साठी अर्ज पाठवला!', 'success'); this.textContent='✓ अर्ज केला'; this.style.color='var(--success)'; this.style.borderColor='var(--success)';">अर्ज करा</a>
        `;
        jobGrid.prepend(row);
      }
    };
  };

  // B. Job Info Modal
  window.showJobInfoModal = function(title, meta) {
    const body = `
      <div style="background:rgba(233,196,106,0.15); padding:14px; border-radius:8px; border-left:3px solid var(--gold-500); margin-bottom:16px;">
        <h4 style="margin:0 0 4px; color:var(--maroon-950);">${title}</h4>
        <div style="font-size:0.86rem; color:var(--saffron-700); font-weight:600;">${meta}</div>
      </div>
      <p style="font-size:0.88rem; color:var(--ink-soft); line-height:1.6;">
        हे सत्र राज्यस्तरीय स्पर्धा परीक्षा आणि भरती मार्गदर्शनासाठी अखिल भारतीय मराठा महासंघाच्या शैक्षणिक समितीमार्फत विनामूल्य आयोजित केले आहे.
      </p>
      <ul style="font-size:0.85rem; color:var(--ink); margin-left:18px; line-height:1.6; margin-bottom:16px;">
        <li>परीक्षेचा संपूर्ण अभ्यासक्रम व संदर्भ पुस्तके मोफत दिली जातील.</li>
        <li>यशस्वी अधिकारी बांधवांचे प्रत्यक्ष मार्गदर्शन सत्र.</li>
        <li>मॉक टेस्ट सिरीज व मुलाखत तंत्र सराव.</li>
      </ul>
      <button type="button" class="btn btn-primary" style="width:100%; padding:10px;" onclick="document.getElementById('jobInfoModal').classList.remove('open'); showToast('मार्गदर्शन सत्रासाठी तुमची नोंदणी निश्चित झाली!', 'success');">✓ सत्रासाठी मोफत नोंदणी करा</button>
    `;
    const modal = createModal('jobInfoModal', '📋 सत्र सविस्तर माहिती', body, '<button type="button" class="btn btn-outline" onclick="document.getElementById(\'jobInfoModal\').classList.remove(\'open\')">बंद करा</button>');
    modal.classList.add('open');
  };

  // C. Group Create Modal
  window.openGroupCreateModal = function() {
    const body = `
      <form id="groupCreateForm">
        <label>गटाचे नाव (Group Name):</label>
        <input type="text" id="newGrpName" placeholder="उदा. पुणे शिवप्रेमी गड संवर्धन मंच" required>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div>
            <label>श्रेणी:</label>
            <select id="newGrpCat">
              <option value="गड संवर्धन">गड संवर्धन</option>
              <option value="युवक संघटन">युवक संघटन</option>
              <option value="महिला मंच">महिला मंच</option>
              <option value="उद्योग नेटवर्क">उद्योग नेटवर्क</option>
              <option value="क्रीडा व व्यायाम">क्रीडा व व्यायाम</option>
            </select>
          </div>
          <div>
            <label>जिल्हा:</label>
            <input type="text" id="newGrpDist" placeholder="उदा. पुणे / सातारा" required>
          </div>
        </div>
        <label>गटाचा मुख्य उद्देश / माहिती:</label>
        <textarea id="newGrpDesc" rows="3" placeholder="गटाच्या उपक्रमांची माहिती येथे लिहा..." required></textarea>
        <button type="submit" class="btn btn-primary" style="width:100%; padding:10px;">✓ गट तयार करा</button>
      </form>
    `;
    const modal = createModal('groupCreateModal', '👥 नवीन समुदाय गट तयार करा', body, '<button type="button" class="btn btn-outline" onclick="document.getElementById(\'groupCreateModal\').classList.remove(\'open\')">बंद करा</button>');
    modal.classList.add('open');

    const form = modal.querySelector('#groupCreateForm');
    form.onsubmit = (e) => {
      e.preventDefault();
      const name = modal.querySelector('#newGrpName').value.trim();
      const category = modal.querySelector('#newGrpCat').value;
      const district = modal.querySelector('#newGrpDist').value.trim();
      const desc = modal.querySelector('#newGrpDesc').value.trim();

      const newGrp = { name, category, district, desc };
      const customGroups = JSON.parse(localStorage.getItem('cm_custom_groups') || '[]');
      customGroups.unshift(newGrp);
      localStorage.setItem('cm_custom_groups', JSON.stringify(customGroups));

      modal.classList.remove('open');
      showToast(`'${name}' गट यशस्वीरीत्या तयार झाला!`, 'success');

      const groupGrid = document.querySelector('#groupGrid, .grid-3');
      if (groupGrid && window.location.pathname.includes('cm-groups')) {
        const card = document.createElement('div');
        card.className = 'info-box-card';
        card.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <span class="tag" style="background:var(--maroon-900); color:var(--gold-300);">${category}</span>
            <span style="font-size:0.75rem; color:var(--success); font-weight:700;">✓ नवीन गट</span>
          </div>
          <h4 style="margin:0 0 6px;">${name}</h4>
          <p style="font-size:0.84rem; color:var(--ink-soft); margin-bottom:12px;">${desc}</p>
          <div style="font-size:0.78rem; color:var(--muted); margin-bottom:10px;">📍 जिल्हा: ${district} · सदस्य: १ (तुम्ही संस्थापक)</div>
          <button class="btn btn-primary" style="padding:6px 14px; font-size:0.82rem;" onclick="showToast('तुम्ही ${name} गटात सामील झालात!', 'success'); this.textContent='✓ सामील झालात';">सामील व्हा</button>
        `;
        groupGrid.prepend(card);
      }
    };
  };

  // D. Messages Modal
  window.openMessagesModal = function() {
    const savedName = localStorage.getItem('cm_user_name') || 'बांधव';
    const body = `
      <div style="height:220px; overflow-y:auto; background:var(--paper-2); padding:12px; border-radius:8px; border:1px solid var(--line); display:flex; flex-direction:column; gap:10px;" id="msgStream">
        <div style="align-self:flex-start; background:#FFFFFF; border:1px solid var(--line); border-radius:10px; padding:8px 12px; max-width:80%; font-size:0.84rem;">
          <strong style="color:var(--maroon-900);">🚩 महासंघ राज्य समन्वयक:</strong><br>
          नमस्कार ${savedName}! कनेक्ट मराठा व्यासपीठावर आपले स्वागत आहे. गड संवर्धन, उद्योग किंवा शैक्षणिक मदतीबाबत काही सहाय्य हवे असल्यास येथे संदेश पाठवा.
          <div style="font-size:0.72rem; color:var(--muted); text-align:right; margin-top:2px;">आज सकाळी १०:३०</div>
        </div>
      </div>
      <div style="display:flex; gap:8px; margin-top:12px;">
        <input type="text" id="replyMsgInput" placeholder="येथे संदेश टाईप करा..." style="margin-bottom:0; flex:1;">
        <button type="button" class="btn btn-primary" id="sendMsgBtn" style="padding:8px 16px;">पाठवा ✈️</button>
      </div>
    `;
    const modal = createModal('messagesModal', '💬 समाज समन्वयक मेसेजेस', body, '<button type="button" class="btn btn-outline" onclick="document.getElementById(\'messagesModal\').classList.remove(\'open\')">बंद करा</button>');
    modal.classList.add('open');

    const sendBtn = modal.querySelector('#sendMsgBtn');
    const input = modal.querySelector('#replyMsgInput');
    const stream = modal.querySelector('#msgStream');

    sendBtn.onclick = () => {
      const txt = input.value.trim();
      if (!txt) return;
      const userBubble = document.createElement('div');
      userBubble.style.cssText = 'align-self:flex-end; background:var(--gold-400); color:var(--maroon-950); font-weight:600; border-radius:10px; padding:8px 12px; max-width:80%; font-size:0.84rem;';
      userBubble.textContent = txt;
      stream.appendChild(userBubble);
      input.value = '';
      stream.scrollTop = stream.scrollHeight;

      setTimeout(() => {
        const replyBubble = document.createElement('div');
        replyBubble.style.cssText = 'align-self:flex-start; background:#FFFFFF; border:1px solid var(--line); border-radius:10px; padding:8px 12px; max-width:80%; font-size:0.84rem;';
        replyBubble.innerHTML = `<strong style="color:var(--maroon-900);">🚩 महासंघ समन्वयक:</strong><br>आपला संदेश मिळाला! आमचे संबंधित जिल्हा समन्वयक लवकरच आपल्याशी संपर्क करतील.`;
        stream.appendChild(replyBubble);
        stream.scrollTop = stream.scrollHeight;
      }, 700);
    };
  };

  // E. Settings Modal
  window.openSettingsModal = function() {
    const savedName = localStorage.getItem('cm_user_name') || 'संजय पाटील';
    const body = `
      <form id="settingsForm">
        <label>तुमचे नाव:</label>
        <input type="text" id="settingName" value="${savedName}" required>
        <label>जिल्हा:</label>
        <input type="text" id="settingDistrict" value="पुणे" required>
        <label style="margin-top:10px; margin-bottom:8px;">सूचना व अलर्ट प्राधान्ये:</label>
        <div style="display:flex; flex-direction:column; gap:8px; font-size:0.88rem; margin-bottom:16px;">
          <label style="font-weight:normal; display:flex; align-items:center; gap:8px; margin:0;">
            <input type="checkbox" checked style="width:auto; margin:0;"> 📱 SMS द्वारे गडकोट व समाज उपक्रम सूचना
          </label>
          <label style="font-weight:normal; display:flex; align-items:center; gap:8px; margin:0;">
            <input type="checkbox" checked style="width:auto; margin:0;"> 💬 WhatsApp द्वारे रक्तदान व नोकरी अलर्ट्स
          </label>
          <label style="font-weight:normal; display:flex; align-items:center; gap:8px; margin:0;">
            <input type="checkbox" checked style="width:auto; margin:0;"> 📧 मासिक मराठा समाचार ई-पत्रिका
          </label>
        </div>
        <button type="submit" class="btn btn-primary" style="width:100%; padding:10px;">✓ सेटिंग्स जतन करा</button>
      </form>
    `;
    const modal = createModal('settingsModal', '⚙️ खाते व सूचना सेटिंग्स', body, '<button type="button" class="btn btn-outline" onclick="document.getElementById(\'settingsModal\').classList.remove(\'open\')">रद्द करा</button>');
    modal.classList.add('open');

    const form = modal.querySelector('#settingsForm');
    form.onsubmit = (e) => {
      e.preventDefault();
      const newName = modal.querySelector('#settingName').value.trim();
      if (newName) {
        localStorage.setItem('cm_user_name', newName);
        const welcomeH2 = document.querySelector('.wrap h2');
        if (welcomeH2) welcomeH2.textContent = `नमस्कार, ${newName.split(' ')[0]}! 👋`;
        const idName = document.querySelector('.id-card .name');
        if (idName) idName.textContent = newName;
      }
      modal.classList.remove('open');
      showToast('सेटिंग्स यशस्वीरीत्या जतन झाल्या!', 'success');
    };
  };

  // F. Community Guidelines Modal
  window.openGuidelinesModal = function() {
    const body = `
      <div style="font-size:0.88rem; line-height:1.65; color:var(--ink-soft);">
        <p style="margin-bottom:12px;"><strong>अखिल भारतीय मराठा महासंघाच्या अधिकृत डिजिटल व्यासपीठाची ५ सुवर्ण तत्त्वे:</strong></p>
        <ol style="margin-left:18px; margin-bottom:16px; display:flex; flex-direction:column; gap:8px;">
          <li><strong>शिवरायांचा आचारधर्म:</strong> रयतेचे कल्याण, सर्व धर्मसमभाव आणि उच्च नैतिक मूल्ये यांचे जीवनात पालन करणे.</li>
          <li><strong>स्त्रीसन्मान:</strong> छत्रपतींच्या राज्यात स्त्रियांचा सर्वोच्च सन्मान होता. महिला बांधवांशी सदैव आदराने वागणे बंधनकारक आहे.</li>
          <li><strong>एकता व बंधुभाव:</strong> जात, पोटजात, राजकीय मतभेद बाजूला ठेवून मराठा समाजात परस्पर सहकार्य व आर्थिक स्वावलंबन निर्माण करणे.</li>
          <li><strong>गडकोट संवर्धन:</strong> सह्याद्रीतील गडकिल्ल्यांचे पावित्र्य राखणे, प्लास्टिकमुक्त ठेवणे व इतिहास संशोधनाला पाठबळ देणे.</li>
          <li><strong>सत्यनिष्ठा:</strong> कोणत्याही अफवा, द्वेषमूलक विधाने किंवा फसव्या जाहिरातींना व्यासपीठावर पूर्णपणे बंदी आहे.</li>
        </ol>
      </div>
      <button type="button" class="btn btn-primary" style="width:100%; padding:10px;" onclick="document.getElementById('guidelinesModal').classList.remove('open'); showToast('मार्गदर्शक तत्त्वांचे वाचन संपन्न झाले!', 'success');">✓ मला सर्व तत्त्वे मान्य आहेत</button>
    `;
    const modal = createModal('guidelinesModal', '📜 कनेक्ट मराठा — समुदाय मार्गदर्शक तत्त्वे', body, '<button type="button" class="btn btn-outline" onclick="document.getElementById(\'guidelinesModal\').classList.remove(\'open\')">बंद करा</button>');
    modal.classList.add('open');
  };

  // G. Password Reset Modal
  window.openPasswordResetModal = function() {
    const body = `
      <form id="passResetForm">
        <label>तुमचा नोंदणीकृत मोबाईल नंबर:</label>
        <input type="tel" id="resetPhone" placeholder="+91 XXXXX XXXXX" required>
        <div id="otpSection" style="display:none;">
          <label>मोबाईलवर आलेला ६-अंकी OTP टाका:</label>
          <input type="text" id="resetOtp" placeholder="- - - - - -" maxlength="6">
          <label>नवीन पासवर्ड:</label>
          <input type="password" id="newPass" placeholder="किमान ८ अक्षरे">
        </div>
        <button type="button" class="btn btn-outline" id="sendOtpBtn" style="width:100%; margin-bottom:10px; border-color:var(--gold-500); color:var(--maroon-950); font-weight:700;">📲 OTP पाठवा</button>
        <button type="submit" class="btn btn-primary" id="savePassBtn" style="width:100%; display:none; padding:10px;">✓ पासवर्ड रीसेट करा</button>
      </form>
    `;
    const modal = createModal('passwordResetModal', '🔐 पासवर्ड रीसेट करा', body, '<button type="button" class="btn btn-outline" onclick="document.getElementById(\'passwordResetModal\').classList.remove(\'open\')">बंद करा</button>');
    modal.classList.add('open');

    const sendOtpBtn = modal.querySelector('#sendOtpBtn');
    const otpSection = modal.querySelector('#otpSection');
    const savePassBtn = modal.querySelector('#savePassBtn');
    const resetPhone = modal.querySelector('#resetPhone');
    const resetOtp = modal.querySelector('#resetOtp');

    sendOtpBtn.onclick = () => {
      const mob = resetPhone.value.trim();
      if (!mob) {
        alert('कृपया मोबाईल नंबर प्रविष्ट करा!');
        return;
      }
      const demoOtp = Math.floor(100000 + Math.random() * 900000);
      showToast(`सुरक्षा OTP ${mob} वर पाठवला: ${demoOtp}`, 'info');
      otpSection.style.display = 'block';
      sendOtpBtn.style.display = 'none';
      savePassBtn.style.display = 'block';
      resetOtp.value = demoOtp;
    };

    const form = modal.querySelector('#passResetForm');
    form.onsubmit = (e) => {
      e.preventDefault();
      modal.classList.remove('open');
      showToast('पासवर्ड यशस्वीरीत्या रीसेट झाला! आता लॉगिन करू शकता.', 'success');
    };
  };

  // Wire up clicks on triggers across all pages
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a, button');
    if (!a) return;
    const txt = a.textContent.trim();

    if (txt === 'जॉब पोस्ट करा') {
      e.preventDefault();
      openJobPostModal();
    } else if (txt === 'माहिती पहा') {
      e.preventDefault();
      const row = a.closest('.list-row');
      const title = row ? row.querySelector('h4')?.textContent : 'स्पर्धा परीक्षा मार्गदर्शन';
      const meta = row ? row.querySelector('.meta')?.textContent : 'राज्यस्तरीय सत्र';
      showJobInfoModal(title, meta);
    } else if (txt === '+ नवीन गट तयार करा') {
      e.preventDefault();
      openGroupCreateModal();
    } else if (txt.includes('मेसेजेस') && a.getAttribute('href') === '#') {
      e.preventDefault();
      openMessagesModal();
    } else if (txt.includes('सेटिंग्स')) {
      e.preventDefault();
      openSettingsModal();
    } else if (txt.includes('समुदाय मार्गदर्शक तत्त्वांशी')) {
      e.preventDefault();
      openGuidelinesModal();
    } else if (txt.includes('पासवर्ड विसरलात?')) {
      e.preventDefault();
      openPasswordResetModal();
    }
  });

  // Render saved custom jobs on cm-jobs.html
  const jobGrid = document.querySelector('#jobGrid');
  if (jobGrid) {
    const customJobs = JSON.parse(localStorage.getItem('cm_custom_jobs') || '[]');
    customJobs.forEach(job => {
      const row = document.createElement('div');
      row.className = 'list-row';
      row.dataset.cat = job.cat;
      row.dataset.name = job.title;
      row.style.marginBottom = '12px';
      row.innerHTML = `
        <div class="thumb">💼</div>
        <div class="content">
          <h4>${job.title}</h4>
          <div class="meta">${job.company} · ${job.city} · ${job.salary} <span style="color:var(--success); font-weight:700;">✓ नवीन पद</span></div>
        </div>
        <a class="btn btn-outline" href="#" onclick="event.preventDefault(); showToast('${job.title} साठी अर्ज पाठवला!', 'success'); this.textContent='✓ अर्ज केला'; this.style.color='var(--success)'; this.style.borderColor='var(--success)';">अर्ज करा</a>
      `;
      jobGrid.prepend(row);
    });
  }

  // Render saved custom groups on cm-groups.html
  const groupGrid = document.querySelector('#groupGrid, .grid-3');
  if (groupGrid && window.location.pathname.includes('cm-groups')) {
    const customGroups = JSON.parse(localStorage.getItem('cm_custom_groups') || '[]');
    customGroups.forEach(grp => {
      const card = document.createElement('div');
      card.className = 'info-box-card';
      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <span class="tag" style="background:var(--maroon-900); color:var(--gold-300);">${grp.category}</span>
          <span style="font-size:0.75rem; color:var(--success); font-weight:700;">✓ नवीन गट</span>
        </div>
        <h4 style="margin:0 0 6px;">${grp.name}</h4>
        <p style="font-size:0.84rem; color:var(--ink-soft); margin-bottom:12px;">${grp.desc}</p>
        <div style="font-size:0.78rem; color:var(--muted); margin-bottom:10px;">📍 जिल्हा: ${grp.district} · सदस्य: १ (तुम्ही संस्थापक)</div>
        <button class="btn btn-primary" style="padding:6px 14px; font-size:0.82rem;" onclick="showToast('तुम्ही ${grp.name} गटात सामील झालात!', 'success'); this.textContent='✓ सामील झालात';">सामील व्हा</button>
      `;
      groupGrid.prepend(card);
    });
  }
}

// ==========================================================================
// Scroll-Reveal Motion Engine — powers [data-reveal] and [data-reveal-group]
// ==========================================================================
function initScrollReveal() {
  const targets = document.querySelectorAll('[data-reveal], [data-reveal-group]');
  if (!targets.length) return;

  if (!('IntersectionObserver' in window)) {
    targets.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  targets.forEach(el => io.observe(el));

  // Fail-safe: never leave content permanently invisible if the observer
  // misses an element (fast resizes, print/screenshot capture, edge cases).
  setTimeout(() => {
    targets.forEach(el => el.classList.add('is-visible'));
  }, 2500);
}

// ==========================================================================
// Cursor Glow — soft saffron light following the pointer (desktop only)
// ==========================================================================
function initCursorGlow() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const glow = document.createElement('div');
  glow.className = 'cursor-glow';
  document.body.appendChild(glow);

  let raf = null;
  document.addEventListener('mousemove', (e) => {
    glow.classList.add('active');
    if (raf) return;
    raf = requestAnimationFrame(() => {
      glow.style.left = e.clientX + 'px';
      glow.style.top = e.clientY + 'px';
      raf = null;
    });
  });
  document.addEventListener('mouseleave', () => glow.classList.remove('active'));
}

// Run dynamic modules after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initEmberCanvas();
  initHeritageLightbox();
  initRajmudraInteractive();
  initMobileNavigation();
  initDropdownMenus();
  initUniversalModals();
  initScrollReveal();
  initCursorGlow();

  if (typeof window.switchHeroView === 'function' && document.getElementById('heroCardImg')) {
    window.switchHeroView('hero');
  }
});

