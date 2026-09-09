const { spawn } = require('child_process');
const http = require('http');

const profileDir = __dirname + '/chrome_test_profile2';

async function run() {
  const chrome = spawn("C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", [
    "--headless=new",
    "--remote-debugging-port=9226",
    "--user-data-dir=" + profileDir,
    "--no-first-run",
    "--no-default-browser-check",
    "--window-size=1440,900",
    "http://localhost:8080/cm-jobs.html"
  ]);

  await new Promise(r => setTimeout(r, 2500));

  http.get('http://localhost:9226/json', (res) => {
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

        console.log("=== 1. Testing cm-jobs.html ===");
        const jobsRes = await send('Runtime.evaluate', {
          expression: `(() => {
            const btn = Array.from(document.querySelectorAll('a')).find(a => a.textContent.trim() === 'जॉब पोस्ट करा');
            if (btn) btn.click();
            const modal = document.querySelector('#jobPostModal');
            return { buttonFound: !!btn, modalOpened: modal && modal.classList.contains('open') };
          })()`,
          returnByValue: true
        });
        console.log("Jobs Post Result:", jobsRes.result?.result?.value);

        console.log("\n=== 2. Testing cm-groups.html ===");
        await send('Page.navigate', { url: 'http://localhost:8080/cm-groups.html' });
        await new Promise(r => setTimeout(r, 600));
        const groupRes = await send('Runtime.evaluate', {
          expression: `(() => {
            const btn = Array.from(document.querySelectorAll('a')).find(a => a.textContent.trim() === '+ नवीन गट तयार करा');
            if (btn) btn.click();
            const modal = document.querySelector('#groupCreateModal');
            return { buttonFound: !!btn, modalOpened: modal && modal.classList.contains('open') };
          })()`,
          returnByValue: true
        });
        console.log("Group Create Result:", groupRes.result?.result?.value);

        console.log("\n=== 3. Testing cm-dashboard.html ===");
        await send('Page.navigate', { url: 'http://localhost:8080/cm-dashboard.html' });
        await new Promise(r => setTimeout(r, 600));
        const dashRes = await send('Runtime.evaluate', {
          expression: `(() => {
            const msgBtn = Array.from(document.querySelectorAll('a')).find(a => a.textContent.includes('मेसेजेस'));
            if (msgBtn) msgBtn.click();
            const msgModal = document.querySelector('#messagesModal');
            const msgOpen = msgModal && msgModal.classList.contains('open');

            const setBtn = Array.from(document.querySelectorAll('a')).find(a => a.textContent.includes('सेटिंग्स'));
            if (setBtn) setBtn.click();
            const setModal = document.querySelector('#settingsModal');
            const setOpen = setModal && setModal.classList.contains('open');

            return { msgModalOpen: msgOpen, settingsModalOpen: setOpen };
          })()`,
          returnByValue: true
        });
        console.log("Dashboard Result:", dashRes.result?.result?.value);

        console.log("\n=== 4. Testing cm-login.html ===");
        await send('Page.navigate', { url: 'http://localhost:8080/cm-login.html' });
        await new Promise(r => setTimeout(r, 600));
        const loginRes = await send('Runtime.evaluate', {
          expression: `(() => {
            const btn = Array.from(document.querySelectorAll('a')).find(a => a.textContent.includes('पासवर्ड विसरलात?'));
            if (btn) btn.click();
            const modal = document.querySelector('#passwordResetModal');
            return { resetModalOpen: modal && modal.classList.contains('open') };
          })()`,
          returnByValue: true
        });
        console.log("Login Result:", loginRes.result?.result?.value);

        ws.close();
        chrome.kill();
        process.exit(0);
      };
    });
  });
}

run();
