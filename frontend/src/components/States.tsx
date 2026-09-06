import type { ReactNode } from 'react';
import { AlertTriangle, Inbox, Loader2 } from 'lucide-react';
import Button from './Button';

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-navy-500">
      <Loader2 className="h-6 w-6 animate-spin text-teal-500" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-navy-100 bg-white px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sand-100 text-navy-400">
        {icon || <Inbox className="h-5 w-5" />}
      </div>
      <p className="font-display text-lg text-navy-800">{title}</p>
      <p className="max-w-sm text-sm text-navy-500">{description}</p>
      {action}
    </div>
  );
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'We could not complete this action. Please try again.',
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-coral-500/20 bg-coral-500/5 px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-coral-500/10 text-coral-500">
        <AlertTriangle className="h-5 w-5" />
      </div>
      <p className="font-display text-lg text-navy-800">{title}</p>
      <p className="max-w-sm text-sm text-navy-500">{description}</p>
      {onRetry && (
        <Button size="sm" variant="outline" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
