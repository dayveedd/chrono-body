import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { getSupabaseClient } from '../services/supabase';
import { ShieldAlert, LogIn, Database } from 'lucide-react';

export const Auth: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = getSupabaseClient();
    if (!supabase) {
      // Offline/Mock Auth Mode
      setTimeout(() => {
        setLoading(false);
        navigate('/interview');
      }, 1000);
      return;
    }

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setError("Sign up successful! Please check your email for confirmation.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/interview');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestSignIn = () => {
    navigate('/interview');
  };

  const supabaseConnected = !!getSupabaseClient();

  return (
    <div className="relative min-h-screen bg-bg-main flex items-center justify-center px-6">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[20%] left-[30%] w-[30%] h-[30%] rounded-full bg-primary-blue/5 blur-[80px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center flex flex-col items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-md bg-gradient-to-br from-primary-blue to-accent-cyan flex items-center justify-center shadow-lg">
            <span className="font-display font-bold text-white text-lg">C</span>
          </div>
          <h2 className="font-display text-2xl font-bold text-text-primary tracking-tight">Access ChronoBody Console</h2>
          <p className="text-xs text-text-muted font-sans max-w-xs">
            Authenticate to sync your physiological digital twin telemetry with our secure cloud servers.
          </p>
        </div>

        <Card className="flex flex-col gap-5 border border-border-subtle/80">
          {error && (
            <div className="flex gap-2 p-3.5 rounded bg-error/10 border border-error/20 text-error text-xs font-sans">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-xs font-display py-1.5 px-3 rounded bg-bg-main border border-border-subtle/50 text-text-muted">
            <div className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-primary-blue" />
              Database Mode:
            </div>
            <span className={`font-bold uppercase ${supabaseConnected ? 'text-success' : 'text-warning'}`}>
              {supabaseConnected ? 'Live Supabase' : 'Offline Sandbox'}
            </span>
          </div>

          <form onSubmit={handleAuth} className="flex flex-col gap-4">
            <Input
              label="Clinical / Patient Email"
              type="email"
              placeholder="e.g. physician@chronobody.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Console Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button type="submit" loading={loading} className="w-full mt-2">
              <LogIn className="w-4 h-4 mr-2" />
              {isSignUp ? 'Create Console Account' : 'Authenticate Console'}
            </Button>
          </form>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-border-subtle/40"></div>
            <span className="flex-shrink mx-4 text-[10px] font-display text-text-muted uppercase tracking-wider">or</span>
            <div className="flex-grow border-t border-border-subtle/40"></div>
          </div>

          <Button variant="glass" className="w-full" onClick={handleGuestSignIn}>
            Developer Sandbox Access
          </Button>

          <div className="text-center mt-2">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs text-primary-blue hover:underline font-display"
            >
              {isSignUp ? 'Already have an account? Sign In' : 'Need a cloud account? Sign Up'}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};
