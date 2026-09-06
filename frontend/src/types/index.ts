export type Gender = 'Female' | 'Male' | 'Other' | 'Prefer not to say';

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  diabetesDuration: string; // e.g. "5 years", "Newly diagnosed"
  notes?: string;
  referenceId: string;
}

export type RiskLevel = 'Low' | 'Moderate' | 'High' | 'Urgent';

export type DRSeverity =
  | 'No Diabetic Retinopathy'
  | 'Mild Non-Proliferative Diabetic Retinopathy'
  | 'Moderate Non-Proliferative Diabetic Retinopathy'
  | 'Severe Non-Proliferative Diabetic Retinopathy'
  | 'Proliferative Diabetic Retinopathy';

export interface RetinalImage {
  id: string;
  url: string;
  fileName: string;
  uploadedAt: string;
  qualityScore: number; // 0-100
  qualityLabel: 'Poor' | 'Fair' | 'Good' | 'Excellent';
}

export interface DetectedFeature {
  id: string;
  label: string;
  description: string;
  confidence: number; // 0-100
  region: { x: number; y: number; radius: number }; // percentage-based, for heatmap markers
}

export interface AIExplanation {
  id: string;
  screeningId: string;
  originalImage: string;
  heatmapImage: string;
  overlayImage: string;
  summary: string;
  features: DetectedFeature[];
  disclaimer: string;
}

export interface ScreeningResult {
  id: string;
  screeningId: string;
  severity: DRSeverity;
  confidence: number; // 0-100
  riskLevel: RiskLevel;
  patientFriendlyExplanation: string;
  recommendedNextStep: string;
  disclaimer: string;
}

export type ScreeningStatus =
  | 'patient_details'
  | 'image_uploaded'
  | 'analyzing'
  | 'completed';

export interface Screening {
  id: string;
  patient: Patient;
  status: ScreeningStatus;
  createdAt: string;
  retinalImage?: RetinalImage;
  result?: ScreeningResult;
  explanation?: AIExplanation;
}
