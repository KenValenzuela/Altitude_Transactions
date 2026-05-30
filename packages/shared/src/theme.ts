/**
 * Altitude Transactions — Shared Design Theme
 *
 * Platform-agnostic design tokens for web (Next.js) and mobile (React Native / Expo).
 *
 * Web: CSS custom properties in globals.css are the live implementation.
 * Mobile: Use this object directly with StyleSheet.create() or a theme provider.
 *
 * Source of truth: docs/ALTITUDE_DESIGN_SYSTEM.md
 */

// ── Colors ──────────────────────────────────────────────────────────────────

export const Colors = {
    // Foundation — surfaces and canvas
    canvas: '#F2F4F7',  // app background
    surface: '#FFFFFF',  // card / panel
    surfaceRecessed: '#ECEFF4', // nested surfaces
    hairline: '#E3E7EE',  // dividers
    hairlineStrong: '#C9D1DC',  // emphasized borders

    // Ink — text hierarchy
    ink: '#14223F',  // primary text
    ink2: '#38445C',  // secondary text
    ink3: '#6B7488',  // captions, eyebrows
    ink4: '#9AA1B0',  // placeholder, disabled

    // Brand navy (20% of UI)
    navy: '#1E3A66',  // brand navy — links, icons, active
    navyDeep: '#14223F',  // deep navy — headings on tints
    navyFill: '#D6DFEC',  // complete badge background
    navyTint: '#EAF0F8',  // light navy wash

    // Gold (10% accent only)
    gold: '#B8862F',  // CTA, active progress, in-progress badge
    goldSoft: '#F4E8CC',  // in-progress badge background

    // Status
    overdue: '#B0493B',  // clay red — overdue / error
    overdueSoft: '#F3DCD6',
    inProgress: '#B8862F',  // gold — in-progress
    inProgressSoft: '#F4E8CC',
    notStarted: '#5C6B82',  // slate — not started
    notStartedSoft: '#DEE3EC',
    complete: '#1E3A66',  // navy — complete / approved
    completeSoft: '#D6DFEC',
    na: '#9AA1B0',  // dimmed — not applicable
    naSoft: '#E8EBF0',

    // Dark theme overrides (for React Native dark mode)
    dark: {
        canvas: '#0E1626',
        surface: '#16203A',
        surfaceRecessed: '#111A30',
        hairline: '#243150',
        hairlineStrong: '#364668',
        ink: '#EDF1F7',
        ink2: '#C2CADB',
        ink3: '#8B95AC',
        ink4: '#646E86',
        navy: '#6E97D6',
        navyDeep: '#A9C3EC',
        navyFill: '#1E3157',
        navyTint: '#182646',
        overdueSoft: '#3A211D',
        goldSoft: '#382C16',
        notStartedSoft: '#232E45',
        naSoft: '#1E2840',
    },
} as const;

// ── Typography ───────────────────────────────────────────────────────────────

export const Typography = {
    // Font families (loaded separately on each platform)
    fontDisplay: 'Instrument Serif',  // hero/display moments only
    fontSans: 'Geist',             // all UI text
    // Mono role uses Geist with tnum feature setting on web; Geist on RN

    // Size scale (px reference — use sp on Android, pt on iOS via Expo)
    sizeDisplay: 40,  // clamp to viewport on web
    sizeTitle: 28,
    sizeHeading: 18,
    sizeBody: 16,  // minimum on mobile
    sizeCaption: 14,
    sizeLabel: 12,
    sizeEyebrow: 10,

    // Weight
    weightLight: 300,
    weightRegular: 400,
    weightMedium: 500,
    weightSemibold: 600,
    weightBold: 700,

    // Line height multipliers
    leadingDisplay: 1.05,
    leadingHeading: 1.25,
    leadingBody: 1.6,
    leadingCaption: 1.45,

    // Letter spacing (em)
    trackingEyebrow: 0.14,
    trackingMono: 0.02,
    trackingTight: -0.01,
} as const;

// ── Spacing ──────────────────────────────────────────────────────────────────

export const Spacing = {
    sp1: 4,
    sp2: 8,
    sp3: 12,
    sp4: 16,
    sp5: 20,
    sp6: 24,
    sp8: 32,
    sp10: 40,
    sp12: 48,
} as const;

// ── Radius ───────────────────────────────────────────────────────────────────

export const Radii = {
    xs: 6,
    sm: 10,
    md: 14,
    lg: 20,
    xl: 28,
    pill: 999,
} as const;

// ── Shadows (React Native) ───────────────────────────────────────────────────
// Web uses CSS box-shadow. RN uses shadowColor + elevation.

export const Shadows = {
    sm: {
        shadowColor: '#14223F',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    md: {
        shadowColor: '#14223F',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.07,
        shadowRadius: 12,
        elevation: 3,
    },
    lg: {
        shadowColor: '#14223F',
        shadowOffset: {width: 0, height: 16},
        shadowOpacity: 0.20,
        shadowRadius: 36,
        elevation: 8,
    },
} as const;

// ── Motion durations (ms) ────────────────────────────────────────────────────

export const Motion = {
    microMs: 150,
    hoverMs: 180,
    transitionMs: 280,
    progressMs: 400,
    skeletonMs: 1800,
    sheetMs: 300,
} as const;

// ── Touch targets ────────────────────────────────────────────────────────────

export const Touch = {
    minTarget: 44,  // px — minimum tap area (WCAG 2.5.5)
    minGap: 8,  // px — minimum gap between adjacent targets
} as const;

// ── Z-index scale (web) ──────────────────────────────────────────────────────

export const ZIndex = {
    base: 0,
    raised: 10,
    overlay: 20,
    modal: 30,
    toast: 50,
} as const;

// ── Status mapping ───────────────────────────────────────────────────────────

export type TaskDisplayState = 'todo' | 'doing' | 'done' | 'na';
export type DeadlineDisplayState = 'upcoming' | 'today' | 'overdue' | 'complete' | 'na';

export const StatusColors: Record<TaskDisplayState, { bg: string; fg: string }> = {
    todo: {bg: Colors.notStartedSoft, fg: Colors.notStarted},
    doing: {bg: Colors.inProgressSoft, fg: Colors.inProgress},
    done: {bg: Colors.completeSoft, fg: Colors.complete},
    na: {bg: Colors.naSoft, fg: Colors.na},
} as const;

// ── Altitude theme export ────────────────────────────────────────────────────

export const AltitudeTheme = {
    Colors,
    Typography,
    Spacing,
    Radii,
    Shadows,
    Motion,
    Touch,
    ZIndex,
    StatusColors,
} as const;

export default AltitudeTheme;
