# QRShield Android APK — Complete Build & Publish Guide

## Prerequisites

Install these tools on your PC (one-time setup):

```bash
# 1. Install Node.js (LTS) from: https://nodejs.org/
# 2. Install EAS CLI globally
npm install -g eas-cli expo-cli

# 3. Create a FREE Expo account at: https://expo.dev/signup
#    (needed for cloud builds)
```

---

## Step 1 — Manual Setup (One-Time)

### Copy your logo (REQUIRED before building)
Open PowerShell and run:

```powershell
$appDir = "d:\UniversityAdmissions\IUB Study\8th Semester\Senior Design Project 2\Antigravity\QRShieldApp"
$logo   = "d:\UniversityAdmissions\IUB Study\8th Semester\Senior Design Project 2\Antigravity\APK\static\Logo.png"
New-Item -ItemType Directory -Force "$appDir\assets" | Out-Null
Copy-Item $logo "$appDir\assets\logo.png"   -Force
Copy-Item $logo "$appDir\assets\icon.png"   -Force
Copy-Item $logo "$appDir\assets\adaptive-icon.png" -Force
Copy-Item $logo "$appDir\assets\splash.png" -Force
Write-Host "Assets copied!"
```

---

## Step 2 — Install Dependencies

Open PowerShell in the `QRShieldApp` folder:

```powershell
cd "d:\UniversityAdmissions\IUB Study\8th Semester\Senior Design Project 2\Antigravity\QRShieldApp"
npm install
```

---

## Step 3 — Login to Expo

```bash
eas login
# Enter your Expo account credentials
```

---

## Step 4 — Push to GitHub

1. Create a new repo on GitHub (e.g. `qrshield-app`)
2. Push the `QRShieldApp` folder:

```bash
cd "d:\UniversityAdmissions\IUB Study\8th Semester\Senior Design Project 2\Antigravity\QRShieldApp"
git init
git add .
git commit -m "Initial QRShield app"
git remote add origin https://github.com/YOUR_USERNAME/qrshield-app.git
git push -u origin main
```

---

## Step 5 — Build APK (for Testing)

```bash
eas build --platform android --profile preview
```

- This triggers a **cloud build** on Expo's servers (free tier: ~10 builds/month)
- Wait ~10–15 minutes
- You'll get a **download link** for the `.apk` file
- Install the APK on any Android phone to test

---

## Step 6 — Build AAB (for Play Store)

```bash
eas build --platform android --profile production
```

- This generates an `.aab` (Android App Bundle) file
- Download it from the EAS dashboard

---

## Step 7 — Upload to Google Play Store

1. Go to [Google Play Console](https://play.google.com/console)
2. Click **Create App** → Fill in app details:
   - **App name**: QRShield
   - **Default language**: English
   - **App or game**: App
   - **Free or paid**: Free (or Paid)
3. Fill in the **Store Listing**:
   - Short description: "Scan QR codes for instant AI-powered threat detection"
   - Full description: (see template below)
   - Screenshots: Take screenshots from your Android test phone
   - Icon: Use Logo.png (512×512 recommended)
4. Go to **Production** → **Create new release** → Upload your `.aab` file
5. Submit for review (~1–3 days)

---

## Play Store Description Template

```
QRShield Pro — AI-Powered QR Threat Detection

Protect yourself from malicious QR codes with enterprise-grade AI threat intelligence.

🔍 HOW IT WORKS:
Simply point your camera at any QR code. QRShield instantly analyzes it using two AI models:
• XGBoost ML model — analyzes 50+ URL features
• Neural Network DL model — visually inspects the QR image itself
• Fusion scoring — combines both models for superior accuracy

✅ RESULTS IN SECONDS:
• SAFE — URL is clean, visit with confidence
• SUSPICIOUS — Proceed with caution
• MALICIOUS — Do NOT open this URL

🧠 TRANSPARENT AI:
Unlike black-box scanners, QRShield shows you SHAP explanations — exactly which features triggered the threat alert.

🛡️ FEATURES:
• Live camera QR scanning
• Instant threat analysis
• AI confidence scores
• SHAP explainability
• Scan history
• No data stored locally — privacy first

Built on the same engine powering qrshieldpro.com
```

---

## Troubleshooting

| Problem | Solution |
|---|---|
| `eas build` fails | Run `eas whoami` to confirm login |
| Camera not working | Ensure camera permission is granted in Android settings |
| Backend timeout | The Render free tier sleeps after 15 min of inactivity — first scan may take 30–60 sec |
| APK installs but crashes | Check that all `npm install` completed successfully |

---

## File Structure Reference

```
QRShieldApp/
├── app/
│   ├── _layout.tsx      ← Fonts + navigation setup
│   ├── index.tsx        ← 📷 Camera Scanner screen
│   ├── results.tsx      ← ✅ Results + SHAP screen
│   ├── history.tsx      ← 📋 Recent scans
│   └── about.tsx        ← ℹ️ Info + links
├── components/
│   ├── Header.tsx       ← Logo + status dot
│   ├── StatusBadge.tsx  ← SAFE/SUSPICIOUS/MALICIOUS badge
│   ├── ScoreBar.tsx     ← Animated probability bar
│   └── ScanFrame.tsx    ← QR viewfinder overlay
├── constants/
│   └── theme.ts         ← All design tokens (matches web CSS)
├── services/
│   └── api.ts           ← Backend API calls
├── assets/
│   ├── logo.png         ← QRShield logo
│   ├── icon.png         ← App icon (Android launcher)
│   ├── adaptive-icon.png← Adaptive icon foreground
│   └── splash.png       ← Splash screen
├── app.json             ← Expo config
├── eas.json             ← EAS build profiles
└── package.json         ← Dependencies
```
