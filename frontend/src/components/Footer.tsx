import { Link } from 'react-router-dom';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="border-t border-navy-100/70 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-3 text-sm leading-relaxed text-navy-600">
              AI-powered eye screening, made accessible. A decision-support tool for early
              diabetic retinopathy detection — built for SIH 2026.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <p className="text-sm font-medium text-navy-800">Product</p>
              <ul className="mt-3 space-y-2 text-sm text-navy-600">
                <li><Link to="/dashboard" className="hover:text-teal-600">Dashboard</Link></li>
                <li><Link to="/screening/patient" className="hover:text-teal-600">Start screening</Link></li>
                <li><Link to="/history" className="hover:text-teal-600">History</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-medium text-navy-800">Resources</p>
              <ul className="mt-3 space-y-2 text-sm text-navy-600">
                <li><Link to="/learn" className="hover:text-teal-600">Learn about DR</Link></li>
                <li><a href="/#trust" className="hover:text-teal-600">Safety &amp; trust</a></li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-medium text-navy-800">Team</p>
              <ul className="mt-3 space-y-2 text-sm text-navy-600">
                <li>SIH26038</li>
                <li>MathWorks · MedTech</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-navy-100 pt-6 text-xs text-navy-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 DR-Screen. Built for Smart India Hackathon.</p>
          <p>AI-assisted screening result — not a medical diagnosis.</p>
        </div>
      </div>
    </footer>
  );
}
