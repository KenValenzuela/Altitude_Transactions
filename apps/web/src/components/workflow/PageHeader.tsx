import type { ReactNode } from 'react';

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  children?: ReactNode;
};

export function PageHeader({ eyebrow, title, description, actions, children }: PageHeaderProps) {
  return (
    <header className="dk-pagehead" style={{ marginBottom: '1.5rem' }}>
      <div>
        {eyebrow && <div className="dk-eyebrow">{eyebrow}</div>}
        <h1 className="dk-h1">{title}</h1>
        {description && <p className="dk-sub">{description}</p>}
        {children}
      </div>
      {actions && (
        <div style={{ display: 'flex', gap: '.6rem', alignItems: 'center', flexShrink: 0 }}>
          {actions}
        </div>
      )}
    </header>
  );
}
