// Welcome email content (no mailbox or database needed).
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildWelcomeEmail, sendWelcomeEmail } from '../utils/mailer.js';

test('welcome email greets the member and shows their member ID', () => {
  const { subject, text, html } = buildWelcomeEmail({ name: 'सुरेश पाटील', memberId: 'M1234' });
  assert.match(subject, /स्वागत/);
  assert.match(text, /सुरेश पाटील/);
  assert.match(text, /M1234/);
  assert.match(html, /सुरेश पाटील/);
  assert.match(html, /M1234/);
  assert.match(html, /https:\/\/api\.connectmaratha\.com\/privacy/);
  assert.match(html, /https:\/\/api\.connectmaratha\.com\/terms/);
  assert.match(text, /support@connectmaratha\.com/);
});

test('a name with HTML cannot inject markup into the email', () => {
  const { html } = buildWelcomeEmail({ name: '<img src=x onerror=alert(1)>"', memberId: 'M1' });
  assert.doesNotMatch(html, /<img src=x/);
  assert.match(html, /&lt;img src=x onerror=alert\(1\)&gt;&quot;/);
});

test('missing name falls back to "सदस्य"; missing ID hides the ID box', () => {
  const { text, html } = buildWelcomeEmail({ name: '   ', memberId: '' });
  assert.match(text, /जय शिवराय सदस्य/);
  assert.doesNotMatch(html, /id-box"/);
});

test('without an address nothing is sent', async () => {
  assert.deepEqual(await sendWelcomeEmail({ to: '', name: 'x', memberId: 'M1' }), { delivered: false });
});
