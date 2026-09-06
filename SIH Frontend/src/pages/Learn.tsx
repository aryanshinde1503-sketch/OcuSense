import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Card from '../components/Card';
import { ChevronDown } from 'lucide-react';

const SECTIONS = [
  {
    q: 'What is diabetic retinopathy?',
    a: 'Diabetic retinopathy is an eye condition that can develop when high blood sugar damages the small blood vessels in the retina, the light-sensing layer at the back of the eye. Left unchecked, it can affect vision over time.',
  },
  {
    q: 'What are the stages?',
    a: 'It progresses from mild to moderate to severe non-proliferative stages, based on how many small vessel changes are visible, and can advance to a proliferative stage where new, fragile vessels start to grow.',
  },
  {
    q: 'Why does screening matter?',
    a: 'Diabetic retinopathy often has no symptoms in its early stages. Regular screening helps catch changes before they affect vision, when treatment options are most effective.',
  },
  {
    q: 'How are retinal images used?',
    a: 'A fundus camera captures a photo of the retina. Eye-care professionals — and tools like DR-Screen — examine this image for patterns associated with vessel damage.',
  },
  {
    q: 'How does AI help?',
    a: 'AI models can review large numbers of images quickly and consistently, helping flag scans that may need a closer look from a professional — especially useful where specialists are scarce.',
  },
  {
    q: 'Why does explainability matter?',
    a: 'A prediction without reasoning is hard to trust. By showing which regions of an image influenced its result, DR-Screen lets patients and health workers understand — and question — the AI\u2019s output.',
  },
  {
    q: 'When should I consult an eye-care professional?',
    a: 'Any AI-assisted result — regardless of risk level — should be followed up with a qualified eye-care professional for a full, confirmed evaluation, especially if you notice any change in your vision.',
  },
];

export default function Learn() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="bg-sand-50">
      <Navbar />
      <section className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="font-display text-3xl text-navy-900">Understanding diabetic retinopathy</h1>
        <p className="mt-3 text-navy-600">
          A short guide to the condition DR-Screen helps detect, and how AI fits into eye care.
        </p>

        <div className="mt-10 space-y-3">
          {SECTIONS.map((s, i) => (
            <Card key={s.q} padded={false} className="overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left"
              >
                <span className="font-medium text-navy-800">{s.q}</span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-navy-400 transition-transform ${open === i ? 'rotate-180' : ''}`}
                />
              </button>
              {open === i && (
                <div className="px-6 pb-5 text-sm leading-relaxed text-navy-600">{s.a}</div>
              )}
            </Card>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
}
