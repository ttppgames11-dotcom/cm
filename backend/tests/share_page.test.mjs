// Shared post page and Android App Links file (no database needed).
import test from 'node:test';
import assert from 'node:assert/strict';
import { assetLinks, normaliseFingerprint, renderPostNotFoundPage, renderPostPage } from '../utils/share_page.js';

const url = 'https://api.connectmaratha.com/post/P-abc123';

test('post page shows the author, text and counts', () => {
  const html = renderPostPage({
    post: { id: 'P-abc123', author_name: 'सुरेश पाटील', text: 'जय शिवराय!\nरायगड भेट.', likes_count: 7, created_at: '2026-09-30 10:15:00' },
    commentsCount: 3,
    url
  });
  assert.match(html, /सुरेश पाटील/);
  assert.match(html, /जय शिवराय!/);
  assert.match(html, /♥ 7/);
  assert.match(html, /💬 3/);
  assert.match(html, /30 Sept? 2026/);
  assert.match(html, new RegExp(`href="${url}"`));
  assert.match(html, /play\.google\.com\/store\/apps\/details\?id=com\.connectmaratha\.app/);
  assert.match(html, /og:description/);
});

test('post text and author name cannot inject markup', () => {
  const html = renderPostPage({
    post: { id: 'P-1', author_name: '<b>x</b>"', text: '<script>alert(1)</script><img src=x onerror=alert(2)>', likes_count: 0, created_at: '' },
    url
  });
  assert.doesNotMatch(html, /<script>alert/);
  assert.doesNotMatch(html, /<img src=x/);
  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.match(html, /&lt;b&gt;x&lt;\/b&gt;&quot;/);
});

test('long text is shortened only in the link preview', () => {
  const text = 'अ'.repeat(400);
  const html = renderPostPage({ post: { id: 'P-1', author_name: 'a', text, likes_count: 0, created_at: '' }, url });
  assert.match(html, new RegExp(`<div class="text">${text}</div>`));
  assert.match(html, /og:description" content="अ{157}…"/);
});

test('missing post page offers the app and no post content', () => {
  const html = renderPostNotFoundPage();
  assert.match(html, /उपलब्ध नाही/);
  assert.match(html, /play\.google\.com/);
});

test('asset links name the app and accept extra fingerprints in any format', () => {
  const extra = 'ab'.repeat(32);
  const [statement] = assetLinks(`${extra}, not-a-fingerprint`);
  assert.deepEqual(statement.relation, ['delegate_permission/common.handle_all_urls']);
  assert.equal(statement.target.package_name, 'com.connectmaratha.app');
  const prints = statement.target.sha256_cert_fingerprints;
  assert.equal(prints.length, 2);
  assert.match(prints[0], /^([0-9A-F]{2}:){31}[0-9A-F]{2}$/);
  assert.equal(prints[1], normaliseFingerprint(extra));
});

test('a fingerprint of the wrong length is rejected', () => {
  assert.equal(normaliseFingerprint('AB:CD'), null);
});
