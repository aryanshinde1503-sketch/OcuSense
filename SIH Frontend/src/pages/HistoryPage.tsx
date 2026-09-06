import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import Card from '../components/Card';
import Badge, { riskTone } from '../components/Badge';
import Button from '../components/Button';
import { LoadingState, EmptyState } from '../components/States';
import { getScreeningHistory, getExplanation } from '../services/screeningService';
import { useScreeningFlow } from '../hooks/useScreeningFlow';
import type { Screening } from '../types';
import { Eye, FileText, Sparkles, ScanEye } from 'lucide-react';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function HistoryPage() {
  const [history, setHistory] = useState<Screening[]>([]);
  const [loading, setLoading] = useState(true);
  const { setFlow } = useScreeningFlow();
  const navigate = useNavigate();

  useEffect(() => {
    getScreeningHistory().then((h) => {
      setHistory(h);
      setLoading(false);
    });
  }, []);

  const openResult = (s: Screening) => {
    setFlow((f) => ({
      ...f,
      screeningId: s.id,
      patient: s.patient,
      retinalImage: s.retinalImage,
      result: s.result,
      explanation: undefined,
    }));
    navigate('/screening/result');
  };

  const openExplanation = async (s: Screening) => {
    const explanation = await getExplanation(s.id);
    setFlow((f) => ({
      ...f,
      screeningId: s.id,
      patient: s.patient,
      retinalImage: s.retinalImage,
      result: s.result,
      explanation,
    }));
    navigate('/screening/explanation');
  };

  return (
    <DashboardLayout>
      <h1 className="font-display text-2xl text-navy-900">Screening history</h1>
      <p className="mt-1 text-sm text-navy-500">All your past AI-assisted screenings in one place.</p>

      <div className="mt-6">
        {loading ? (
          <LoadingState label="Loading history…" />
        ) : history.length === 0 ? (
          <EmptyState
            icon={<ScanEye className="h-5 w-5" />}
            title="No screenings yet"
            description="Once you complete a screening, it will appear here for you to revisit."
            action={
              <Link to="/screening/patient">
                <Button size="sm">Start Screening</Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-4">
            {history.map((s) => (
              <Card key={s.id} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full ring-2 ring-navy-800/80">
                    <img src={s.retinalImage?.url} alt="Retinal scan" className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <p className="text-xs text-navy-400">{formatDate(s.createdAt)}</p>
                    <p className="mt-0.5 text-sm font-medium text-navy-800">{s.result?.severity}</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      {s.result && <Badge tone={riskTone(s.result.riskLevel)}>{s.result.riskLevel}</Badge>}
                      <span className="text-xs text-navy-400">Confidence {s.result?.confidence}%</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 sm:justify-end">
                  <Button size="sm" variant="outline" icon={<Eye className="h-3.5 w-3.5" />} iconPosition="left" onClick={() => openResult(s)}>
                    Result
                  </Button>
                  <Button size="sm" variant="outline" icon={<Sparkles className="h-3.5 w-3.5" />} iconPosition="left" onClick={() => openExplanation(s)}>
                    Explanation
                  </Button>
                  <Link to={`/report/${s.id}`}>
                    <Button size="sm" variant="ghost" icon={<FileText className="h-3.5 w-3.5" />} iconPosition="left">
                      Report
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
