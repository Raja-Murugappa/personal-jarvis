import { useQuery } from '@tanstack/react-query';
import { checkHealth } from '@/lib/api';

export function HealthIndicator() {
  const { data, isError, isLoading } = useQuery({
    queryKey: ['backend-health'],
    queryFn: checkHealth,
    refetchInterval: 15000,
    retry: 1,
    retryDelay: 2000,
  });

  const isOnline = !isError && !isLoading && data?.status === 'ok';

  return (
    <div
      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
        isOnline
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
          : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800'
      }`}
      title={isOnline ? 'Backend service is online (127.0.0.1:8000)' : 'Backend service is unreachable'}
    >
      <span className="relative flex h-2 w-2">
        <span
          className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
            isOnline ? 'bg-emerald-400' : 'bg-rose-400'
          }`}
        />
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${
            isOnline ? 'bg-emerald-500' : 'bg-rose-500'
          }`}
        />
      </span>
      <span>{isOnline ? 'Backend online' : 'Backend offline'}</span>
    </div>
  );
}
