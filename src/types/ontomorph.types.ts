export interface HealthEventData {
  system: string;
  code: string;
  value: string | number;
  unit: string;
  title?: string;
  description?: string;
  category?: 'lab' | 'observation' | 'flag' | 'genomics' | 'simulation';
  [key: string]: any;
}

export interface HealthEvent {
  id: string;
  created_at: string;
  data: HealthEventData;
}

export interface SystemView {
  system: string;
  twinId: string;
  events: HealthEvent[];
}

export interface GrantClaims {
  grantId: string;
  twinId: string;
  systems: string[] | null;
  eventTypes: string[] | null;
}

export interface FlagInput {
  code: string;
  value: string | number;
  title?: string;
  description?: string;
}

export interface SimulationResult {
  scalarOutputs: Record<string, string | number>;
  disclaimer: string;
  narration: string | null;
  animation: string | null; // gltf / path / state map
}

// HOLON Types
export interface Concept {
  conceptId: number | string;
  conceptCode: string;
  conceptName: string;
  vocabularyId: string;
  domainId: 'Drug' | 'Measurement' | 'Condition' | 'Anatomy';
}

export interface ConceptResponse {
  concept: Concept;
}

export interface SearchResponse {
  hits: Concept[];
  total: number;
  page: number;
  pageSize: number;
}

export interface Interaction {
  severity: 'high' | 'moderate' | 'minor' | 'contraindicated';
  description: string;
  drugs: string[];
}

export interface InteractionsResponse {
  hasInteraction: boolean;
  interactions: Interaction[];
}

export interface MappingEntry {
  sourceCode: string;
  sourceVocabulary: string;
  targetCode: string;
  targetVocabulary: string;
  conceptId: number | string;
}

export interface ReferenceRangeEntry {
  conceptId: number | string;
  lowValue: number;
  highValue: number;
  unit: string;
  ageMin?: number;
  ageMax?: number;
  sex?: 'male' | 'female' | 'both';
}

export interface PhenotypeMatch {
  score: number; // 0 to 1
  matchingConcepts: string[];
}
