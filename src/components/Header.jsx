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
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 900,
      backgroundColor: 'var(--bg-glass-heavy)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-subtle)',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '76px'
      }}>
        
        {/* Brand Logo */}
        <div 
          onClick={() => handleNavClick('explore')} 
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
        >
          <img 
            src="/logo.jpg" 
            alt="WorkPulse Logo"
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              objectFit: 'cover',
              boxShadow: 'var(--shadow-primary)',
              border: '1.5px solid var(--border-teal)'
            }}
          />
          <div>
            <span style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.45rem',
              fontWeight: 800,
              color: 'var(--primary)',
              letterSpacing: '-0.02em',
              display: 'block'
            }}>
              WorkPulse
            </span>
            <span style={{
              fontSize: '0.65rem',
              fontWeight: 800,
              color: 'var(--secondary)',
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
          gap: '0.5rem'
        }} className="desktop-only-nav">
          <button 
            onClick={() => handleNavClick('explore')}
            className={`btn ${activeTab === 'explore' ? 'btn-secondary' : ''}`}
            style={{ 
              color: activeTab === 'explore' ? 'var(--primary)' : 'var(--text-muted)',
              background: activeTab === 'explore' ? 'var(--primary-light)' : 'transparent',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <Search size={16} /> Browse Jobs
          </button>
          
          <button 
            onClick={() => handleNavClick('freelancers')}
            className={`btn ${activeTab === 'freelancers' ? 'btn-secondary' : ''}`}
            style={{ 
              color: activeTab === 'freelancers' ? 'var(--primary)' : 'var(--text-muted)',
              background: activeTab === 'freelancers' ? 'var(--primary-light)' : 'transparent',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
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
                color: activeTab === 'dashboard' ? 'var(--primary)' : 'var(--text-muted)',
                background: activeTab === 'dashboard' ? 'var(--primary-light)' : 'transparent',
                border: 'none',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
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
                  backgroundColor: 'var(--accent-emerald)'
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
              {/* SAVED ITEMS: Only when logged in */}
              <div 
                onClick={() => handleNavClick('explore')}
                style={{
                  position: 'relative',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  color: 'var(--text-muted)',
                  borderRadius: '50%',
                  transition: 'color 0.2s ease'
                }}
                title="Bookmarked Projects"
              >
                <Bookmark size={20} />
                {savedCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '0',
                    right: '0',
                    backgroundColor: 'var(--accent-sun)',
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
                  style={{ position: 'relative', cursor: 'pointer', padding: '0.5rem' }}
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '0',
                      right: '0',
                      backgroundColor: 'var(--accent-rose, #f43f5e)',
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
                    top: '110%',
                    right: 0,
                    width: '320px',
                    maxHeight: '400px',
                    overflowY: 'auto',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-lg)',
                    zIndex: 1000
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-subtle)' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Notifications</span>
                      {unreadCount > 0 && (
                        <button onClick={handleMarkAllRead} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}>
                          Mark all read
                        </button>
                      )}
                    </div>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No notifications yet</div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n._id}
                          onClick={() => handleNotifClick(n)}
                          style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer', background: n.read ? 'transparent' : 'var(--bg-input)' }}
                        >
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-main)' }}>{n.message}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>{new Date(n.createdAt).toLocaleString()}</div>
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
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
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
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-medium)'
                  }}
                >
                  <img 
                    src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'} 
                    alt={currentUser.name}
                    style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {currentUser.name.split(' ')[0]}
                  </span>
                  <ChevronDown size={14} color="var(--text-muted)" />
                </div>

                {profileDropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '110%',
                    right: 0,
                    width: '230px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '0.75rem',
                    boxShadow: 'var(--shadow-lg)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    zIndex: 1000
                  }}>
                    <div style={{ paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>{currentUser.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{currentUser.email}</div>
                      <span className="badge badge-category" style={{ marginTop: '0.35rem' }}>
                        Mode: {isClient ? 'Employer' : 'Freelancer'}
                      </span>
                    </div>

                    <button 
                      onClick={() => { handleNavClick('dashboard'); setProfileDropdownOpen(false); }}
                      className="btn btn-secondary btn-sm"
                      style={{ justifyContent: 'flex-start' }}
                    >
                      <LayoutDashboard size={14} /> My Workspace
                    </button>

                    <button
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={uploadingAvatar}
                      className="btn btn-secondary btn-sm"
                      style={{ justifyContent: 'flex-start' }}
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
                      style={{ justifyContent: 'flex-start' }}
                    >
                      <LogOut size={14} /> Log Out
                    </button>

                    <button 
                      onClick={handleDeleteAccountClick}
                      className="btn btn-secondary btn-sm"
                      style={{ justifyContent: 'flex-start', color: 'var(--accent-rose)', border: '1px solid var(--accent-rose-light)', background: 'var(--accent-rose-light)' }}
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
              >
                <LogIn size={15} /> Log In
              </button>
              <button 
                onClick={() => handleNavClick('signup')}
                className="btn btn-primary btn-sm"
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
            background: 'var(--bg-input)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-main)',
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
          background: 'var(--bg-card)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          <button 
            onClick={() => handleNavClick('explore')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: activeTab === 'explore' ? 'var(--primary-light)' : 'transparent', color: activeTab === 'explore' ? 'var(--primary)' : 'var(--text-muted)', border: 'none', borderRadius: '10px', fontWeight: 700, textAlign: 'left', fontSize: '0.95rem' }}
          >
            <Search size={18} /> Browse Jobs
          </button>

          <button 
            onClick={() => handleNavClick('freelancers')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: activeTab === 'freelancers' ? 'var(--primary-light)' : 'transparent', color: activeTab === 'freelancers' ? 'var(--primary)' : 'var(--text-muted)', border: 'none', borderRadius: '10px', fontWeight: 700, textAlign: 'left', fontSize: '0.95rem' }}
          >
            <UserCheck size={18} /> Find Talent
          </button>

          {isLoggedIn ? (
            <>
              <button 
                onClick={() => handleNavClick('dashboard')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: activeTab === 'dashboard' ? 'var(--primary-light)' : 'transparent', color: activeTab === 'dashboard' ? 'var(--primary)' : 'var(--text-muted)', border: 'none', borderRadius: '10px', fontWeight: 700, textAlign: 'left', fontSize: '0.95rem' }}
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

              <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Logged in as <strong>{currentUser.name}</strong></span>
                <button onClick={() => { onLogout(); setMobileMenuOpen(false); }} style={{ background: 'none', border: 'none', color: 'var(--accent-rose)', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}>
                  Log Out
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
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

      {/* RESPONSIVE CSS INJECTION */}
      <style>{`
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