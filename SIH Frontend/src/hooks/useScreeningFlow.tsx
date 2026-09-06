import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Patient, RetinalImage, ScreeningResult, AIExplanation } from '../types';

interface FlowState {
  screeningId?: string;
  patient?: Patient;
  retinalImage?: RetinalImage;
  result?: ScreeningResult;
  explanation?: AIExplanation;
}

interface FlowContextValue {
  flow: FlowState;
  setFlow: React.Dispatch<React.SetStateAction<FlowState>>;
  resetFlow: () => void;
}

const FlowContext = createContext<FlowContextValue | undefined>(undefined);

export function ScreeningFlowProvider({ children }: { children: ReactNode }) {
  const [flow, setFlow] = useState<FlowState>({});
  const resetFlow = () => setFlow({});
  return (
    <FlowContext.Provider value={{ flow, setFlow, resetFlow }}>{children}</FlowContext.Provider>
  );
}

export function useScreeningFlow() {
  const ctx = useContext(FlowContext);
  if (!ctx) throw new Error('useScreeningFlow must be used within ScreeningFlowProvider');
  return ctx;
}
