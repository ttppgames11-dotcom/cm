const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const files = fs.readdirSync(path.join(__dirname, '..')).filter(f => f.endsWith('.html'));

async function runAudit() {
  const chrome = spawn("C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", [
    "--headless=new",
    "--remote-debugging-port=9222",
    "--no-first-run",
    "--no-default-browser-check",
    "--window-size=1440,900"
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
  const pageTarget = targets.find(t => t.type === 'page');
  if (!pageTarget) {
    console.error("No page target found");
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

  const pageErrors = {};

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const resolver = pending.get(msg.id);
      pending.delete(msg.id);
      resolver(msg);
    } else if (msg.method === 'Console.messageAdded') {
      const level = msg.params.message.level;
      if (level === 'error' || level === 'warning') {
        const url = currentPage;
        if (!pageErrors[url]) pageErrors[url] = [];
        pageErrors[url].push(`[Console ${level}] ${msg.params.message.text}`);
      }
    } else if (msg.method === 'Runtime.exceptionThrown') {
      const url = currentPage;
      if (!pageErrors[url]) pageErrors[url] = [];
      pageErrors[url].push(`[Exception] ${msg.params.exceptionDetails.text} ${msg.params.exceptionDetails.exception?.description || ''}`);
    }
  };

  await new Promise(r => ws.onopen = r);
  await send('Console.enable');
  await send('Runtime.enable');
  await send('Page.enable');

  let currentPage = '';

  for (const file of files) {
    currentPage = file;
    pageErrors[file] = [];
    const url = `http://localhost:8080/${file}`;
    await send('Page.navigate', { url });
    await new Promise(r => setTimeout(r, 600));

    // Evaluate checks on page
    const checks = await send('Runtime.evaluate', {
      expression: `(() => {
        // 1. Check all anchor tags for dead hrefs or '#' without handlers
        const links = Array.from(document.querySelectorAll('a'));
        const emptyLinks = links.filter(a => !a.getAttribute('href') || a.getAttribute('href') === '#' || a.getAttribute('href') === 'javascript:void(0)').map(a => ({
          text: a.textContent.trim().slice(0, 30),
          onclick: a.getAttribute('onclick'),
          outer: a.outerHTML.slice(0, 100)
        }));
        
        // 2. Check all buttons for clickability or missing handlers
        const buttons = Array.from(document.querySelectorAll('button'));
        const unhandledBtns = buttons.filter(b => !b.getAttribute('onclick') && !b.id && !b.className).map(b => b.outerHTML.slice(0, 80));

        // 3. Check search inputs
        const searchInputs = Array.from(document.querySelectorAll('input[type="text"], input[type="search"]')).map(i => ({
          id: i.id,
          placeholder: i.placeholder,
          hasOninput: !!i.getAttribute('oninput'),
          hasOnkeyup: !!i.getAttribute('onkeyup')
        }));

        // 4. Check tabs
        const tabBtns = Array.from(document.querySelectorAll('.tab-btn, .history-tab, .filter-chip, [data-tab]')).map(t => t.textContent.trim());

        return {
          title: document.title,
          linksCount: links.length,
          emptyLinksCount: emptyLinks.length,
          emptyLinks: emptyLinks,
          buttonsCount: buttons.length,
          tabBtns,
          searchInputs
        };
      })()`,
      returnByValue: true
    });

    const res = checks.result?.result?.value;
    console.log(`\n=== Page: ${file} ===`);
    console.log(`Title: ${res?.title}`);
    console.log(`Links: ${res?.linksCount}, Empty/Hash Links: ${res?.emptyLinksCount}`);
    if (res?.emptyLinks?.length > 0) {
      console.log(`Empty/Hash links:`, res.emptyLinks.filter(l => !l.onclick).map(l => l.text || l.outer));
    }
    if (pageErrors[file].length > 0) {
      console.log(`ERRORS on ${file}:`, pageErrors[file]);
    }
  }

  ws.close();
  chrome.kill();
  console.log("\nFinished audit.");
  process.exit(0);
}

runAudit();
