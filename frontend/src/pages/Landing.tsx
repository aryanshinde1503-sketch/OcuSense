import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Button from '../components/Button';
import Card from '../components/Card';
import {
  ArrowRight,
  ScanEye,
  BrainCircuit,
  Sparkles,
  Wifi,
  Smartphone,
  MapPinned,
  ShieldCheck,
  UserCheck,
  FileLock2,
} from 'lucide-react';

const STEPS = [
  {
    title: 'Upload',
    desc: 'Take or upload a retinal photo taken with a fundus camera at a local clinic or health worker visit.',
    icon: ScanEye,
  },
  {
    title: 'Analyze',
    desc: 'The AI model checks the image for signs associated with diabetic retinopathy in under a minute.',
    icon: BrainCircuit,
  },
  {
    title: 'Understand',
    desc: 'See a plain-language result along with a visual explanation of what the AI noticed and why.',
    icon: Sparkles,
  },
];

const ACCESS_POINTS = [
  {
    icon: Wifi,
    title: 'Works with limited connectivity',
    desc: 'Designed for low-bandwidth clinics — screenings sync when a connection is available.',
  },
  {
    icon: Smartphone,
    title: 'Simple enough for any device',
    desc: 'A clean, guided flow that a first-time smartphone user or health worker can follow unaided.',
  },
  {
    icon: MapPinned,
    title: 'Built for community health camps',
    desc: 'Fast enough to screen many patients in a single rural outreach visit.',
  },
];

const TRUST_POINTS = [
  {
    icon: ShieldCheck,
    title: 'Decision support, not diagnosis',
    desc: 'DR-Screen flags patterns for a professional to review — it never replaces clinical judgement.',
  },
  {
    icon: UserCheck,
    title: 'Always human in the loop',
    desc: 'Every result recommends a next step involving a qualified eye-care professional.',
  },
  {
    icon: FileLock2,
    title: 'Transparent by design',
    desc: 'Every prediction comes with a visual explanation of the regions that influenced it.',
  },
];

export default function Landing() {
  const navigate = useNavigate();
  return (
    <div className="bg-sand-50">
      <Navbar />

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-teal-100 bg-teal-50 px-3.5 py-1.5 text-xs font-medium text-teal-700">
            Smart India Hackathon 2026 · SIH26038
          </span>
          <h1 className="mt-5 font-display text-[2.75rem] leading-[1.08] text-navy-900 sm:text-5xl lg:text-[3.4rem]">
            Eye screening for diabetic retinopathy, explained in plain language.
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-navy-600">
            DR-Screen looks at a retinal photo, flags early signs of diabetic eye disease, and
            shows exactly which regions influenced the result — so patients and health workers
            understand the &ldquo;why,&rdquo; not just the answer.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button size="lg" icon={<ArrowRight className="h-4.5 w-4.5" />} onClick={() => navigate('/screening/patient')}>
              Start Screening
            </Button>
            <a href="#how-it-works">
              <Button size="lg" variant="outline">
                How It Works
              </Button>
            </a>
          </div>
          <p className="mt-6 text-sm text-navy-400">
            AI-assisted screening result — not a medical diagnosis.
          </p>
        </div>

        <div className="relative mx-auto w-full max-w-sm">
          <div className="relative aspect-square overflow-hidden rounded-[2.5rem] bg-navy-900 shadow-card ring-1 ring-navy-800">
            <img
              src="/sample-retina.svg"
              alt="Sample retinal scan analyzed by DR-Screen"
              className="h-full w-full object-cover opacity-90"
            />
            <div
              className="absolute h-24 w-24 rounded-full blur-2xl"
              style={{ left: '34%', top: '40%', background: 'radial-gradient(circle, rgba(255,120,60,0.75), rgba(255,120,60,0))' }}
            />
            <div
              className="absolute h-20 w-20 rounded-full blur-2xl"
              style={{ left: '58%', top: '55%', background: 'radial-gradient(circle, rgba(255,190,60,0.6), rgba(255,190,60,0))' }}
            />
          </div>
          <Card className="absolute -bottom-6 -left-6 w-52 !p-4">
            <p className="text-xs text-navy-400">AI Screening Result</p>
            <p className="mt-1 font-display text-base text-navy-800">Mild NPDR detected</p>
            <div className="mt-2 flex items-center gap-2">
              <div className="h-1.5 flex-1 rounded-full bg-navy-100">
                <div className="h-1.5 w-[92%] rounded-full bg-teal-500" />
              </div>
              <span className="text-xs font-medium text-teal-600">92%</span>
            </div>
          </Card>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-navy-100/70 bg-white py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-xl">
            <h2 className="font-display text-3xl text-navy-900">How screening works</h2>
            <p className="mt-3 text-navy-600">
              Three steps, guided from start to finish — no medical background required.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <Card key={s.title} className="relative">
                <span className="font-display text-3xl text-teal-100">{`0${i + 1}`}</span>
                <div className="mt-3 flex h-11 w-11 items-center justify-center rounded-xl bg-navy-800 text-white">
                  <s.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-xl text-navy-800">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-600">{s.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Explainable AI preview */}
      <section className="py-20">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 lg:grid-cols-2">
          <div>
            <span className="text-sm font-medium text-teal-600">The key difference</span>
            <h2 className="mt-2 font-display text-3xl text-navy-900">
              An AI that shows its reasoning, not just its verdict.
            </h2>
            <p className="mt-4 leading-relaxed text-navy-600">
              Instead of a black-box score, DR-Screen highlights the exact regions of the retina
              that influenced its prediction — microaneurysm-like dots, small hemorrhages, and
              irregular patches — with a confidence level for each.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-navy-700">
              {['Original, AI-explanation, and overlay views', 'Feature-level confidence scores', 'Written in language patients can understand'].map(
                (item) => (
                  <li key={item} className="flex items-center gap-2.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                    {item}
                  </li>
                )
              )}
            </ul>
            <Link to="/screening/patient" className="mt-6 inline-flex">
              <Button variant="outline" icon={<ArrowRight className="h-4 w-4" />}>
                See it in a screening
              </Button>
            </Link>
          </div>
          <div className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-[2.5rem] bg-navy-900 shadow-card">
            <img src="/sample-retina.svg" alt="AI explanation heatmap preview" className="h-full w-full object-cover" style={{ mixBlendMode: 'normal' }} />
            <div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(circle at 38% 44%, rgba(255,90,60,0.65), transparent 22%), radial-gradient(circle at 62% 58%, rgba(255,190,60,0.5), transparent 20%), radial-gradient(circle at 55% 30%, rgba(255,150,60,0.4), transparent 18%)',
                mixBlendMode: 'screen',
              }}
            />
          </div>
        </div>
      </section>

      {/* Rural accessibility */}
      <section className="border-y border-navy-100/70 bg-navy-800 py-20 text-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-xl">
            <h2 className="font-display text-3xl">Built for rural accessibility</h2>
            <p className="mt-3 text-navy-200">
              Designed so screening camps in low-resource settings can reach more patients, faster.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {ACCESS_POINTS.map((p) => (
              <div key={p.title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-500/20 text-teal-300">
                  <p.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg text-white">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-200">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & safety */}
      <section id="trust" className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-xl">
            <h2 className="font-display text-3xl text-navy-900">Safety comes first</h2>
            <p className="mt-3 text-navy-600">
              DR-Screen supports clinical decisions — it never makes them on its own.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {TRUST_POINTS.map((p) => (
              <Card key={p.title}>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                  <p.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-xl text-navy-800">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-600">{p.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
