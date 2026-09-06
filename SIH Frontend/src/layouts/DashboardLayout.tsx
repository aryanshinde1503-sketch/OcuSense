import { type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from '../components/Logo';
import { LayoutDashboard, ScanEye, History, BookOpen, Plus } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/screening/patient', label: 'New Screening', icon: ScanEye },
  { to: '/history', label: 'History', icon: History },
  { to: '/learn', label: 'Learn', icon: BookOpen },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-sand-50">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-navy-100/70 bg-white lg:flex">
        <div className="px-6 py-6">
          <Link to="/">
            <Logo />
          </Link>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to || (to !== '/dashboard' && location.pathname.startsWith(to));
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-navy-600 hover:bg-sand-100 hover:text-navy-800'
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4">
          <p className="rounded-xl bg-navy-800 px-4 py-3 text-xs leading-relaxed text-navy-100">
            DR-Screen provides AI-assisted screening support only. Always consult an eye-care
            professional for diagnosis.
          </p>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-60">
        <main className="mx-auto max-w-5xl px-5 pb-24 pt-8 sm:px-8 lg:pb-10">{children}</main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-navy-100 bg-white/95 py-2 backdrop-blur lg:hidden">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to || (to !== '/dashboard' && location.pathname.startsWith(to));
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center gap-1 px-3 py-1 text-[11px] ${
                active ? 'text-teal-600' : 'text-navy-400'
              }`}
            >
              {to === '/screening/patient' ? (
                <span className="-mt-6 flex h-11 w-11 items-center justify-center rounded-full bg-teal-500 text-white shadow-soft">
                  <Plus className="h-5 w-5" />
                </span>
              ) : (
                <Icon className="h-5 w-5" />
              )}
              {label === 'New Screening' ? 'New' : label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
