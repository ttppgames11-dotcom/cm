# 🚀 Connect Maratha - Google Play Console Deployment Guide

**Version:** 1.0.3+5  
**Package:** com.connectmaratha.app  
**Date:** October 13, 2026

---

## 📋 **PRE-DEPLOYMENT CHECKLIST**

Before starting, ensure you have:

- [ ] Google Play Console account ($25 one-time registration fee if new)
- [ ] App signing keystore file (already configured in `android/key.properties`)
- [ ] High-resolution app icon (512x512 PNG)
- [ ] Feature graphic (1024x500 PNG)
- [ ] Screenshots (at least 2, up to 8 per device type)
- [ ] Privacy Policy URL (required)
- [ ] App description and metadata ready
- [ ] Content rating questionnaire answers prepared

---

## 🏗️ **STEP 1: BUILD PRODUCTION APP BUNDLE (AAB)**

Google Play requires Android App Bundle format, not APK.

### 1.1 Clean Build Environment

```powershell
cd E:\community_mobile\app
flutter clean
flutter pub get
```

### 1.2 Build Release App Bundle

```powershell
flutter build appbundle --release
```

**Expected Output:**
```
✓ Built build\app\outputs\bundle\release\app-release.aab
```

### 1.3 Verify Bundle Location

The AAB file will be at:
```
E:\community_mobile\app\build\app\outputs\bundle\release\app-release.aab
```

**File Size:** ~30-40 MB (much smaller than APK because Google optimizes per-device)

---

## 📱 **STEP 2: CREATE APP IN GOOGLE PLAY CONSOLE**

### 2.1 Access Console

1. Go to: https://play.google.com/console
2. Sign in with your Google account
3. If first time: Complete $25 registration and accept Developer Program Policies

### 2.2 Create New App

1. Click **"Create app"** button
2. Fill in the form:

   **App details:**
   - **App name:** Connect Maratha
   - **Default language:** English (UK) or Marathi
   - **App or game:** App
   - **Free or paid:** Free

   **Declarations:**
   - [x] I confirm this app complies with Google Play's Developer Program Policies
   - [x] I confirm this app complies with US export laws

3. Click **"Create app"**

---

## 🖼️ **STEP 3: PREPARE STORE LISTING ASSETS**

### 3.1 Required Graphics

You need to prepare these images:

#### **App Icon**
- **Size:** 512 x 512 px
- **Format:** 32-bit PNG
- **No transparency**
- Location: `E:\community_mobile\app\icon\app_icon.png` (resize to 512x512)

#### **Feature Graphic**
- **Size:** 1024 x 500 px
- **Format:** JPG or PNG
- **Purpose:** Header image in Play Store
- **Create:** Use Canva or Photoshop with Connect Maratha branding

#### **Screenshots** (REQUIRED - minimum 2)
- **Phone screenshots:** 320-3840 px on shortest side
- **Recommended:** 1080 x 1920 px (portrait) or 1920 x 1080 px (landscape)
- **Quantity:** 2-8 screenshots
- **How to capture:** 
  1. Install app on Moto G45
  2. Use ADB: `adb shell screencap -p /sdcard/screenshot.png`
  3. Pull: `adb pull /sdcard/screenshot.png`
  4. Or use phone's built-in screenshot feature

**Suggested Screenshots:**
1. Home screen / Splash
2. Community feed with posts
3. History/Culture section
4. User profile
5. Post creation
6. Heritage places

### 3.2 Screenshot Locations

You already have some screenshots in the workspace:
```
E:\community_mobile\app\live.png
E:\community_mobile\app\screen_1.png
E:\community_mobile\app\screen_live.png
E:\community_mobile\app\shot.png
E:\community_mobile\app\shot2.png
E:\community_mobile\app\shot_cm.png
E:\community_mobile\app\shot_home.png
E:\community_mobile\app\shot_home2.png
```

**Check these files and select the best 2-8 images.**

---

## ✍️ **STEP 4: COMPLETE STORE LISTING**

In Google Play Console, go to **"Store presence" → "Main store listing"**

### 4.1 App Details

**App name:**
```
Connect Maratha
```

**Short description (80 characters max):**
```
Connect with Maratha heritage, history, culture, and community.
```

