import { Link, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import Button from './Button';
import { ArrowRight } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-40 border-b border-navy-100/70 bg-sand-50/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          <a href="/#how-it-works" className="text-sm text-navy-600 hover:text-navy-800">
            How it works
          </a>
          <Link to="/learn" className="text-sm text-navy-600 hover:text-navy-800">
            Learn
          </Link>
          <a href="/#trust" className="text-sm text-navy-600 hover:text-navy-800">
            Safety &amp; trust
          </a>
        </nav>
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="hidden text-sm font-medium text-navy-700 sm:block">
            Dashboard
          </Link>
          <Button size="sm" icon={<ArrowRight className="h-4 w-4" />} onClick={() => navigate('/screening/patient')}>
            Start Screening
          </Button>
        </div>
      </div>
    </header>
  );
}
