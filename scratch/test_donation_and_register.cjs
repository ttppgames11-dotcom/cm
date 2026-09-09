const { spawn } = require('child_process');
const http = require('http');

const profileDir = __dirname + '/chrome_test_profile4';

async function run() {
  const chrome = spawn("C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", [
    "--headless=new",
    "--remote-debugging-port=9228",
    "--user-data-dir=" + profileDir,
    "--no-first-run",
    "--no-default-browser-check",
    "--window-size=1440,900",
    "http://localhost:8080/cm-donation.html"
  ]);

  await new Promise(r => setTimeout(r, 2000));

  http.get('http://localhost:9228/json', (res) => {
    let raw = '';
    res.on('data', d => raw += d);
    res.on('end', async () => {
      const targets = JSON.parse(raw);
      const target = targets.find(t => t.url.includes('localhost:8080'));
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
        await send('Page.enable');

        console.log("=== Testing cm-donation.html ===");
        const donRes = await send('Runtime.evaluate', {
          expression: `(() => {
            const btn = document.querySelector('.btn-primary');
            if (btn) btn.click();
            const modal = document.querySelector('#donationModal');
            return { btnFound: !!btn, modalOpen: modal ? modal.classList.contains('open') : false };
          })()`,
          returnByValue: true
        });
        console.log("Donation Result:", JSON.stringify(donRes.result?.result?.value));

        console.log("\n=== Testing cm-register.html ===");
        await send('Page.navigate', { url: 'http://localhost:8080/cm-register.html' });
        await new Promise(r => setTimeout(r, 1000));
        const regRes = await send('Runtime.evaluate', {
          expression: `(() => {
            const link = Array.from(document.querySelectorAll('a')).find(a => a.textContent.includes('मार्गदर्शक तत्त्वे') || a.textContent.includes('मार्गदर्शक'));
            if (link) link.click();
            const modal = document.querySelector('#guidelinesModal');
            return { linkFound: !!link, modalOpen: modal ? modal.classList.contains('open') : false };
          })()`,
          returnByValue: true
        });
        console.log("Register Result:", JSON.stringify(regRes.result?.result?.value));

        ws.close();
        chrome.kill();
        process.exit(0);
      };
    });
  });
}

run();
