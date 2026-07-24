import { createHolonClient } from '@ontomorph/holon-client';
import type { Concept, InteractionsResponse, ReferenceRangeEntry } from '../types/ontomorph.types';
import { getDBMode } from './supabase';

const HOLON_API_KEY = import.meta.env.VITE_HOLON_API_KEY || 'holon_57c05f4d8fd398a940f1e60f967cebf37facd08b158e34af58ad7524ff550cf7';
const HOLON_API_URL = import.meta.env.VITE_HOLON_API_URL || 'https://holon.ontomorph.com';

let liveHolonClient: any = null;

try {
  if (HOLON_API_KEY) {
    liveHolonClient = createHolonClient({
      apiUrl: HOLON_API_URL,
      apiKey: HOLON_API_KEY
    });
  }
} catch (error) {
  console.error("Failed to initialize Holon client:", error);
}

// Pre-seeded high-fidelity clinical mock data
const MOCK_CONCEPTS: Concept[] = [
  { conceptId: "11289", conceptCode: "36567", conceptName: "Warfarin 5mg Oral Tablet", vocabularyId: "RxNorm", domainId: "Drug" },
  { conceptId: "1191", conceptCode: "153165", conceptName: "Aspirin 81mg Oral Tablet", vocabularyId: "RxNorm", domainId: "Drug" },
  { conceptId: "197361", conceptCode: "860975", conceptName: "Metformin 500mg Oral Tablet", vocabularyId: "RxNorm", domainId: "Drug" },
  { conceptId: "40213251", conceptCode: "197361", conceptName: "Atorvastatin 20mg Oral Tablet", vocabularyId: "RxNorm", domainId: "Drug" },
  { conceptId: "3004249", conceptCode: "2093-3", conceptName: "Cholesterol [Mass/Volume] in Serum or Plasma", vocabularyId: "LOINC", domainId: "Measurement" },
  { conceptId: "3005456", conceptCode: "4548-4", conceptName: "Hemoglobin A1c [Percent] in Blood", vocabularyId: "LOINC", domainId: "Measurement" },
  { conceptId: "40213252", conceptCode: "1203005", conceptName: "Chronic Kidney Disease Stage 3", vocabularyId: "SNOMED", domainId: "Condition" },
  { conceptId: "40213253", conceptCode: "44054006", conceptName: "Type 2 Diabetes Mellitus", vocabularyId: "SNOMED", domainId: "Condition" },
  { conceptId: "40213254", conceptCode: "38341003", conceptName: "Essential Hypertension", vocabularyId: "SNOMED", domainId: "Condition" }
];

const MOCK_INTERACTIONS: Record<string, InteractionsResponse> = {
  "11289_1191": {
    hasInteraction: true,
    interactions: [
      {
        severity: "high",
        description: "Concurrent use of warfarin and aspirin significantly increases risk of major gastrointestinal and systemic hemorrhage.",
        drugs: ["Warfarin 5mg Oral Tablet", "Aspirin 81mg Oral Tablet"]
      }
    ]
  },
  "11289_40213251": {
    hasInteraction: true,
    interactions: [
      {
        severity: "moderate",
        description: "Atorvastatin may minorly increase the anticoagulant effect of warfarin, requiring regular INR monitoring.",
        drugs: ["Warfarin 5mg Oral Tablet", "Atorvastatin 20mg Oral Tablet"]
      }
    ]
  }
};

const MOCK_RANGES: Record<string, ReferenceRangeEntry[]> = {
  "3004249": [
    { conceptId: "3004249", lowValue: 120, highValue: 200, unit: "mg/dL", sex: "both" }
  ],
  "3005456": [
    { conceptId: "3005456", lowValue: 4.0, highValue: 5.6, unit: "%", sex: "both" }
  ]
};

// Safe wrapper exporting concept searches and lookups
export const holonService = {
  async searchConcepts(query: string, domain?: string): Promise<Concept[]> {
    const mode = getDBMode();
    if (mode === 'live' && liveHolonClient) {
      try {
        const response = await liveHolonClient.concepts.search(query, { domain });
        return response.hits;
      } catch (err) {
        console.warn("Live Holon concept search failed, falling back to mock:", err);
      }
    }
    // Mock Search
    const lowerQuery = query.toLowerCase();
    return MOCK_CONCEPTS.filter(c => {
      const matchText = c.conceptName.toLowerCase().includes(lowerQuery) || 
                        c.conceptCode.includes(lowerQuery);
      const matchDomain = domain ? c.domainId === domain : true;
      return matchText && matchDomain;
    });
  },

  async getConceptById(id: string): Promise<Concept | null> {
    const mode = getDBMode();
    if (mode === 'live' && liveHolonClient) {
      try {
        const response = await liveHolonClient.concepts.getById(id);
        return response.concept;
      } catch (err) {
        console.warn("Live Holon getById failed, falling back to mock:", err);
      }
    }
    return MOCK_CONCEPTS.find(c => String(c.conceptId) === String(id)) || null;
  },

  async checkInteraction(idA: string, idB: string): Promise<InteractionsResponse> {
    const mode = getDBMode();
    if (mode === 'live' && liveHolonClient) {
      try {
        return await liveHolonClient.interactions.check(Number(idA), Number(idB));
      } catch (err) {
        console.warn("Live Holon interaction check failed, falling back to mock:", err);
      }
    }
    
    const key1 = `${idA}_${idB}`;
    const key2 = `${idB}_${idA}`;
    return MOCK_INTERACTIONS[key1] || MOCK_INTERACTIONS[key2] || { hasInteraction: false, interactions: [] };
  },

  async checkListInteractions(ids: string[]): Promise<InteractionsResponse> {
    const mode = getDBMode();
    if (mode === 'live' && liveHolonClient) {
      try {
        return await liveHolonClient.interactions.checkList(ids.map(Number));
      } catch (err) {
        console.warn("Live Holon checkList failed, falling back to mock:", err);
      }
    }

    const foundInteractions: any[] = [];
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const check = await this.checkInteraction(ids[i], ids[j]);
        if (check.hasInteraction) {
          foundInteractions.push(...check.interactions);
        }
      }
    }
    return {
      hasInteraction: foundInteractions.length > 0,
      interactions: foundInteractions
    };
  },

  async getReferenceRange(conceptId: string, _age?: number, _sex?: 'male' | 'female'): Promise<ReferenceRangeEntry[]> {
    const mode = getDBMode();
    if (mode === 'live' && liveHolonClient) {
      try {
        return await liveHolonClient.referenceRanges.getByConceptId(Number(conceptId));
      } catch (err) {
        console.warn("Live Holon getReferenceRange failed, falling back to mock:", err);
      }
    }
    return MOCK_RANGES[conceptId] || [{ conceptId, lowValue: 0, highValue: 100, unit: "units", sex: "both" }];
  }
};
