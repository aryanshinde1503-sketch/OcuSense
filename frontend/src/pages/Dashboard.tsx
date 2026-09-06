import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge, { riskTone } from '../components/Badge';
import { LoadingState } from '../components/States';
import { getScreeningHistory, getPatient } from '../services/screeningService';
import type { Screening, Patient } from '../types';
import { ArrowRight, Plus, TrendingUp, Info, Eye } from 'lucide-react';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function Dashboard() {
  const [history, setHistory] = useState<Screening[]>([]);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getScreeningHistory(), getPatient()]).then(([h, p]) => {
      setHistory(h);
      setPatient(p);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingState label="Loading your dashboard…" />
      </DashboardLayout>
    );
  }

  const latest = history[0];
  const total = history.length;
  const avgConfidence = Math.round(
    history.reduce((sum, s) => sum + (s.result?.confidence || 0), 0) / (total || 1)
  );

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl text-navy-900">Welcome back, {patient?.name.split(' ')[0]}</h1>
          <p className="mt-1 text-sm text-navy-500">Here's a summary of your eye health screenings.</p>
        </div>
        <Link to="/screening/patient">
          <Button icon={<Plus className="h-4 w-4" />} iconPosition="left">
            Start New Screening
          </Button>
        </Link>
      </div>

      {/* Latest result */}
      {latest?.result ? (
        <Card className="mt-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="mx-auto overflow-hidden rounded-full ring-4 ring-navy-800/90 sm:mx-0 h-28 w-28 shrink-0">
              <img src={latest.retinalImage?.url} alt="Latest retinal scan" className="h-full w-full object-cover" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <p className="text-xs uppercase tracking-wide text-navy-400">Latest screening · {formatDate(latest.createdAt)}</p>
              <h2 className="mt-1 font-display text-xl text-navy-900">{latest.result.severity}</h2>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <Badge tone={riskTone(latest.result.riskLevel)}>{latest.result.riskLevel} risk</Badge>
                <Badge tone="navy">Confidence {latest.result.confidence}%</Badge>
              </div>
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:items-end">
              <Link to="/screening/result"><Button size="sm" variant="outline">View Result</Button></Link>
              <Link to="/screening/explanation"><Button size="sm" variant="ghost">View Explanation</Button></Link>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="mt-6 text-center">
          <p className="text-navy-600">No screenings yet. Start your first one to see results here.</p>
        </Card>
      )}

      {/* Stats */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
            <Eye className="h-5 w-5" />
          </div>
          <div>
            <p className="font-display text-2xl text-navy-900">{total}</p>
            <p className="text-xs text-navy-500">Total screenings</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <p className="font-display text-2xl text-navy-900">{avgConfidence}%</p>
            <p className="text-xs text-navy-500">Average AI confidence</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
            <Info className="h-5 w-5" />
          </div>
          <div>
            <p className="font-display text-2xl text-navy-900">{latest?.result?.riskLevel || '—'}</p>
            <p className="text-xs text-navy-500">Current risk level</p>
          </div>
        </Card>
      </div>

      {/* Recent history */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg text-navy-900">Recent screenings</h2>
          <Link to="/history" className="flex items-center gap-1 text-sm font-medium text-teal-600">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="mt-4 space-y-3">
          {history.slice(0, 3).map((s) => (
            <Card key={s.id} className="flex items-center justify-between !py-4">
              <div>
                <p className="text-sm font-medium text-navy-800">{s.result?.severity}</p>
                <p className="text-xs text-navy-400">{formatDate(s.createdAt)}</p>
              </div>
              {s.result && <Badge tone={riskTone(s.result.riskLevel)}>{s.result.riskLevel}</Badge>}
            </Card>
          ))}
        </div>
      </div>

      {/* Info card */}
      <Card className="mt-8 bg-teal-50/60 border-teal-100">
        <h3 className="font-display text-lg text-navy-800">About diabetic retinopathy</h3>
        <p className="mt-2 text-sm leading-relaxed text-navy-600">
          Diabetic retinopathy develops slowly and often shows no symptoms until vision is
          affected. Regular screening helps catch changes early, when they're most treatable.
        </p>
        <Link to="/learn" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-teal-700">
          Learn more <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </Card>
    </DashboardLayout>
  );
}
