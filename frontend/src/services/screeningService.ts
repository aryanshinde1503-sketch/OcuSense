import type {
  Patient,
  Screening,
  ScreeningResult,
  RetinalImage,
  AIExplanation,
} from '../types';
import { mockFeatures, mockHistory, currentPatient, SAMPLE_RETINA_IMG } from '../data/mockData';

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
  await delay(250);
  const id = `scr-${Math.floor(1000 + Math.random() * 9000)}`;
  const screening: Screening = {
    id,
    patient,
    status: 'patient_details',
    createdAt: new Date().toISOString(),
  };
  screeningStore[id] = screening;
  return screening;
}

// export async function uploadRetinalImage(
//   screeningId: string,
//   fileName: string,
//   previewUrl?: string
// ): Promise<RetinalImage> {
//   await delay(400);
//   const image: RetinalImage = {
//     id: `img-${screeningId}`,
//     url: previewUrl || SAMPLE_RETINA_IMG,
//     fileName,
//     uploadedAt: new Date().toISOString(),
//     qualityScore: 82,
//     qualityLabel: 'Good',
//   };
//   const screening = screeningStore[screeningId];
//   if (screening) {
//     screening.retinalImage = image;
//     screening.status = 'image_uploaded';
//   }
//   return image;
// }
const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:5000';

export async function uploadRetinalImage(
  screeningId: string,
  file: File,
  previewUrl?: string
): Promise<RetinalImage> {
  const formData = new FormData();
formData.append('image', file);

// const response = await fetch('https://striking-tranquility-production-5e49.up.railway.app/predict', {
const response = await fetch(`${API_BASE_URL}/predict`, {
// const response = await fetch('http://127.0.0.1:5000/predict', {
  method: 'POST',
  body: formData,
});

  if (!response.ok) {
    throw new Error('Failed to upload image');
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
    qualityScore: 82,
    qualityLabel: 'Good',
  };

  const screening = screeningStore[screeningId];

  if (screening) {
    screening.retinalImage = image;
    screening.status = 'image_uploaded';
  }

  return image;
}

// export async function analyzeScreening(screeningId: string): Promise<ScreeningResult> {
//   await delay(300);
//   const result: ScreeningResult = {
//     id: `res-${screeningId}`,
//     screeningId,
//     severity: 'Mild Non-Proliferative Diabetic Retinopathy',
//     confidence: 92,
//     riskLevel: 'Moderate',
//     patientFriendlyExplanation:
//       'The AI found a few early signs of change in the small blood vessels of your eye. This is common in early stages and is worth monitoring with a specialist.',
//     recommendedNextStep: 'Schedule a check-up with an eye-care professional within 3 months.',
//     disclaimer: 'AI-assisted screening result — not a medical diagnosis.',
//   };
//   const screening = screeningStore[screeningId];
//   if (screening) {
//     screening.result = result;
//     screening.status = 'completed';
//   }
//   return result;
// }
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

// export async function getExplanation(screeningId: string): Promise<AIExplanation> {
//   await delay(200);
//   const explanation: AIExplanation = {
//     id: `exp-${screeningId}`,
//     screeningId,
//     originalImage: SAMPLE_RETINA_IMG,
//     heatmapImage: SAMPLE_RETINA_IMG,
//     overlayImage: SAMPLE_RETINA_IMG,
//     summary:
//       'The AI focused mainly on the central and lower-right areas of the retina, where small dot-like and irregular patterns resemble early diabetic changes. These regions carried the most weight in the prediction.',
//     features: mockFeatures,
//     disclaimer:
//       'Highlighted regions show areas that influenced the AI prediction. They do not independently confirm disease.',
//   };
//   const screening = screeningStore[screeningId];
//   if (screening) {
//     screening.explanation = explanation;
//   }
//   return explanation;
// }
export async function getExplanation(
  screeningId: string
): Promise<AIExplanation> {
  const prediction = predictionStore[screeningId];
  const screening = screeningStore[screeningId];

  if (!prediction || !screening) {
    throw new Error('No explanation data found for this screening');
  }

  const explanation: AIExplanation = {
    id: `exp-${screeningId}`,
    screeningId,
    originalImage: screening.retinalImage?.url || SAMPLE_RETINA_IMG,
    heatmapImage: prediction.heatmapUrl,
    overlayImage: prediction.overlayUrl,
    summary:
      'The highlighted regions show the areas that contributed most to the AI prediction.',
    features: mockFeatures,
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
