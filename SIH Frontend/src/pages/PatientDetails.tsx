import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import ScreeningSteps from '../components/ScreeningSteps';
import Card from '../components/Card';
import Button from '../components/Button';
import { useScreeningFlow } from '../hooks/useScreeningFlow';
import { createScreening } from '../services/screeningService';
import type { Gender } from '../types';
import { ArrowRight } from 'lucide-react';

export default function PatientDetails() {
  const navigate = useNavigate();
  const { setFlow } = useScreeningFlow();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    age: '',
    gender: 'Female' as Gender,
    diabetesDuration: '',
    referenceId: `DR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    notes: '',
  });

  const update = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const patient = {
      id: `p-${Date.now()}`,
      name: form.name,
      age: Number(form.age),
      gender: form.gender,
      diabetesDuration: form.diabetesDuration,
      referenceId: form.referenceId,
      notes: form.notes || undefined,
    };
    const screening = await createScreening(patient);
    setFlow((f) => ({ ...f, patient, screeningId: screening.id }));
    setSubmitting(false);
    navigate('/screening/upload');
  };

  return (
    <DashboardLayout>
      <ScreeningSteps current={1} />
      <div className="mt-8 max-w-xl">
        <h1 className="font-display text-2xl text-navy-900">Patient details</h1>
        <p className="mt-1 text-sm text-navy-500">
          Just enough information to keep this screening on record — nothing more.
        </p>

        <Card className="mt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-medium text-navy-700">Full name</label>
              <input
                required
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                placeholder="e.g. Asha Devi"
                className="mt-1.5 w-full rounded-xl border border-navy-100 px-4 py-2.5 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-navy-700">Age</label>
                <input
                  required
                  type="number"
                  min={1}
                  max={120}
                  value={form.age}
                  onChange={(e) => update('age', e.target.value)}
                  placeholder="54"
                  className="mt-1.5 w-full rounded-xl border border-navy-100 px-4 py-2.5 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-navy-700">Gender</label>
                <select
                  value={form.gender}
                  onChange={(e) => update('gender', e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-navy-100 px-4 py-2.5 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                >
                  {['Female', 'Male', 'Other', 'Prefer not to say'].map((g) => (
                    <option key={g}>{g}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-navy-700">Diabetes duration</label>
              <input
                required
                value={form.diabetesDuration}
                onChange={(e) => update('diabetesDuration', e.target.value)}
                placeholder="e.g. 5 years, or Newly diagnosed"
                className="mt-1.5 w-full rounded-xl border border-navy-100 px-4 py-2.5 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-navy-700">Patient / reference ID</label>
              <input
                value={form.referenceId}
                onChange={(e) => update('referenceId', e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-navy-100 px-4 py-2.5 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-navy-700">Additional information (optional)</label>
              <textarea
                value={form.notes}
                onChange={(e) => update('notes', e.target.value)}
                rows={3}
                placeholder="Any relevant symptoms or history"
                className="mt-1.5 w-full rounded-xl border border-navy-100 px-4 py-2.5 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
              />
            </div>

            <Button type="submit" disabled={submitting} className="w-full" icon={<ArrowRight className="h-4 w-4" />}>
              {submitting ? 'Saving…' : 'Continue to Upload Image'}
            </Button>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}
