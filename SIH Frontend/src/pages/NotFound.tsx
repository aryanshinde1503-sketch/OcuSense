import { Link } from 'react-router-dom';
import Button from '../components/Button';
import Logo from '../components/Logo';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-sand-50 px-6 text-center">
      <Logo />
      <h1 className="font-display text-3xl text-navy-900">Page not found</h1>
      <p className="max-w-sm text-sm text-navy-500">
        The page you're looking for doesn't exist or may have moved.
      </p>
      <Link to="/">
        <Button>Back to home</Button>
      </Link>
    </div>
  );
}
