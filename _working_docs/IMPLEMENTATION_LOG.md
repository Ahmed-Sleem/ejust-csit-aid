# Implementation Log

## 2026-11-22 — EJUST-001
- Preserved the supplied single-page department website and interactions.
- Integrated the supplied EJUST logo in the hero and floating navigation.
- Added exactly three cursor-responsive koi only inside the intro, using Koi Tiles, cell size 5, and responsive 12%-of-intro sizing.
- Positioned initial koi in the open upper hero area and pause rendering outside the intro.
- Added attribution, responsive checks, interaction checks, desktop/mobile browser coverage, and Pages automation.

## 2026-11-22 — Intro sizing refinement
- Translated the requested 12% fish setting to Cursor Pond's actual visual scale: 58–72 px on desktop with gentle responsive reduction on mobile.
- Reduced hero logo from 360 px maximum to 250 px and floating logo to 120 px.
- Replaced the favicon with the supplied EJUST emblem SVG.
- Reverified desktop/mobile behavior and visually inspected the revised hero.

## 2026-11-22 — Directory navigation and people slider
- Restored the large full EJUST wordmark in the intro and switched the floating navigation to the compact supplied emblem.
- Converted the homepage People section to a horizontal snap slider with filter options and a terminal Explore card containing View everyone and Search actions.
- Added View all controls for People and Projects.
- Added dedicated full People and Projects directory pages within the existing hash-routed site, preserving the same typography, spacing, cards, transitions, floating navigation, search, and project/profile interactions.
- Added desktop/mobile directory and slider coverage and visually inspected both views.

## 2026-11-22 — Mobile navigation and search
- Replaced the hero wordmark asset with the user's tighter crop and reduced its maximum width to 290 px.
- Added a three-dot control immediately before the search icon on screens up to 620 px.
- Added a full-screen glass mobile menu with large Home, Projects, People, and Sign in actions, compact identity, background blur, scroll locking, and circular close control.
- Added a matching full-screen mobile search experience with immediate people/project results and its own close control; desktop search remains unchanged.
- Added Escape handling, focus handoff, and mobile-only browser coverage; visually inspected both overlays at 412×915.

## 2026-11-22 — Logo and emblem fit
- Reduced the intro wordmark by approximately 60% to a 120 px maximum and vertically aligned it with Projects, People, Search, and Sign in.
- Converted the supplied SVG text attachment into `ejust-mark.svg` and used it in the floating and mobile navigation instead of the favicon URL.
- Cropped both the navigation mark and favicon viewBoxes tightly around the visible black/red emblem, removing excess transparent/white space so the artwork fills its available area.
- Increased the floating emblem box to 38 px and visually verified its fit in the 52 px glass navigation.

## 2026-11-22 — Confirmed production requirements and navigation polish
- Created `docs/PRODUCT_REQUIREMENTS.md` covering the confirmed account, verification, role, profile, project, mention-count ranking, security, audit, privacy, operations, and launch requirements.
- Modeled Admin as a privilege layered on Student/Professor, with a one-time preverified root-admin bootstrap that still completes normal account creation.
- Explicitly excluded project workflow, project Status, notifications, likes, comments, chat, and social-feed complexity.
- Removed the supplied white SVG container from the floating navigation emblem, leaving a transparent black/red mark.
- Rebuilt the favicon as a smaller inset emblem on a rounded white tile.
- Added elegant desktop search collapse on blur/outside click and automatic floating-navigation removal on return to the intro.
