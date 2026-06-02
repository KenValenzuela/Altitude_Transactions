import type {Config} from 'tailwindcss'

const config: Config = {
    content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
    corePlugins: {
        // Disable Preflight — the project's globals.css already handles the base reset
        preflight: false,
    },
    theme: {
        extend: {
            fontFamily: {
                sans: ['var(--font-sans)'],
                serif: ['var(--font-serif)'],
                mono: ['var(--font-mono)'],
            },
            borderRadius: {
                pill: 'var(--r-pill)',
            },
            boxShadow: {
                xs: 'var(--shadow-xs)',
                sm: 'var(--shadow-sm)',
                md: 'var(--shadow-md)',
                lg: 'var(--shadow-lg)',
            },
        },
    },
}

export default config
