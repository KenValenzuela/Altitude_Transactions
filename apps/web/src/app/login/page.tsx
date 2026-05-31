'use client';
import { useRouter } from 'next/navigation';
import { api, ApiError, setStoredUser, setToken, getStoredUser } from '@/lib/api-client';
import { AppShell } from '@/components/ui/AppShell';
import { ScreenLogin } from '@/components/screens/ScreenLogin';

export default function LoginPage() {
  const router = useRouter();

  const onContinue = async () => {
    try {
      const session = await api.createSession();
      setToken(session.token);
      setStoredUser(session.user);
    } catch (err) {
      // Auth is stubbed; if the backend is down let the user through so
      // the dashboard surfaces a clear "API unreachable" error on its own.
      if (!(err instanceof ApiError)) throw err;
    }
    router.push('/dashboard');
  };

  return (
    <AppShell>
      <ScreenLogin go={() => {}} user={getStoredUser() ?? undefined} onContinue={onContinue} />
    </AppShell>
  );
}
