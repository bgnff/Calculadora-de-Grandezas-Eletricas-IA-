---
name: Reduced motion in preview
description: The browser preview may enable prefers-reduced-motion, which makes Framer Motion animations appear absent.
---

The preview environment can report `prefers-reduced-motion: reduce`, so `useReducedMotion()` may intentionally disable visual animations even when the implementation is correct.

**Why:** This made the landing-page BlurReveal look unimplemented during verification; the browser console explicitly reported reduced motion.

**How to apply:** Preserve reduced-motion behavior by default, but add an explicit opt-in override only for a user-requested showcase animation that must remain visible in this preview. The Voltiva landing is one such explicit showcase surface; keep the override scoped there, not in shared app screens. Never hide essential copy, CTAs, or previews while waiting for a delayed entrance animation; fast screenshots can capture that pending state.