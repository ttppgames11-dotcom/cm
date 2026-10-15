# 🚀 Hostinger hPanel Node.js & Database Deployment Guide
**Connect Maratha Backend & Referral System Deployment**

---

## 📦 १. तयार केलेले पॅकेज (Deployment Package)

आपल्या प्रोजेक्टच्या रूट डिरेक्टरीमध्ये **`hostinger_backend_deploy.zip`** फाईल तयार करण्यात आली आहे.

या झिप (ZIP) फाईलमध्ये खालील सर्व घटक समाविष्ट आहेत:
1. **`server.js`** : रुट स्टार्ट-अप फाईल (Hostinger सुसंगत).
2. **`package.json`** : सर्व Node.js डिपेंडन्सीज (`express`, `sql.js`, `bcryptjs`, `jsonwebtoken`, `cors`, `nodemailer`, `dotenv`).
3. **`.env`** : Hostinger प्रॉडक्शन कॉन्फिगरेशन (SMTP ईमेल, JWT secret, Production mode).
4. **`database/`** :
   - `connect_maratha.db` : अद्ययावत SQLite डेटाबेस (सर्व नवीन रेफरल कॉलम्स व युनिक रेफरल आयडींसह).
   - `database.js` : डेटाबेस ॲब्स्ट्रॅक्शन व मायग्रेशन्स.
   - `schema.sql` : संपूर्ण रिलेशनल स्कीमा.
5. **`backend/`** :
   - सर्व API राऊट्स (`auth.routes.js`, `members.routes.js`, `sangam.routes.js`, इत्यादी).
   - सर्व मिडलवेअर, युटिलिटीज, `db.json`, आणि ओरल हिस्ट्री डेटा.

---

## 🛠️ २. Hostinger hPanel वर डिप्लॉय करण्याची टप्प्याटप्प्याने पद्धत (Step-by-Step Instructions)

