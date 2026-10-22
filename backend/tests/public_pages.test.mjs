// Policy pages linked from the Play Store listing must be served by the API
// itself (the production host reaches it through a Cloudflare tunnel, no Nginx).
import test from 'node:test';
import assert from 'node:assert/strict';

const ORIGIN = (process.env.API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

for (const [path, text] of [
  ['/privacy', 'Privacy'],
  ['/delete-account', 'Delete'],
  ['/terms', 'Terms'],
  ['/privacy/', 'Privacy']
]) {
  test(`GET ${path} returns the HTML page`, async () => {
    const res = await fetch(`${ORIGIN}${path}`);
    assert.equal(res.status, 200);
    assert.match(res.headers.get('content-type'), /text\/html/);
    assert.match(await res.text(), new RegExp(text, 'i'));
  });
}

test('other paths outside /api are not served as files', async () => {
  const res = await fetch(`${ORIGIN}/index.html`);
  assert.equal(res.status, 404);
});
