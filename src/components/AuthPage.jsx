import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Mail, 
  Lock, 
  User, 
  Briefcase, 
  Code, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Camera, 
  CheckCircle2, 
  Upload, 
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { apiLogin, apiSignup } from '../api/client';

export default function AuthPage({ mode = 'login', onNavigate, onLoginSuccess }) {
  const isLogin = mode === 'login';
  
  // 🌟 STEP STATE: 1 = Account Credentials, 2 = Profile, Gender & Avatar
  const [step, setStep] = useState(1);

  // Form State
  const [role, setRole] = useState('freelancer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Step 2 Fields
  const [gender, setGender] = useState('male');
  const [profession, setProfession] = useState('');
  const [customAvatarUploaded, setCustomAvatarUploaded] = useState(false);
  
  const DEFAULT_AVATARS = {
    male: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    female: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    other: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'
  };

  const [avatar, setAvatar] = useState(DEFAULT_AVATARS.male);
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";

  // Gender badalne par avatar auto-switch
  const handleGenderChange = (selectedGender) => {
    setGender(selectedGender);
    if (!customAvatarUploaded) {
      setAvatar(DEFAULT_AVATARS[selectedGender] || DEFAULT_AVATARS.other);
    }
  };

  // Custom photo upload
  const handleCustomPhotoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      setErrorMsg('Image size should be less than 3MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setAvatar(uploadEvent.target.result);
      setCustomAvatarUploaded(true);
      setErrorMsg('');
    };
    reader.readAsDataURL(file);
  };

  // Password Strength
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const strengthScore = [hasMinLength, hasUppercase, hasNumber, hasSpecial].filter(Boolean).length;
  
  const getStrengthLabel = () => {
    if (!password) return { text: '', color: '#94a3b8', width: '0%' };
    if (strengthScore <= 1) return { text: 'Weak', color: '#ef4444', width: '25%' };
    if (strengthScore === 2) return { text: 'Fair', color: '#f59e0b', width: '50%' };
    if (strengthScore === 3) return { text: 'Good', color: '#3b82f6', width: '75%' };
    return { text: 'Strong (Secure)', color: '#10b981', width: '100%' };
  };

  const strength = getStrengthLabel();

  const handleSuggestStrongPassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    const caps = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const nums = '0123456789';
    const syms = '!@#$%&*';

    let gen = '';
    gen += caps[Math.floor(Math.random() * caps.length)];
    gen += nums[Math.floor(Math.random() * nums.length)];
    gen += syms[Math.floor(Math.random() * syms.length)];

    const all = chars + caps + nums + syms;
    for (let i = 0; i < 11; i++) {
      gen += all[Math.floor(Math.random() * all.length)];
    }

    setPassword(gen);
    setShowPassword(true);
  };

  // Google SDK Init
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

        const btnContainer = document.getElementById('googleSignInBtn');
        if (btnContainer && step === 1) {
          btnContainer.innerHTML = '';
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
  }, [isLogin, role, step]);

  // 🌟 GOOGLE AUTH RESPONSE: SIGNUP MEIN SEEDHE STEP 2 KHULEGA!
  const handleGoogleResponse = (response) => {
    try {
      setLoading(true);
      const base64Url = response.credential.split('.');
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64).split('').map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
      );
      const payload = JSON.parse(jsonPayload);

      setName(payload.name || '');
      setEmail(payload.email || '');
      if (payload.picture) {
        setAvatar(payload.picture);
        setCustomAvatarUploaded(true);
      }

      if (isLogin) {
        // Login me direct success
        const realGoogleUser = {
          _id: 'google-' + payload.sub,
          name: payload.name,
          email: payload.email,
          avatar: payload.picture || DEFAULT_AVATARS.male,
          role: role,
          verified: true
        };
        localStorage.setItem('token', response.credential);
        localStorage.setItem('workpulse_user', JSON.stringify(realGoogleUser));
        onLoginSuccess(realGoogleUser, `Welcome back, ${realGoogleUser.name}!`);
        onNavigate('explore');
      } else {
        // Signup me 2ND FORM KHULEGA (Gender & Profession)!
        setStep(2);
        setErrorMsg('');
      }
    } catch (err) {
      setErrorMsg('Google Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFallbackGoogle = () => {
    if (isLogin) {
      const simulatedName = name.trim() || 'Google User';
      const simulatedEmail = email.trim() || 'user@gmail.com';
      const googleUser = {
        _id: 'google-user-' + Date.now(),
        name: simulatedName,
        email: simulatedEmail,
        role: role,
        avatar: avatar,
        verified: true
      };
      localStorage.setItem('token', 'google_jwt_' + Date.now());
      localStorage.setItem('workpulse_user', JSON.stringify(googleUser));
      onLoginSuccess(googleUser, `Welcome back!`);
      onNavigate('explore');
    } else {
      // Signup fallback me bhi Step 2 khulega!
      setName(name.trim() || 'Google User');
      setEmail(email.trim() || 'user@gmail.com');
      setStep(2);
    }
  };

  // 🌟 STEP 1 SUBMIT: VALIDATE KARKE STEP 2 KHOLNA
  const handleProceedToStep2 = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!isLogin && strengthScore < 2) {
      setErrorMsg('Please enter a password with at least 8 characters.');
      return;
    }

    setStep(2); // STEP 2 OPEN!
  };

  // 🌟 FINAL FORM SUBMIT (STEP 2 COMPLETED)
  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await apiLogin({ email, password });
      } else {
        result = await apiSignup({ 
          name, 
          email, 
          password: password || 'GoogleAuthPass2026!', 
          role,
          gender,
          profession: profession.trim() || (role === 'client' ? 'Hiring Client' : 'Full-Stack Developer'),
          avatar
        });
      }

      if (result.token && onLoginSuccess) {
        localStorage.setItem('token', result.token);
        localStorage.setItem('workpulse_user', JSON.stringify(result.user));
        onLoginSuccess(result.user, isLogin ? `Welcome back, ${result.user.name}!` : 'Account created successfully!');
        onNavigate('explore');
      }
    } catch (err) {
      setErrorMsg(err.message || (isLogin ? 'Login failed. Check credentials.' : 'Registration failed.'));
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (demoRole) => {
    const demoUser = demoRole === 'client' 
      ? { _id: 'demo-client-1', name: 'Demo Employer', email: 'client.demo@workpulse.com', role: 'client', avatar: DEFAULT_AVATARS.male, isDemo: true }
      : { _id: 'demo-free-1', name: 'Elena Rostova', email: 'elena.rostova@dev.com', role: 'freelancer', avatar: DEFAULT_AVATARS.female, isDemo: true };

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
        maxWidth: '480px',
        width: '100%',
        background: '#FFFFFF',
        border: '1px solid var(--border-subtle, #E2E8F0)',
        borderRadius: '24px',
        padding: '2.5rem 2rem',
        boxShadow: '0 20px 40px rgba(0, 128, 128, 0.08)',
        position: 'relative'
      }}>
        
        {/* Back Button */}
        <button
          onClick={() => {
            if (!isLogin && step === 2) {
              setStep(1);
            } else {
              onNavigate('explore');
            }
          }}
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
          <ArrowLeft size={16} /> {!isLogin && step === 2 ? 'Back to Step 1' : 'Back to Marketplace'}
        </button>

        {/* 🌟 STEP 1 & 2 INTERACTIVE TABS */}
        {!isLogin && (
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.6rem' }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{
                  padding: '0.4rem',
                  borderRadius: '8px',
                  border: step === 1 ? '2px solid var(--primary)' : '1px solid #E2E8F0',
                  background: step === 1 ? 'var(--primary-light)' : '#F8FAFC',
                  color: step === 1 ? 'var(--primary)' : '#64748b',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                1. Account Basics
              </button>
              <button
                type="button"
                onClick={() => {
                  if (name && email) setStep(2);
                  else setErrorMsg('Please fill name and email in Step 1 first.');
                }}
                style={{
                  padding: '0.4rem',
                  borderRadius: '8px',
                  border: step === 2 ? '2px solid var(--primary)' : '1px solid #E2E8F0',
                  background: step === 2 ? 'var(--primary-light)' : '#F8FAFC',
                  color: step === 2 ? 'var(--primary)' : '#64748b',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                2. Profile & Identity
              </button>
            </div>
            {/* Progress Bar */}
            <div style={{ width: '100%', height: '4px', background: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: step === 1 ? '50%' : '100%', height: '100%', background: 'var(--primary)', transition: 'width 0.3s ease' }} />
            </div>
          </div>
        )}

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main, #0F172A)', marginBottom: '0.35rem' }}>
            {isLogin ? 'Welcome Back' : (step === 1 ? 'Create an Account' : 'Set Up Your Profile')}
          </h2>
          <p style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.875rem', margin: 0 }}>
            {isLogin 
              ? 'Log in to continue to your WorkPulse workspace' 
              : (step === 1 ? 'Step 1: Enter your name, email and password' : 'Step 2: Choose your gender, profession and avatar')}
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

        {/* ======================= LOGIN VIEW ======================= */}
        {isLogin && (
          <>
            <div id="googleSignInBtn" style={{ width: '100%', minHeight: '44px', display: 'flex', justifyContent: 'center' }}>
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
                  cursor: 'pointer'
                }}
              >
                <span>Sign in with Google</span>
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.35rem 0', color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>
              <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
              <span>Or with Email</span>
              <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
            </div>

            <form onSubmit={handleFinalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
                <label className="form-label">Password</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Lock size={16} color="#64748b" style={{ position: 'absolute', left: '12px' }} />
                  <input
                    required
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '2.4rem', paddingRight: '2.5rem' }}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', marginTop: '0.4rem' }}>
                {loading ? 'Please wait…' : 'Login'}
              </button>
            </form>
          </>
        )}

        {/* ======================= SIGNUP STEP 1: CREDENTIALS ======================= */}
        {!isLogin && step === 1 && (
          <div>
            {/* Role Selector */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label className="form-label" style={{ marginBottom: '0.4rem', display: 'block' }}>I want to:</label>
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

            {/* Google Button */}
            <div id="googleSignInBtn" style={{ width: '100%', minHeight: '44px', display: 'flex', justifyContent: 'center' }}>
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
                  cursor: 'pointer'
                }}
              >
                <span>Sign up with Google (Proceeds to Step 2)</span>
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.35rem 0', color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>
              <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
              <span>Or with Email</span>
              <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
            </div>

            {/* Step 1 Form */}
            <form onSubmit={handleProceedToStep2} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
                  <button
                    type="button"
                    onClick={handleSuggestStrongPassword}
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                  >
                    <Sparkles size={12} color="#F59E0B" fill="#F59E0B" /> Suggest Strong Password
                  </button>
                </div>

                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Lock size={16} color="#64748b" style={{ position: 'absolute', left: '12px' }} />
                  <input
                    required
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter a secure password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '2.4rem', paddingRight: '2.5rem' }}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {password && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '0.25rem' }}>
                      <span style={{ color: '#64748b' }}>Strength:</span>
                      <span style={{ color: strength.color, fontWeight: 700 }}>{strength.text}</span>
                    </div>
                    <div style={{ width: '100%', height: '4px', background: '#E2E8F0', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: strength.width, height: '100%', background: strength.color, transition: 'all 0.3s ease' }} />
                    </div>
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', marginTop: '0.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontWeight: 800 }}
              >
                Proceed to Step 2: Profile Setup <ArrowRight size={17} />
              </button>
            </form>
          </div>
        )}

        {/* ======================= SIGNUP STEP 2: GENDER, PROFESSION & AVATAR ======================= */}
        {!isLogin && step === 2 && (
          <form onSubmit={handleFinalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* 1. AVATAR PREVIEW & CHANGE PHOTO */}
            <div style={{ textAlign: 'center', marginBottom: '0.25rem' }}>
              <div style={{ position: 'relative', width: '96px', height: '96px', margin: '0 auto 0.75rem' }}>
                <img
                  src={avatar}
                  alt="Avatar Preview"
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '3px solid var(--primary, #008080)',
                    boxShadow: '0 6px 16px rgba(0, 128, 128, 0.2)'
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    position: 'absolute',
                    bottom: '2px',
                    right: '2px',
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    background: 'var(--primary, #008080)',
                    border: '2px solid #FFFFFF',
                    color: '#FFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                  title="Upload Custom Photo"
                >
                  <Camera size={14} />
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleCustomPhotoSelect}
                style={{ display: 'none' }}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary, #008080)',
                  fontSize: '0.825rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem'
                }}
              >
                <Upload size={13} /> {customAvatarUploaded ? 'Change Custom Photo' : 'Upload Your Own Photo'}
              </button>
            </div>

            {/* 2. GENDER SELECTION (AUTO UPDATES AVATAR) */}
            <div>
              <label className="form-label" style={{ marginBottom: '0.4rem', display: 'block' }}>
                Select Gender:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.65rem' }}>
                <button
                  type="button"
                  onClick={() => handleGenderChange('male')}
                  style={{
                    padding: '0.65rem',
                    borderRadius: '12px',
                    border: gender === 'male' ? '2px solid var(--primary)' : '1.5px solid #E2E8F0',
                    background: gender === 'male' ? 'var(--primary-light)' : '#FFFFFF',
                    color: gender === 'male' ? 'var(--primary)' : '#475569',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem',
                    cursor: 'pointer'
                  }}
                >
                  👨 Male
                </button>
                <button
                  type="button"
                  onClick={() => handleGenderChange('female')}
                  style={{
                    padding: '0.65rem',
                    borderRadius: '12px',
                    border: gender === 'female' ? '2px solid var(--primary)' : '1.5px solid #E2E8F0',
                    background: gender === 'female' ? 'var(--primary-light)' : '#FFFFFF',
                    color: gender === 'female' ? 'var(--primary)' : '#475569',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem',
                    cursor: 'pointer'
                  }}
                >
                  👩 Female
                </button>
                <button
                  type="button"
                  onClick={() => handleGenderChange('other')}
                  style={{
                    padding: '0.65rem',
                    borderRadius: '12px',
                    border: gender === 'other' ? '2px solid var(--primary)' : '1.5px solid #E2E8F0',
                    background: gender === 'other' ? 'var(--primary-light)' : '#FFFFFF',
                    color: gender === 'other' ? 'var(--primary)' : '#475569',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem',
                    cursor: 'pointer'
                  }}
                >
                  🧑 Other
                </button>
              </div>
            </div>

            {/* 3. PROFESSION */}
            <div>
              <label className="form-label">
                {role === 'client' ? 'Company Name or Title' : 'Your Professional Title / Specialization'}
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Briefcase size={16} color="#64748b" style={{ position: 'absolute', left: '12px' }} />
                <input
                  required
                  type="text"
                  placeholder={role === 'client' ? "e.g. Founder at TechCorp / Hiring Lead" : "e.g. Full-Stack React & Node Developer"}
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '2.4rem' }}
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', fontWeight: 800, marginTop: '0.5rem' }}
            >
              {loading ? 'Creating Account…' : 'Complete Setup & Launch Workspace'}
            </button>
          </form>
        )}

        {/* Switch Link */}
        <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.85rem', color: '#64748b' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => {
              setStep(1);
              onNavigate(isLogin ? 'signup' : 'login');
            }}
            style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </div>

        {/* Demo Login */}
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