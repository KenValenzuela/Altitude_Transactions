import {getTransaction, vendors} from '@/lib/product-data';
import {PageHeader, VendorRolodex} from '@/components/product/ProductComponents';

export default async function TransactionVendors({params}: {params: Promise<{id: string}>}) {
  const {id} = await params;
  const transaction = getTransaction(id);
  const attached = vendors.filter((vendor) => transaction.vendors.includes(vendor.id));
  return <><PageHeader eyebrow="Vendors" title="Vendors attached from global Vendor Rolodex">Transaction vendors are references to the reusable global directory, not duplicate contact records.</PageHeader><VendorRolodex items={attached}/></>;
}
