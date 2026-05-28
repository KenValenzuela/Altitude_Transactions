'use client';
import { useRouter } from 'next/navigation';
import { api, ApiError, setStoredUser, setToken } from '@/lib/api-client';
import { getStoredUser } from '@/lib/api-client';
import { useScreenNav } from '@/lib/navigation';
import { AppShell } from '@/components/ui/AppShell';
import { ScreenLogin } from '@/components/screens/ScreenLogin';

export default function LoginPage() {
  const router = useRouter();
  const go = useScreenNav();

  const onContinue = async () => {
    try {
      const session = await api.createSession();
      setToken(session.token);
      setStoredUser(session.user);
    } catch (err) {
      // Auth is stubbed; if the backend is down we still let the user through so
      // the dashboard can surface a clear "API unreachable" state on its own.
      if (!(err instanceof ApiError)) throw err;
    }
    router.push('/dashboard');
  };

  return (
    <AppShell>
      <ScreenLogin go={go} user={getStoredUser() ?? undefined} onContinue={onContinue} />
    </AppShell>
  );
}
