# 📱 Google Play Console Policy Resolution Guide

This guide provides the exact compliant copy and step-by-step instructions to resolve both policy strikes flagged by Google Play Console:
1. **Child Safety Standards Policy Violation** (CSAE prohibition & designated contact)
2. **Metadata Policy Violation** (Removal of unverified performance/ranking claims like *"Join thousands of community members..."*)

---

## 🛡️ Issue 1: Child Safety Standards Policy Resolution

### Root Cause
Google Play requires a dedicated, publicly accessible, non-PDF web resource that explicitly prohibits **Child Sexual Abuse and Exploitation (CSAE)**, references **Connect Maratha** and the developer name, and provides a designated contact team/email.

### Live URLs Created
- **Public React Web Route:** `https://connectmaratha.com/child-safety`
- **Standalone Fast Static HTML:** `https://connectmaratha.com/child-safety.html`
- **Privacy Policy Section 7:** `https://connectmaratha.com/privacy#section7`

### Information to Enter in Google Play Console
1. Open **Google Play Console** → Select **Connect Maratha**.
2. Navigate to **Policy and programs** → **App content**.
3. Under **Child Safety Standards** (or **Actions required**), click **Start** or **Manage**:
   - **Public URL to Standards:**
     ```
     https://connectmaratha.com/child-safety
     ```
     *(Or your deployed domain: `https://connectmaratha.com/child-safety.html`)*
   - **Designated Child Safety Contact Email:**
     ```
     child-safety@connectmaratha.com
     ```
   - **Contact Team / Officer:**
     ```
     Connect Maratha Child Safety & Compliance Team
     ```
   - Check the declaration confirming that your published standards explicitly prohibit Child Sexual Abuse and Exploitation (CSAE).
4. Click **Save**.

---

## 🏷️ Issue 2: Metadata Policy Resolution

### Root Cause
Google Play flagged the line:
> ❌ *"Join thousands of community members celebrating and preserving Maratha heritage!"*

Google Play's Metadata Policy prohibits claims about performance, ranking, awards, or unverified user numbers (*"thousands of members"*, *"#1"*, *"Top"*, *"Best"*).

### 📋 Replace with Compliant Store Listing Copy Below:

#### 1. App Title (Max 30 characters)
```text
Connect Maratha: Community Hub
```

#### 2. Short Description (Max 80 characters)
```text
Platform for Maratha heritage, local directories, education & mutual assistance.
```
*(Length: 79 characters)*

#### 3. Full Description (Max 4,000 characters) — Fully Compliant en-US Text
*(Copy and paste this into Google Play Console Main Store Listing)*

```text
Connect Maratha is a community platform dedicated to celebrating cultural heritage, facilitating local directories, and fostering mutual support across Maharashtra.

Key Features:

1. History & Heritage Knowledge
- Explore historical references, fort architecture archives, and cultural timelines.
- Engage with an interactive educational Maratha history quiz with multiple categories and learning tiers.
- Discover authentic literary works and regional historical studies.

2. Community & Professional Directories
- Connect with verified local services, artisans, healthcare practitioners, and businesses.
- Access educational resources, scholarship guidance, and student development programs.
- Discover organizations and community initiatives active across Maharashtra districts.

3. Mutual Assistance & Seva Network
- Emergency blood request and voluntary donor contact directory.
- Local assistance exchange for urgent community needs and volunteer support.
- Grievance facilitation and community help desk.

4. Culture & Dialect Archives
- Regional dialect preservation, folk tradition records, and historical calendars.
- Updates on historical commemorations and cultural events across Maharashtra.

Privacy & Safety:
Connect Maratha is committed to user safety and data privacy. The application adheres to DPDP Act 2023 principles and maintains strict Child Safety Standards prohibiting all forms of Child Sexual Abuse and Exploitation (CSAE). Dedicated account deletion and data control tools are available directly within the application and website.

Website: https://connectmaratha.com
Child Safety Desk: child-safety@connectmaratha.com
Support: support@connectmaratha.com
```

---

## 🚀 How to Submit Changes in Google Play Console

1. In **Google Play Console**, go to **Grow** → **Store presence** → **Main store listing**.
2. Replace:
   - **Short description** with the 79-character compliant text above.
   - **Full description** with the compliant text above (ensuring the phrase *"Join thousands of community members"* is completely gone).
3. Click **Save** at the bottom right.
4. Go to **Publishing overview**.
5. Click **Send changes for review** (or include in your next release rollout).
