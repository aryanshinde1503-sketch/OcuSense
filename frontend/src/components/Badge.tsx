import type { ReactNode } from 'react';

type BadgeTone = 'teal' | 'amber' | 'coral' | 'navy' | 'neutral';

const tones: Record<BadgeTone, string> = {
  teal: 'bg-teal-50 text-teal-700 border-teal-100',
  amber: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  coral: 'bg-coral-500/10 text-coral-500 border-coral-500/20',
  navy: 'bg-navy-50 text-navy-700 border-navy-100',
  neutral: 'bg-sand-100 text-navy-600 border-navy-100',
};

export default function Badge({
  children,
  tone = 'neutral',
  icon,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  icon?: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium ${tones[tone]}`}
    >
      {icon}
      {children}
    </span>
  );
}

export function riskTone(risk: string): BadgeTone {
  switch (risk) {
    case 'Low':
      return 'teal';
    case 'Moderate':
      return 'amber';
    case 'High':
    case 'Urgent':
      return 'coral';
    default:
      return 'neutral';
  }
}
