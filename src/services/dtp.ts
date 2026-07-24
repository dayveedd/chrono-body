import type { HealthEvent, SystemView, SimulationResult, FlagInput } from '../types/ontomorph.types';

// Client-side simulation state and event generator
class TwinInstance {
  twinId: string;
  systems: string[] | null;
  eventTypes: string[] | null;
  localEvents: HealthEvent[] = [];

  constructor(twinId: string, systems: string[] | null = null, eventTypes: string[] | null = null) {
    this.twinId = twinId;
    this.systems = systems;
    this.eventTypes = eventTypes;
    this.initializeEvents();
  }

  // Pre-seed baseline clinical events representing the digital twin's status
  private initializeEvents() {
    const systemsList = this.systems || ['cardiovascular', 'respiratory', 'metabolic', 'renal', 'neurological'];
    const baselines = [
      { system: 'cardiovascular', code: 'LDL', value: 115, unit: 'mg/dL', title: 'LDL Cholesterol', description: 'Baseline measurement' },
      { system: 'cardiovascular', code: 'BP', value: '122/80', unit: 'mmHg', title: 'Blood Pressure', description: 'Slightly elevated systolic' },
      { system: 'metabolic', code: 'A1C', value: 5.5, unit: '%', title: 'Hemoglobin A1c', description: 'Optimal range' },
      { system: 'metabolic', code: 'FBS', value: 92, unit: 'mg/dL', title: 'Fasting Blood Sugar', description: 'Normal threshold' },
      { system: 'respiratory', code: 'SPO2', value: 98, unit: '%', title: 'Oxygen Saturation', description: 'Normal respiration' },
      { system: 'renal', code: 'EGFR', value: 95, unit: 'mL/min/1.73m2', title: 'eGFR Kidney Function', description: 'Excellent filtration' }
    ];

    let timeOffset = 24; // hours ago
    this.localEvents = baselines
      .filter(b => systemsList.includes(b.system))
      .map((b, i) => ({
        id: `evt_${this.twinId}_${i}`,
        created_at: new Date(Date.now() - (timeOffset - i) * 60 * 60 * 1000).toISOString(),
        data: {
          system: b.system,
          code: b.code,
          value: b.value,
          unit: b.unit,
          title: b.title,
          description: b.description,
          category: 'lab'
        }
      }));
  }

  get systemsAccessor() {
    return {
      get: async (systemName: string): Promise<SystemView> => {
        const events = this.localEvents.filter(e => e.data.system === systemName);
        return {
          system: systemName,
          twinId: this.twinId,
          events
        };
      }
    };
  }

  get eventsAccessor() {
    return {
      list: async (filter?: { system?: string; limit?: number }): Promise<HealthEvent[]> => {
        let list = [...this.localEvents];
        if (filter?.system) {
          list = list.filter(e => e.data.system === filter.system);
        }
        list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        if (filter?.limit) {
          list = list.slice(0, filter.limit);
        }
        return list;
      },
      stream: (options: { system: string; intervalMs?: number }, callback: (event: HealthEvent) => void) => {
        const interval = options.intervalMs || 5000;
        const intervalId = setInterval(async () => {
          let newEvt: HealthEvent | null = null;
          
          if (options.system === 'cardiovascular') {
            newEvt = {
              id: `evt_stream_${Date.now()}`,
              created_at: new Date().toISOString(),
              data: {
                system: 'cardiovascular',
                code: 'HR',
                value: Math.floor(68 + Math.random() * 15),
                unit: 'bpm',
                title: 'Heart Rate',
                description: 'Real-time sensor telemetry',
                category: 'observation'
              }
            };
          }

          if (newEvt) {
            this.localEvents.push(newEvt);
            callback(newEvt);
          }
        }, interval);

        return {
          stop: () => clearInterval(intervalId)
        };
      }
    };
  }

  async flag(systemName: string, input: FlagInput): Promise<HealthEvent> {
    const newEvent: HealthEvent = {
      id: `evt_flag_${Date.now()}`,
      created_at: new Date().toISOString(),
      data: {
        system: systemName,
        code: input.code,
        value: input.value,
        unit: 'flag',
        title: input.title || 'Clinical Alert Flagged',
        description: input.description || '',
        category: 'flag'
      }
    };
    this.localEvents.push(newEvent);
    return newEvent;
  }

