// Pages behind a shared post link (https://api.connectmaratha.com/post/<id>)
// and the Digital Asset Links file that lets Android open those links in the
// app. Pure functions: every user-supplied value is HTML-escaped here.
import { safeMediaPath } from './media.js';

export const APP_PACKAGE = 'com.connectmaratha.app';
export const PLAY_STORE_URL = `https://play.google.com/store/apps/details?id=${APP_PACKAGE}`;

// SHA-256 of the certificates that may sign the app. The first is the upload
// key (builds installed from the APK). Add the "App signing key certificate"
// from Play Console → App integrity through ANDROID_APP_FINGERPRINTS (comma
// separated) so links also open the app when it was installed from Play.
const UPLOAD_KEY_SHA256 =
  'F1:2E:99:57:96:1B:05:12:6D:E1:D0:F4:FD:57:F3:04:62:2B:66:89:A1:77:3F:21:14:87:1D:C1:57:2B:E8:5F';

const escapeHtml = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** Accepts `AA:BB:..` or plain hex; returns the colon-separated upper-case form, or null. */
export function normaliseFingerprint(value) {
  const hex = String(value || '').replace(/[^0-9a-fA-F]/g, '').toUpperCase();
  if (hex.length !== 64) return null;
  return hex.match(/.{2}/g).join(':');
}

/** Body of /.well-known/assetlinks.json. */
export function assetLinks(extraFingerprints = process.env.ANDROID_APP_FINGERPRINTS) {
  const fingerprints = [UPLOAD_KEY_SHA256, ...String(extraFingerprints || '').split(',')]
    .map(normaliseFingerprint)
    .filter(Boolean);
  return [
    {
      relation: ['delegate_permission/common.handle_all_urls'],
      target: {
        namespace: 'android_app',
        package_name: APP_PACKAGE,
        sha256_cert_fingerprints: [...new Set(fingerprints)]
      }
    }
  ];
}

const PAGE_STYLE = `
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Noto Sans Devanagari',sans-serif;background:#FDF8F2;margin:0;padding:20px;color:#2C1810}
.wrap{max-width:560px;margin:0 auto}
.brand{text-align:center;padding:10px 0 18px}
.brand b{font-size:22px;color:#2B1B12}.brand b span{color:#E84C10}
.brand div{font-size:12px;color:#7A6A5D;margin-top:2px}
.card{background:#fff;border:1px solid #F0E8DF;border-radius:16px;padding:18px}
.author{display:flex;align-items:center;gap:10px;margin-bottom:12px}
.avatar{width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,#E84C10,#F59E0B);color:#fff;font-weight:800;font-size:19px;display:flex;align-items:center;justify-content:center;flex:none}
.name{font-weight:800;font-size:15px}.when{font-size:12px;color:#9CA3AF}
.photo{display:block;width:100%;border-radius:12px;margin-top:12px}
.text{font-size:16px;line-height:1.6;white-space:pre-wrap;word-wrap:break-word}
.meta{margin-top:14px;padding-top:12px;border-top:1px solid #F3F4F6;font-size:13px;color:#6B7280}
.btn{display:block;text-align:center;text-decoration:none;font-weight:800;border-radius:12px;padding:13px;margin-top:12px;font-size:15px}
.primary{background:#E84C10;color:#fff}.secondary{background:#fff;color:#E84C10;border:1.5px solid #E84C10}
.note{font-size:12px;color:#7A6A5D;text-align:center;margin-top:16px;line-height:1.5}
h1{font-size:18px;margin:0 0 6px}`;

function shell({ title, description, url, image, body }) {
  return `<!DOCTYPE html>
<html lang="mr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Connect मराठा">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
${url ? `<meta property="og:url" content="${escapeHtml(url)}">` : ''}
${image ? `<meta property="og:image" content="${escapeHtml(image)}">` : ''}
<meta name="robots" content="noindex">
<style>${PAGE_STYLE}</style></head><body><div class="wrap">
<div class="brand"><b>Connect <span>मराठा</span></b><div>आधुनिक युगातील आधुनिक संघटन</div></div>
${body}
</div></body></html>`;
}

const firstLetter = (name) => [...String(name || '').trim()][0] || 'स';

function formatDate(raw) {
  const d = new Date(`${String(raw || '').replace(' ', 'T')}Z`);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' });
}

/** Page for a visible post. `url` is the public link of this page; `origin` the site it is served from. */
export function renderPostPage({ post, commentsCount = 0, url, origin = '' }) {
  const image = safeMediaPath(post.image);
  const author = String(post.author_name || 'सदस्य');
  const text = String(post.text || '');
  const preview = (text.length > 160 ? `${text.slice(0, 157)}…` : text) || 'Connect मराठा समुदायातील पोस्ट';
  const body = `<div class="card">
<div class="author"><div class="avatar">${escapeHtml(firstLetter(author))}</div>
<div><div class="name">${escapeHtml(author)}</div><div class="when">${escapeHtml(formatDate(post.created_at))}</div></div></div>
<div class="text">${escapeHtml(text)}</div>${image ? `
<img class="photo" src="${escapeHtml(image)}" alt="">` : ''}
<div class="meta">♥ ${Number(post.likes_count) || 0} &nbsp;•&nbsp; 💬 ${Number(commentsCount) || 0} टिप्पण्या</div>
</div>
<a class="btn primary" href="${escapeHtml(url)}">Connect मराठा अ‍ॅपमध्ये उघडा / Open in app</a>
<a class="btn secondary" href="${PLAY_STORE_URL}">अ‍ॅप डाउनलोड करा / Get the app</a>
<div class="note">ही पोस्ट Connect मराठा समुदायातील सदस्याने शेअर केली आहे.<br>लाईक व टिप्पणी करण्यासाठी अ‍ॅपमध्ये लॉगिन करा.</div>`;
  return shell({ title: `${author} — Connect मराठा`, description: preview, url, image: image ? `${origin}${image}` : null, body });
}

/** Page shown when the post was deleted, hidden or never existed. */
export function renderPostNotFoundPage() {
  const body = `<div class="card"><h1>ही पोस्ट उपलब्ध नाही</h1>
<div class="text" style="font-size:14px;color:#6B7280">पोस्ट हटवली गेली असेल किंवा लिंक चुकीची असेल.<br>This post is no longer available.</div></div>
<a class="btn primary" href="${PLAY_STORE_URL}">Connect मराठा अ‍ॅप डाउनलोड करा</a>`;
  return shell({ title: 'पोस्ट उपलब्ध नाही — Connect मराठा', description: 'This post is no longer available.', body });
}
