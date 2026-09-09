const { spawn } = require('child_process');
const http = require('http');

async function testAllNewFeatures() {
  const chrome = spawn("C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", [
    "--headless=new",
    "--remote-debugging-port=9222",
    "--no-first-run",
    "--no-default-browser-check",
    "--window-size=1440,900",
    "http://localhost:8080/index.html"
  ]);

  await new Promise(r => setTimeout(r, 2000));

  function getTargets() {
    return new Promise((resolve) => {
      http.get('http://localhost:9222/json', (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(JSON.parse(data)));
      });
    });
  }

  const targets = await getTargets();
  const pageTarget = targets.find(t => t.url.includes('localhost:8080'));
  if (!pageTarget) {
    console.error("Target not found!");
    chrome.kill();
    return;
  }

  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  let msgId = 1;
  const pending = new Map();

  function send(method, params = {}) {
    return new Promise((resolve) => {
      const id = msgId++;
      pending.set(id, resolve);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await new Promise(r => ws.onopen = r);
  await send('Console.enable');
  await send('Runtime.enable');
  await send('Page.enable');

  console.log("=== 1. Testing Mobile Hamburger Menu & Slide-out Drawer ===");
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });

  const drawerTest = await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = document.querySelector('#mobileMenuToggle');
      const drawer = document.querySelector('#mobileNavDrawer');
      const backdrop = document.querySelector('.mobile-nav-backdrop');
      if (!btn || !drawer || !backdrop) return { error: 'Elements missing' };
      
      btn.click();
      const isOpenAfterClick = drawer.classList.contains('open') && backdrop.classList.contains('open');
      
      const closeBtn = document.querySelector('#mobileDrawerClose');
      if (closeBtn) closeBtn.click();
      const isClosedAfterClose = !drawer.classList.contains('open');

      return {
        hamburgerPresent: true,
        openedOnClick: isOpenAfterClick,
        closedOnCloseBtn: isClosedAfterClose,
        drawerLinksCount: drawer.querySelectorAll('a').length
      };
    })()`,
    returnByValue: true
  });
  console.log("Drawer Test Result:", drawerTest.result?.result?.value);

  console.log("\n=== 2. Testing Mega-Dropdown on Desktop ===");
  await send('Emulation.clearDeviceMetricsOverride');
  const dropdownTest = await send('Runtime.evaluate', {
    expression: `(() => {
      const dropdownWrap = document.querySelector('.nav-dropdown');
      const trigger = dropdownWrap ? dropdownWrap.querySelector('.dropdown-trigger') : null;
      const menu = dropdownWrap ? dropdownWrap.querySelector('.nav-dropdown-menu') : null;
      if (!dropdownWrap || !trigger || !menu) return { error: 'Dropdown elements missing' };

      trigger.click();
      const isOpen = dropdownWrap.classList.contains('open');
      const linksCount = menu.querySelectorAll('a').length;

      return {
        dropdownPresent: true,
        openedOnClick: isOpen,
        linksCount: linksCount
      };
    })()`,
    returnByValue: true
  });
  console.log("Dropdown Test Result:", dropdownTest.result?.result?.value);

  console.log("\n=== 3. Testing Universal Service Booking Modal on index.html ===");
  const bookingTest = await send('Runtime.evaluate', {
    expression: `(() => {
      // Find a service button on index.html, e.g. 'सेवा बुक करा'
      const btns = Array.from(document.querySelectorAll('a, button'));
      const bookBtn = btns.find(b => b.textContent.trim() === 'सेवा बुक करा');
      if (!bookBtn) return { error: 'Booking button not found on index.html' };

      bookBtn.click();
      const modal = document.querySelector('#serviceBookingModal');
      const isOpen = modal && modal.classList.contains('open');
      const serviceTitle = document.querySelector('#modalServiceTitle')?.textContent;

      if (modal && isOpen) {
        // Test form submission
        const nameInput = modal.querySelector('#bookUserName');
        const phoneInput = modal.querySelector('#bookUserPhone');
        const cityInput = modal.querySelector('#bookUserCity');
        if (nameInput) nameInput.value = 'सचिन गायकवाड';
        if (phoneInput) phoneInput.value = '9876543210';
        if (cityInput) cityInput.value = 'सातारा';

        modal.querySelector('#serviceBookingForm').dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }

      const bookedServices = JSON.parse(localStorage.getItem('cm_booked_services') || '[]');

      return {
        modalOpened: isOpen,
        serviceTitle: serviceTitle,
        bookedSuccessfully: bookedServices.length > 0,
        latestBooking: bookedServices[0]
      };
    })()`,
    returnByValue: true
  });
  console.log("Service Booking Test Result:", bookingTest.result?.result?.value);

  console.log("\n=== 4. Testing Hero View Switcher Active State ===");
  const heroBtnTest = await send('Runtime.evaluate', {
    expression: `(() => {
      window.switchHeroView('samrajya');
      const btns = Array.from(document.querySelectorAll('.hero-real-card button'));
      const activeBtn = btns.find(b => b.classList.contains('hero-btn-active'));
      return {
        activeButtonText: activeBtn ? activeBtn.textContent : null,
        title: document.getElementById('heroCardTitle')?.textContent
      };
    })()`,
    returnByValue: true
  });
  console.log("Hero Switcher Result:", heroBtnTest.result?.result?.value);

  console.log("\n=== 5. Testing cm-jobs.html Modals (Job Post & Info) ===");
  await send('Page.navigate', { url: 'http://localhost:8080/cm-jobs.html' });
  await new Promise(r => setTimeout(r, 600));

  const jobModalTest = await send('Runtime.evaluate', {
    expression: `(() => {
      const postBtn = Array.from(document.querySelectorAll('a')).find(a => a.textContent.trim() === 'जॉब पोस्ट करा');
      if (!postBtn) return { error: 'Post button not found' };
      postBtn.click();

      const modal = document.querySelector('#jobPostModal');
      const isOpen = modal && modal.classList.contains('open');

      if (modal && isOpen) {
        modal.querySelector('#newJobTitle').value = 'Automobile Engineer';
        modal.querySelector('#newJobCompany').value = 'टाटा मोटर्स वेंडर';
        modal.querySelector('#newJobCity').value = 'पुणे';
        modal.querySelector('#newJobSalary').value = '₹4.5 LPA';
        modal.querySelector('#jobPostForm').dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }

      const customJobs = JSON.parse(localStorage.getItem('cm_custom_jobs') || '[]');
      const firstRow = document.querySelector('#jobGrid .list-row');

      return {
        modalOpened: isOpen,
        customJobsCount: customJobs.length,
        prependedToDom: firstRow ? firstRow.textContent.includes('Automobile Engineer') : false
      };
    })()`,
    returnByValue: true
  });
  console.log("Job Modal Test Result:", jobModalTest.result?.result?.value);

  console.log("\n=== 6. Testing cm-groups.html Modal (Create Group) ===");
  await send('Page.navigate', { url: 'http://localhost:8080/cm-groups.html' });
  await new Promise(r => setTimeout(r, 600));

  const groupModalTest = await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = Array.from(document.querySelectorAll('a')).find(a => a.textContent.trim() === '+ नवीन गट तयार करा');
      if (!btn) return { error: 'Group create button not found' };
      btn.click();

      const modal = document.querySelector('#groupCreateModal');
      const isOpen = modal && modal.classList.contains('open');

      if (modal && isOpen) {
        modal.querySelector('#newGrpName').value = 'रायगड शिवसंवर्धन मंच';
        modal.querySelector('#newGrpDist').value = 'रायगड';
        modal.querySelector('#newGrpDesc').value = 'रायगडावरील ऐतिहासिक वास्तूंची स्वच्छता व संवर्धन मोहीम.';
        modal.querySelector('#groupCreateForm').dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }

      const customGroups = JSON.parse(localStorage.getItem('cm_custom_groups') || '[]');

      return {
        modalOpened: isOpen,
        customGroupsCount: customGroups.length,
        latestGroup: customGroups[0]
      };
    })()`,
    returnByValue: true
  });
  console.log("Group Modal Test Result:", groupModalTest.result?.result?.value);

  console.log("\n=== 7. Testing cm-dashboard.html (Messages & Settings) ===");
  await send('Page.navigate', { url: 'http://localhost:8080/cm-dashboard.html' });
  await new Promise(r => setTimeout(r, 600));

  const dashModalTest = await send('Runtime.evaluate', {
    expression: `(() => {
      const msgBtn = Array.from(document.querySelectorAll('a')).find(a => a.textContent.includes('मेसेजेस'));
      if (msgBtn) msgBtn.click();
      const msgModal = document.querySelector('#messagesModal');
      const isMsgOpen = msgModal && msgModal.classList.contains('open');
      if (msgModal) msgModal.classList.remove('open');

      const setBtn = Array.from(document.querySelectorAll('a')).find(a => a.textContent.includes('सेटिंग्स'));
      if (setBtn) setBtn.click();
      const setModal = document.querySelector('#settingsModal');
      const isSetOpen = setModal && setModal.classList.contains('open');

      return {
        messagesModalWorks: isMsgOpen,
        settingsModalWorks: isSetOpen
      };
    })()`,
    returnByValue: true
  });
  console.log("Dashboard Modals Test Result:", dashModalTest.result?.result?.value);

  console.log("\n=== 8. Testing cm-login.html (Password Reset Modal) ===");
  await send('Page.navigate', { url: 'http://localhost:8080/cm-login.html' });
  await new Promise(r => setTimeout(r, 600));

  const loginModalTest = await send('Runtime.evaluate', {
    expression: `(() => {
      const forgotBtn = Array.from(document.querySelectorAll('a')).find(a => a.textContent.includes('पासवर्ड विसरलात?'));
      if (forgotBtn) forgotBtn.click();
      const modal = document.querySelector('#passwordResetModal');
      return {
        resetModalOpens: modal && modal.classList.contains('open')
      };
    })()`,
    returnByValue: true
  });
  console.log("Login Modal Test Result:", loginModalTest.result?.result?.value);

  ws.close();
  chrome.kill();
  console.log("\nAll feature tests complete!");
  process.exit(0);
}

testAllNewFeatures();
