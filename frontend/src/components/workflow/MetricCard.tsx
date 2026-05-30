import { Card } from './Card';
export function MetricCard({label,value,detail}:{label:string;value:string|number;detail?:string}){return <Card><p className="eyebrow">{label}</p><strong className="metric-value">{value}</strong>{detail&&<p className="muted">{detail}</p>}</Card>}
