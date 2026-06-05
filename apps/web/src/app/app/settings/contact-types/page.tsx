import {defaultContactTypes} from '@/lib/product-data';
import {PageHeader} from '@/components/product/ProductComponents';

export default function ContactTypesPage() {
  return <><PageHeader eyebrow="Admin · Contact Types" title="Default and custom contact types">Listing Agent and Listing Brokerage are included. Title / Escrow is combined. Radon Inspector is not a default, but Brett can add it manually as a custom contact.</PageHeader><div className="at-grid-2">{defaultContactTypes.map((type) => <article className="at-card" key={type.role}><h2>{type.label}</h2><p>{type.required ? 'Required default' : 'Optional default'} · Admin editable</p></article>)}</div></>;
}
