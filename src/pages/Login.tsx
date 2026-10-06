import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { googleSignIn, initAuth } from '../lib/auth';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Optional: detect if they are already logged into Firebase
    const unsubscribe = initAuth((user, token) => {
      // Could automatically log them in via our backend using the google email
    }, () => {});
    return () => unsubscribe();
  }, []);

  const saveClient = (client: any) => {
    // Display-only details; access is controlled by the secure session cookie set by the server.
    localStorage.setItem('clientId', client.id);
    localStorage.setItem('clientName', client.name);
    localStorage.setItem('clientEmail', client.email);
  };

  const handleGoogleSignIn = async () => {
    try {
      setErrorMsg('');
      const result = await googleSignIn();
      if (result && result.user) {
        // The server verifies the Google ID token itself, then signs the visitor in.
        const idToken = await result.user.getIdToken();
        const res = await fetch('/api/client/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken })
        });
        const data = await res.json();
        if (data.client) {
          saveClient(data.client);
          navigate('/dashboard');
        } else {
          setErrorMsg(data.error || "Error verifying Google account with backend.");
        }
      }
    } catch(err) {
      console.error(err);
      setErrorMsg("Google Sign In Failed");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      if (isLogin) {
        const res = await fetch('/api/client/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (data.client) {
          saveClient(data.client);
          navigate('/dashboard');
        } else {
          setErrorMsg('Login failed: ' + (data.error || 'User not found. Try signing up?'));
        }
      } else {
        const res = await fetch('/api/client/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, name, password })
        });
        const data = await res.json();
        if (data.client) {
          saveClient(data.client);
          navigate('/dashboard');
        } else {
          setErrorMsg('Signup failed: ' + (data.error || 'User already exists.'));
        }
      }
    } catch (err) {
      setErrorMsg("Network error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-28 pb-12 px-4 sm:px-6 lg:px-8 bg-mashiro relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-sakura/50 via-mashiro to-mashiro"></div>
      
      <div className="max-w-md w-full space-y-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-sakura/20 p-10 rounded-[2rem] shadow-2xl border border-sakura"
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl font-serif font-light text-momo tracking-tight">
              {isLogin ? <>Welcome <em>back</em>.</> : <>Create your <em>account</em>.</>}
            </h2>
            <p className="mt-3 text-sm text-momo/70 font-light">
              {isLogin 
                ? 'Sign in to access your client portal' 
                : 'Sign up to start your fitness journey'}
            </p>
          </div>

          {errorMsg && (
            <div className="bg-red-50 text-red-600 p-3 mb-6 rounded-xl text-sm text-center border border-red-200">
              {errorMsg}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {!isLogin && (
              <div>
                <label className="block text-xs font-medium text-momo/70 mb-2 uppercase tracking-widest">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="appearance-none block w-full px-4 py-3 bg-mashiro border border-ash rounded-full text-momo placeholder-momo/40 focus:outline-none focus:ring-1 focus:ring-momo focus:border-momo sm:text-sm transition-colors"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}
            
            <div>
              <label className="block text-xs font-medium text-momo/70 mb-2 uppercase tracking-widest">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-momo/50" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full pl-11 pr-4 py-3 bg-mashiro border border-ash rounded-full text-momo placeholder-momo/40 focus:outline-none focus:ring-1 focus:ring-momo focus:border-momo sm:text-sm transition-colors"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-momo/70 mb-2 uppercase tracking-widest">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-momo/50" />
                </div>
                <input
                  type="password"
                  required
                  minLength={isLogin ? undefined : 8}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full pl-11 pr-4 py-3 bg-mashiro border border-ash rounded-full text-momo placeholder-momo/40 focus:outline-none focus:ring-1 focus:ring-momo focus:border-momo sm:text-sm transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {isLogin && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-momo focus:ring-momo border-sakura rounded bg-mashiro"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-momo/70">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className="font-medium text-momo hover:text-momo/80 transition-colors">
                    Forgot password?
                  </a>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-semibold rounded-full text-parchment bg-terracotta hover:bg-[#99492a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-momo transition-all hover:scale-[1.02]"
            >
              {isLogin ? 'Sign In' : 'Create Account'}
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-sakura"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-sakura/20 text-momo/60">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full flex justify-center py-4 px-4 border border-sakura text-sm font-bold tracking-widest rounded-full text-momo bg-mashiro hover:bg-sakura focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-momo transition-all hover:scale-[1.02]"
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm font-medium text-momo/60 hover:text-momo transition-colors"
            >
              {isLogin 
                ? "Don't have an account? Sign up" 
                : "Already have an account? Sign in"}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
