import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge, { riskTone } from '../components/Badge';
import Logo from '../components/Logo';
import { LoadingState, ErrorState } from '../components/States';
import { useScreeningFlow } from '../hooks/useScreeningFlow';
import { getScreeningById } from '../services/screeningService';
import { useToast } from '../components/Toast';
import type { Screening } from '../types';
import { Download, Printer, ArrowLeft } from 'lucide-react';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function Report() {
  const { id } = useParams();
  const { flow } = useScreeningFlow();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [screening, setScreening] = useState<Screening | null | undefined>(undefined);

  useEffect(() => {
    if (id === 'latest') {
      if (flow.patient && flow.retinalImage && flow.result) {
        setScreening({
          id: flow.screeningId || 'current',
          patient: flow.patient,
          retinalImage: flow.retinalImage,
          result: flow.result,
          explanation: flow.explanation,
          status: 'completed',
          createdAt: new Date().toISOString(),
        });
      } else {
        setScreening(null);
      }
      return;
    }
    if (id) {
      getScreeningById(id).then((s) => setScreening(s || null));
    }
  }, [id, flow]);

  if (screening === undefined) {
    return (
      <DashboardLayout>
        <LoadingState label="Preparing report…" />
      </DashboardLayout>
    );
  }

  if (!screening || !screening.result) {
    return (
      <DashboardLayout>
        <ErrorState
          title="Report not available"
          description="We couldn't find this screening's report. Try starting a new screening."
          onRetry={() => navigate('/screening/patient')}
        />
      </DashboardLayout>
    );
  }

  const { patient, retinalImage, result, explanation } = screening;

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between print:hidden">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-navy-500 hover:text-navy-800">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            icon={<Printer className="h-3.5 w-3.5" />}
            iconPosition="left"
            onClick={() => window.print()}
          >
            Print
          </Button>
          <Button
            size="sm"
            icon={<Download className="h-3.5 w-3.5" />}
            iconPosition="left"
            onClick={() => showToast('Report download will connect to the real backend later.')}
          >
            Download Report
          </Button>
        </div>
      </div>

      <Card className="mt-6 max-w-3xl !p-8 print:shadow-none print:border-none">
        <div className="flex items-center justify-between border-b border-navy-100 pb-6">
          <Logo />
          <div className="text-right">
            <p className="text-xs text-navy-400">Report generated</p>
            <p className="text-sm font-medium text-navy-700">{formatDate(screening.createdAt)}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl bg-sand-100 p-5 sm:grid-cols-4">
          <div>
            <p className="text-xs text-navy-400">Patient</p>
            <p className="text-sm font-medium text-navy-800">{patient.name}</p>
          </div>
          <div>
            <p className="text-xs text-navy-400">Age / Gender</p>
            <p className="text-sm font-medium text-navy-800">{patient.age} · {patient.gender}</p>
          </div>
          <div>
            <p className="text-xs text-navy-400">Diabetes duration</p>
            <p className="text-sm font-medium text-navy-800">{patient.diabetesDuration}</p>
          </div>
          <div>
            <p className="text-xs text-navy-400">Reference ID</p>
            <p className="text-sm font-medium text-navy-800">{patient.referenceId}</p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-6 sm:flex-row">
          {retinalImage && (
            <div className="mx-auto h-40 w-40 shrink-0 overflow-hidden rounded-full ring-4 ring-navy-800/90 sm:mx-0">
              <img src={retinalImage.url} alt="Retinal scan" className="h-full w-full object-cover" />
            </div>
          )}
          <div className="flex-1 text-center sm:text-left">
            <p className="text-xs uppercase tracking-wide text-navy-400">AI Screening Result</p>
            <h2 className="mt-1 font-display text-xl text-navy-900">{result.severity}</h2>
            <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
              <Badge tone={riskTone(result.riskLevel)}>{result.riskLevel} risk</Badge>
              <Badge tone="navy">Confidence {result.confidence}%</Badge>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-navy-600">{result.patientFriendlyExplanation}</p>
          </div>
        </div>

        <div className="mt-6 rounded-xl bg-teal-50 p-4">
          <p className="text-sm font-medium text-teal-800">Recommended next step</p>
          <p className="mt-0.5 text-sm text-teal-700">{result.recommendedNextStep}</p>
        </div>

        {explanation && (
          <div className="mt-6">
            <p className="text-sm font-medium text-navy-800">Explainability summary</p>
            <p className="mt-1.5 text-sm leading-relaxed text-navy-600">{explanation.summary}</p>
            <ul className="mt-3 space-y-1.5">
              {explanation.features.map((f) => (
                <li key={f.id} className="flex justify-between text-sm text-navy-600">
                  <span>{f.label}</span>
                  <span className="font-medium text-navy-800">{f.confidence}%</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-8 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-navy-600">
          {result.disclaimer} This report is intended to support — not replace — evaluation by a
          qualified eye-care professional.
        </div>
      </Card>

      <p className="mt-4 max-w-3xl text-center text-xs text-navy-400 print:hidden">
        Report layout is ready to connect to a real PDF-generation service.
      </p>
    </DashboardLayout>
  );
}
