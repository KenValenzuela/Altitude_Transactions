/** Only the fields the hero actually renders — works with either the API
 * property (joined with the transaction address) or a demo fixture. */
interface HeroProperty {
  address: string;
  city: string;
  type: string;
  mls: string;
}

interface PropertyHeroProps {
  property: HeroProperty;
  height?: number;
}

export function PropertyHero({ property, height = 160 }: PropertyHeroProps) {
  return (
    <div style={{
      position: 'relative', height,
      borderRadius: 'var(--r-md)', overflow: 'hidden',
      background: 'linear-gradient(155deg, #0E1A30 0%, #1E3A66 55%, #B8862F 135%)',
    }}>
      <svg viewBox="0 0 320 160" preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="sky-hero" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#F4EFE3" stopOpacity="0.35" />
            <stop offset="1" stopColor="#F4EFE3" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect width="320" height="160" fill="url(#sky-hero)" />
        <path d="M0 110 L40 86 L70 100 L110 72 L150 96 L190 78 L230 102 L270 84 L320 100 L320 160 L0 160 Z"
          fill="#1E3A66" opacity="0.55"/>
        <path d="M0 130 L30 118 L60 128 L100 108 L140 124 L180 110 L220 130 L260 116 L320 128 L320 160 L0 160 Z"
          fill="#0E1A30"/>
        {[0,1,2,3].map(i => (
          <path key={i}
            d={`M0 ${135 + i*5} Q80 ${130 + i*5} 160 ${136 + i*5} T320 ${134 + i*5}`}
            stroke="rgba(244,239,227,0.18)" strokeWidth="0.5" fill="none"/>
        ))}
        <circle cx="245" cy="42" r="14" fill="#F1ECDF" opacity="0.9"/>
      </svg>
      <div style={{
        position: 'absolute', left: 14, bottom: 12, right: 14,
        color: '#F4EFE3', textShadow: '0 1px 12px rgba(0,0,0,.3)',
      }}>
        <div style={{
          fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.16em',
          textTransform: 'uppercase', opacity: 0.85, marginBottom: 4,
        }}>{property.mls} · {property.type}</div>
        <div className="alt-display" style={{ fontSize: 22, lineHeight: 1.05 }}>
          {property.address}
        </div>
        <div style={{ fontSize: 12, opacity: 0.88, marginTop: 2 }}>{property.city}</div>
      </div>
    </div>
  );
}