  async simulate(trajectoryName: 'ldl_trajectory' | 'hba1c_trajectory' | string, params: Record<string, any>): Promise<SimulationResult> {
    // Artificial 2s simulation delay to represent the queued job state transitions in the UI
    await new Promise(r => setTimeout(r, 2000));

    // Dynamic calculations based on parameters representing timeline projections (Years: 0, 1, 3, 5, 10)
    const scalarOutputs: Record<string, any> = {};
    let narration = '';
    
    // Extrapolate inputs
    const smoking = params.smoking ?? false;
    const dietQuality = params.diet || 'average'; // good, average, poor
    const activeLevel = params.exercise || 'moderate'; // high, moderate, low
    const weightTrend = params.weightTrend || 'stable'; // losing, stable, gaining

    if (trajectoryName === 'ldl_trajectory') {
      let baselineLdl = 115;
      if (dietQuality === 'poor') baselineLdl += 25;
      if (dietQuality === 'good') baselineLdl -= 15;

      scalarOutputs['year_0'] = baselineLdl;
      scalarOutputs['year_1'] = Math.round(baselineLdl * (smoking ? 1.05 : 1.01));
      scalarOutputs['year_3'] = Math.round(baselineLdl * (smoking ? 1.15 : 1.03) * (dietQuality === 'poor' ? 1.10 : 0.98));
      scalarOutputs['year_5'] = Math.round(baselineLdl * (smoking ? 1.25 : 1.05) * (dietQuality === 'poor' ? 1.20 : 0.95));
      scalarOutputs['year_10'] = Math.round(baselineLdl * (smoking ? 1.40 : 1.08) * (dietQuality === 'poor' ? 1.35 : 0.90));

      const finalLdl = scalarOutputs['year_10'];
      if (finalLdl > 160) {
        narration = `Simulated 10-year trajectory shows significant lipid accumulation. High LDL levels (${finalLdl} mg/dL) combined with vascular shear stress from smoking accelerates coronary plaque development by 240%, creating substantial risk of myocardial infarction in year 7.`;
      } else {
        narration = `Vascular profile remains optimized. Moderate/good lifestyle factors restrict lipid deposition, predicting normal endothelial lining and less than 5% arterial plaque accretion over the next decade.`;
      }
    } else if (trajectoryName === 'hba1c_trajectory') {
      let baselineA1c = 5.5;
      if (dietQuality === 'poor') baselineA1c += 0.8;
      if (activeLevel === 'low') baselineA1c += 0.5;

      scalarOutputs['year_0'] = Number(baselineA1c.toFixed(1));
      scalarOutputs['year_1'] = Number((baselineA1c + (weightTrend === 'gaining' ? 0.3 : 0.05)).toFixed(1));
      scalarOutputs['year_3'] = Number((baselineA1c * (dietQuality === 'poor' ? 1.08 : 0.98) + (activeLevel === 'low' ? 0.6 : -0.2)).toFixed(1));
      scalarOutputs['year_5'] = Number((baselineA1c * (dietQuality === 'poor' ? 1.15 : 0.95) + (activeLevel === 'low' ? 1.0 : -0.4)).toFixed(1));
      scalarOutputs['year_10'] = Number((baselineA1c * (dietQuality === 'poor' ? 1.25 : 0.90) + (activeLevel === 'low' ? 1.8 : -0.6)).toFixed(1));

      const finalA1c = scalarOutputs['year_10'];
      if (finalA1c >= 6.5) {
        narration = `Trajectory projects progression into overt Type 2 Diabetes Mellitus (HbA1c: ${finalA1c}%). Insufficient metabolic clearance and weight gain promote peripheral insulin resistance, raising risk score of diabetic retinopathy and renal hyperfiltration by year 5.`;
      } else {
        narration = `Insulin sensitivity is projected to remain stable (HbA1c: ${finalA1c}%). Consistent lifestyle choices limit metabolic workload, preventing pancreatic beta-cell fatigue and protecting macrovascular blood flow.`;
      }
    } else {
      // General telemetry simulation
      scalarOutputs['year_0'] = 75;
      scalarOutputs['year_1'] = 74;
      scalarOutputs['year_3'] = 72;
      scalarOutputs['year_5'] = 70;
      scalarOutputs['year_10'] = 68;
      narration = `Baseline progression shows general physiological aging.`;
    }

    return {
      scalarOutputs,
      disclaimer: "ChronoBody simulations are generative AI projections based on digital-twin variables and clinical coefficients. They explore possibilities rather than guaranteeing diagnoses.",
      narration,
      animation: JSON.stringify({ trajectory: trajectoryName, outputs: scalarOutputs })
    };
  }
}

export class DTP {
  apiKey: string;
  constructor(config: { apiKey: string }) {
    this.apiKey = config.apiKey;
  }

  get twins() {
    return {
      connect: async (grantToken: string): Promise<TwinInstance> => {
        // Decode mock/sandbox claims or use fallback
        const twinId = grantToken.startsWith('grant_') ? grantToken.replace('grant_', 'twin_') : 'twin_demo_default';
        return new TwinInstance(twinId);
      }
    };
  }

  get sandbox() {
    return {
      grants: async (): Promise<Array<{ grantToken: string; expiresIn: number }>> => {
        return [
          { grantToken: 'grant_sandbox_synthetic_01', expiresIn: 3600 },
          { grantToken: 'grant_sandbox_synthetic_02', expiresIn: 3600 }
        ];
      }
    };
  }
}
