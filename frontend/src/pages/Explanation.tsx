import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import ScreeningSteps from '../components/ScreeningSteps';
import Card from '../components/Card';
import Button from '../components/Button';
import HeatmapViewer from '../components/HeatmapViewer';
import { LoadingState } from '../components/States';
import { useScreeningFlow } from '../hooks/useScreeningFlow';
import { getExplanation } from '../services/screeningService';
import { AlertCircle, ArrowRight, FileText, Sparkles } from 'lucide-react';

export default function Explanation() {
  const navigate = useNavigate();
  const { flow, setFlow } = useScreeningFlow();
  const [loading, setLoading] = useState(!flow.explanation);

  useEffect(() => {
    if (!flow.screeningId) {
      navigate('/screening/patient');
      return;
    }
    if (!flow.explanation) {
      getExplanation(flow.screeningId).then((explanation) => {
        setFlow((f) => ({ ...f, explanation }));
        setLoading(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading || !flow.explanation) {
    return (
      <DashboardLayout>
        <ScreeningSteps current={5} />
        <LoadingState label="Preparing AI explanation…" />
      </DashboardLayout>
    );
  }

  const { explanation } = flow;

  return (
    <DashboardLayout>
      <ScreeningSteps current={5} />
      <div className="mt-8 grid max-w-4xl grid-cols-1 gap-8 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-600">
            <Sparkles className="h-4 w-4" /> Explainable AI
          </span>
          <h1 className="mt-1 font-display text-2xl text-navy-900">Why did the AI predict this?</h1>
          <p className="mt-2 text-sm leading-relaxed text-navy-600">
            Toggle between views to see the original image, the AI's attention map, and both
            layered together. Tap a marker to learn what it means.
          </p>
          <Card className="mt-6">
            <HeatmapViewer explanation={explanation} />
          </Card>
          <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
            <p className="text-sm text-navy-600">{explanation.disclaimer}</p>
          </div>
        </div>

        <div>
          <Card>
            <h2 className="font-display text-lg text-navy-800">Overall explanation</h2>
            <p className="mt-2 text-sm leading-relaxed text-navy-600">{explanation.summary}</p>
          </Card>

          <div className="mt-4 space-y-3">
            {explanation.features.map((f) => (
              <Card key={f.id} className="!py-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-navy-800">{f.label}</p>
                  <span className="text-xs font-medium text-teal-600">{f.confidence}% confidence</span>
                </div>
                <div className="mt-2 h-1.5 w-full rounded-full bg-sand-100">
                  <div className="h-1.5 rounded-full bg-teal-500" style={{ width: `${f.confidence}%` }} />
                </div>
                <p className="mt-2 text-xs leading-relaxed text-navy-500">{f.description}</p>
              </Card>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Link to="/report/latest">
              <Button className="w-full" variant="outline" icon={<FileText className="h-4 w-4" />} iconPosition="left">
                View Report
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button className="w-full" variant="ghost" icon={<ArrowRight className="h-4 w-4" />}>
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
