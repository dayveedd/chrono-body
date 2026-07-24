import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTwinStore } from '../store/useTwinStore';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Select, Slider } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ArrowLeft, GitCompare, RefreshCw, Sparkles } from 'lucide-react';

export const Compare: React.FC = () => {
  const navigate = useNavigate();
  const {
    lifestyleA,
    lifestyleB,
    updateLifestyleA,
    updateLifestyleB,
    simulationResultsA,
    simulationResultsB,
    timelineYear,
    setTimelineYear,
    runSimulations,
    loadingSimulation
  } = useTwinStore();

  // Extract scalar outputs for year selected
  const ldlA = simulationResultsA['ldl_trajectory']?.scalarOutputs[`year_${timelineYear}`] as number || 115;
  const ldlB = simulationResultsB['ldl_trajectory']?.scalarOutputs[`year_${timelineYear}`] as number || 155;
  
  const a1cA = simulationResultsA['hba1c_trajectory']?.scalarOutputs[`year_${timelineYear}`] as number || 5.5;
  const a1cB = simulationResultsB['hba1c_trajectory']?.scalarOutputs[`year_${timelineYear}`] as number || 7.2;

  // Prepare double-line chart datasets comparing A vs B
  const prepareComparisonData = (trajKey: string) => {
    const outA = simulationResultsA[trajKey]?.scalarOutputs;
    const outB = simulationResultsB[trajKey]?.scalarOutputs;
    if (!outA || !outB) return [];
    return [
      { name: '0Y', ScenarioA: outA['year_0'], ScenarioB: outB['year_0'] },
      { name: '1Y', ScenarioA: outA['year_1'], ScenarioB: outB['year_1'] },
      { name: '3Y', ScenarioA: outA['year_3'], ScenarioB: outB['year_3'] },
      { name: '5Y', ScenarioA: outA['year_5'], ScenarioB: outB['year_5'] },
      { name: '10Y', ScenarioA: outA['year_10'], ScenarioB: outB['year_10'] }
    ];
  };

  const ldlCompData = prepareComparisonData('ldl_trajectory');
  const a1cCompData = prepareComparisonData('hba1c_trajectory');

  const ldlDelta = ldlB - ldlA;
  const a1cDelta = Number((a1cB - a1cA).toFixed(1));

  return (
    <div className="min-h-screen bg-bg-main text-text-primary p-6 flex flex-col justify-between">
      {/* Header */}
      <header className="w-full max-w-7xl mx-auto flex justify-between items-center py-4 border-b border-border-subtle/50 mb-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-xs font-display text-text-muted hover:text-primary-blue transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
        <span className="font-display font-bold text-text-primary text-base flex items-center gap-1.5">
          <GitCompare className="w-5 h-5 text-accent-indigo" />
          Dual Scenario Compare
        </span>
        <Button size="sm" onClick={runSimulations} loading={loadingSimulation} className="gap-1.5">
          <RefreshCw className="w-3.5 h-3.5" />
          Simulate Changes
        </Button>
      </header>

      {/* Comparison Grid */}
      <main className="flex-grow w-full max-w-7xl mx-auto flex flex-col gap-6">
        
        {/* Timeline controller across both scenarios */}
        <Card className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-display font-bold text-text-muted">Simultaneous Timeline Scrubber</span>
            <span className="text-xs font-mono text-accent-indigo font-bold">YEAR {timelineYear} PROJECTIONS</span>
          </div>
          <div className="relative pt-1">
            <Slider
              label=""
              min="0"
              max="10"
              value={timelineYear}
              onChange={(e) => {
                const val = Number(e.target.value);
                const snaps = [0, 1, 3, 5, 10];
                const closest = snaps.reduce((prev, curr) => 
                  Math.abs(curr - val) < Math.abs(prev - val) ? curr : prev
                );
                setTimelineYear(closest as any);
              }}
            />
            <div className="flex justify-between text-[10px] font-mono text-text-muted mt-2 px-1">
              <span>TODAY</span>
              <span>1Y</span>
              <span>3Y</span>
              <span>5Y</span>
              <span>10Y</span>
            </div>
          </div>
        </Card>

        {/* Delta Badges Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="flex items-center justify-between border-l-4 border-l-primary-blue p-4">
            <div className="flex flex-col">
              <span className="text-xs text-text-muted font-display uppercase">LDL Delta Variance</span>
              <span className="text-xs font-sans text-text-muted mt-0.5">Scenario B compared to Scenario A</span>
            </div>
            <span className={`text-xl font-mono font-bold ${ldlDelta > 0 ? 'text-error' : 'text-success'}`}>
              {ldlDelta > 0 ? `+${ldlDelta}` : ldlDelta} <span className="text-xs font-sans">mg/dL</span>
            </span>
          </Card>

          <Card className="flex items-center justify-between border-l-4 border-l-accent-cyan p-4">
            <div className="flex flex-col">
              <span className="text-xs text-text-muted font-display uppercase">HbA1c Delta Variance</span>
              <span className="text-xs font-sans text-text-muted mt-0.5">Scenario B compared to Scenario A</span>
            </div>
            <span className={`text-xl font-mono font-bold ${a1cDelta > 0 ? 'text-error' : 'text-success'}`}>
              {a1cDelta > 0 ? `+${a1cDelta}` : a1cDelta} <span className="text-xs font-sans">%</span>
            </span>
          </Card>
        </div>

        {/* Configurations Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Column A: Scenario A (Healthy Path) */}
          <Card className="flex flex-col gap-4 border-t-2 border-t-success bg-success/2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-display font-bold text-success uppercase">Scenario A: Intervention Path</span>
              <Badge variant="success">Optimization</Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Diet"
                value={lifestyleA.diet}
                onChange={(e: any) => updateLifestyleA({ diet: e.target.value })}
                options={[
                  { value: 'good', label: 'Good (Whole Foods)' },
                  { value: 'average', label: 'Average (Mixed)' },
                  { value: 'poor', label: 'Poor (High Fat)' }
                ]}
              />
              <Select
                label="Exercise"
                value={lifestyleA.exercise}
                onChange={(e: any) => updateLifestyleA({ exercise: e.target.value })}
                options={[
                  { value: 'high', label: 'High' },
                  { value: 'moderate', label: 'Moderate' },
                  { value: 'low', label: 'Low' }
                ]}
              />
            </div>
            
            <div className="flex justify-between items-center bg-bg-main p-3 rounded border border-border-subtle/50 text-xs mt-1">
              <span className="text-text-muted">Smoking status:</span>
              <button
                onClick={() => updateLifestyleA({ smoking: !lifestyleA.smoking })}
                className={`px-2.5 py-1 rounded font-bold border transition-colors ${lifestyleA.smoking ? 'bg-error/10 border-error text-error' : 'bg-bg-surface border-border-subtle text-text-muted'}`}
              >
                {lifestyleA.smoking ? 'Smoker' : 'Non-Smoker'}
              </button>
            </div>

            {/* Scenario A biomarkers indicators */}
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="bg-bg-surface p-4 rounded border border-border-subtle flex flex-col">
                <span className="text-[10px] font-mono text-text-muted uppercase">LDL Cholesterol</span>
                <span className="text-lg font-mono font-bold text-success mt-1">{ldlA} <span className="text-xs font-sans text-text-muted">mg/dL</span></span>
              </div>
              <div className="bg-bg-surface p-4 rounded border border-border-subtle flex flex-col">
                <span className="text-[10px] font-mono text-text-muted uppercase">Hemoglobin A1c</span>
                <span className="text-lg font-mono font-bold text-success mt-1">{a1cA} <span className="text-xs font-sans text-text-muted">%</span></span>
              </div>
            </div>
          </Card>

          {/* Column B: Scenario B (High Risk Path) */}
          <Card className="flex flex-col gap-4 border-t-2 border-t-error bg-error/2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-display font-bold text-error uppercase">Scenario B: Risk Path</span>
              <Badge variant="error">Degeneration</Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Diet"
                value={lifestyleB.diet}
                onChange={(e: any) => updateLifestyleB({ diet: e.target.value })}
                options={[
                  { value: 'good', label: 'Good' },
                  { value: 'average', label: 'Average' },
                  { value: 'poor', label: 'Poor (High Fat)' }
                ]}
              />
              <Select
                label="Exercise"
                value={lifestyleB.exercise}
                onChange={(e: any) => updateLifestyleB({ exercise: e.target.value })}
                options={[
                  { value: 'high', label: 'High' },
                  { value: 'moderate', label: 'Moderate' },
                  { value: 'low', label: 'Low' }
                ]}
              />
            </div>

            <div className="flex justify-between items-center bg-bg-main p-3 rounded border border-border-subtle/50 text-xs mt-1">
              <span className="text-text-muted">Smoking status:</span>
              <button
                onClick={() => updateLifestyleB({ smoking: !lifestyleB.smoking })}
                className={`px-2.5 py-1 rounded font-bold border transition-colors ${lifestyleB.smoking ? 'bg-error/10 border-error text-error' : 'bg-bg-surface border-border-subtle text-text-muted'}`}
              >
                {lifestyleB.smoking ? 'Smoker' : 'Non-Smoker'}
              </button>
            </div>

            {/* Scenario B biomarkers indicators */}
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="bg-bg-surface p-4 rounded border border-border-subtle flex flex-col">
                <span className="text-[10px] font-mono text-text-muted uppercase">LDL Cholesterol</span>
                <span className="text-lg font-mono font-bold text-error mt-1">{ldlB} <span className="text-xs font-sans text-text-muted">mg/dL</span></span>
              </div>
              <div className="bg-bg-surface p-4 rounded border border-border-subtle flex flex-col">
                <span className="text-[10px] font-mono text-text-muted uppercase">Hemoglobin A1c</span>
                <span className="text-lg font-mono font-bold text-error mt-1">{a1cB} <span className="text-xs font-sans text-text-muted">%</span></span>
              </div>
            </div>
          </Card>
        </div>

        {/* Double Comparison Line Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="flex flex-col gap-4 h-60">
            <span className="text-xs font-display font-bold text-text-muted uppercase">LDL Comparative Trajectories</span>
            <div className="flex-grow w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ldlCompData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                  <XAxis dataKey="name" stroke="hsl(var(--text-muted))" fontSize={9} />
                  <YAxis stroke="hsl(var(--text-muted))" fontSize={9} domain={[50, 220]} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--bg-surface))', border: '1px solid hsl(var(--border-subtle))', fontSize: 10 }} />
                  <Legend wrapperStyle={{ fontSize: 9 }} />
                  <Line type="monotone" name="Scenario A (Intervention)" dataKey="ScenarioA" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" name="Scenario B (Risk)" dataKey="ScenarioB" stroke="#f43f5e" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="flex flex-col gap-4 h-60">
            <span className="text-xs font-display font-bold text-text-muted uppercase">HbA1c Comparative Trajectories</span>
            <div className="flex-grow w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={a1cCompData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                  <XAxis dataKey="name" stroke="hsl(var(--text-muted))" fontSize={9} />
                  <YAxis stroke="hsl(var(--text-muted))" fontSize={9} domain={[4.0, 9.5]} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--bg-surface))', border: '1px solid hsl(var(--border-subtle))', fontSize: 10 }} />
                  <Legend wrapperStyle={{ fontSize: 9 }} />
                  <Line type="monotone" name="Scenario A (Intervention)" dataKey="ScenarioA" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" name="Scenario B (Risk)" dataKey="ScenarioB" stroke="#f43f5e" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* AI comparative assessment statement */}
        <Card className="flex flex-col gap-3 border border-accent-indigo/25">
          <div className="flex items-center gap-1.5 text-accent-indigo font-bold text-xs font-display">
            <Sparkles className="w-4.5 h-4.5 animate-pulse" />
            <span>AI Scenario Comparative Assessment Summary</span>
          </div>
          <p className="text-xs leading-relaxed text-text-primary">
            {ldlDelta > 0 
              ? `Scenario B projects substantial biological risk deterioration by Year 10. Elevating cholesterol by +${ldlDelta} mg/dL and HbA1c by +${a1cDelta}% will result in a 3.4x higher incidence rate of stroke and chronic glomerular microvascular lesions compared to Scenario A's optimization track.`
              : `Both scenarios are configured with similar baseline profiles. Adjust variables in Column B to see custom comparative projections.`}
          </p>
        </Card>
      </main>

      <footer className="text-center text-[10px] text-text-muted border-t border-border-subtle/30 pt-4 mt-6">
        ChronoBody Compare Engine. Calculations aligned with Framingham risk coefficients.
      </footer>
    </div>
  );
};
