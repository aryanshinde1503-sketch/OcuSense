import { Check } from 'lucide-react';

const STEPS = ['Patient Details', 'Upload Image', 'AI Analysis', 'Result', 'Explanation'];

export default function ScreeningSteps({ current }: { current: number }) {
  return (
    <div className="flex items-center w-full overflow-x-auto pb-1">
      {STEPS.map((step, i) => {
        const stepNum = i + 1;
        const isDone = stepNum < current;
        const isActive = stepNum === current;
        return (
          <div key={step} className="flex items-center flex-1 min-w-[92px] last:flex-none">
            <div className="flex flex-col items-center gap-1.5 shrink-0">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium border transition-colors ${
                  isDone
                    ? 'bg-teal-500 border-teal-500 text-white'
                    : isActive
                    ? 'bg-navy-800 border-navy-800 text-white'
                    : 'bg-white border-navy-100 text-navy-400'
                }`}
              >
                {isDone ? <Check className="h-4 w-4" /> : stepNum}
              </div>
              <span
                className={`text-xs whitespace-nowrap ${
                  isActive ? 'text-navy-800 font-medium' : 'text-navy-400'
                }`}
              >
                {step}
              </span>
            </div>
            {stepNum !== STEPS.length && (
              <div
                className={`h-px flex-1 mx-2 mb-4 ${isDone ? 'bg-teal-500' : 'bg-navy-100'}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
