import { createReferral } from '../services/referralService';
// import { useEffect } from 'react';
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import ScreeningSteps from '../components/ScreeningSteps';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge, { riskTone } from '../components/Badge';
import SeverityIndicator from '../components/SeverityIndicator';
import RetinalImageViewer from '../components/RetinalImageViewer';
import { useScreeningFlow } from '../hooks/useScreeningFlow';
import { AlertCircle, ArrowRight, Eye, FileText, LayoutDashboard } from 'lucide-react';

export default function Result() {
  const navigate = useNavigate();
  const { flow } = useScreeningFlow();

  const [referralLoading, setReferralLoading] = useState(false);
  const [referral, setReferral] = useState<{
    referral_id: number;
    patient_id: string;
    status: string;
  } | null>(null);
  const [referralError, setReferralError] = useState<string | null>(null);

  useEffect(() => {
    if (!flow.result || !flow.retinalImage) navigate('/screening/patient');
  }, [flow.result, flow.retinalImage, navigate]);

  if (!flow.result || !flow.retinalImage) return null;
  const { result, retinalImage } = flow;

    const handleCreateReferral = async () => {
    if (!flow.screeningId) {
      setReferralError('Screening ID is missing.');
      return;
    }

    setReferralLoading(true);
    setReferralError(null);

    try {
      const data = await createReferral({
        patient_id: flow.patient?.id ?? '',
        screening_id: flow.screeningId,
        dr_grade: Number(result.severity.match(/\d+/)?.[0] ?? 0),
        risk_level: result.riskLevel,
        referral_center: 'District Eye Care Center',
        referral_date: new Date().toISOString().split('T')[0],
      });

      setReferral(data);
    } catch (error) {
      setReferralError(
        error instanceof Error
          ? error.message
          : 'Failed to create referral.'
      );
    } finally {
      setReferralLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <ScreeningSteps current={4} />
      <div className="mt-8 max-w-2xl">
        <h1 className="font-display text-2xl text-navy-900">AI Screening Result</h1>
        <p className="mt-1 text-sm text-navy-500">Screening for {flow.patient?.name}</p>

        <Card className="mt-6">
          <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-start sm:text-left">
            <RetinalImageViewer image={retinalImage} />
            <div className="flex-1">
              <Badge tone={riskTone(result.riskLevel)}>{result.riskLevel} risk</Badge>
              <h2 className="mt-3 font-display text-xl text-navy-900">{result.severity}</h2>
              <p className="mt-1 text-sm text-navy-500">AI confidence: {result.confidence}%</p>
              <div className="mt-4">
                <SeverityIndicator severity={result.severity} risk={result.riskLevel} />
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-xl bg-sand-100 p-4">
            <p className="text-sm leading-relaxed text-navy-700">{result.patientFriendlyExplanation}</p>
          </div>

          <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-teal-50 p-4">
            <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
            <div>
              <p className="text-sm font-medium text-teal-800">Recommended next step</p>
              <p className="mt-0.5 text-sm text-teal-700">{result.recommendedNextStep}</p>
            </div>
          </div>
          
          {result.riskLevel !== 'Low' && (
          <div className="mt-4">
            {!referral ? (
              <Button
                className="w-full"
                onClick={handleCreateReferral}
                disabled={referralLoading}
              >
                {referralLoading ? 'Creating Referral…' : 'Create Referral'}
              </Button>
            ) : (
              <div className="rounded-xl bg-teal-50 p-4">
                <p className="font-medium text-teal-800">
                  Referral created successfully
                </p>
                <p className="mt-1 text-sm text-teal-700">
                  Patient ID: {referral.patient_id}
                </p>
                <p className="text-sm text-teal-700">
                  Referral ID: {referral.referral_id}
                </p>
                <p className="text-sm text-teal-700">
                  Status: {referral.status}
                </p>
              </div>
            )}

            {referralError && (
              <p className="mt-2 text-sm text-red-600">
                {referralError}
              </p>
            )}
          </div>
        )}

          <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
            <p className="text-sm text-navy-600">
              {result.disclaimer} Please consult a qualified eye-care professional for an official
              diagnosis.
            </p>
          </div>
        </Card>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Link to="/screening/explanation">
            <Button className="w-full" icon={<Eye className="h-4 w-4" />} iconPosition="left">
              View AI Explanation
            </Button>
          </Link>
          <Link to="/report/latest">
            <Button className="w-full" variant="outline" icon={<FileText className="h-4 w-4" />} iconPosition="left">
              View Report
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button className="w-full" variant="ghost" icon={<LayoutDashboard className="h-4 w-4" />} iconPosition="left">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
