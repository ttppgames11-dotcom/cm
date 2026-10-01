# Connect Maratha Mobile App — Asset License & Source Inventory

Generated as part of the pre-release audit.

> [!WARNING]
> None of the image assets listed below have verified open-source, Creative Commons, or commercial licenses recorded in the repository.
> Until explicit commercial rights or original artist attribution/waivers are obtained, **do not claim that any of these assets are licensed**.

---

## 1. Asset Summary

| Directory | File Count | Total Size | Verification Status |
|---|---|---|---|
| `assets/images/` | 26 files | ~30.8 MB | **Unverified / Unknown Origin** |
| `assets/avatars/` | 3 files | ~4.7 MB | **Unverified / AI or Photographic Mock** |
| `google_fonts/` | 34 files (`.ttf`) | ~4.8 MB | **Verified** (SIL Open Font License) |

---

## 2. Image Assets (`assets/images/`)

| File Name | File Size | Usage in Code | Visual Description / Content | License / Source Status | Verification Action Required |
|---|---|---|---|---|---|
| `connect_maratha_crest.png` | 575 KB | App launcher icon (`mipmap`), login screen hero crest, header branding | Circular Maratha crest with saffron Rajmudra, Shivneri fort silhouette & swords | **Unverified** (Proprietary / Brand Asset) | Confirm designer transfer of IP / copyright ownership to Connect Maratha |
| `d63da6d1-2655-47cf-b154-b037ec531cfa.png` | 1.69 MB | Unused directly in `lib/` (duplicate of `logo.png`) | Circular logo art with warrior and saffron flags | **Unverified / Duplicate** | Safe to remove before Play Store upload to reduce AAB bundle size |
| `event_rajgad.png` | 2.35 MB | Events section / Rajgad trek event thumbnail | Photograph/composite of Rajgad fort trek banner | **Unverified** | Check photographer permissions or replace with licensed/original photograph |
| `heritage_hero.png` | 788 KB | Heritage list hero card banner | Panoramic aerial view of Maharashtra hill fort | **Unverified** | Verify whether source is royalty-free (Unsplash/Wikimedia) or copyrighted |
| `heritage_rajgad.png` | 2.40 MB | Heritage section / Fort list card | Aerial view of Rajgad fort padmavati machi | **Unverified** | Verify source rights or replace with owned photography |
| `heritage_sinhgad.png` | 2.45 MB | Heritage section / Sinhgad fort card | High-resolution hill fort sunset panorama with flag | **Unverified** (AI generated or commercial stock) | Check generation provenance or replace with original photo |
| `hero_banner.png` | 2.00 MB | Home screen top hero carousel | Scenic Maratha fortification banner | **Unverified** | Verify license |
| `login_card_fort_watermark.png` | 329 KB | Login screen card faint watermark | Watermark line art / silhouette of hill fort | **Unverified** | Confirm graphic artist source |
| `logo.png` | 1.69 MB | Splash screen & branding headers | Connect Maratha official circular logo | **Unverified** | Confirm ownership / trademark filing status |
| `logo_icon.png` | 476 KB | Compact app icon / header icon | Compact logo glyph | **Unverified** | Confirm ownership |
| `nav_fort_icon.png` | 390 KB | Bottom navigation bar icon | Custom fort bastion vector/raster icon | **Unverified** | Verify icon author |
| `post_rajgad_trek.png` | 2.20 MB | Community mock post attachment | Fort trek landscape image | **Unverified** | Verify photographer source |
| `profile_fort_header_bg.png` | 787 KB | Member profile screen header background | Fort wall and sunrise landscape | **Unverified** | Verify photographer source |
| `rajgad_carousel_1.jpg` | 793 KB | Rajgad Fort detail carousel slide 1 | Scenic view of Rajgad bastion | **Unverified** | Confirm if shot by community members or sourced from web |
| `rajgad_carousel_2.jpg` | 1.01 MB | Rajgad Fort detail carousel slide 2 | Rajgad ridge / machi path | **Unverified** | Confirm source |
| `rajgad_carousel_3.jpg` | 1.01 MB | Rajgad Fort detail carousel slide 3 | Fort gate / Maha Darwaja | **Unverified** | Confirm source |
| `rajgad_carousel_4.jpg` | 998 KB | Rajgad Fort detail carousel slide 4 | Citadel (Bale Killa) | **Unverified** | Confirm source |
| `rajgad_carousel_5.jpg` | 839 KB | Rajgad Fort detail carousel slide 5 | Panoramic view from ramparts | **Unverified** | Confirm source |
| `splash_background.png` | 2.01 MB | Splash screen background gradient art | Decorative background with fort motifs | **Unverified** | Confirm designer source |
| `warrior_bajirao.png` | 892 KB | Warrior detail / carousel: Bajirao Peshwa | Oil-painting style portrait of Peshwa Bajirao I | **Unverified** (Likely Midjourney/StableDiffusion AI) | Verify AI generation ownership or museum public domain status |
| `warrior_hambirrao.png` | 963 KB | Warrior detail / carousel: Senapati Hambirrao Mohite | Historical military commander portrait | **Unverified** (AI generated artwork) | Verify commercial usage rights for AI platform used |
| `warrior_illustration.png` | 2.14 MB | Heritage / Warriors section banner | Group illustration of Maratha warriors | **Unverified** | Verify illustrator source |
| `warrior_sambhaji.png` | 937 KB | Warrior detail / carousel: Chhatrapati Sambhaji Maharaj | Historical portrait of Chhatrapati Sambhaji Maharaj | **Unverified** (AI generated artwork) | Verify prompt ownership / commercial rights |
| `warrior_shivaji.png` | 1.02 MB | Warrior detail / carousel: Chhatrapati Shivaji Maharaj | Regal portrait of Chhatrapati Shivaji Maharaj | **Unverified** (AI generated artwork) | Verify prompt ownership / commercial rights |
| `warrior_tanaji.png` | 882 KB | Warrior detail / carousel: Subhedar Tanaji Malusare | Portrait of Tanaji Malusare | **Unverified** (AI generated artwork) | Verify prompt ownership / commercial rights |
| `warrior_tarabai.png` | 828 KB | Warrior detail / carousel: Maharani Tarabai | Regal equestrian portrait of Maharani Tarabai | **Unverified** (AI generated artwork) | Verify prompt ownership / commercial rights |

