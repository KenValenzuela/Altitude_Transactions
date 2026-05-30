import type { ButtonHTMLAttributes, ReactNode } from 'react';
export function Button({children,className='',...props}:ButtonHTMLAttributes<HTMLButtonElement>&{children:ReactNode}){return <button className={`ops-button ${className}`} {...props}>{children}</button>}