**Full description (4000 characters max):**
```
Connect Maratha is your gateway to Maratha heritage, history, culture, and community.

🏛️ EXPLORE MARATHA HERITAGE
Discover the rich history of the Maratha Empire, from Chhatrapati Shivaji Maharaj's legendary battles to the administrative excellence of the Swarajya. Learn about Maratha warriors, forts, naval power, and the Balidan Maas sacrifices.

📚 KNOWLEDGE CENTER
Access comprehensive resources including:
- Historical dates and events
- Dnyankosh (Knowledge encyclopedia)
- Granthalaya (Library)
- Swarajya administration details
- Freedom movements

🎭 CULTURAL HERITAGE
Immerse yourself in Maratha culture:
- Shivkal festivals and celebrations
- Traditional Marathi food and cuisine
- Regional dialects and language
- Gram devata (Village deities)
- Heritage places and temples
- Maratha symbols and traditions
- Books, films, and cultural media

🤝 COMMUNITY NETWORK
Connect with fellow Maratha community members:
- Share posts, photos, and experiences
- Like and comment on community content
- Discover members worldwide
- Build meaningful connections

🗺️ INTERACTIVE FEATURES
- Knowledge graphs linking historical events
- Fort trails and heritage site guides
- Quiz challenges to test your knowledge
- Search across all content
- Save favorite articles and posts

📱 EASY TO USE
Simple, intuitive interface in Marathi and English. Works offline for saved content.

Join thousands of community members celebrating and preserving Maratha heritage!

जय शिवराय! 🚩
```

### 4.2 Upload Graphics

1. **App icon:** Upload 512x512 PNG
2. **Feature graphic:** Upload 1024x500 image
3. **Phone screenshots:** Upload 2-8 screenshots (drag to reorder)

### 4.3 Categorization

**App category:** Select one:
- **Social** (for community features)
- **Education** (for heritage/history content)

**Tags:** Add relevant tags like:
- Maratha
- Heritage
- History
- Culture
- Community

### 4.4 Contact Details

**Email address:** Your support email (will be publicly visible)

**Phone number:** (Optional but recommended)

**Website:** Your app's website or landing page URL

### 4.5 Privacy Policy

**Required by Google Play.**

You must provide a publicly accessible URL with your privacy policy.

**Quick option:** Create a privacy policy page and host on:
- Your website
- GitHub Pages
- Google Sites
- Other free hosting

**Example structure:**
```
Connect Maratha Privacy Policy

Information We Collect:
- Account information (email, name, profile photo)
- User-generated content (posts, comments)
- Usage data and analytics

How We Use Information:
- To provide app functionality
- To improve user experience
- To ensure community safety

Data Storage:
- Securely stored on our servers
- Not shared with third parties

User Rights:
- Access your data
- Delete your account
- Contact us at [email]

Last updated: [Date]
```

**Enter the URL in the Privacy Policy field.**

---

## 🎮 **STEP 5: APP CONTENT & RATINGS**

### 5.1 Content Rating

1. Go to **"App content" → "Content rating"**
2. Click **"Start questionnaire"**
3. Enter your email address
4. Select app category: **Social Networking** or **Education**

**Answer questionnaire honestly:**

**Violence:**
- Does your app contain violent references? → Likely **No**

**Sexual content:**
- Does your app contain sexual content? → **No**

**Profanity:**
- Does your app contain profanity? → **No**

**Drugs, alcohol, tobacco:**
- Does your app reference drugs, alcohol, or tobacco? → **No**

**User interaction:**
- Can users communicate with each other? → **Yes** (Community posts/comments)
- Can users share personal information? → **Yes** (Profile, posts)
- Do you have moderation system? → **Yes** (Report features - though hidden in V1)

**Google will assign ratings:**
- ESRB (US): Likely **Teen** or **Everyone**
- PEGI (Europe): Likely **12+** or **7+**
- etc.

5. Click **"Submit"** and **"Apply rating"**

### 5.2 Target Audience

1. Go to **"Target audience and content"**
2. Select age groups: **13+** recommended (due to user-generated content)
3. Click **"Next"** and confirm

### 5.3 News App Declaration

- Is your app a news app? → **No** (unless you publish news content)

### 5.4 COVID-19 Contact Tracing/Status

- Is this a COVID-19 contact tracing or status app? → **No**

### 5.5 Data Safety

**CRITICAL SECTION** - Google requires detailed data collection disclosure.

1. Go to **"Data safety"**
2. Click **"Start"**

**Does your app collect or share user data?** → **Yes**

**Data types collected:**

**Personal information:**
- [x] Name
- [x] Email address
- [x] User IDs (member ID)
- [x] Photos (profile, post images)

**App activity:**
- [x] App interactions (likes, comments)
- [x] User-generated content (posts, comments)

**For each data type, specify:**
- **Is it collected or shared?** → Collected
- **Is collection required or optional?** → Required for core functionality
- **Why is it collected?** → App functionality, Account management
- **Is data encrypted in transit?** → Yes (HTTPS)
- **Can users request data deletion?** → Yes (account deletion available)

