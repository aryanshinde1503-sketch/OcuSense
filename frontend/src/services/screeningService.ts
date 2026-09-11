import type {
  Patient,
  Screening,
  ScreeningResult,
  RetinalImage,
  AIExplanation,
} from '../types';
import { mockHistory, currentPatient, SAMPLE_RETINA_IMG } from '../data/mockData';

// ---------------------------------------------------------------------------
// Mock service layer.
// Every function here returns a Promise so real API calls can replace the
// implementation later without changing any calling UI code.
// ---------------------------------------------------------------------------

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let screeningStore: Record<string, Screening> = {};
mockHistory.forEach((s) => (screeningStore[s.id] = s));

const predictionStore: Record<
  string,
  {
    severity: number;
    confidence: number;
    heatmapUrl: string;
    overlayUrl: string;
  }
> = {};

export async function getPatient(): Promise<Patient> {
  await delay(150);
  return currentPatient;
}

export async function createScreening(patient: Patient): Promise<Screening> {
  const response = await fetch(`${API_BASE_URL}/api/patients`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      diabetesDuration: patient.diabetesDuration,
      referenceId: patient.referenceId,
      notes: patient.notes,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to create patient');
  }

  const screening: Screening = {
    id: data.screening_id,
    patient: {
      ...patient,
      id: data.patient_id,
    },
    status: 'patient_details',
    createdAt: new Date().toISOString(),
  };

  screeningStore[screening.id] = screening;

  return screening;
}


const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:5001';

export async function uploadRetinalImage(
  screeningId: string,
  file: File,
  previewUrl?: string
): Promise<RetinalImage> {
  const formData = new FormData();

formData.append('image', file);
formData.append('screening_id', screeningId);

// const response = await fetch('https://striking-tranquility-production-5e49.up.railway.app/predict', {
const response = await fetch(`${API_BASE_URL}/predict`, {
// const response = await fetch('http://127.0.0.1:5000/predict', {
  method: 'POST',
  body: formData,
});

  if (!response.ok) {
  let message = 'Failed to upload image';

  try {
    const errorData = await response.json();
    message = errorData.message || message;
  } catch {
    // Keep default message if response is not JSON
  }

  throw new Error(message);
}

  const data = await response.json();

  console.log('Backend response:', data);

//   predictionStore[screeningId] = {
//   severity: Number(data.severity),
//   confidence: Number(data.confidence),
// };
predictionStore[screeningId] = {
  severity: Number(data.severity),
  confidence: Number(data.confidence),
  heatmapUrl: data.heatmap_url,
  overlayUrl: data.overlay_url,
};

  const image: RetinalImage = {
  id: `img-${screeningId}`,
  url: previewUrl || URL.createObjectURL(file),
  fileName: file.name,
  uploadedAt: new Date().toISOString(),
  qualityScore: Number(data.blur_score),
  qualityLabel: data.image_quality,
};

  const screening = screeningStore[screeningId];

  if (screening) {
    screening.retinalImage = image;
    screening.status = 'image_uploaded';
  }

  return image;
}

export async function validateRetinalImage(
  file: File
): Promise<{
  valid: boolean;
  imageQuality: string;
  blurScore?: number;
  message: string;
}> {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`${API_BASE_URL}/api/validate-image`, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to validate image');
  }

  return {
    valid: Boolean(data.valid),
    imageQuality: data.image_quality,
    blurScore: data.blur_score,
    message: data.message,
  };
}