---

## 3. Avatar Assets (`assets/avatars/`)

| File Name | File Size | Usage in Code | Content | License / Source Status | Verification Action Required |
|---|---|---|---|---|---|
| `abhay_gond.png` | 1.92 MB | Demo profile / testing mock | Personal photo portrait | **Personal Data / Unverified** | Should be replaced in production by user's own uploaded avatar or initials |
| `profile_sunset_avatar.png` | 703 KB | Default fallback avatar | Artistic avatar silhouette against sunset | **Unverified** | Verify illustration license |
| `user_profile.png` | 1.92 MB | Profile screen default avatar | User profile photo (duplicate of abhay_gond.png) | **Personal Data / Unverified** | Replace with generic vector SVG/monogram fallback |

---

## 4. Fonts (`google_fonts/`)

All fonts bundled in `google_fonts/` have been verified against Google Fonts open-source distributions:

| Font Family | Files Bundled | Upstream License | Status |
|---|---|---|---|
| **Mukta** | 7 files (Light, Regular, Medium, SemiBold, Bold, ExtraBold, ExtraLight) | SIL Open Font License, 1.1 | **Verified Open Source** |
| **Playfair Display** | 12 files (Regular, Medium, SemiBold, Bold, ExtraBold, Black + Italics) | SIL Open Font License, 1.1 | **Verified Open Source** |
| **Cinzel** | 6 files (Regular, Medium, SemiBold, Bold, ExtraBold, Black) | SIL Open Font License, 1.1 | **Verified Open Source** |
| **Noto Sans Devanagari** | 9 files (Thin, Light, Regular, Medium, SemiBold, Bold, ExtraBold, Black) | SIL Open Font License, 1.1 | **Verified Open Source** |

*Note: Bundled locally and runtime downloads disabled (`GoogleFonts.config.allowRuntimeFetching = false`), ensuring no user IP leakage to Google and full offline rendering.*

---

## 5. High-Risk Assets Requiring Immediate Verification Before Store Upload

1. **Warrior portraits (`warrior_*.png`):**
   - If AI-generated: verify terms of service of the generator (Midjourney Pro, Adobe Firefly, etc.) to ensure commercial redistribution in mobile app bundles is permitted.
   - If derived from living artists' paintings: must obtain written license or commission agreement.
2. **Fort photography (`rajgad_carousel_*.jpg`, `heritage_*.png`, `event_rajgad.png`):**
   - Confirm whether these were photographed directly by the Connect Maratha team, licensed via creative commons (CC-BY / CC-BY-SA with proper in-app attribution), or taken from Google Images (high copyright risk).
3. **Personal Avatars (`abhay_gond.png`, `user_profile.png`):**
   - Do not ship actual personal photographs as default bundled placeholders in production APKs. Use vector initials or generic avatars.