3. Click **"Next"** and review
4. Click **"Submit"**

### 5.6 Ads Declaration

**Does your app contain ads?** → **No** (unless you have ads)

### 5.7 Government Apps

**Is this a government app?** → **No**

---

## 🎵 **STEP 6: SET UP RELEASE**

### 6.1 Select Release Type

You have 3 options:

1. **Internal testing** (up to 100 testers, immediate) - **Recommended first**
2. **Closed testing** (specific testers, takes hours)
3. **Production** (public, takes 1-7 days review)

**Start with Internal Testing to verify everything works.**

### 6.2 Create Internal Testing Release

1. Go to **"Testing" → "Internal testing"**
2. Click **"Create new release"**

### 6.3 App Signing

**Important:** Google Play App Signing

- **Recommended:** Let Google manage your app signing key
- Google will show you a message about App Signing
- Click **"Continue"** to enroll

**Benefits:**
- Google securely stores your signing key
- You upload with an upload key (already configured)
- If you lose your upload key, Google can reset it

### 6.4 Upload App Bundle

1. Click **"Upload"** in the App bundles section
2. Select file: `E:\community_mobile\app\build\app\outputs\bundle\release\app-release.aab`
3. Wait for upload (may take 1-3 minutes)

**Google will process the bundle and show:**
- Supported devices
- APK sizes per configuration
- Warnings/errors (if any)

### 6.5 Release Name

**Release name:**
```
V1.0.2 - Initial Release
```

### 6.6 Release Notes

**What's new (English):**
```
Welcome to Connect Maratha V1!

Features:
• Explore Maratha history and heritage
• Discover forts, warriors, and battles
• Learn about Maratha culture and traditions
• Connect with community members
• Share posts and engage with content
• Access knowledge library and resources
• Interactive quizzes and trails

Join the community celebrating Maratha pride!

जय शिवराय! 🚩
```

**If supporting Marathi, add Marathi release notes too.**

### 6.7 Review Release

1. Review all information
2. Check the **"What's new"** section
3. Verify the version code (should be **3**)
4. Verify the version name (should be **1.0.2**)

### 6.8 Save and Roll Out

1. Click **"Save"**
2. Click **"Review release"**
3. **If Internal Testing:** Click **"Start rollout to Internal testing"**
4. Confirm

**Internal testing is available immediately (within minutes).**

---

## 👥 **STEP 7: ADD TESTERS (INTERNAL TESTING)**

### 7.1 Create Tester List

1. Go to **"Testing" → "Internal testing"**
2. Click **"Testers"** tab
3. Click **"Create email list"**
4. Name it: **"Internal Testers"**
5. Add email addresses (comma-separated):
   ```
   your.email@example.com,
   tester1@example.com,
   tester2@example.com
   ```
6. Save

### 7.2 Share Test Link

1. Copy the **"Copy link"** from the testers page
2. Share with testers

**Testers will:**
1. Click the link
2. Accept invite
3. Download app from Play Store (internal test track)

**Test thoroughly before moving to production!**

---

## 🚀 **STEP 8: PROMOTE TO PRODUCTION**

After successful internal testing (3-7 days recommended):

### 8.1 Create Production Release

1. Go to **"Production" → "Releases"**
2. Click **"Create new release"**
3. Click **"Promote release"** to reuse your tested bundle
4. OR upload the same AAB file again

### 8.2 Release Details

**Release name:**
```
1.0.2 - Initial Public Release
```

**Release notes:** (Same as internal testing or enhanced)

### 8.3 Rollout Percentage (Optional)

You can do a staged rollout:
- **Staged rollout:** Start at 20%, gradually increase
- **Full rollout:** 100% immediately

**Recommended for V1:** Start with 20-50% to monitor for issues.

### 8.4 Review and Publish

1. Click **"Save"**
2. Click **"Review release"**
3. **Important:** Review EVERYTHING one more time
4. Click **"Start rollout to Production"**
5. Confirm

---

## ⏱️ **STEP 9: GOOGLE REVIEW PROCESS**

### 9.1 Timeline

- **Internal testing:** Available within **minutes**
- **Closed testing:** Available within **hours**
- **Production:** Takes **1-7 days** (usually 1-3 days)

### 9.2 Review Criteria

Google will check:
- Policy compliance (no banned content)
- Accurate metadata and descriptions
- Functional app (no crashes on test devices)
- Privacy policy present and valid
- Data safety declarations match actual behavior
- Content rating appropriate
- No copyright violations

### 9.3 Status Tracking

