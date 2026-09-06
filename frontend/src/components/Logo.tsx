import { Eye } from 'lucide-react';

export default function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-navy-700">
        <Eye className="h-4.5 w-4.5 text-white" strokeWidth={2.25} />
        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-amber-500 ring-2 ring-white" />
      </span>
      <span
        className={`font-display text-[19px] tracking-tight ${
          dark ? 'text-white' : 'text-navy-800'
        }`}
      >
        DR-Screen
      </span>
    </div>
  );
}
