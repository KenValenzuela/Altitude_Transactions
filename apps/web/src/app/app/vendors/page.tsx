import {vendors} from '@/lib/product-data';
import {PageHeader, VendorRolodex} from '@/components/product/ProductComponents';

export default function VendorsPage() {
  return <><PageHeader eyebrow="Vendor Rolodex" title="Global reusable vendor directory">Vendors are separate from transaction-specific contacts and can be attached to one or more property files.</PageHeader><div className="at-filterbar"><input placeholder="Search vendors by name, company, category, email, or notes" aria-label="Search Vendor Rolodex"/><select aria-label="Vendor status"><option>Active vendors</option><option>Inactive vendors</option><option>All vendors</option></select></div><VendorRolodex items={vendors}/></>;
}