export async function analyzeScreening(
  screeningId: string
): Promise<ScreeningResult> {
  const prediction = predictionStore[screeningId];

  if (!prediction) {
    throw new Error('No prediction found for this screening');
  }

  const severityLabels: ScreeningResult['severity'][] = [
    'No Diabetic Retinopathy',
    'Mild Non-Proliferative Diabetic Retinopathy',
    'Moderate Non-Proliferative Diabetic Retinopathy',
    'Severe Non-Proliferative Diabetic Retinopathy',
    'Proliferative Diabetic Retinopathy',
  ];

  const riskLevels: ScreeningResult['riskLevel'][] = [
    'Low',
    'Moderate',
    'Moderate',
    'High',
    'Urgent',
  ];

  const explanations = [
    'The AI did not detect signs of diabetic retinopathy in this image.',
    'The AI detected signs consistent with mild diabetic retinopathy.',
    'The AI detected signs consistent with moderate diabetic retinopathy.',
    'The AI detected signs consistent with severe diabetic retinopathy.',
    'The AI detected signs consistent with proliferative diabetic retinopathy.',
  ];

  const nextSteps = [
    'Continue regular eye screening as recommended by an eye-care professional.',
    'Schedule a check-up with an eye-care professional within 3 months.',
    'Schedule a comprehensive eye examination with an eye-care professional soon.',
    'Arrange an eye-care professional evaluation as soon as possible.',
    'Seek prompt evaluation by an eye-care professional.',
  ];

  const result: ScreeningResult = {
    id: `res-${screeningId}`,
    screeningId,
    severity: severityLabels[prediction.severity],
    confidence: Number(prediction.confidence.toFixed(2)),
    riskLevel: riskLevels[prediction.severity],
    patientFriendlyExplanation: explanations[prediction.severity],
    recommendedNextStep: nextSteps[prediction.severity],
    disclaimer: 'AI-assisted screening result — not a medical diagnosis.',
  };

  const screening = screeningStore[screeningId];

  if (screening) {
    screening.result = result;
    screening.status = 'completed';
  }

  return result;
}

export async function getScreeningResult(screeningId: string): Promise<ScreeningResult | undefined> {
  await delay(150);
  return screeningStore[screeningId]?.result;
}


