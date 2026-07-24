import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTwinStore } from '../store/useTwinStore';
import { Button } from '../components/ui/Button';
import { ArrowLeft, Printer, AlertCircle } from 'lucide-react';

export const Notes: React.FC = () => {
  const navigate = useNavigate();
  const {
    lifestyleA,
    medicalA,
    simulationResultsA,
    timelineYear
  } = useTwinStore();

  const handlePrint = () => {
    window.print();
  };

  const ldlVal = simulationResultsA['ldl_trajectory']?.scalarOutputs[`year_${timelineYear}`] as number || 115;
  const a1cVal = simulationResultsA['hba1c_trajectory']?.scalarOutputs[`year_${timelineYear}`] as number || 5.5;

  const finalLdl = simulationResultsA['ldl_trajectory']?.scalarOutputs['year_10'] as number || 115;
  const finalA1c = simulationResultsA['hba1c_trajectory']?.scalarOutputs['year_10'] as number || 5.5;

  const currentDateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-bg-main text-text-primary p-6 flex flex-col justify-between print:bg-white print:text-black">
      {/* Header (hidden on print) */}
      <header className="w-full max-w-4xl mx-auto flex justify-between items-center py-4 border-b border-border-subtle/50 mb-6 print:hidden">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-xs font-display text-text-muted hover:text-primary-blue transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
        <span className="font-display font-bold text-text-primary text-base">SOAP Clinical Summary</span>
        <Button size="sm" onClick={handlePrint} className="gap-1.5">
          <Printer className="w-4 h-4" />
          Print / Save PDF
        </Button>
      </header>

      {/* Printable SOAP Note Container */}
      <main className="flex-grow w-full max-w-4xl mx-auto flex flex-col gap-6 print:gap-4">
        
        {/* SOAP Header (formatted like clinical document) */}
        <div className="border-b-2 border-primary-blue/30 pb-4 flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <h1 className="font-display font-bold text-2xl text-text-primary print:text-black tracking-tight uppercase">ChronoBody Clinical Note</h1>
            <span className="text-xs font-mono text-text-muted">Twin Identifier: CB-TWIN-DEMO-01</span>
            <span className="text-xs font-mono text-text-muted">Physiological SDK Version: Ontomorph v0.1.3</span>
          </div>
          <div className="text-right flex flex-col gap-1 text-xs text-text-muted">
            <span className="font-bold text-text-primary">DATE: {currentDateStr}</span>
            <span>SYSTEM: CARDIOVASCULAR / METABOLIC</span>
            <span>TIMELINE REFERENCE: {timelineYear}Y</span>
          </div>
        </div>

        {/* Clinical Disclaimer */}
        <div className="p-3.5 rounded bg-warning/10 border border-warning/20 text-warning text-xs font-sans flex gap-2 items-center print:hidden">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>This note is a generated projection of the digital-twin simulation trajectory and is intended for clinical educational guidance only.</span>
        </div>

        {/* SOAP Divisions */}
        <div className="flex flex-col gap-6 print:gap-4 mt-2">
          
          {/* S: Subjective */}
          <section className="flex flex-col gap-2">
            <h3 className="font-display font-bold text-sm text-primary-blue print:text-black uppercase tracking-wider border-b border-border-subtle/50 pb-1">
              Subjective (S)
            </h3>
            <p className="text-xs leading-relaxed text-text-primary print:text-black font-sans">
              Patient digital twin initialized using conversational console interview. Baseline parameters state {lifestyleA.smoking ? "active tobacco use (telemetry confirmed)" : "no active tobacco use"}. Diet quality rated as {lifestyleA.diet.toUpperCase()} and exercise level is {lifestyleA.exercise.toUpperCase()}. Presenting history shows medications including {medicalA.medications.length > 0 ? medicalA.medications.join(', ') : "none currently configured"}.
            </p>
          </section>

          {/* O: Objective */}
          <section className="flex flex-col gap-2">
            <h3 className="font-display font-bold text-sm text-primary-blue print:text-black uppercase tracking-wider border-b border-border-subtle/50 pb-1">
              Objective (O)
            </h3>
            <div className="grid grid-cols-2 gap-4 print:gap-2">
              <div className="bg-bg-surface print:bg-white p-3.5 rounded border border-border-subtle flex flex-col gap-1">
                <span className="text-[10px] font-mono text-text-muted uppercase">Selected Reference Year ({timelineYear}Y)</span>
                <div className="flex flex-col text-xs mt-1">
                  <span>LDL Cholesterol: <strong>{ldlVal} mg/dL</strong></span>
                  <span>HbA1c Level: <strong>{a1cVal}%</strong></span>
                </div>
              </div>
              <div className="bg-bg-surface print:bg-white p-3.5 rounded border border-border-subtle flex flex-col gap-1">
                <span className="text-[10px] font-mono text-text-muted uppercase">10-Year Projections (10Y)</span>
                <div className="flex flex-col text-xs mt-1">
                  <span>LDL Cholesterol Target: <strong>{finalLdl} mg/dL</strong></span>
                  <span>HbA1c Level Target: <strong>{finalA1c}%</strong></span>
                </div>
              </div>
            </div>
          </section>

          {/* A: Assessment */}
          <section className="flex flex-col gap-2">
            <h3 className="font-display font-bold text-sm text-primary-blue print:text-black uppercase tracking-wider border-b border-border-subtle/50 pb-1">
              Assessment (A)
            </h3>
            <div className="flex flex-col gap-3 font-sans text-xs text-text-primary print:text-black leading-relaxed">
              <p>
                Calculations utilizing physiological timelines project {finalLdl > 130 ? 'substantial atherogenic risk progression over the next decade' : 'optimized lipid management'}. Current LDL ({ldlVal} mg/dL) indicates {ldlVal > 130 ? 'cellular lipid overload and vessel thickness narrowing' : 'normal endothelial function'}.
              </p>
              <p>
                Metabolic analysis of HbA1c ({a1cVal}%) demonstrates {a1cVal >= 6.5 ? 'overt glycemic dysfunction (Type 2 Diabetes category)' : (a1cVal > 5.6 ? 'elevated insulin clearance workloads (Prediabetes category)' : 'normal insulin receptor sensitivity')}.
              </p>
            </div>
          </section>

          {/* P: Plan */}
          <section className="flex flex-col gap-2">
            <h3 className="font-display font-bold text-sm text-primary-blue print:text-black uppercase tracking-wider border-b border-border-subtle/50 pb-1">
              Plan (P)
            </h3>
            <div className="flex flex-col gap-2.5 font-sans text-xs text-text-primary print:text-black">
              <div className="flex items-start gap-2">
                <span className="font-bold text-primary-blue">•</span>
                <span><strong>Dietary Modification:</strong> Transition to whole-food, low-glycemic inputs to reduce pancreatic workload and lipid accumulation.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-primary-blue">•</span>
                <span><strong>Physical Activity:</strong> Implement daily active targets (minimum 30 minutes cardiovascular load) to promote peripheral glucose transporter recruitment.</span>
              </div>
              {lifestyleA.smoking && (
                <div className="flex items-start gap-2 text-error print:text-black">
                  <span className="font-bold">•</span>
                  <span><strong>Smoking Cessation:</strong> Strongly recommend immediate tobacco cessation to mitigate arterial shear pressure and plaque calcification risk.</span>
                </div>
              )}
              {medicalA.medications.length > 0 && (
                <div className="flex items-start gap-2">
                  <span className="font-bold text-primary-blue">•</span>
                  <span><strong>Pharmacotherapy Compliance:</strong> Review medication list ({medicalA.medications.join(', ')}) with primary physician for dose optimization.</span>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Signature Line */}
        <div className="border-t border-border-subtle/50 pt-8 mt-6 flex justify-between text-xs text-text-muted">
          <div className="flex flex-col gap-1">
            <span className="h-8 border-b border-border-subtle/80 w-48"></span>
            <span>Physician Signature / Audit Signoff</span>
          </div>
          <div className="flex flex-col text-right">
            <span>Generated via ChronoBody Client Syncer</span>
            <span>Consent ID: {medicalA.conditions.includes('Type 2 Diabetes') ? 'GRT-DIAB-801' : 'GRT-CARD-112'}</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-[10px] text-text-muted mt-8 border-t border-border-subtle/30 pt-4 print:hidden">
        ChronoBody Clinical Notes Workspace. Print-optimized.
      </footer>
    </div>
  );
};
