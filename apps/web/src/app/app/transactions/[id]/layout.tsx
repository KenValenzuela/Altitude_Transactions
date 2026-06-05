import type {ReactNode} from 'react';
import {getTransaction} from '@/lib/product-data';
import {TransactionHeader, TransactionTabs} from '@/components/product/ProductComponents';

export default async function TransactionLayout({children, params}: {children: ReactNode; params: Promise<{id: string}>}) {
  const {id} = await params;
  const transaction = getTransaction(id);
  return <><TransactionHeader transaction={transaction}/><TransactionTabs id={transaction.id}/>{children}</>;
}
