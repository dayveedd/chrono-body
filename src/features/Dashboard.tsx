import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTwinStore } from '../store/useTwinStore';
import { BodyViewer } from './twin-viewer/BodyViewer';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Slider, Select } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Sparkles, FileText, Settings, GitCompare, RefreshCw } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const {
    dbMode,
    activeSystem,
    timelineYear,
    setTimelineYear,
    lifestyleA,
    updateLifestyleA,
    simulationResultsA,
    runSimulations,
    loadingSimulation
  } = useTwinStore();

  // Run initial simulation if not yet populated
  useEffect(() => {
    if (Object.keys(simulationResultsA).length === 0) {
      runSimulations();
    }
  }, [simulationResultsA, runSimulations]);

  // Extract biomarker telemetry mapping based on selected year
  const ldlVal = simulationResultsA['ldl_trajectory']?.scalarOutputs[`year_${timelineYear}`] as number || 115;
  const a1cVal = simulationResultsA['hba1c_trajectory']?.scalarOutputs[`year_${timelineYear}`] as number || 5.5;

  const currentLdlRange = ldlVal > 130 ? 'warning' : 'success';
  const currentA1cRange = a1cVal > 6.0 ? (a1cVal >= 6.5 ? 'error' : 'warning') : 'success';

  // Prepare chart datasets for Recharts rendering
  const prepareChartData = (trajKey: string) => {
    const outputs = simulationResultsA[trajKey]?.scalarOutputs;
    if (!outputs) return [];
    return [
      { name: '0Y', value: outputs['year_0'] },
      { name: '1Y', value: outputs['year_1'] },
      { name: '3Y', value: outputs['year_3'] },
      { name: '5Y', value: outputs['year_5'] },
      { name: '10Y', value: outputs['year_10'] }
    ];
  };

  const ldlChartData = prepareChartData('ldl_trajectory');
  const a1cChartData = prepareChartData('hba1c_trajectory');

  const ldlStatus = ldlVal > 130 ? 'Elevated (Target < 100)' : 'Optimal';
  const a1cStatus = a1cVal >= 6.5 ? 'Critical (Diabetes)' : (a1cVal > 5.6 ? 'Elevated (Prediabetes)' : 'Optimal');

  return (
    <div className="min-h-screen bg-bg-main text-text-primary p-6 flex flex-col justify-between">
      {/* Header bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center py-4 border-b border-border-subtle/50 gap-4 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-primary-blue to-accent-cyan flex items-center justify-center shadow-lg">
            <span className="font-display font-bold text-white text-base">C</span>
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-base tracking-tight leading-none">ChronoBody Twin Workspace</span>
            <span className="text-[10px] text-text-muted mt-1 font-mono">CLIENT_MODE: {dbMode.toUpperCase()}</span>
          </div>
        </div>

        {/* Global Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="glass" size="sm" onClick={() => navigate('/compare')} className="gap-1.5">
            <GitCompare className="w-4 h-4 text-accent-indigo" />
            Compare Scenarios
          </Button>
          <Button variant="glass" size="sm" onClick={() => navigate('/notes')} className="gap-1.5">
            <FileText className="w-4 h-4 text-primary-blue" />
            Clinical Notes
          </Button>
          <Button variant="glass" size="sm" onClick={() => navigate('/profile')} className="gap-1.5">
            <Settings className="w-4 h-4 text-text-muted" />
            Settings
          </Button>
        </div>
      </header>

      {/* Main Workspace grid */}
      <main className="flex-grow w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Side: 3D Body Canvas Viewer (cols: 5) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-sm text-text-muted uppercase tracking-wider">Anatomical Digital Twin</h3>
            <Badge variant="success" dot>Real-time Telemetry</Badge>
          </div>
          <BodyViewer />
        </div>

        {/* Right Side: Telemetry Controls Sidebar (cols: 7) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-sm text-text-muted uppercase tracking-wider">System Controls & Parameters</h3>
            <span className="text-xs font-mono text-text-muted">Twin Status: Active</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Telemetry panel */}
            <Card className="flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-border-subtle/50 pb-2">
                <span className="text-xs font-display font-bold text-text-muted">Biomarker Telemetry</span>
                <span className="text-[10px] font-mono text-text-muted uppercase">System: {activeSystem}</span>
              </div>

              {/* LDL readings */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-text-primary">LDL (Lipoprotein Profile)</span>
                  <span className="text-lg font-mono font-bold">{ldlVal} <span className="text-xs font-sans text-text-muted">mg/dL</span></span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-text-muted font-mono">{ldlStatus}</span>
                  <Badge variant={currentLdlRange === 'warning' ? 'warning' : 'success'}>
                    {currentLdlRange === 'warning' ? 'Elevated' : 'Optimal'}
                  </Badge>
                </div>
              </div>

              {/* HbA1c readings */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-text-primary">HbA1c (Glycated Hemoglobin)</span>
                  <span className="text-lg font-mono font-bold">{a1cVal} <span className="text-xs font-sans text-text-muted">%</span></span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-text-muted font-mono">{a1cStatus}</span>
                  <Badge variant={currentA1cRange === 'error' ? 'error' : (currentA1cRange === 'warning' ? 'warning' : 'success')}>
                    {currentA1cRange === 'error' ? 'Critical' : (currentA1cRange === 'warning' ? 'Elevated' : 'Optimal')}
                  </Badge>
                </div>
              </div>
            </Card>

            {/* Inputs Configurator panel */}
            <Card className="flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-border-subtle/50 pb-2">
                <span className="text-xs font-display font-bold text-text-muted">Lifestyle Interventions</span>
                <Button variant="glass" size="sm" onClick={runSimulations} loading={loadingSimulation} className="h-6 py-0 px-2 text-[10px]">
                  <RefreshCw className="w-2.5 h-2.5 mr-1" />
                  Recalculate
                </Button>
              </div>

              <div className="flex flex-col gap-3">
                <Select
                  label="Diet Quality"
                  value={lifestyleA.diet}
                  onChange={(e: any) => updateLifestyleA({ diet: e.target.value })}
                  options={[
                    { value: 'good', label: 'Good (Whole Foods)' },
                    { value: 'average', label: 'Average (Mixed)' },
                    { value: 'poor', label: 'Poor (High Fat / Sugar)' }
                  ]}
                />

                <Select
                  label="Exercise Intensity"
                  value={lifestyleA.exercise}
                  onChange={(e: any) => updateLifestyleA({ exercise: e.target.value })}
                  options={[
                    { value: 'high', label: 'High (Daily Cardio)' },
                    { value: 'moderate', label: 'Moderate (Active)' },
                    { value: 'low', label: 'Low (Sedentary)' }
                  ]}
                />

                <div className="flex justify-between items-center pt-2">
                  <span className="text-xs font-display font-medium text-text-muted">Smoking telemetries:</span>
                  <button
                    onClick={() => updateLifestyleA({ smoking: !lifestyleA.smoking })}
                    className={`text-xs px-2.5 py-1 rounded font-display font-bold border transition-colors ${lifestyleA.smoking ? 'bg-error/10 border-error text-error' : 'bg-bg-main border-border-subtle text-text-muted'}`}
                  >
                    {lifestyleA.smoking ? 'Active Smoker' : 'Non-Smoker'}
                  </button>
                </div>
              </div>
            </Card>
          </div>

          {/* Timeline slider panel */}
          <Card className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-display font-bold text-text-muted">Trajectory Timeline Scrubber</span>
              <span className="text-xs font-mono text-primary-blue font-bold">
                {timelineYear === 0 ? 'Today (Baseline)' : `Year ${timelineYear} Projection`}
              </span>
            </div>
            
            <div className="relative pt-2">
              <Slider
                label=""
                min="0"
                max="10"
                value={timelineYear}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  // Snap to allowed timeline intervals: 0, 1, 3, 5, 10
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

          {/* Simulations line graphs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="flex flex-col gap-3 h-52">
              <span className="text-xs font-display font-bold text-text-muted">LDL 10-Year Path</span>
              <div className="flex-grow w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={ldlChartData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                    <XAxis dataKey="name" stroke="hsl(var(--text-muted))" fontSize={9} />
                    <YAxis stroke="hsl(var(--text-muted))" fontSize={9} domain={[50, 220]} />
                    <Tooltip contentStyle={{ background: 'hsl(var(--bg-surface))', border: '1px solid hsl(var(--border-subtle))', fontSize: 10 }} />
                    <Line type="monotone" dataKey="value" stroke="hsl(var(--primary-blue))" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="flex flex-col gap-3 h-52">
              <span className="text-xs font-display font-bold text-text-muted">HbA1c 10-Year Path</span>
              <div className="flex-grow w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={a1cChartData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                    <XAxis dataKey="name" stroke="hsl(var(--text-muted))" fontSize={9} />
                    <YAxis stroke="hsl(var(--text-muted))" fontSize={9} domain={[4.0, 9.5]} />
                    <Tooltip contentStyle={{ background: 'hsl(var(--bg-surface))', border: '1px solid hsl(var(--border-subtle))', fontSize: 10 }} />
                    <Line type="monotone" dataKey="value" stroke="hsl(var(--accent-cyan))" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* AI Reasoning Narration */}
          <Card className="flex flex-col gap-3 border border-primary-blue/20">
            <div className="flex items-center gap-1.5 text-primary-blue font-bold text-xs font-display">
              <Sparkles className="w-4.5 h-4.5 animate-pulse" />
              <span>AI Clinical Trajectory Reasoning</span>
            </div>
            <p className="text-xs leading-relaxed text-text-primary font-sans">
              {simulationResultsA['ldl_trajectory']?.narration || 'Click recalculate to trigger AI engine reasoning...'}
            </p>
            <p className="text-[10px] leading-relaxed text-text-muted font-sans italic border-t border-border-subtle/30 pt-2">
              {simulationResultsA['ldl_trajectory']?.disclaimer}
            </p>
          </Card>
        </div>
      </main>

      <footer className="w-full max-w-7xl mx-auto text-center text-[10px] text-text-muted border-t border-border-subtle/30 pt-4 mt-6">
        ChronoBody Healthcare Console © 2026. Data governed by Zitadel OAuth and Ontomorph clinical structures.
      </footer>
    </div>
  );
};
