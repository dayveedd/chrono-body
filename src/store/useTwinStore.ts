import { create } from 'zustand';
import { DTP } from '../services/dtp';
import { getDBMode, setDBMode, type DBMode } from '../services/supabase';
import type { HealthEvent, SimulationResult } from '../types/ontomorph.types';

// Structured interfaces for state management
export interface LifestyleConfig {
  diet: 'good' | 'average' | 'poor';
  sleep: 'adequate' | 'deprived';
  exercise: 'high' | 'moderate' | 'low';
  smoking: boolean;
  alcohol: 'none' | 'moderate' | 'heavy';
  stress: 'low' | 'moderate' | 'high';
}

export interface MedicalConfig {
  conditions: string[];
  medications: string[];
  allergies: string[];
  familyHistory: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  entities?: { category: string; value: string; conceptId?: string }[];
}

interface TwinState {
  dbMode: DBMode;
  twinId: string | null;
  grantToken: string | null;
  activeSystem: string;
  timelineYear: 0 | 1 | 3 | 5 | 10;
  
  // Scenarios Configuration
  lifestyleA: LifestyleConfig;
  lifestyleB: LifestyleConfig;
  medicalA: MedicalConfig;
  medicalB: MedicalConfig;
  
  // Active outputs
  simulationResultsA: Record<string, SimulationResult>;
  simulationResultsB: Record<string, SimulationResult>;
  loadingSimulation: boolean;

  // Real-time events logged from stream
  streamedEvents: HealthEvent[];
  
  // Intake Chat history
  chatHistory: ChatMessage[];
  interviewStep: number;

  // Actions
  toggleDBMode: () => void;
  setTwinId: (id: string | null) => void;
  setGrantToken: (token: string | null) => void;
  setActiveSystem: (system: string) => void;
  setTimelineYear: (year: 0 | 1 | 3 | 5 | 10) => void;
  updateLifestyleA: (update: Partial<LifestyleConfig>) => void;
  updateLifestyleB: (update: Partial<LifestyleConfig>) => void;
  updateMedicalA: (update: Partial<MedicalConfig>) => void;
  updateMedicalB: (update: Partial<MedicalConfig>) => void;
  runSimulations: () => Promise<void>;
  addChatMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  resetChat: () => void;
}

const defaultLifestyle: LifestyleConfig = {
  diet: 'average',
  sleep: 'adequate',
  exercise: 'moderate',
  smoking: false,
  alcohol: 'none',
  stress: 'moderate'
};

const defaultMedical: MedicalConfig = {
  conditions: [],
  medications: [],
  allergies: [],
  familyHistory: []
};

// Connect to mock DTP instance immediately
const dtp = new DTP({ apiKey: 'sandbox_temp_key' });

export const useTwinStore = create<TwinState>((set, get) => {
  // Listen to external toggle switches
  window.addEventListener('chronobody-db-mode-change', () => {
    set({ dbMode: getDBMode() });
  });

  return {
    dbMode: getDBMode(),
    twinId: null,
    grantToken: null,
    activeSystem: 'cardiovascular',
    timelineYear: 0,
    
    lifestyleA: { ...defaultLifestyle },
    lifestyleB: { ...defaultLifestyle, smoking: true, diet: 'poor', exercise: 'low' }, // Pre-seed Scenario B as high risk comparison
    medicalA: { ...defaultMedical },
    medicalB: { ...defaultMedical },
    
    simulationResultsA: {},
    simulationResultsB: {},
    loadingSimulation: false,
    streamedEvents: [],
    
    chatHistory: [
      {
        id: 'msg_welcome',
        sender: 'ai',
        text: 'Welcome to ChronoBody. I am your Digital Twin onboarding AI. Let\'s begin by collecting your clinical and lifestyle parameters. What are your current primary health concerns, and do you take any regular medications?',
        timestamp: new Date().toISOString()
      }
    ],
    interviewStep: 0,

    toggleDBMode: () => {
      const nextMode = get().dbMode === 'live' ? 'mock' : 'live';
      setDBMode(nextMode);
      set({ dbMode: nextMode });
    },

    setTwinId: (id) => set({ twinId: id }),
    setGrantToken: (token) => set({ grantToken: token }),
    setActiveSystem: (system) => set({ activeSystem: system }),
    setTimelineYear: (year) => set({ timelineYear: year }),

    updateLifestyleA: (update) => set((state) => ({ lifestyleA: { ...state.lifestyleA, ...update } })),
    updateLifestyleB: (update) => set((state) => ({ lifestyleB: { ...state.lifestyleB, ...update } })),
    updateMedicalA: (update) => set((state) => ({ medicalA: { ...state.medicalA, ...update } })),
    updateMedicalB: (update) => set((state) => ({ medicalB: { ...state.medicalB, ...update } })),

    runSimulations: async () => {
      set({ loadingSimulation: true });
      try {
        const { lifestyleA, lifestyleB, grantToken } = get();
        const activeTwin = await dtp.twins.connect(grantToken || 'grant_sandbox_synthetic_01');
        
        // Execute LDL and HbA1c trajectory simulations in parallel for both scenarios
        const [ldlA, hba1cA, ldlB, hba1cB] = await Promise.all([
          activeTwin.simulate('ldl_trajectory', lifestyleA),
          activeTwin.simulate('hba1c_trajectory', lifestyleA),
          activeTwin.simulate('ldl_trajectory', lifestyleB),
          activeTwin.simulate('hba1c_trajectory', lifestyleB)
        ]);

        set({
          simulationResultsA: { ldl_trajectory: ldlA, hba1c_trajectory: hba1cA },
          simulationResultsB: { ldl_trajectory: ldlB, hba1c_trajectory: hba1cB },
          loadingSimulation: false
        });
      } catch (err) {
        console.error("Simulation run crashed:", err);
        set({ loadingSimulation: false });
      }
    },

    addChatMessage: (msg) => set((state) => ({
      chatHistory: [
        ...state.chatHistory,
        {
          ...msg,
          id: `msg_${Date.now()}`,
          timestamp: new Date().toISOString()
        }
      ]
    })),

    resetChat: () => set({
      chatHistory: [
        {
          id: 'msg_welcome',
          sender: 'ai',
          text: 'Welcome to ChronoBody. I am your Digital Twin onboarding AI. Let\'s begin by collecting your clinical and lifestyle parameters. What are your current primary health concerns, and do you take any regular medications?',
          timestamp: new Date().toISOString()
        }
      ],
      interviewStep: 0
    })
  };
});
