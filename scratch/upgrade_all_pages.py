import os
import re

ROOT_DIR = r"c:\Users\Yashraj Sathe\Downloads\cm"

def get_nav_active(filename):
    if "home" in filename or "index" in filename:
        return 'class="active"', '', '', '', '', '', '', ''
    elif "history" in filename or "shivaji" in filename or "sambhaji" in filename or "bajirao" in filename:
        return '', 'class="active"', '', '', '', '', '', ''
    elif "fort" in filename:
        return '', '', 'class="active"', '', '', '', '', ''
    elif "warrior" in filename or "leader" in filename:
        return '', '', '', 'class="active"', '', '', '', ''
    elif "service" in filename or "business" in filename or "profession" in filename or "job" in filename:
        return '', '', '', '', 'class="active"', '', '', ''
    elif "director" in filename or "group" in filename or "member" in filename:
        return '', '', '', '', '', 'class="active"', '', ''
    elif "event" in filename:
        return '', '', '', '', '', '', 'class="active"', ''
    else:
        return '', '', '', '', '', '', '', 'class="active"'

def make_header(filename):
    n_h, n_hi, n_f, n_w, n_s, n_c, n_e, n_m = get_nav_active(filename)
    return f"""<!-- Website Top Announcement & Utility Bar -->
<div class="site-topbar">
  <div class="site-topbar-inner">
    <div class="left-info">
      <span>🚩 <strong>जय जिजाऊ · जय शिवराय · जय शंभूराजे</strong></span>
      <span style="opacity:0.6;">|</span>
      <span>अखंड हिंदुस्थानचे प्रेरणास्थान — हिंदवी स्वराज्य</span>
    </div>
    <div class="right-info">
      <span>📞 समाज हेल्पलाईन: <strong>१८००-१२३-१६७४</strong></span>
      <span style="opacity:0.6;">|</span>
      <span>📅 <strong>शिवराज्याभिषेक शक ३५१</strong></span>
      <span style="opacity:0.6;">|</span>
      <a href="cm-contact.html" style="color:var(--gold-400); text-decoration:underline;">संपर्क व मदत</a>
    </div>
  </div>
</div>

<!-- Main Desktop Website Header & Mega Navbar -->
<header class="site-header">
  <div class="site-header-inner">
    <a href="index.html" class="brand-desktop">
      <img src="assets/images/logo.png" alt="Connect Maratha Logo" class="brand-logo">
      <div class="brand-titles">
        <div class="brand-main">
          <span class="en">CONNECT</span>
          <span class="mr">मराठा</span>
        </div>
        <span class="brand-sub">अखिल भारतीय मराठा डिजिटल महासंघ</span>
      </div>
    </a>

    <!-- Desktop Navigation Menu -->
    <nav class="desktop-nav">
      <a href="index.html" {n_h}>🏠 मुखपृष्ठ</a>
      <a href="cm-history.html" {n_hi}>⚔️ मराठा इतिहास</a>
      <a href="cm-forts-map.html" {n_f}>🏰 ३५०+ गड-किल्ले</a>
      <a href="cm-warriors.html" {n_w}>🛡️ अमर शिलेदार</a>
      <a href="cm-services.html" {n_s}>🛠️ सेवा व उद्योग</a>
      <a href="cm-directory-people.html" {n_c}>👥 समुदाय</a>
      <a href="cm-events.html" {n_e}>📅 उपक्रम</a>
      <a href="cm-more.html" {n_m}>📂 अधिक विभाग ▾</a>
    </nav>

    <!-- Header Actions -->
    <div class="header-actions">
      <a href="cm-login.html" class="btn btn-outline" style="padding:8px 16px; font-size:0.88rem; font-weight:600;">👤 लॉगिन</a>
      <a href="cm-register.html" class="btn btn-primary" style="padding:8px 18px; font-size:0.88rem; font-weight:700;">🚩 नोंदणी</a>
    </div>
  </div>
</header>
"""

