const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

const profileDir = __dirname + '/chrome_test_profile';
if (!fs.existsSync(profileDir)) fs.mkdirSync(profileDir, { recursive: true });

async function run() {
  const chrome = spawn("C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", [
    "--headless=new",
    "--remote-debugging-port=9225",
    "--user-data-dir=" + profileDir,
    "--no-first-run",
    "--no-default-browser-check",
    "--window-size=1440,900",
    "http://localhost:8080/index.html"
  ]);

  await new Promise(r => setTimeout(r, 2500));

  http.get('http://localhost:9225/json', (res) => {
    let raw = '';
    res.on('data', d => raw += d);
    res.on('end', async () => {
      const targets = JSON.parse(raw);
      const target = targets.find(t => t.url.includes('localhost:8080'));
      if (!target) {
        console.error("Target not found!");
        chrome.kill();
        process.exit(1);
      }

      const ws = new WebSocket(target.webSocketDebuggerUrl);
      let id = 1;
      const map = new Map();

      function send(method, params = {}) {
        return new Promise((resolve) => {
          const reqId = id++;
          map.set(reqId, resolve);
          ws.send(JSON.stringify({ id: reqId, method, params }));
        });
      }

      ws.onmessage = (e) => {
        const msg = JSON.parse(e.data);
        if (msg.id && map.has(msg.id)) {
          const r = map.get(msg.id);
          map.delete(msg.id);
          r(msg);
        }
      };

      ws.onopen = async () => {
        await send('Runtime.enable');

        console.log("=== Testing 1: Mobile Hamburger & Drawer ===");
        await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
        const res1 = await send('Runtime.evaluate', {
          expression: `(() => {
            const btn = document.querySelector('#mobileMenuToggle');
            const drawer = document.querySelector('#mobileNavDrawer');
            if (!btn || !drawer) return 'ELEMENTS_NOT_FOUND';
            btn.click();
            const isOpen = drawer.classList.contains('open');
            const closeBtn = document.querySelector('#mobileDrawerClose');
            if (closeBtn) closeBtn.click();
            const isClosed = !drawer.classList.contains('open');
            return { hamburgerPresent: !!btn, opened: isOpen, closed: isClosed, linksCount: drawer.querySelectorAll('a').length };
          })()`,
          returnByValue: true
        });
        console.log("Mobile Nav Result:", res1.result?.result?.value);

        console.log("\n=== Testing 2: Desktop Mega-Dropdown ===");
        await send('Emulation.clearDeviceMetricsOverride');
        const res2 = await send('Runtime.evaluate', {
          expression: `(() => {
            const dd = document.querySelector('.nav-dropdown');
            const trigger = dd?.querySelector('.dropdown-trigger');
            if (!dd || !trigger) return 'DROPDOWN_NOT_FOUND';
            trigger.click();
            return { opened: dd.classList.contains('open'), menuLinks: dd.querySelectorAll('.nav-dropdown-menu a').length };
          })()`,
          returnByValue: true
        });
        console.log("Dropdown Result:", res2.result?.result?.value);

        console.log("\n=== Testing 3: Universal Service Booking Modal on index.html ===");
        const res3 = await send('Runtime.evaluate', {
          expression: `(() => {
            const btn = Array.from(document.querySelectorAll('a, button')).find(b => b.textContent.trim() === 'सेवा बुक करा');
            if (!btn) return 'BOOK_BTN_NOT_FOUND';
            btn.click();
            const modal = document.querySelector('#serviceBookingModal');
            const isOpen = modal?.classList.contains('open');
            const title = document.querySelector('#modalServiceTitle')?.textContent;
            return { modalOpened: isOpen, title };
          })()`,
          returnByValue: true
        });
        console.log("Booking Modal Result:", res3.result?.result?.value);

        console.log("\n=== Testing 4: Hero View Switcher Active Class ===");
        const res4 = await send('Runtime.evaluate', {
          expression: `(() => {
            window.switchHeroView('samrajya');
            const activeBtn = document.querySelector('.hero-real-card button.hero-btn-active');
            return { activeBtnText: activeBtn?.textContent, cardTitle: document.getElementById('heroCardTitle')?.textContent };
          })()`,
          returnByValue: true
        });
        console.log("Hero Switcher Result:", res4.result?.result?.value);

        ws.close();
        chrome.kill();
        process.exit(0);
      };
    });
  }).on('error', (err) => {
    console.error("HTTP error:", err.message);
    chrome.kill();
    process.exit(1);
  });
}

run();
