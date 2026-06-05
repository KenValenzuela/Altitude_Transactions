import {redirect} from 'next/navigation';
export default async function TransactionIndex({params}: {params: Promise<{id: string}>}) { const {id} = await params; redirect(`/app/transactions/${id}/overview`); }
