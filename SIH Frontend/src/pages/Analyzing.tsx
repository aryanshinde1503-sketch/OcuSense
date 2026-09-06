import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import ScreeningSteps from '../components/ScreeningSteps';
import Card from '../components/Card';
import { useScreeningFlow } from '../hooks/useScreeningFlow';
import { analyzeScreening } from '../services/screeningService';
import { Check, Loader2, ScanEye, Sparkles, Waves, FileSearch } from 'lucide-react';

const STAGES = [
  { label: 'Checking image quality', icon: ScanEye },
  { label: 'Detecting retinal features', icon: FileSearch },
  { label: 'Analyzing DR indicators', icon: Waves },
  { label: 'Generating explanation', icon: Sparkles },
];

export default function Analyzing() {
  const navigate = useNavigate();
  const { flow, setFlow } = useScreeningFlow();
  const [activeStage, setActiveStage] = useState(0);

  useEffect(() => {
    if (!flow.screeningId || !flow.retinalImage) {
      navigate('/screening/patient');
      return;
    }

    const stageInterval = setInterval(() => {
      setActiveStage((s) => Math.min(s + 1, STAGES.length));
    }, 700);

    analyzeScreening(flow.screeningId).then((result) => {
      setFlow((f) => ({ ...f, result }));
      setTimeout(() => {
        navigate('/screening/result');
      }, STAGES.length * 700 + 300);
    });

    return () => clearInterval(stageInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <DashboardLayout>
      <ScreeningSteps current={3} />
      <div className="mt-8 flex max-w-xl flex-col items-center text-center">
        <h1 className="font-display text-2xl text-navy-900">Analyzing your image</h1>
        <p className="mt-1 text-sm text-navy-500">This usually takes less than a minute.</p>

        <div className="relative mt-8 h-48 w-48 overflow-hidden rounded-full ring-4 ring-navy-800/90">
          <img src={flow.retinalImage?.url} alt="Retinal scan being analyzed" className="h-full w-full object-cover" />
          <div className="absolute inset-0 animate-pulse bg-gradient-to-b from-teal-400/0 via-teal-400/20 to-teal-400/0" />
        </div>

        <Card className="mt-8 w-full text-left">
          <ul className="space-y-4">
            {STAGES.map((stage, i) => {
              const done = i < activeStage;
              const active = i === activeStage;
              return (
                <li key={stage.label} className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      done ? 'bg-teal-500 text-white' : active ? 'bg-navy-800 text-white' : 'bg-sand-100 text-navy-400'
                    }`}
                  >
                    {done ? (
                      <Check className="h-4 w-4" />
                    ) : active ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <stage.icon className="h-4 w-4" />
                    )}
                  </div>
                  <span className={`text-sm ${done || active ? 'text-navy-800 font-medium' : 'text-navy-400'}`}>
                    {stage.label}
                  </span>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
    </DashboardLayout>
  );
}
