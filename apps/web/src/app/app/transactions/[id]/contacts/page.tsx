import {defaultContactTypes, getTransaction} from '@/lib/product-data';
import {ContactList, PageHeader} from '@/components/product/ProductComponents';

export default async function TransactionContacts({params}: {params: Promise<{id: string}>}) {
  const {id} = await params;
  const transaction = getTransaction(id);
  return <><PageHeader eyebrow="Contacts" title="Transaction-specific contacts">Default contacts include Listing Agent and Listing Brokerage, combine Title / Escrow, and exclude Radon Inspector unless Brett manually adds a custom row.</PageHeader><section className="at-card"><h2>Default contact template</h2><p>{defaultContactTypes.map((type) => type.label).join(' · ')}</p><p>Brett/admin can edit contacts and add custom contact rows. Agents cannot destroy admin-level contact type configuration.</p></section><ContactList contacts={transaction.contacts}/></>;
}
