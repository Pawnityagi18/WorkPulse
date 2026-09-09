import React, { useState, useEffect } from 'react';
import { ArrowLeft, Mail, Lock, User, Briefcase, Code } from 'lucide-react';
import { apiLogin, apiSignup } from '../api/client';

export default function AuthPage({ mode = 'login', onNavigate, onLoginSuccess }) {
  const isLogin = mode === 'login';
  
  const [role, setRole] = useState('freelancer'); // 'freelancer' | 'client'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 🌟 Google Cloud Console Credentials wala Client ID yahan paste karein:
  const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";

  // Google Identity Services (GIS) Load & Render for BOTH Login & Signup
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse
        });

        // Google Button Container
        const btnContainer = document.getElementById('googleSignInBtn');
        if (btnContainer) {
          btnContainer.innerHTML = ''; // Clear previous button
          window.google.accounts.id.renderButton(btnContainer, {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: isLogin ? 'signin_with' : 'signup_with',
            shape: 'rectangular',
            logo_alignment: 'center'
          });
        }
      }
    };

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [isLogin, role]);

  // Real Google Auth Response: Decodes real Google Name, Email, and Avatar
  const handleGoogleResponse = (response) => {
    try {
      setLoading(true);
      const base64Url = response.credential.split('.');
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(jsonPayload);

      // Real user details extracted from Google
      const realGoogleUser = {
        _id: 'google-' + payload.sub,
        name: payload.name,
        email: payload.email,
        avatar: payload.picture,
        role: role, // Chosen role (Client or Freelancer)
        verified: true
      };

      localStorage.setItem('token', response.credential);
      localStorage.setItem('workpulse_user', JSON.stringify(realGoogleUser));
      
      onLoginSuccess(realGoogleUser, isLogin ? `Welcome back, ${realGoogleUser.name}!` : `Welcome to WorkPulse, ${realGoogleUser.name}!`);
      onNavigate('explore');
    } catch (err) {
      setErrorMsg('Google Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fallback Google Sign-in if GIS script is loading
  const handleFallbackGoogle = () => {
    const simulatedName = name.trim() || 'Google User';
    const simulatedEmail = email.trim() || 'user@gmail.com';
    const googleUser = {
      _id: 'google-user-' + Date.now(),
      name: simulatedName,
      email: simulatedEmail,
      role: role,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      verified: true
    };
    localStorage.setItem('token', 'google_jwt_' + Date.now());
    localStorage.setItem('workpulse_user', JSON.stringify(googleUser));
    onLoginSuccess(googleUser, isLogin ? `Welcome back!` : `Account created!`);
    onNavigate('explore');
  };

  // Standard Form Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await apiLogin({ email, password });
      } else {
        result = await apiSignup({ name, email, password, role });
      }

      if (result.token && onLoginSuccess) {
        localStorage.setItem('token', result.token);
        localStorage.setItem('workpulse_user', JSON.stringify(result.user));
        onLoginSuccess(result.user, isLogin ? `Welcome back, ${result.user.name}!` : 'Account created successfully!');
        onNavigate('explore');
      }
    } catch (err) {
      setErrorMsg(err.message || (isLogin ? 'Login failed. Check your credentials.' : 'Registration failed.'));
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Demo Evaluation Shortcuts
  const handleDemoLogin = (demoRole) => {
    const demoUser = demoRole === 'client' 
      ? { _id: 'demo-client-1', name: 'Demo Employer', email: 'client.demo@workpulse.com', role: 'client', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', isDemo: true }
      : { _id: 'demo-free-1', name: 'Elena Rostova', email: 'elena.rostova@dev.com', role: 'freelancer', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150', isDemo: true };

    localStorage.setItem('token', 'demo_jwt_token_' + demoRole);
    localStorage.setItem('workpulse_user', JSON.stringify(demoUser));
    onLoginSuccess(demoUser, `Logged in as ${demoUser.name} (${demoRole})`);
    onNavigate('explore');
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 74px)',
      background: 'var(--bg-gradient, linear-gradient(135deg, #E6F4F1 0%, #F0FAF8 50%, #FFFFFF 100%))',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 1.5rem'
    }}>
      <div style={{
        maxWidth: '460px',
        width: '100%',
        background: '#FFFFFF',
        border: '1px solid var(--border-subtle, #E2E8F0)',
        borderRadius: '24px',
        padding: '2.5rem 2rem',
        boxShadow: '0 20px 40px rgba(0, 128, 128, 0.08)',
        position: 'relative'
      }}>
        
        {/* Back to Home */}
        <button
          onClick={() => onNavigate('explore')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted, #64748b)',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            marginBottom: '1.25rem',
            padding: 0
          }}
          onMouseEnter={(e) => e.target.style.color = 'var(--primary, #008080)'}
          onMouseLeave={(e) => e.target.style.color = '#64748b'}
        >
          <ArrowLeft size={16} /> Back to Marketplace
        </button>

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main, #0F172A)', marginBottom: '0.35rem' }}>
            {isLogin ? 'Welcome Back' : 'Create an Account'}
          </h2>
          <p style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.875rem', margin: 0 }}>
            {isLogin 
              ? 'Log in to continue to your WorkPulse workspace' 
              : 'Join over 28,000+ top verified engineering and AI talent'}
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div style={{
            padding: '0.75rem 1rem',
            background: '#FEE2E2',
            border: '1px solid #FCA5A5',
            borderRadius: '12px',
            color: '#B91C1C',
            fontSize: '0.85rem',
            marginBottom: '1.25rem',
            textAlign: 'center'
          }}>
            {errorMsg}
          </div>
        )}

        {/* 🌟 SIGNUP ONLY: ROLE SELECTOR BEFORE GOOGLE AUTH */}
        {!isLogin && (
          <div style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" style={{ marginBottom: '0.4rem', display: 'block' }}>
              I want to:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
              <button
                type="button"
                onClick={() => setRole('freelancer')}
                style={{
                  padding: '0.65rem',
                  borderRadius: '10px',
                  border: role === 'freelancer' ? '2px solid var(--primary)' : '1px solid #E2E8F0',
                  background: role === 'freelancer' ? 'var(--primary-light)' : '#FFFFFF',
                  color: role === 'freelancer' ? 'var(--primary)' : '#475569',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  cursor: 'pointer'
                }}
              >
                <Code size={15} /> Work as Talent
              </button>
              <button
                type="button"
                onClick={() => setRole('client')}
                style={{
                  padding: '0.65rem',
                  borderRadius: '10px',
                  border: role === 'client' ? '2px solid var(--primary)' : '1px solid #E2E8F0',
                  background: role === 'client' ? 'var(--primary-light)' : '#FFFFFF',
                  color: role === 'client' ? 'var(--primary)' : '#475569',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  cursor: 'pointer'
                }}
              >
                <Briefcase size={15} /> Hire as Client
              </button>
            </div>
          </div>
        )}

        {/* 🌟 GOOGLE POPUP BUTTON CONTAINER (FOR BOTH LOGIN & SIGNUP) */}
        <div id="googleSignInBtn" style={{ width: '100%', minHeight: '44px', display: 'flex', justifyContent: 'center' }}>
          {/* Fallback button if Google script is loading */}
          <button
            type="button"
            onClick={handleFallbackGoogle}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '12px',
              border: '1.5px solid #E2E8F0',
              background: '#FFFFFF',
              color: '#1E293B',
              fontSize: '0.925rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z"/>
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"/>
            </svg>
            <span>{isLogin ? 'Sign in with Google' : 'Sign up with Google'}</span>
          </button>
        </div>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          margin: '1.35rem 0',
          color: '#94a3b8',
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          fontWeight: 700
        }}>
          <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
          <span>Or with Email</span>
          <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {!isLogin && (
            <div>
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <User size={16} color="#64748b" style={{ position: 'absolute', left: '12px' }} />
                <input
                  required
                  type="text"
                  placeholder="e.g. Alex Morgan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '2.4rem' }}
                />
              </div>
            </div>
          )}

          <div>
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Mail size={16} color="#64748b" style={{ position: 'absolute', left: '12px' }} />
              <input
                required
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '2.4rem' }}
              />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
              <label className="form-label" style={{ margin: 0 }}>Password</label>
            </div>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock size={16} color="#64748b" style={{ position: 'absolute', left: '12px' }} />
              <input
                required
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '2.4rem' }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', marginTop: '0.4rem' }}
          >
            {loading ? 'Please wait…' : (isLogin ? 'Login' : 'Create Free Account')}
          </button>
        </form>

        {/* Switch Link */}
        <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.85rem', color: '#64748b' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => onNavigate(isLogin ? 'signup' : 'login')}
            style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </div>

        {/* 1-Click Demo Evaluation */}
        <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #E2E8F0', textAlign: 'center' }}>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.5rem' }}>
            ⚡ Instant 1-Click Demo Evaluation
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={() => handleDemoLogin('client')}
              className="badge badge-verified"
              style={{ cursor: 'pointer', padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
            >
              Demo Client
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('freelancer')}
              className="badge badge-category"
              style={{ cursor: 'pointer', padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
            >
              Demo Freelancer
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}