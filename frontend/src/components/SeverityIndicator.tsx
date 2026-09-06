import type { DRSeverity, RiskLevel } from '../types';

const SEVERITY_SCALE: Record<DRSeverity, number> = {
  'No Diabetic Retinopathy': 0,
  'Mild Non-Proliferative Diabetic Retinopathy': 1,
  'Moderate Non-Proliferative Diabetic Retinopathy': 2,
  'Severe Non-Proliferative Diabetic Retinopathy': 3,
  'Proliferative Diabetic Retinopathy': 4,
};

const RISK_COLOR: Record<RiskLevel, string> = {
  Low: '#0f9b8e',
  Moderate: '#d98c2b',
  High: '#d9634f',
  Urgent: '#b3382a',
};

export default function SeverityIndicator({
  severity,
  risk,
}: {
  severity: DRSeverity;
  risk: RiskLevel;
}) {
  const level = SEVERITY_SCALE[severity];
  const color = RISK_COLOR[risk];
  return (
    <div>
      <div className="flex gap-1.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-2 flex-1 rounded-full"
            style={{ background: i <= level ? color : '#eef2f7' }}
          />
        ))}
      </div>
      <div className="mt-1.5 flex justify-between text-[11px] text-navy-400">
        <span>None</span>
        <span>Proliferative</span>
      </div>
    </div>
  );
}