Check status in Play Console:
- **In review:** Google is reviewing
- **Pending publication:** Approved, publishing soon
- **Published:** Live on Google Play Store!

### 9.4 If Rejected

If Google rejects your submission:
1. Read rejection reason carefully
2. Fix the issue
3. Create a new release with fixes
4. Resubmit

**Common rejection reasons:**
- Privacy policy issues
- Incorrect data safety declarations
- Crashes on test devices
- Misleading screenshots/descriptions
- Policy violations

---

## 📊 **STEP 10: POST-LAUNCH MONITORING**

### 10.1 Monitor Statistics

In Play Console Dashboard:
- **Installs:** Track downloads
- **Crashes:** Monitor crash reports
- **ANRs:** Application Not Responding events
- **Ratings & reviews:** User feedback
- **Pre-launch report:** Device compatibility issues

### 10.2 Respond to Reviews

1. Go to **"User feedback" → "Ratings and reviews"**
2. Reply to user reviews (important for engagement)
3. Thank positive reviewers
4. Help users with issues

### 10.3 Update App

When you need to update:
1. Increment version in `pubspec.yaml`:
   ```yaml
   version: 1.0.3+4
   ```
2. Build new AAB: `flutter build appbundle --release`
3. Create new release in Play Console
4. Upload new AAB
5. Add release notes describing changes

---

## 🔒 **SECURITY CHECKLIST**

Before submitting:

- [ ] **Keystore backed up** - Copy `android/key.properties` and keystore file to secure location
- [ ] **Never commit keystore** - Ensure `.gitignore` excludes `key.properties` and `.jks` files
- [ ] **HTTPS only** - All API endpoints use HTTPS
- [ ] **Privacy policy live** - Privacy policy URL is accessible
- [ ] **Error reporting configured** - Sentry configured (already done)
- [ ] **No hardcoded secrets** - Check `.env` usage, no API keys in code
- [ ] **Permissions justified** - Only request necessary permissions

---

## 📝 **REQUIRED DOCUMENTS & INFO**

Have these ready before starting:

1. **App Information:**
   - App name: Connect Maratha
   - Package: com.connectmaratha.app
   - Category: Social / Education
   - Content rating: 13+ (Teen)

2. **Contact Information:**
   - Developer name: [Your name or company]
   - Email: [Support email]
   - Website: [Your website]
   - Phone: [Optional]

3. **Legal:**
   - Privacy Policy URL
   - Terms of Service (optional but recommended)

4. **Assets:**
   - App icon 512x512
   - Feature graphic 1024x500
   - 2-8 phone screenshots
   - Optional: Tablet screenshots, promo video

5. **Descriptions:**
   - Short description (80 chars)
   - Full description (4000 chars)
   - Release notes

---

## 🆘 **TROUBLESHOOTING**

### Issue: "Upload failed - version code already exists"

**Solution:** Increment version code in `pubspec.yaml`:
```yaml
version: 1.0.3+4  # +4 is the version code
```

### Issue: "App not signed"

**Solution:** Verify `android/key.properties` exists and build.gradle.kts references it.

### Issue: "Bundle too large"

**Solution:** AAB should be ~30-40MB. If larger:
- Check for unnecessary assets
- Use `flutter build appbundle --release --shrink`

### Issue: "Privacy policy URL not working"

**Solution:** Ensure:
- URL is publicly accessible (not localhost)
- HTTPS preferred
- Page loads without authentication

### Issue: "Can't find AAB file"

**Full path:**
```
E:\community_mobile\app\build\app\outputs\bundle\release\app-release.aab
```

If missing, rebuild:
```powershell
cd E:\community_mobile\app
flutter build appbundle --release
```

---

## 🎯 **QUICK START SUMMARY**

If you're in a hurry, here's the minimal path:

```powershell
# 1. Build AAB
cd E:\community_mobile\app
flutter build appbundle --release

# 2. Go to Play Console
# https://play.google.com/console

# 3. Create app

# 4. Upload assets (icon, feature graphic, 2 screenshots)

# 5. Fill store listing

# 6. Complete app content (ratings, data safety)

# 7. Create internal test release → Upload AAB

# 8. Test thoroughly

# 9. Promote to production

# 10. Wait 1-3 days for review

# 11. Celebrate launch! 🎉
```

---

## 📞 **SUPPORT**

**Google Play Console Help:**
- https://support.google.com/googleplay/android-developer

**Flutter Documentation:**
- https://docs.flutter.dev/deployment/android

**Connect Maratha Repository:**
- https://github.com/ttppgames11-dotcom/cm

---

**Good luck with your launch! 🚀**

**जय शिवराय! 🚩**
