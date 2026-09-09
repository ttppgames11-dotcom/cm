const { spawn } = require('child_process');
const http = require('http');

async function test() {
  console.log("Launching Chrome with remote debugging...");
  const chromeProcess = spawn("C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", [
    "--headless=new",
    "--remote-debugging-port=9222",
    "--no-first-run",
    "--no-default-browser-check",
    "http://localhost:8080/index.html"
  ]);

  await new Promise(r => setTimeout(r, 2000));

  http.get('http://localhost:9222/json', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log("Chrome targets:", JSON.parse(data).map(t => ({ title: t.title, url: t.url })));
      chromeProcess.kill();
    });
  }).on('error', err => {
    console.error("HTTP error:", err);
    chromeProcess.kill();
  });
}

test();
