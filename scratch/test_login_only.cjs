const { spawn } = require('child_process');
const http = require('http');

const profileDir = __dirname + '/chrome_test_profile3';

async function run() {
  const chrome = spawn("C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", [
    "--headless=new",
    "--remote-debugging-port=9227",
    "--user-data-dir=" + profileDir,
    "--no-first-run",
    "--no-default-browser-check",
    "--window-size=1440,900",
    "http://localhost:8080/cm-login.html"
  ]);

  await new Promise(r => setTimeout(r, 2000));

  http.get('http://localhost:9227/json', (res) => {
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

        console.log("=== Testing cm-login.html directly ===");
        const loginRes = await send('Runtime.evaluate', {
          expression: `(() => {
            try {
              const btn = document.querySelector('#forgotPassBtn');
              const beforeClick = { btnExists: !!btn, hasFn: typeof window.openPasswordResetModal === 'function' };
              if (btn) btn.click();
              const modal = document.querySelector('#passwordResetModal');
              return { beforeClick, modalOpen: modal ? modal.classList.contains('open') : false };
            } catch (err) {
              return { error: err.message };
            }
          })()`,
          returnByValue: true
        });
        console.log("Login Result:", JSON.stringify(loginRes.result?.result?.value));

        ws.close();
        chrome.kill();
        process.exit(0);
      };
    });
  });
}

run();
