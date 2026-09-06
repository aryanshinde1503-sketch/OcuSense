# DR-Screen — Frontend (SIH26038)

Explainable AI for Diabetic Retinopathy Screening — patient-facing frontend.
React + Vite + TypeScript + Tailwind CSS + React Router. All data is mocked;
see `src/services/screeningService.ts` for the swap-in points for real APIs.

## Run locally
```
npm install
npm run dev
```

## Build
```
npm run build
```

## Structure
- `src/pages` — route-level screens (Landing, Dashboard, screening flow, History, Report, Learn)
- `src/components` — reusable UI (Button, Card, HeatmapViewer, UploadArea, etc.)
- `src/services` — mock service layer (replace internals with real API calls later)
- `src/data` — mock data
- `src/types` — shared TypeScript types
- `src/hooks/useScreeningFlow.tsx` — in-progress screening state shared across the flow

## Demo path
Landing → Dashboard → Start Screening → Patient Details → Upload Image →
AI Analysis → Result → Explainable AI → Report
