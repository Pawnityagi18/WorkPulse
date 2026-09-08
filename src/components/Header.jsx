import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  UserCheck, 
  PlusCircle, 
  LayoutDashboard, 
  Bookmark, 
  LogIn, 
  UserPlus, 
  LogOut, 
  ChevronDown, 
  Trash2, 
  Menu, 
  X, 
  Bell, 
  Camera 
} from 'lucide-react';
import { 
  apiFetchNotifications, 
  apiMarkNotificationRead, 
  apiMarkAllNotificationsRead, 
  apiUploadAvatar 
} from '../api/client';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  userRole, 
  setUserRole, 
  savedCount = 0, 
  onOpenPostModal, 
  proposalsCount = 0,
  currentUser,
  onOpenAuthModal,
  onLogout,
  onDeleteAccount,
  onUpdateUser
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef(null);

  const isLoggedIn = Boolean(currentUser);
  const role = currentUser?.role; // 'client' | 'freelancer' | undefined
  const isClient = isLoggedIn && role === 'client';

  useEffect(() => {
    if (!currentUser) return;
    const loadNotifications = () => {
      apiFetchNotifications()
        .then((data) => {
          setNotifications(data.notifications || []);
          setUnreadCount(data.unreadCount || 0);
        })
        .catch(() => {});
    };
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const handleNotifClick = async (notif) => {
    if (!notif.read) {
      await apiMarkNotificationRead(notif._id).catch(() => {});
      setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    if (notif.link) {
      setActiveTab('dashboard');
    }
    setNotifDropdownOpen(false);
  };

  const handleMarkAllRead = async () => {
    await apiMarkAllNotificationsRead().catch(() => {});
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const handleAvatarFileSelected = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const result = await apiUploadAvatar(file);
      if (result.avatar && onUpdateUser) {
        onUpdateUser({ ...currentUser, avatar: result.avatar });
      }
    } catch (err) {
      alert(err.message || 'Avatar upload failed');
    } finally {
      setUploadingAvatar(false);
      e.target.value = '';
    }
  };

  const handleDeleteAccountClick = () => {
    if (window.confirm('⚠️ Are you sure you want to permanently delete your account? This action cannot be undone.')) {
      onDeleteAccount();
      setProfileDropdownOpen(false);
    }
  };

  const handleNavClick = (tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="main-navbar-header" style={{
      position: 'sticky',
      top: 0,
      zIndex: 900,
      backgroundColor: 'rgba(255, 255, 255, 0.85)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '74px'
      }}>
        
        {/* Brand Logo */}
        <div 
          onClick={() => handleNavClick('explore')} 
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
        >
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2px',
            boxShadow: '0 4px 10px rgba(13, 148, 136, 0.2)'
          }}>
            <img 
              src="/logo.jpg" 
              alt="WorkPulse Logo"
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '10px',
                objectFit: 'cover'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
          <div>
            <span style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.4rem',
              fontWeight: 800,
              color: 'var(--primary, #0d9488)',
              letterSpacing: '-0.02em',
              display: 'block'
            }}>
              WorkPulse
            </span>
            <span style={{
              fontSize: '0.65rem',
              fontWeight: 800,
              color: 'var(--text-muted, #64748b)',
              letterSpacing: '0.08em',
              display: 'block',
              marginTop: '-4px',
              textTransform: 'uppercase'
            }}>
              Freelance Marketplace
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav style={{
          display: 'none',
          alignItems: 'center',
          gap: '0.4rem'
        }} className="desktop-only-nav">
          <button 
            onClick={() => handleNavClick('explore')}
            className={`btn ${activeTab === 'explore' ? 'btn-secondary' : ''}`}
            style={{ 
              color: activeTab === 'explore' ? 'var(--primary, #0d9488)' : '#334155',
              background: activeTab === 'explore' ? 'rgba(13, 148, 136, 0.1)' : 'transparent',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontWeight: 600
            }}
          >
            <Search size={16} /> Browse Jobs
          </button>
          
          <button 
            onClick={() => handleNavClick('freelancers')}
            className={`btn ${activeTab === 'freelancers' ? 'btn-secondary' : ''}`}
            style={{ 
              color: activeTab === 'freelancers' ? 'var(--primary, #0d9488)' : '#334155',
              background: activeTab === 'freelancers' ? 'rgba(13, 148, 136, 0.1)' : 'transparent',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontWeight: 600
            }}
          >
            <UserCheck size={16} /> Find Talent
          </button>

          {/* DASHBOARD: ONLY FOR LOGGED-IN USERS */}
          {isLoggedIn && (
            <button 
              onClick={() => handleNavClick('dashboard')}
              className={`btn ${activeTab === 'dashboard' ? 'btn-secondary' : ''}`}
              style={{ 
                color: activeTab === 'dashboard' ? 'var(--primary, #0d9488)' : '#334155',
                background: activeTab === 'dashboard' ? 'rgba(13, 148, 136, 0.1)' : 'transparent',
                border: 'none',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontWeight: 600
              }}
            >
              <LayoutDashboard size={16} /> Workspace
              {proposalsCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent-emerald, #10b981)'
                }} />
              )}
            </button>
          )}
        </nav>

        {/* Desktop Actions */}
        <div style={{ display: 'none', alignItems: 'center', gap: '0.85rem' }} className="desktop-only-actions">
          
          {/* LOGGED-IN VIEW */}
          {isLoggedIn ? (
            <>
              {/* SAVED ITEMS */}
              <div 
                onClick={() => handleNavClick('explore')}
                style={{
                  position: 'relative',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  color: '#64748b',
                  borderRadius: '50%',
                  transition: 'color 0.2s ease'
                }}
                title="Saved Jobs"
              >
                <Bookmark size={20} />
                {savedCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '0',
                    right: '0',
                    backgroundColor: '#f59e0b',
                    color: '#FFF',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {savedCount}
                  </span>
                )}
              </div>

              {/* NOTIFICATION BELL */}
              <div style={{ position: 'relative' }}>
                <div
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  style={{ position: 'relative', cursor: 'pointer', padding: '0.5rem', color: '#64748b' }}
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '0',
                      right: '0',
                      backgroundColor: '#ef4444',
                      color: '#FFF',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>

                {notifDropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '115%',
                    right: 0,
                    width: '320px',
                    maxHeight: '400px',
                    overflowY: 'auto',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '16px',
                    boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
                    zIndex: 1000
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>Notifications</span>
                      {unreadCount > 0 && (
                        <button onClick={handleMarkAllRead} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}>
                          Mark all read
                        </button>
                      )}
                    </div>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>No notifications yet</div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n._id}
                          onClick={() => handleNotifClick(n)}
                          style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', background: n.read ? 'transparent' : 'rgba(13, 148, 136, 0.05)' }}
                        >
                          <div style={{ fontSize: '0.82rem', color: '#334155' }}>{n.message}</div>
                          <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.2rem' }}>{new Date(n.createdAt).toLocaleString()}</div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* POST PROJECT: ONLY FOR CLIENTS */}
              {isClient && (
                <button 
                  onClick={onOpenPostModal}
                  className="btn btn-primary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 1rem', borderRadius: '10px', fontWeight: 700 }}
                >
                  <PlusCircle size={16} /> Post Job
                </button>
              )}

              {/* USER PROFILE AVATAR & DROPDOWN */}
              <div style={{ position: 'relative' }}>
                <div 
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                    padding: '0.35rem 0.65rem',
                    borderRadius: '20px',
                    background: 'rgba(0, 0, 0, 0.04)',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <img 
                    src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'} 
                    alt={currentUser.name}
                    style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                    {currentUser.name.split(' ')[0]}
                  </span>
                  <ChevronDown size={14} color="#64748b" />
                </div>

                {profileDropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '120%',
                    right: 0,
                    width: '240px',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '16px',
                    padding: '0.75rem',
                    boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    zIndex: 1000
                  }}>
                    <div style={{ paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>{currentUser.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{currentUser.email}</div>
                      <span style={{ display: 'inline-block', marginTop: '0.4rem', padding: '2px 8px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 700, background: isClient ? 'rgba(16, 185, 129, 0.15)' : 'rgba(13, 148, 136, 0.15)', color: isClient ? '#059669' : '#0d9488' }}>
                        Mode: {isClient ? 'Employer' : 'Freelancer'}
                      </span>
                    </div>

                    <button 
                      onClick={() => { handleNavClick('dashboard'); setProfileDropdownOpen(false); }}
                      className="btn btn-secondary btn-sm"
                      style={{ justifyContent: 'flex-start', color: '#334155' }}
                    >
                      <LayoutDashboard size={14} /> My Workspace
                    </button>

                    <button
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={uploadingAvatar}
                      className="btn btn-secondary btn-sm"
                      style={{ justifyContent: 'flex-start', color: '#334155' }}
                    >
                      <Camera size={14} /> {uploadingAvatar ? 'Uploading…' : 'Change Photo'}
                    </button>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarFileSelected}
                      style={{ display: 'none' }}
                    />

                    <button 
                      onClick={() => { onLogout(); setProfileDropdownOpen(false); }}
                      className="btn btn-secondary btn-sm"
                      style={{ justifyContent: 'flex-start', color: '#334155' }}
                    >
                      <LogOut size={14} /> Log Out
                    </button>

                    <button 
                      onClick={handleDeleteAccountClick}
                      className="btn btn-secondary btn-sm"
                      style={{ justifyContent: 'flex-start', color: '#ef4444', background: '#fef2f2', border: '1px solid #fecaca' }}
                    >
                      <Trash2 size={14} /> Delete Account
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* UNAUTHENTICATED VIEW */
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button 
                onClick={() => handleNavClick('login')}
                className="btn btn-secondary btn-sm"
                style={{ color: '#334155', fontWeight: 600 }}
              >
                <LogIn size={15} /> Log In
              </button>
              <button 
                onClick={() => handleNavClick('signup')}
                className="btn btn-primary btn-sm"
                style={{ fontWeight: 700 }}
              >
                <UserPlus size={15} /> Sign Up
              </button>
            </div>
          )}
        </div>

        {/* MOBILE HAMBURGER TOGGLE BUTTON */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            display: 'none',
            background: 'rgba(0, 0, 0, 0.05)',
            border: '1px solid #e2e8f0',
            color: '#0f172a',
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
          className="mobile-hamburger-btn"
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* MOBILE SLIDE-DOWN DRAWER MENU */}
      {mobileMenuOpen && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid #e2e8f0',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          <button 
            onClick={() => handleNavClick('explore')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: activeTab === 'explore' ? 'rgba(13, 148, 136, 0.1)' : 'transparent', color: activeTab === 'explore' ? '#0d9488' : '#334155', border: 'none', borderRadius: '10px', fontWeight: 700, textAlign: 'left', fontSize: '0.95rem' }}
          >
            <Search size={18} /> Browse Jobs
          </button>

          <button 
            onClick={() => handleNavClick('freelancers')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: activeTab === 'freelancers' ? 'rgba(13, 148, 136, 0.1)' : 'transparent', color: activeTab === 'freelancers' ? '#0d9488' : '#334155', border: 'none', borderRadius: '10px', fontWeight: 700, textAlign: 'left', fontSize: '0.95rem' }}
          >
            <UserCheck size={18} /> Find Talent
          </button>

          {isLoggedIn ? (
            <>
              <button 
                onClick={() => handleNavClick('dashboard')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: activeTab === 'dashboard' ? 'rgba(13, 148, 136, 0.1)' : 'transparent', color: activeTab === 'dashboard' ? '#0d9488' : '#334155', border: 'none', borderRadius: '10px', fontWeight: 700, textAlign: 'left', fontSize: '0.95rem' }}
              >
                <LayoutDashboard size={18} /> My Workspace
              </button>

              {isClient && (
                <button 
                  onClick={() => { onOpenPostModal(); setMobileMenuOpen(false); }}
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '0.5rem', justifyContent: 'center' }}
                >
                  <PlusCircle size={18} /> Post a Job
                </button>
              )}

              <div style={{ paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Logged in as <strong>{currentUser.name}</strong></span>
                <button onClick={() => { onLogout(); setMobileMenuOpen(false); }} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}>
                  Log Out
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0' }}>
              <button 
                onClick={() => handleNavClick('login')}
                className="btn btn-secondary" 
                style={{ flex: 1, justifyContent: 'center' }}
              >
                Log In
              </button>
              <button 
                onClick={() => handleNavClick('signup')}
                className="btn btn-primary" 
                style={{ flex: 1, justifyContent: 'center' }}
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      )}

      {/* 🌟 100% GUARANTEED CSS OVERRIDE (NO DARK BLUE POSSIBLE) */}
      <style>{`
        header.main-navbar-header {
          background-color: rgba(255, 255, 255, 0.85) !important;
          backdrop-filter: blur(16px) !important;
          -webkit-backdrop-filter: blur(16px) !important;
          border-bottom: 1px solid rgba(226, 232, 240, 0.8) !important;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03) !important;
        }
        @media (min-width: 768px) {
          .desktop-only-nav {
            display: flex !important;
          }
          .desktop-only-actions {
            display: flex !important;
          }
          .mobile-hamburger-btn {
            display: none !important;
          }
        }
        @media (max-width: 767px) {
          .desktop-only-nav {
            display: none !important;
          }
          .desktop-only-actions {
            display: none !important;
          }
          .mobile-hamburger-btn {
            display: flex !important;
          }
        }
      `}</style>
    </header>
  );
}