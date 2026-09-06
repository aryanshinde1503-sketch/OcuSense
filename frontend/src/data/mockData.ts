import type { Screening, DetectedFeature } from '../types';

// A local sample fundus-style placeholder built with CSS/SVG (see utils/placeholderImage.ts),
// referenced everywhere a "retinal image" is needed for mock data.
export const SAMPLE_RETINA_IMG = '/sample-retina.svg';

export const mockFeatures: DetectedFeature[] = [
  {
    id: 'f1',
    label: 'Microaneurysm-like regions',
    description:
      'Small round dots detected near the central retina, a common early sign of blood vessel changes.',
    confidence: 91,
    region: { x: 38, y: 44, radius: 6 },
  },
  {
    id: 'f2',
    label: 'Hemorrhage-like regions',
    description:
      'Small areas of irregular pigmentation consistent with minor bleeding beneath the retinal surface.',
    confidence: 78,
    region: { x: 62, y: 58, radius: 8 },
  },
  {
    id: 'f3',
    label: 'Exudate-like regions',
    description:
      'Bright, well-defined patches that may indicate fluid or fat leakage from damaged vessels.',
    confidence: 66,
    region: { x: 55, y: 30, radius: 5 },
  },
  {
    id: 'f4',
    label: 'Other retinal irregularities',
    description: 'Minor texture variation near the vascular arcade, flagged for reference.',
    confidence: 41,
    region: { x: 28, y: 66, radius: 5 },
  },
];

export const mockHistory: Screening[] = [
  {
    id: 'scr-1042',
    createdAt: '2026-08-22T09:15:00Z',
    status: 'completed',
    patient: {
      id: 'p-1',
      name: 'Asha Devi',
      age: 54,
      gender: 'Female',
      diabetesDuration: '9 years',
      referenceId: 'DR-2026-1042',
    },
    retinalImage: {
      id: 'img-1042',
      url: SAMPLE_RETINA_IMG,
      fileName: 'left_eye.jpg',
      uploadedAt: '2026-08-22T09:10:00Z',
      qualityScore: 88,
      qualityLabel: 'Good',
    },
    result: {
      id: 'res-1042',
      screeningId: 'scr-1042',
      severity: 'Mild Non-Proliferative Diabetic Retinopathy',
      confidence: 92,
      riskLevel: 'Moderate',
      patientFriendlyExplanation:
        'The AI found a few early signs of change in the small blood vessels of your eye. This is common in the early stages and is worth monitoring.',
      recommendedNextStep: 'Schedule a check-up with an eye-care professional within 3 months.',
      disclaimer: 'AI-assisted screening result — not a medical diagnosis.',
    },
  },
  {
    id: 'scr-0981',
    createdAt: '2026-07-02T11:40:00Z',
    status: 'completed',
    patient: {
      id: 'p-1',
      name: 'Asha Devi',
      age: 54,
      gender: 'Female',
      diabetesDuration: '9 years',
      referenceId: 'DR-2026-0981',
    },
    retinalImage: {
      id: 'img-0981',
      url: SAMPLE_RETINA_IMG,
      fileName: 'left_eye.jpg',
      uploadedAt: '2026-07-02T11:35:00Z',
      qualityScore: 81,
      qualityLabel: 'Good',
    },
    result: {
      id: 'res-0981',
      screeningId: 'scr-0981',
      severity: 'No Diabetic Retinopathy',
      confidence: 96,
      riskLevel: 'Low',
      patientFriendlyExplanation:
        'No signs of diabetic retinopathy were detected. Your retina appeared healthy in this screening.',
      recommendedNextStep: 'Continue routine annual screening.',
      disclaimer: 'AI-assisted screening result — not a medical diagnosis.',
    },
  },
  {
    id: 'scr-0873',
    createdAt: '2026-05-14T08:05:00Z',
    status: 'completed',
    patient: {
      id: 'p-1',
      name: 'Asha Devi',
      age: 54,
      gender: 'Female',
      diabetesDuration: '9 years',
      referenceId: 'DR-2026-0873',
    },
    retinalImage: {
      id: 'img-0873',
      url: SAMPLE_RETINA_IMG,
      fileName: 'right_eye.jpg',
      uploadedAt: '2026-05-14T08:00:00Z',
      qualityScore: 74,
      qualityLabel: 'Fair',
    },
    result: {
      id: 'res-0873',
      screeningId: 'scr-0873',
      severity: 'Mild Non-Proliferative Diabetic Retinopathy',
      confidence: 87,
      riskLevel: 'Moderate',
      patientFriendlyExplanation:
        'A small number of early changes were detected. Your care team recommended a routine follow-up.',
      recommendedNextStep: 'Re-screen in 6 months or sooner if vision changes occur.',
      disclaimer: 'AI-assisted screening result — not a medical diagnosis.',
    },
  },
];

export const currentPatient = mockHistory[0].patient;
