const { spawn } = require('child_process');
const http = require('http');

async function testInteractions() {
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

  const testPages = [
    'cm-forts-map.html',
    'cm-warriors.html',
    'cm-history.html',
    'cm-services.html',
    'cm-business-directory.html',
    'cm-jobs.html',
    'cm-groups.html',
    'cm-dashboard.html'
  ];

  for (const page of testPages) {
    await send('Page.navigate', { url: `http://localhost:8080/${page}` });
    await new Promise(r => setTimeout(r, 600));

    const res = await send('Runtime.evaluate', {
      expression: `(() => {
        const issues = [];
        
        // Check search filter functionality
        const searchInput = document.querySelector('input[type="text"], input[type="search"]');
        if (searchInput) {
          const initialCards = document.querySelectorAll('.feature-card, .list-row, .profile-card, .info-box-card, .battle-card').length;
          searchInput.value = 'xyznonexistent123';
          searchInput.dispatchEvent(new Event('input', { bubbles: true }));
          const visibleAfterFilter = Array.from(document.querySelectorAll('.feature-card, .list-row, .profile-card, .info-box-card, .battle-card')).filter(c => getComputedStyle(c).display !== 'none').length;
          if (visibleAfterFilter === initialCards && initialCards > 0) {
            issues.push('Search input does NOT filter items (visible count unchanged: ' + initialCards + ')');
          }
        }

        // Check tabs
        const tabs = document.querySelectorAll('.tab, .filter-chip');
        if (tabs.length > 1) {
          const tab2 = tabs[1];
          tab2.click();
          if (!tab2.classList.contains('active')) {
            issues.push('Clicking tab does NOT add active class: ' + tab2.textContent.trim());
          }
        }

        // Check for modal dialogs or buttons that do nothing
        const emptyBtns = Array.from(document.querySelectorAll('a[href="#"]')).map(a => a.textContent.trim());
        if (emptyBtns.length > 0) {
          issues.push('Empty href="#" buttons: ' + emptyBtns.join(', '));
        }

        return {
          page: window.location.pathname.split('/').pop(),
          issues
        };
      })()`,
      returnByValue: true
    });

    console.log(`Page: ${page}`, res.result?.result?.value);
  }

  ws.close();
  chrome.kill();
  process.exit(0);
}

testInteractions();
