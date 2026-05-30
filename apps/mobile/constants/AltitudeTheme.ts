/**
 * Altitude mobile design tokens.
 * Mirrors packages/shared/src/theme.ts — import from @altitude/shared
 * in feature screens once the workspace dep is fully resolved.
 */

export const Colors = {
    // Surfaces
    canvas: '#F2F4F7',
    surface: '#FFFFFF',
    surfaceRecessed: '#ECEFF4',
    hairline: '#E3E7EE',
    hairlineStrong: '#C9D1DC',

    // Text
    ink: '#14223F',
    ink2: '#38445C',
    ink3: '#6B7488',
    ink4: '#9AA1B0',

    // Brand navy
    navy: '#1E3A66',
    navyDeep: '#14223F',
    navyFill: '#D6DFEC',
    navyTint: '#EAF0F8',

    // Gold (restrained — CTA, progress, in-progress badge only)
    gold: '#B8862F',
    goldSoft: '#F4E8CC',

    // Status
    overdue: '#B0493B',
    overdueSoft: '#F3DCD6',
    notStarted: '#5C6B82',
    notStartedSoft: '#DEE3EC',
    na: '#9AA1B0',
    naSoft: '#E8EBF0',

    // Dark theme
    dark: {
        canvas: '#0E1626',
        surface: '#16203A',
        surfaceRecessed: '#111A30',
        hairline: '#243150',
        ink: '#EDF1F7',
        ink2: '#C2CADB',
        ink3: '#8B95AC',
        navy: '#6E97D6',
    },
} as const;

export const Spacing = {
    sp1: 4, sp2: 8, sp3: 12, sp4: 16,
    sp5: 20, sp6: 24, sp8: 32, sp10: 40, sp12: 48,
} as const;

export const Radii = {
    xs: 6, sm: 10, md: 14, lg: 20, xl: 28, pill: 999,
} as const;

export const Typography = {
    sizeDisplay: 40,
    sizeTitle: 28,
    sizeHeading: 18,
    sizeBody: 16,
    sizeCaption: 14,
    sizeLabel: 12,
    sizeEyebrow: 10,
    weightRegular: '400' as const,
    weightMedium: '500' as const,
    weightSemibold: '600' as const,
    weightBold: '700' as const,
    // Use system fonts until Geist is bundled via expo-font
    fontSans: undefined as string | undefined, // falls back to system default
} as const;

export const Motion = {
    micro: 150,
    hover: 180,
    transition: 280,
} as const;

export const Touch = {
    minTarget: 44,
    minGap: 8,
} as const;
