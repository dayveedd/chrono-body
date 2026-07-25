import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Activity, Shield, Brain, ArrowRight } from 'lucide-react';

export const Landing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-bg-main overflow-hidden flex flex-col justify-between">
      {/* Ambient background grids and neon glows */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-20%] w-[60%] h-[60%] rounded-full bg-primary-blue/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-20%] w-[60%] h-[60%] rounded-full bg-accent-cyan/5 blur-[120px]" />
        
        {/* Holographic grid overlay */}
        <div 
          className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]" 
          style={{
            backgroundImage: `linear-gradient(to right, hsl(var(--text-primary)) 1px, transparent 1px),
                              linear-gradient(to bottom, hsl(var(--text-primary)) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
        {/* Scanner scanline effect */}
        <div className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-accent-cyan/20 to-transparent animate-scanline pointer-events-none" />
      </div>

      {/* Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-primary-blue to-accent-cyan flex items-center justify-center shadow-lg">
            <span className="font-display font-bold text-white text-base">C</span>
          </div>
          <span className="font-display font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-text-primary via-primary-blue to-accent-cyan">
            ChronoBody
          </span>
        </div>
        <Button variant="glass" size="sm" onClick={() => navigate('/auth')}>
          Sign In
        </Button>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex-grow flex items-center px-6">
        <div className="w-full max-w-4xl mx-auto text-center flex flex-col items-center gap-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-blue/10 border border-primary-blue/20 text-primary-blue text-xs font-display font-medium tracking-wide uppercase"
          >
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            Powered by Ontomorph Digital Twin Platform
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-5xl md:text-7xl font-bold tracking-tight text-text-primary leading-[1.05]"
          >
            A predictive blueprint for your <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-blue via-accent-cyan to-accent-indigo">
              future health.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-xl text-base md:text-lg text-text-muted font-sans leading-relaxed"
          >
            Rather than looking back at charts, simulate possible futures. Run biological trajectories, explore anatomical changes, and view AI clinical notes before they become reality.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 mt-4"
          >
            <Button size="lg" className="group shadow-lg gap-2" onClick={() => navigate('/interview')}>
              Initialize Digital Twin
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button size="lg" variant="glass" onClick={() => navigate('/dashboard')}>
              Explore Demo Sandbox
            </Button>
          </motion.div>

          {/* Features grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mt-20 text-left"
          >
            <div className="glass-card rounded-lg p-6 flex flex-col gap-3">
              <div className="w-10 h-10 rounded-md bg-primary-blue/10 flex items-center justify-center text-primary-blue border border-primary-blue/20">
                <Brain className="w-5 h-5" />
              </div>
              <h3 className="font-display font-semibold text-text-primary text-base">Conversational Intake</h3>
              <p className="text-sm text-text-muted font-sans leading-relaxed">
                Provide your medical history using clinical notes, genomic datasets, or simple conversational chat.
              </p>
            </div>

            <div className="glass-card rounded-lg p-6 flex flex-col gap-3">
              <div className="w-10 h-10 rounded-md bg-accent-cyan/10 flex items-center justify-center text-accent-cyan border border-accent-cyan/20">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="font-display font-semibold text-text-primary text-base">10-Year Simulations</h3>
              <p className="text-sm text-text-muted font-sans leading-relaxed">
                Apply lifestyle, diet, or treatment parameters to scrub biological timelines and compare clinical risk trajectories.
              </p>
            </div>

            <div className="glass-card rounded-lg p-6 flex flex-col gap-3">
              <div className="w-10 h-10 rounded-md bg-accent-indigo/10 flex items-center justify-center text-accent-indigo border border-accent-indigo/20">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="font-display font-semibold text-text-primary text-base">Clinical SOAP Notes</h3>
              <p className="text-sm text-text-muted font-sans leading-relaxed">
                Generate shareable, medical-grade diagnostic SOAP notes and visit summaries backed by Ontomorph HOLON knowledge.
              </p>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 text-center text-xs text-text-muted font-sans border-t border-border-subtle/50">
        © 2026 ChronoBody. All rights reserved. For simulation demonstration purposes only.
      </footer>
    </div>
  );
};
