import {redirect} from 'next/navigation';

const routeMap: Record<string, string> = {
  checklist: 'documents',
  parties: 'contacts',
  postclose: 'post-close',
  summary: 'overview',
};

export default async function LegacyNestedTransactionRedirect({params}: {params: Promise<{id: string}>}) {
  const {id} = await params;
  const segment = __dirname.split('/').at(-1) ?? 'overview';
  redirect(`/app/transactions/${id}/${routeMap[segment] ?? segment}`);
}