FOOTER = """<!-- Grand Desktop Website Mega-Footer -->
<footer class="website-footer">
  <div class="footer-grid">
    <!-- Column 1: Brand & Mission -->
    <div>
      <div style="display:flex; align-items:center; gap:10px; margin-bottom:14px;">
        <img src="assets/images/logo.png" alt="Connect Maratha Logo" style="width:42px; height:42px; object-fit:contain;">
        <span style="font-family:'Baloo 2', sans-serif; font-size:1.4rem; font-weight:800; color:var(--gold-400);">CONNECT मराठा</span>
      </div>
      <p style="font-size:0.86rem; line-height:1.6; color:rgba(251,243,227,0.8); margin-bottom:16px;">
        अखिल भारतीय मराठा समाजाला संस्कृती, इतिहास, रोजगार, सामाजिक एकता आणि आर्थिक स्वावलंबनाच्या धाग्यात बांधणारे अधिकृत व सुरक्षित डिजिटल व्यासपीठ.
      </p>
      <div style="font-size:0.8rem; color:var(--gold-300);">
        📍 मुख्य कार्यालय: शनिवार वाडा परिसर, पुणे / दुर्गराज रायगड परिसर<br>
        📧 संपर्क: contact@connectmaratha.org
      </div>
    </div>

    <!-- Column 2: इतिहास व संशोधन दालन -->
    <div>
      <h3>इतिहास व संशोधन</h3>
      <ul>
        <li><a href="cm-shivaji-maharaj.html">🚩 छत्रपती शिवाजी महाराज</a></li>
        <li><a href="cm-sambhaji-maharaj.html">⚔️ छत्रपती संभाजी महाराज</a></li>
        <li><a href="cm-bajirao-peshwa.html">🐎 श्रीमंत बाजीराव पेशवे</a></li>
        <li><a href="cm-warriors.html">🛡️ अमर वीर व वीरांगना</a></li>
        <li><a href="cm-forts-map.html">🏰 महाराष्ट्रातील ३५०+ किल्ले</a></li>
        <li><a href="cm-history.html">📖 मराठा साम्राज्य कालपट</a></li>
      </ul>
    </div>

    <!-- Column 3: सेवा व उपक्रम -->
    <div>
      <h3>सेवा व उपक्रम</h3>
      <ul>
        <li><a href="cm-services.html">🛠️ अधिकृत सेवा निर्देशिका</a></li>
        <li><a href="cm-business-directory.html">💼 मराठा उद्योग व व्यवसाय</a></li>
        <li><a href="cm-jobs.html">🤝 रोजगार व करिअर मार्गदर्शन</a></li>
        <li><a href="cm-education.html">🎓 शिक्षण व स्पर्धा परीक्षा</a></li>
        <li><a href="cm-donation.html">❤️ गड संवर्धन व आरोग्य निधी</a></li>
        <li><a href="cm-events.html">📅 आगामी कार्यक्रम व शिबिरे</a></li>
      </ul>
    </div>

    <!-- Column 4: मदत व सुरक्षितता -->
    <div>
      <h3>मदत व सुरक्षितता</h3>
      <ul>
        <li><a href="cm-login.html">👤 सदस्य लॉगिन</a></li>
        <li><a href="cm-register.html">📝 नवीन सदस्य नोंदणी</a></li>
        <li><a href="cm-membership.html">⭐ सदस्यत्व श्रेणी (Tiers)</a></li>
        <li><a href="cm-community-safety.html">🚨 आपत्कालीन सुरक्षा कक्ष</a></li>
        <li><a href="cm-contact.html">☎️ संपर्क व तक्रार निवारण</a></li>
      </ul>
      <div style="margin-top:16px; padding:10px; background:rgba(0,0,0,0.3); border-radius:6px; border:1px solid rgba(233,196,106,0.3); font-size:0.78rem;">
        🔒 <strong>सुरक्षित व्यासपीठ:</strong> डेटा एन्क्रिप्शन व १००% गोपनीयता.
      </div>
    </div>
  </div>

  <div class="footer-bottom">
    <p>© २०२६ Connect Maratha (कनेक्ट मराठा) · सर्व हक्क सुरक्षित · नोंदणीकृत सामाजिक व्यासपीठ</p>
    <p style="margin-top:4px; color:var(--gold-400); font-weight:600;">॥ जय भवानी, जय शिवाजी ॥ अखंड मराठा साम्राज्य की जय!</p>
  </div>
</footer>
"""

already_upgraded = [
    "index.html", "cm-home.html", "cm-bajirao-peshwa.html", 
    "cm-shivaji-maharaj.html", "cm-sambhaji-maharaj.html", 
    "cm-forts-map.html", "cm-history.html", "cm-warriors.html", 
    "cm-services.html"
]

def process_file(filepath):
    filename = os.path.basename(filepath)
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    modified = False

    # 1. Replace <header class="appbar">...</header>
    appbar_match = re.search(r'<header class="appbar">.*?</header>', content, re.DOTALL)
    if appbar_match:
        content = content[:appbar_match.start()] + make_header(filename) + content[appbar_match.end():]
        modified = True

    # 2. Replace <div class="hero-band wide">...<svg ... class="rider-img" ...</svg>...<div class="wrap hero-band-inner">(.*?)</div>\s*</div>
    hero_band_match = re.search(r'<div class="hero-band wide">.*?<svg[^>]*class="rider-img"[^>]*>.*?</svg>.*?<div class="wrap hero-band-inner">(.*?)</div>\s*</div>', content, re.DOTALL)
    if hero_band_match:
        inner_content = hero_band_match.group(1).strip()
        new_hero = f"""<div class="hero short" style="min-height:260px;">
  <img src="assets/images/real-raigad-panoramic.jpg" alt="सह्याद्रीचे अभेद्य गडकोट" class="hero-bg-img">
  <div class="hero-overlay"></div>
  <div class="wrap hero-content" style="max-width:1320px; width:100%; padding:30px 24px;">
    {inner_content}
  </div>
</div>"""
        content = content[:hero_band_match.start()] + new_hero + content[hero_band_match.end():]
        modified = True

    # 3. Replace <nav class="bottom-nav">...</nav>
    bottom_nav_match = re.search(r'<nav class="bottom-nav">.*?</nav>', content, re.DOTALL)
    if bottom_nav_match:
        content = content[:bottom_nav_match.start()] + FOOTER + content[bottom_nav_match.end():]
        modified = True

    if modified:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Upgraded {filepath}")
    else:
        print(f"Skipped/No changes {filepath}")

# Process all html files in root
for fn in os.listdir(ROOT_DIR):
    if fn.endswith('.html') and fn not in already_upgraded:
        process_file(os.path.join(ROOT_DIR, fn))

# Process all html files in prototypes_backup
backup_dir = os.path.join(ROOT_DIR, 'prototypes_backup')
if os.path.exists(backup_dir):
    for fn in os.listdir(backup_dir):
        if fn.endswith('.html'):
            process_file(os.path.join(backup_dir, fn))

print("All files processed successfully!")