export async function getExplanation(
  screeningId: string
): Promise<AIExplanation> {
  const prediction = predictionStore[screeningId];
  const screening = screeningStore[screeningId];

  if (!prediction || !screening) {
    throw new Error('No explanation data found for this screening');
  }

  const grade = prediction.severity;

  const gradeSummaries = [
    'The AI prediction is consistent with no visible signs of diabetic retinopathy.',
    'The AI prediction is consistent with early diabetic retinopathy changes.',
    'The AI prediction is consistent with moderate diabetic retinopathy changes.',
    'The AI prediction is consistent with severe non-proliferative diabetic retinopathy changes.',
    'The AI prediction is consistent with proliferative diabetic retinopathy changes.',
  ];

  const gradeFeatures: AIExplanation['features'][] = [
    [
      {
        id: 'retinal-appearance',
        label: 'Retinal appearance',
        description:
          'The retina appears largely free of patterns associated with diabetic retinopathy.',
        confidence: 94,
        region: { x: 50, y: 50, radius: 12 },
      },
      {
        id: 'vessel-pattern',
        label: 'Vessel pattern',
        description:
          'The visible retinal vessels do not show strong patterns associated with advanced diabetic changes.',
        confidence: 91,
        region: { x: 35, y: 40, radius: 10 },
      },
      {
        id: 'abnormal-regions',
        label: 'Abnormal regions',
        description:
          'No strong lesion-like regions were prioritized by the model.',
        confidence: 88,
        region: { x: 62, y: 55, radius: 9 },
      },
      {
        id: 'overall-evidence',
        label: 'Overall evidence',
        description:
          'The strongest model evidence supports the lowest severity category.',
        confidence: 93,
        region: { x: 50, y: 50, radius: 15 },
      },
    ],

    [
      {
        id: 'early-abnormal-regions',
        label: 'Early abnormal regions',
        description:
          'Small localized regions contributed to the prediction of early diabetic retinal changes.',
        confidence: 84,
        region: { x: 55, y: 45, radius: 8 },
      },
      {
        id: 'mild-vessel-pattern',
        label: 'Vessel pattern',
        description:
          'Subtle vascular changes contributed to the model prediction.',
        confidence: 79,
        region: { x: 38, y: 42, radius: 9 },
      },
      {
        id: 'retinal-texture',
        label: 'Retinal texture',
        description:
          'Localized texture changes increased the likelihood of mild disease.',
        confidence: 76,
        region: { x: 64, y: 58, radius: 8 },
      },
      {
        id: 'mild-overall-evidence',
        label: 'Overall evidence',
        description:
          'The combined evidence supports the mild severity category.',
        confidence: 82,
        region: { x: 50, y: 50, radius: 13 },
      },
    ],

    [
      {
        id: 'microaneurysm-regions',
        label: 'Microaneurysm-like regions',
        description:
          'Small localized regions contributed strongly to the moderate-grade prediction.',
        confidence: 91,
        region: { x: 55, y: 48, radius: 7 },
      },
      {
        id: 'hemorrhage-regions',
        label: 'Hemorrhage-like regions',
        description:
          'Irregular darker regions contributed to the model evidence.',
        confidence: 78,
        region: { x: 40, y: 60, radius: 8 },
      },
      {
        id: 'exudate-regions',
        label: 'Exudate-like regions',
        description:
          'Bright localized regions contributed additional evidence to the prediction.',
        confidence: 66,
        region: { x: 65, y: 45, radius: 9 },
      },
      {
        id: 'moderate-overall-evidence',
        label: 'Overall evidence',
        description:
          'The combined retinal evidence supports the moderate severity category.',
        confidence: 87,
        region: { x: 50, y: 50, radius: 15 },
      },
    ],

    [
      {
        id: 'severe-hemorrhage-regions',
        label: 'Hemorrhage-like regions',
        description:
          'Larger or more prominent abnormal regions contributed strongly to the severe-grade prediction.',
        confidence: 92,
        region: { x: 42, y: 58, radius: 10 },
      },
      {
        id: 'vascular-changes',
        label: 'Vascular changes',
        description:
          'The retinal vessel pattern contributed substantial evidence to the prediction.',
        confidence: 88,
        region: { x: 35, y: 42, radius: 10 },
      },
      {
        id: 'abnormal-retinal-regions',
        label: 'Abnormal retinal regions',
        description:
          'Multiple localized abnormalities influenced the model strongly.',
        confidence: 85,
        region: { x: 65, y: 55, radius: 10 },
      },
      {
        id: 'severe-overall-evidence',
        label: 'Overall evidence',
        description:
          'The combined evidence supports the severe non-proliferative category.',
        confidence: 90,
        region: { x: 50, y: 50, radius: 16 },
      },
    ],

    [
      {
        id: 'advanced-abnormal-regions',
        label: 'Advanced abnormal regions',
        description:
          'Multiple prominent retinal abnormalities contributed strongly to the prediction.',
        confidence: 95,
        region: { x: 60, y: 48, radius: 11 },
      },
      {
        id: 'vascular-abnormalities',
        label: 'Vascular abnormalities',
        description:
          'The vascular pattern contributed substantial evidence for advanced disease.',
        confidence: 93,
        region: { x: 38, y: 45, radius: 11 },
      },
      {
        id: 'high-risk-retinal-regions',
        label: 'High-risk retinal regions',
        description:
          'High-impact abnormal regions were prioritized by the model.',
        confidence: 91,
        region: { x: 55, y: 65, radius: 10 },
      },
      {
        id: 'proliferative-overall-evidence',
        label: 'Overall evidence',
        description:
          'The combined evidence supports the proliferative severity category.',
        confidence: 94,
        region: { x: 50, y: 50, radius: 17 },
      },
    ],
  ];

  const explanation: AIExplanation = {
    id: `exp-${screeningId}`,
    screeningId,
    originalImage: screening.retinalImage?.url || SAMPLE_RETINA_IMG,
    heatmapImage: prediction.heatmapUrl,
    overlayImage: prediction.overlayUrl,
    summary: gradeSummaries[grade],
    features: gradeFeatures[grade] ?? [],
    disclaimer:
      'Highlighted regions show areas that influenced the AI prediction. They do not independently confirm disease.',
  };

  screening.explanation = explanation;

  return explanation;
}
export async function getScreeningHistory(): Promise<Screening[]> {
  await delay(200);
  return Object.values(screeningStore).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getScreeningById(screeningId: string): Promise<Screening | undefined> {
  await delay(150);
  return screeningStore[screeningId];
}

export async function generateReport(screeningId: string): Promise<Screening | undefined> {
  await delay(150);
  return screeningStore[screeningId];
}
