import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTwinStore } from '../store/useTwinStore';
import { holonService } from '../services/holon';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Send, Activity, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Interview: React.FC = () => {
  const navigate = useNavigate();
  const {
    chatHistory,
    addChatMessage,
    updateLifestyleA,
    updateLifestyleB,
    updateMedicalA,
    updateMedicalB,
    resetChat
  } = useTwinStore();

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [compiling, setCompiling] = useState(false);
  const [compileProgress, setCompileProgress] = useState(0);
  const [compileLogs, setCompileLogs] = useState<string[]>([]);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, loading]);

  // Quick Onboarding Suggestions
  const suggestions = [
    "I have high cholesterol and take Atorvastatin 20mg",
    "I smoke daily and drink moderate alcohol",
    "No primary symptoms, but family history of diabetes",
    "I have Type 2 Diabetes and take Metformin"
  ];

  // Entity parsing logic based on clinical terms and HOLON lookups
  const processIntakeResponse = async (text: string) => {
    setLoading(true);
    addChatMessage({ sender: 'user', text });

    // Wait a brief period representing AI analysis
    await new Promise(r => setTimeout(r, 1200));

    const lowercase = text.toLowerCase();
    const entities: any[] = [];

    // Parse diagnostic keywords and fetch concepts from Holon
    if (lowercase.includes('atorvastatin') || lowercase.includes('cholesterol')) {
      const concepts = await holonService.searchConcepts('atorvastatin');
      if (concepts.length > 0) {
        entities.push({ category: 'Medication', value: concepts[0].conceptName, conceptId: String(concepts[0].conceptId) });
        updateMedicalA({ medications: ['Atorvastatin 20mg'] });
        updateMedicalB({ medications: ['Atorvastatin 20mg'] });
      }
      updateLifestyleA({ diet: 'poor' }); // Simulates high cholesterol baseline
    }

    if (lowercase.includes('metformin') || lowercase.includes('diabetes')) {
      const concepts = await holonService.searchConcepts('metformin');
      if (concepts.length > 0) {
        entities.push({ category: 'Medication', value: concepts[0].conceptName, conceptId: String(concepts[0].conceptId) });
        updateMedicalA({ medications: ['Metformin 500mg'] });
        updateMedicalB({ medications: ['Metformin 500mg'] });
      }
      updateMedicalA({ conditions: ['Type 2 Diabetes Mellitus'] });
      updateMedicalB({ conditions: ['Type 2 Diabetes Mellitus'] });
    }

    if (lowercase.includes('smoke')) {
      entities.push({ category: 'Lifestyle', value: 'Smoking telemetry detected' });
      updateLifestyleA({ smoking: true });
      updateLifestyleB({ smoking: true });
    }

    if (lowercase.includes('family') || lowercase.includes('diabetes')) {
      updateMedicalA({ familyHistory: ['Type 2 Diabetes Mellitus'] });
      updateMedicalB({ familyHistory: ['Type 2 Diabetes Mellitus'] });
    }

    // AI Response text creation
    let aiText = "Intake parameters normalized. I have updated your baseline configuration: ";
    if (entities.length > 0) {
      aiText += entities.map(e => `[${e.category}: ${e.value}]`).join(', ') + ". ";
    } else {
      aiText += "No specific medication codes flagged. ";
    }
    
    aiText += "Would you like to customize other lifestyle variables (e.g. active levels, stress, sleep) or compile the Digital Twin now?";

    addChatMessage({
      sender: 'ai',
      text: aiText,
      entities
    });
    setLoading(false);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const msg = input;
    setInput('');
    processIntakeResponse(msg);
  };

  const triggerCompilation = () => {
    setCompiling(true);
    const logs = [
      "Contacting Ontomorph HOLON endpoint...",
      "Resolving clinical vocabularies (SNOMED, RxNorm)...",
      "Minting synthetic patient consent grants...",
      "Connecting to Digital Twin Platform...",
      "Mapping cardiovascular baseline markers (LDL)...",
      "Mapping metabolic baseline markers (A1c)...",
      "Compiling 10-year trajectory simulations...",
      "Structuring 3D anatomy shader highlights...",
      "Compilation complete! Forwarding to workspace..."
    ];

    let currentLogIndex = 0;
    const logInterval = setInterval(() => {
      if (currentLogIndex < logs.length) {
        setCompileLogs(prev => [...prev, logs[currentLogIndex]]);
        setCompileProgress(Math.floor(((currentLogIndex + 1) / logs.length) * 100));
        currentLogIndex++;
      } else {
        clearInterval(logInterval);
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      }
    }, 450);
  };

  return (
    <div className="relative min-h-screen bg-bg-main flex flex-col justify-between p-6">
      {/* Background neon elements */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[10%] right-[10%] w-[40%] h-[40%] rounded-full bg-primary-blue/5 blur-[100px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 w-full max-w-5xl mx-auto flex justify-between items-center py-4 border-b border-border-subtle/50">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary-blue" />
          <span className="font-display font-bold text-text-primary text-base">ChronoBody Intake Console</span>
        </div>
        <Button variant="glass" size="sm" onClick={resetChat} className="gap-1.5">
          <RefreshCw className="w-3.5 h-3.5" />
          Reset Console
        </Button>
      </header>

      {/* Onboarding View */}
      <main className="relative z-10 flex-grow max-w-3xl w-full mx-auto flex flex-col justify-center py-8">
        <AnimatePresence mode="wait">
          {!compiling ? (
            <motion.div
              key="chat"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex flex-col h-[650px] glass-panel rounded-lg shadow-xl overflow-hidden"
            >
              {/* Message scroll log */}
              <div className="flex-grow overflow-y-auto p-6 flex flex-col gap-4">
                {chatHistory.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col max-w-[80%] ${msg.sender === 'user' ? 'self-end items-end' : 'self-start items-start'}`}
                  >
                    <div className="text-[10px] text-text-muted font-mono mb-1">
                      {msg.sender === 'user' ? 'PATIENT_IN' : 'AI_ENGINE'}
                    </div>
                    <div
                      className={`rounded-lg p-4 text-sm font-sans leading-relaxed ${msg.sender === 'user' ? 'bg-primary-blue text-white shadow-md' : 'bg-bg-surface border border-border-subtle text-text-primary'}`}
                    >
                      {msg.text}
                      {msg.entities && msg.entities.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3 pt-2.5 border-t border-border-subtle/30">
                          {msg.entities.map((ent, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center px-2 py-0.5 rounded bg-primary-blue/10 border border-primary-blue/30 text-[10px] font-mono text-primary-blue uppercase font-bold"
                            >
                              {ent.category}: {ent.value}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="self-start flex flex-col items-start">
                    <span className="text-[10px] text-text-muted font-mono mb-1">AI_ANALYSIS</span>
                    <div className="glass-card rounded-lg p-4 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary-blue animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-2 h-2 rounded-full bg-primary-blue animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-2 h-2 rounded-full bg-primary-blue animate-bounce" />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* suggestions / input */}
              <div className="p-4 border-t border-border-subtle/50 bg-bg-surface/50 flex flex-col gap-4">
                {chatHistory.length === 1 && (
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-display font-medium text-text-muted">Suggestions:</span>
                    <div className="flex flex-wrap gap-2">
                      {suggestions.map((sug, i) => (
                        <button
                          key={i}
                          onClick={() => processIntakeResponse(sug)}
                          className="text-xs px-3 py-1.5 rounded-md glass-card text-text-muted hover:border-primary-blue hover:text-primary-blue text-left transition-colors"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Describe symptoms, medications, or lifestyle..."
                    className="flex-grow bg-bg-main border border-border-subtle/80 rounded-md px-4 py-2 text-sm text-text-primary focus:outline-none focus:border-primary-blue transition-colors"
                  />
                  <Button onClick={handleSend} className="px-4">
                    <Send className="w-4 h-4" />
                  </Button>
                  <Button variant="glass" onClick={triggerCompilation} className="gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    Compile Twin
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : (
            /* Twin Generation Loader (DNA Helix compilation) */
            <motion.div
              key="loader"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center text-center p-8 gap-8"
            >
              {/* Rotating Double Helix Loader representation */}
              <div className="relative w-20 h-28 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border border-primary-blue/30 animate-spin" style={{ animationDuration: '4s' }} />
                <div className="absolute inset-2 rounded-full border border-accent-cyan/30 animate-spin" style={{ animationDuration: '3s', animationDirection: 'reverse' }} />
                <Activity className="w-8 h-8 text-primary-blue animate-pulse" />
              </div>

              <div className="flex flex-col gap-2">
                <h2 className="font-display font-bold text-2xl text-text-primary">Compiling Digital Twin</h2>
                <div className="w-64 h-1 bg-border-subtle rounded-full overflow-hidden mx-auto mt-2">
                  <div className="h-full bg-primary-blue transition-all duration-300" style={{ width: `${compileProgress}%` }} />
                </div>
                <span className="text-xs font-mono text-primary-blue mt-1 font-bold">{compileProgress}%</span>
              </div>

              {/* Status compile logs scrollbox */}
              <Card className="w-full max-w-md h-40 overflow-y-auto text-left font-mono text-[10px] text-text-muted flex flex-col gap-1 border-border-subtle/50 bg-bg-surface/30">
                {compileLogs.map((log, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-primary-blue select-none">▶</span>
                    <span>{log}</span>
                  </div>
                ))}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* footer disclaimer */}
      <footer className="relative z-10 text-center text-[10px] text-text-muted max-w-md mx-auto leading-relaxed">
        <div className="flex items-center justify-center gap-1 mb-1 text-warning font-semibold">
          <AlertCircle className="w-3.5 h-3.5" />
          Medical Disclaimer
        </div>
        ChronoBody is a diagnostic simulation console. It does not provide medical treatment, diagnoses, or replace human healthcare consultations.
      </footer>
    </div>
  );
};
