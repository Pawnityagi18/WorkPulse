import React, { useState } from 'react';
import { apiSignup, apiLogin, apiGoogleAuth, apiUpdateProfile } from '../api/client';

const DEFAULT_AVATARS = {
  male: [
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  ],
  female: [
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  ]
};

export default function AuthPage({ onAuthSuccess, onClose }) {
  const [isLogin, setIsLogin] = useState(false);
  const [step, setStep] = useState(1);
  const [role, setRole] = useState('freelancer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState('male');
  const [profession, setProfession] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [googleAuthData, setGoogleAuthData] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1 validation: Name, Email, Password, Role
  const handleProceedToStep2 = (e) => {
    e?.preventDefault?.();
    setError('');

    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setStep(2);
  };

  // Direct login submit
  const handleLoginSubmit = async (e) => {
    e?.preventDefault?.();
    setError('');
    setIsSubmitting(true);

    try {
      if (!email.trim() || !password) {
        setError('Please enter both email and password');
        setIsSubmitting(false);
        return;
      }

      const res = await apiLogin({ email: email.trim(), password });
      const userObj = res.user || {
        _id: res._id,
        name: res.name,
        email: res.email,
        role: res.role
      };

      if (res && res.token) {
        localStorage.setItem('workpulse_token', res.token);
        localStorage.setItem('workpulse_user', JSON.stringify(userObj));
        if (onAuthSuccess) onAuthSuccess(userObj);
      } else {
        setError(res?.message || 'Login failed. Invalid credentials.');
      }
    } catch (err) {
      setError(err?.message || 'Login failed. Check your details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2 final submit (Google or normal signup)
  const handleFinalSubmit = async (e) => {
    e?.preventDefault?.();
    setError('');
    setIsSubmitting(true);

    try {
      const defaultTitle = role === 'client' ? 'Hiring Client' : 'Full-Stack Developer';
      const finalTitle = profession.trim() || defaultTitle;
      const avatarList = DEFAULT_AVATARS[gender] || DEFAULT_AVATARS.male;
      const finalAvatar = selectedAvatar || avatarList[0];

      if (googleAuthData) {
        // Google Signup Step 2 Completion
        const updateRes = await apiUpdateProfile({
          gender,
          profession: finalTitle,
          title: finalTitle,
          avatar: finalAvatar,
          role
        });

        const storedUser = JSON.parse(localStorage.getItem('workpulse_user') || '{}');
        const updatedUser = {
          ...storedUser,
          ...(updateRes?.user || {}),
          gender,
          profession: finalTitle,
          title: finalTitle,
          avatar: finalAvatar,
          role
        };

        localStorage.setItem('workpulse_user', JSON.stringify(updatedUser));
        if (onAuthSuccess) onAuthSuccess(updatedUser);
      } else {
        // Standard Email/Password Signup
        const res = await apiSignup({
          name: name.trim(),
          email: email.trim(),
          password,
          role,
          gender,
          profession: finalTitle,
          title: finalTitle,
          avatar: finalAvatar
        });

        const userObj = res.user || {
          _id: res._id,
          name: res.name || name.trim(),
          email: res.email || email.trim(),
          role: res.role || role,
          gender,
          profession: finalTitle,
          title: finalTitle,
          avatar: finalAvatar
        };

        if (res && res.token) {
          localStorage.setItem('workpulse_token', res.token);
          localStorage.setItem('workpulse_user', JSON.stringify(userObj));
          if (onAuthSuccess) onAuthSuccess(userObj);
        } else {
          setError(res?.message || res?.error || 'Registration failed. Check your details.');
        }
      }
    } catch (err) {
      setError(err?.message || 'Registration failed. Check your details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl transition-all">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold"
          >
            &times;
          </button>
        )}

        {/* Tab Headers */}
        {!googleAuthData && (
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => {
                setIsLogin(false);
                setStep(1);
                setError('');
              }}
              className={`flex-1 py-3 text-center text-sm font-semibold border-b-2 transition-colors ${
                !isLogin ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Sign Up
            </button>
            <button
              onClick={() => {
                setIsLogin(true);
                setError('');
              }}
              className={`flex-1 py-3 text-center text-sm font-semibold border-b-2 transition-colors ${
                isLogin ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Log In
            </button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
            {error}
          </div>
        )}

        {/* LOGIN FORM */}
        {isLogin ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-blue-600 py-2.5 font-semibold text-white shadow-md hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        ) : (
          /* REGISTRATION FORM */
          <div>
            {step === 1 ? (
              /* STEP 1 */
              <form onSubmit={handleProceedToStep2} className="space-y-4">
                <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setRole('freelancer')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition ${
                      role === 'freelancer' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                    }`}
                  >
                    I want to Work
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('client')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition ${
                      role === 'client' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                    }`}
                  >
                    I want to Hire
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-lg bg-blue-600 py-2.5 font-semibold text-white shadow-md hover:bg-blue-700 transition"
                >
                  Continue to Step 2 &rarr;
                </button>
              </form>
            ) : (
              /* STEP 2: PROFILE & IDENTITY */
              <form onSubmit={handleFinalSubmit} className="space-y-4">
                <div className="text-center mb-2">
                  <h3 className="text-base font-bold text-gray-800">Profile &amp; Identity</h3>
                  <p className="text-xs text-gray-500">Step 2 of 2: Personalize your account</p>
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Gender</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setGender('male');
                        setSelectedAvatar('');
                      }}
                      className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition ${
                        gender === 'male'
                          ? 'border-blue-600 bg-blue-50 text-blue-600'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      Male
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setGender('female');
                        setSelectedAvatar('');
                      }}
                      className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition ${
                        gender === 'female'
                          ? 'border-blue-600 bg-blue-50 text-blue-600'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      Female
                    </button>
                  </div>
                </div>

                {/* Profession / Role Title */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                    {role === 'client' ? 'Company or Role Title' : 'Professional Title'}
                  </label>
                  <input
                    type="text"
                    value={profession}
                    onChange={(e) => setProfession(e.target.value)}
                    placeholder={role === 'client' ? 'e.g. Hiring Client / Acme Corp' : 'e.g. Full-Stack Developer'}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {/* Avatar Selection */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">Choose Avatar</label>
                  <div className="flex items-center justify-center gap-3">
                    {(DEFAULT_AVATARS[gender] || DEFAULT_AVATARS.male).map((imgUrl, idx) => {
                      const isSelected = selectedAvatar === imgUrl || (!selectedAvatar && idx === 0);
                      return (
                        <img
                          key={idx}
                          src={imgUrl}
                          alt="avatar"
                          onClick={() => setSelectedAvatar(imgUrl)}
                          className={`h-12 w-12 cursor-pointer rounded-full object-cover border-2 transition ${
                            isSelected ? 'border-blue-600 ring-2 ring-blue-300 scale-105' : 'border-gray-200 hover:opacity-80'
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-2 pt-2">
                  {!googleAuthData && (
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-4 py-2.5 text-xs font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                    >
                      Back
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 rounded-lg bg-blue-600 py-2.5 font-semibold text-white shadow-md hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {isSubmitting ? 'Completing Registration...' : 'Complete Registration'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}