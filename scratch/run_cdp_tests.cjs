const { spawn } = require('child_process');
const http = require('http');

async function runTest() {
  const chrome = spawn("C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", [
    "--headless=new",
    "--remote-debugging-port=9222",
    "--no-first-run",
    "--no-default-browser-check",
    "--window-size=1440,900",
    "http://localhost:8080/index.html"
  ]);

  await new Promise(r => setTimeout(r, 2000));

  http.get('http://localhost:9222/json', async (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', async () => {
      const targets = JSON.parse(data);
      const pageTarget = targets.find(t => t.url.includes('localhost:8080/index.html'));
      if (!pageTarget) {
        console.error("Page target not found!");
        chrome.kill();
        return;
      }

      console.log("Connecting to WebSocket:", pageTarget.webSocketDebuggerUrl);
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

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id && pending.has(msg.id)) {
          const resolver = pending.get(msg.id);
          pending.delete(msg.id);
          resolver(msg);
        } else if (msg.method === 'Console.messageAdded') {
          console.log('[BROWSER CONSOLE]', msg.params.message.level, msg.params.message.text);
        } else if (msg.method === 'Runtime.exceptionThrown') {
          console.error('[BROWSER EXCEPTION]', msg.params.exceptionDetails);
        }
      };

      ws.onopen = async () => {
        console.log("WebSocket connected. Enabling domains...");
        await send('Console.enable');
        await send('Runtime.enable');
        await send('Page.enable');

        // Test 1: Check document title and errors
        const titleRes = await send('Runtime.evaluate', { expression: 'document.title', returnByValue: true });
        console.log("Document Title:", titleRes.result?.result?.value);

        // Test 2: Check Ember canvas presence & size
        const canvasRes = await send('Runtime.evaluate', { 
          expression: '(() => { const c = document.getElementById("emberCanvas"); return c ? { width: c.width, height: c.height } : null; })()',
          returnByValue: true
        });
        console.log("Ember Canvas status:", canvasRes.result?.result?.value);

        // Test 3: Test switchHeroView('samrajya')
        const switchRes = await send('Runtime.evaluate', { 
          expression: '(() => { if (typeof window.switchHeroView === "function") { window.switchHeroView("samrajya"); return document.getElementById("heroCardTitle").textContent; } return "NOT_A_FUNCTION"; })()',
          returnByValue: true
        });
        console.log("switchHeroView('samrajya') result:", switchRes.result?.result?.value);

        // Test 4: Check if lightbox element exists and test opening it
        const lbTest = await send('Runtime.evaluate', {
          expression: '(() => { const trigger = document.querySelector(".lightbox-trigger"); if (!trigger) return "NO_TRIGGER"; trigger.click(); const lb = document.querySelector(".heritage-lightbox"); return lb ? { hasActive: lb.classList.contains("active"), title: document.getElementById("lightboxTitle").textContent } : "NO_LB"; })()',
          returnByValue: true
        });
        console.log("Lightbox click test on .lightbox-trigger:", lbTest.result?.result?.value);

        // Test 5: Check Rajmudra click
        const rajTest = await send('Runtime.evaluate', {
          expression: '(() => { const r = document.querySelector(".rajmudra-container"); if (r) { r.click(); return "CLICKED_RAJMUDRA"; } return "NO_RAJMUDRA"; })()',
          returnByValue: true
        });
        console.log("Rajmudra Click:", rajTest.result?.result?.value);

        // Test 6: Check Toast container
        const toastTest = await send('Runtime.evaluate', {
          expression: '(() => { const t = document.querySelector(".cm-toast"); return t ? t.textContent : "NO_TOAST"; })()',
          returnByValue: true
        });
        console.log("Toast result:", toastTest.result?.result?.value);

        // Test 7: Mobile check - what is desktop-nav visibility at 600px width?
        await send('Emulation.setDeviceMetricsOverride', {
          width: 390,
          height: 844,
          deviceScaleFactor: 2,
          mobile: true
        });
        const mobileNavCheck = await send('Runtime.evaluate', {
          expression: '(() => { const dNav = document.querySelector(".desktop-nav"); const bNav = document.querySelector(".bottom-nav"); const hBtn = document.querySelector(".mobile-menu-btn, .hamburger, .menu-toggle"); return { desktopNavDisplay: dNav ? getComputedStyle(dNav).display : "NONE", hasBottomNav: !!bNav, hasHamburger: !!hBtn }; })()',
          returnByValue: true
        });
        console.log("Mobile responsiveness check:", mobileNavCheck.result?.result?.value);

        ws.close();
        chrome.kill();
        process.exit(0);
      };
    });
  }).on('error', err => {
    console.error("HTTP error:", err);
    chrome.kill();
  });
}

runTest();