### टप्पा १: सबडोमेन (Subdomain) किंवा डिरेक्टरी तयार करणे
1. **Hostinger hPanel** ([hpanel.hostinger.com](https://hpanel.hostinger.com)) मध्ये लॉगिन करा.
2. आपल्या `connectmaratha.com` या डोमेनच्या **Manage** वर क्लिक करा.
3. जर तुम्ही सबडोमेन वापरत असाल (उदा. `api.connectmaratha.com`):
   - डाव्या बाजूच्या मेनूमधून **Domains -> Subdomains** वर जा.
   - **`api`** हे नाव टाकून सबडोमेन तयार करा. त्याची फोल्डर डिरेक्टरी सामान्यतः `public_html/api` किंवा `domains/api.connectmaratha.com/public_html` अशी बनेल.
   - जर तुम्ही थेट मेन डोमेनवर चालवणार असाल, तर रूट डिरेक्टरी `public_html` असेल.

---

### टप्पा २: फाईल्स अपलोड आणि अनझिप करणे (File Manager)
1. hPanel मध्ये **Files -> File Manager** उघडा.
2. तुमच्या API साठीच्या फोल्डरमध्ये जा (उदा. `public_html/api` किंवा `public_html`).
3. वरच्या **Upload** आयकॉनवर क्लिक करा आणि आपल्या कॉम्प्युटरवरील **`hostinger_backend_deploy.zip`** निवडून अपलोड करा.
4. फाईल अपलोड झाल्यावर, `hostinger_backend_deploy.zip` वर **Right Click** करून **Extract (अनझिप)** करा.
5. अनझिप झाल्यानंतर तिथे खालील फाईल्स थेट दिसल्या पाहिजेत:
   - `server.js`
   - `package.json`
   - `.env`
   - `backend/`
   - `database/` (यामध्ये `connect_maratha.db` असणे आवश्यक आहे)
6. आता मूळ `hostinger_backend_deploy.zip` फाईल डिलीट करू शकता.

---

### टप्पा ३: Hostinger hPanel मध्ये Node.js ॲप्लिकेशन कॉन्फिगर करणे
1. hPanel च्या डाव्या मेनूमधील **Advanced -> Node.js** (किंवा Search बारमध्ये "Node.js" टाईप करा) वर क्लिक करा.
2. **Create Application** किंवा **Add Application** वर क्लिक करा:
   - **Node.js version**: **`20.x`** किंवा **`22.x`** (किमान 18.x किंवा त्यापुढील निवडा).
   - **Application mode**: **`Production`** निवडा.
   - **Application root**: तुम्ही फाईल्स जिथे अनझिप केल्या आहेत तो पाथ टाका (उदा. `public_html/api` किंवा `public_html`).
   - **Application URL**: तुमचे डोमेन निवडा (उदा. `api.connectmaratha.com` किंवा `connectmaratha.com/api`).
   - **Application startup file**: **`server.js`** टाइप करा.
3. **Save** किंवा **Create** बटणावर क्लिक करा.

---

### टप्पा ४: Node.js डिपेंडन्सीज इन्स्टॉल करणे (NPM Install)
1. Node.js ॲप्लिकेशन पेजवर तुम्हाला **"NPM Install"** किंवा **"Run NPM Install"** चे बटण दिसेल.
2. त्यावर क्लिक करा. Hostinger आपोआप सर्व पॅकेजेस (`express`, `sql.js`, `bcryptjs`, इत्यादी) इन्स्टॉल करेल.
   *(पर्यायी: जर तुम्ही SSH वापरत असाल, तर त्या फोल्डरमध्ये जाऊन `npm install --omit=dev` चालवू शकता).*

---

### टप्पा ५: ॲप्लिकेशन सुरू करणे (Start Application)
1. NPM Install पूर्ण झाल्यावर, **"Start Application"** किंवा **"Restart"** बटणावर क्लिक करा.
2. स्टेटस हिरव्या रंगात **"Running"** दिसेल.

---

## 🔍 ३. डिप्लॉयमेंट तपासणे आणि खात्री करणे (Verification & Testing)

ॲप सुरू झाल्यावर तुमच्या ब्राऊझरमध्ये खालील लिंक्स उघडून तपासा:

1. **सिस्टम हेल्थ चेक**:
   ```text
   https://api.connectmaratha.com/api/health
   ```
   **अपेक्षित रिस्पॉन्स:**
   ```json
   {
     "status": "OK",
     "system": "Connect Maratha Express REST API Server",
     "timestamp": "2026-..."
   }
   ```

2. **रेफरल कोड पडताळणी टेस्ट (Live Referral Verification)**:
   ```text
   https://api.connectmaratha.com/api/auth/referrals/verify/REF-96K-2866
   ```
   **अपेक्षित रिस्पॉन्स:**
   ```json
   {
     "success": true,
     "isValid": true,
     "message": "सत्यापित रेफरल कोड",
     "referrer": {
       "id": "M2866",
       "name": "Flutter Test A",
       "reference_id": "REF-96K-2866",
       "district": "पुणे"
     }
   }
   ```

3. **अधिकृत केंद्रीय रेफरल कोड पडताळणी**:
   ```text
   https://api.connectmaratha.com/api/auth/referrals/verify/CM-OFFICIAL-2026
   ```

---

## 📱 ४. मोबाईल ॲपचे Hostinger API शी कनेक्शन

आपल्या मोबाईल ॲपचे [api_config.dart](file:///e:/community_mobile/app/lib/core/config/api_config.dart) आधीच Hostinger च्या प्रॉडक्शन URL साठी कॉन्फिगर केलेले आहे:
```dart
AppEnv.prod => 'https://api.connectmaratha.com'
```

Hostinger वर ॲप सुरू होताच, मोबाईल ॲप आपोआप या लाईव्ह डेटाबेस आणि बॅकएंडशी जोडले जाईल!
