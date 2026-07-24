import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTwinStore } from '../store/useTwinStore';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Toggle } from '../components/ui/Toggle';
import { Button } from '../components/ui/Button';
import { Shield, Key, Eye, EyeOff, Save, Database, ArrowLeft } from 'lucide-react';

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { dbMode, toggleDBMode } = useTwinStore();

  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    setSupabaseUrl(localStorage.getItem('VITE_SUPABASE_URL') || import.meta.env.VITE_SUPABASE_URL || 'https://xbxflhzlucwhthfkjqzc.supabase.co');
    setSupabaseKey(localStorage.getItem('VITE_SUPABASE_ANON_KEY') || import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_0goxP8V7LONJgmKIUiCONw_Mj9TkY6R');
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('VITE_SUPABASE_URL', supabaseUrl);
    localStorage.setItem('VITE_SUPABASE_ANON_KEY', supabaseKey);
    setSaveStatus("Credentials cached! Toggling Live mode will reload connections.");
    setTimeout(() => setSaveStatus(null), 3000);
  };

  return (
    <div className="relative min-h-screen bg-bg-main p-6 md:p-12 flex flex-col justify-between">
      {/* Header */}
      <header className="w-full max-w-5xl mx-auto flex justify-between items-center py-4 border-b border-border-subtle/50">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-xs font-display text-text-muted hover:text-primary-blue transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
        <span className="font-display font-bold text-text-primary text-base">Console Configurations</span>
      </header>

      {/* Settings Grid */}
      <main className="flex-grow max-w-3xl w-full mx-auto py-10 flex flex-col gap-6">
        <Card className="flex flex-col gap-5">
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1">
              <h3 className="font-display text-lg font-bold text-text-primary flex items-center gap-2">
                <Database className="w-5 h-5 text-primary-blue" />
                Data Adapter Syncer
              </h3>
              <p className="text-xs text-text-muted">
                Choose between sandbox simulation data or live synchronization with your Cloud database.
              </p>
            </div>
            <Toggle
              checked={dbMode === 'live'}
              onChange={toggleDBMode}
              label={dbMode === 'live' ? 'Live Mode Active' : 'Mock Mode Active'}
            />
          </div>

          <div className="p-3.5 rounded bg-bg-main border border-border-subtle/50 flex flex-col gap-1.5 text-xs text-text-muted">
            <span className="font-semibold text-text-primary uppercase font-display tracking-wide">Syncer telemetry:</span>
            <span>Active client reads and twin state writes will hit: <strong>{dbMode === 'live' ? 'https://xbxflhzlucwhthfkjqzc.supabase.co' : 'In-Browser LocalStorage DB'}</strong></span>
          </div>
        </Card>

        {/* Credentials Form */}
        <Card className="flex flex-col gap-5 border border-border-subtle/80">
          <div className="flex flex-col gap-1">
            <h3 className="font-display text-lg font-bold text-text-primary flex items-center gap-2">
              <Key className="w-5 h-5 text-accent-indigo" />
              Supabase Integrations
            </h3>
            <p className="text-xs text-text-muted">
              Configure parameters to connect to your personal database instance.
            </p>
          </div>

          {saveStatus && (
            <div className="p-3 bg-success/10 border border-success/20 text-success text-xs font-medium rounded-md">
              {saveStatus}
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="flex flex-col gap-4">
            <Input
              label="Supabase URL"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              placeholder="e.g. https://xxxxxx.supabase.co"
              required
            />
            
            <div className="relative">
              <Input
                label="Anon Public Key"
                type={showKey ? 'text' : 'password'}
                value={supabaseKey}
                onChange={(e) => setSupabaseKey(e.target.value)}
                placeholder="sb_publishable_..."
                required
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-7.5 text-text-muted hover:text-text-primary transition-colors"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <Button type="submit" className="self-end gap-1.5 mt-2">
              <Save className="w-4 h-4" />
              Save Configuration
            </Button>
          </form>
        </Card>

        {/* Security / SDK Scopes */}
        <Card className="flex flex-col gap-3">
          <h3 className="font-display text-sm font-bold text-text-primary flex items-center gap-2">
            <Shield className="w-4.5 h-4.5 text-success" />
            API Key Grant Scopes
          </h3>
          <div className="grid grid-cols-2 gap-4 text-xs font-mono text-text-muted bg-bg-main p-4 rounded border border-border-subtle/50">
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-text-primary">Twin Scopes:</span>
              <span>• twins:read (Granted)</span>
              <span>• twins:write (Granted)</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-text-primary">Clinical Scopes:</span>
              <span>• holon:clinical_snomed (Granted)</span>
              <span>• holon:clinical_rxnorm (Granted)</span>
            </div>
          </div>
        </Card>
      </main>

      <footer className="text-center text-[10px] text-text-muted">
        ChronoBody Administration Dashboard. For authorization audits, contact security@chronobody.org
      </footer>
    </div>
  );
};
