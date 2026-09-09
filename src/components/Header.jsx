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
  Camera,
  Briefcase,
  TrendingUp,
  Sparkles
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
  onUpdateUser,
  onBrowseJobs,
  searchQuery = '',
  setSearchQuery
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef(null);

  // 🌟 LINKEDIN PRO SEARCH STATE
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchScope, setSearchScope] = useState('jobs'); // 'jobs' | 'talent'
  const searchContainerRef = useRef(null);

  const TRENDING_SUGGESTIONS = [
    { label: 'React.js Developer', query: 'React', type: 'jobs' },
    { label: 'Senior UI/UX Designer', query: 'UI/UX', type: 'talent' },
    { label: 'Python & AI Engineer', query: 'Python', type: 'jobs' },
    { label: 'Next.js 15 Full-Stack', query: 'Next.js', type: 'jobs' },
    { label: 'Flutter Mobile Specialist', query: 'Flutter', type: 'talent' },
    { label: 'Docker & DevOps Architect', query: 'Docker', type: 'jobs' }
  ];

  const isLoggedIn = Boolean(currentUser);
  const role = currentUser?.role;
  const isClient = isLoggedIn && role === 'client';

  // Click outside to close LinkedIn search dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const handleBrowseJobsClick = () => {
    setMobileMenuOpen(false);
    if (onBrowseJobs) {
      onBrowseJobs();
    } else {
      setActiveTab('explore');
      setTimeout(() => {
        const el = document.getElementById('project-list-section') || document.getElementById('projects-section');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  };

  const handleNavClick = (tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  // 🌟 LINKEDIN SUGGESTION CLICK
  const handleSelectSuggestion = (item) => {
    if (setSearchQuery) setSearchQuery(item.query);
    setSearchFocused(false);

    if (item.type === 'talent') {
      setActiveTab('freelancers');
    } else {
      setActiveTab('explore');
      setTimeout(() => {
        const el = document.getElementById('project-list-section') || document.getElementById('projects-section');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
    }
  };

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter') {
      setSearchFocused(false);
      if (searchScope === 'talent') {
        setActiveTab('freelancers');
      } else {
        setActiveTab('explore');
        setTimeout(() => {
          const el = document.getElementById('project-list-section') || document.getElementById('projects-section');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 60);
      }
    }
  };

  return (
    <header className="workpulse-pure-glass-nav">
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '74px',
        gap: '1rem'
      }}>
        
        {/* LEFT: BRAND LOGO + LINKEDIN-STYLE SEARCH BAR */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flex: isLoggedIn ? '1 1 auto' : 'initial', maxWidth: isLoggedIn ? '620px' : 'auto' }}>
          
          {/* Logo */}
          <div 
            onClick={handleBrowseJobsClick} 
            style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', flexShrink: 0 }}
          >
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #008080 0%, #0ea5e9 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2px',
              boxShadow: '0 4px 10px rgba(0, 128, 128, 0.2)'
            }}>
              <img 
                src="/logo.jpg" 
                alt="WorkPulse"
                style={{ width: '100%', height: '100%', borderRadius: '8px', objectFit: 'cover' }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
            <div>
              <span style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.35rem',
                fontWeight: 900,
                color: 'var(--primary, #008080)',
                letterSpacing: '-0.02em',
                display: 'block'
              }}>
                WorkPulse
              </span>
            </div>
          </div>

          {/* 🌟 OFFICIAL LINKEDIN SEARCH BAR WITH DROPDOWN (LOGGED IN ONLY) */}
          {isLoggedIn && (
            <div 
              ref={searchContainerRef}
              className="navbar-linkedin-search-container" 
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                maxWidth: '420px'
              }}
            >
              <Search 
                size={16} 
                color="#64748B" 
                style={{ position: 'absolute', left: '12px', pointerEvents: 'none' }} 
              />
              <input 
                type="text"
                placeholder={searchScope === 'jobs' ? "Search jobs by skill, title..." : "Search freelancers & talent..."}
                value={searchQuery}
                onFocus={() => setSearchFocused(true)}
                onChange={(e) => {
                  if (setSearchQuery) setSearchQuery(e.target.value);
                }}
                onKeyDown={handleSearchSubmit}
                style={{
                  width: '100%',
                  padding: '0.55rem 2.2rem 0.55rem 2.3rem',
                  borderRadius: searchFocused ? '18px 18px 0 0' : '24px',
                  border: '1.5px solid #CBD5E1',
                  background: searchFocused ? '#FFFFFF' : 'rgba(255, 255, 255, 0.9)',
                  color: '#0F172A',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  boxShadow: searchFocused ? '0 10px 25px rgba(0, 128, 128, 0.12)' : 'none'
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery && setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    background: 'none',
                    border: 'none',
                    color: '#94A3B8',
                    cursor: 'pointer',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <X size={14} />
                </button>
              )}

              {/* 🌟 LINKEDIN-STYLE LIVE DROPDOWN POPUP */}
              {searchFocused && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: '#FFFFFF',
                  border: '1.5px solid #008080',
                  borderTop: 'none',
                  borderRadius: '0 0 18px 18px',
                  boxShadow: '0 15px 30px rgba(0, 0, 0, 0.15)',
                  padding: '1rem',
                  zIndex: 1000
                }}>
                  {/* Scope Selector: Jobs vs Talent */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>Search in:</span>
                    <button
                      type="button"
                      onClick={() => setSearchScope('jobs')}
                      style={{
                        padding: '2px 10px',
                        borderRadius: '12px',
                        border: searchScope === 'jobs' ? '1.5px solid #008080' : '1px solid #E2E8F0',
                        background: searchScope === 'jobs' ? '#E6F4F1' : '#F8FAFC',
                        color: searchScope === 'jobs' ? '#008080' : '#475569',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      💼 Jobs
                    </button>
                    <button
                      type="button"
                      onClick={() => setSearchScope('talent')}
                      style={{
                        padding: '2px 10px',
                        borderRadius: '12px',
                        border: searchScope === 'talent' ? '1.5px solid #008080' : '1px solid #E2E8F0',
                        background: searchScope === 'talent' ? '#E6F4F1' : '#F8FAFC',
                        color: searchScope === 'talent' ? '#008080' : '#475569',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      👥 Talent
                    </button>
                  </div>

                  {/* Trending Searches Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
                    <TrendingUp size={13} color="#008080" /> Trending Searches
                  </div>

                  {/* Suggestion List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {TRENDING_SUGGESTIONS.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSelectSuggestion(item)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.45rem 0.65rem',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'background 0.15s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#F0FAF8'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#1E293B' }}>
                          <Search size={14} color="#94A3B8" />
                          <span>{item.label}</span>
                        </div>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: item.type === 'talent' ? '#0EA5E9' : '#008080', background: item.type === 'talent' ? '#E0F2FE' : '#E6F4F1', padding: '2px 6px', borderRadius: '6px' }}>
                          {item.type}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* RIGHT: NAVIGATION & USER ACTIONS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          
          <nav style={{ display: 'none', alignItems: 'center', gap: '0.4rem' }} className="desktop-only-nav">
            <button 
              onClick={handleBrowseJobsClick}
              className={`btn ${activeTab === 'explore' ? 'btn-secondary' : ''}`}
              style={{ color: activeTab === 'explore' ? 'var(--primary, #008080)' : '#334155', background: activeTab === 'explore' ? 'rgba(0, 128, 128, 0.1)' : 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, cursor: 'pointer' }}
            >
              Browse Jobs
            </button>
            
            <button 
              onClick={() => handleNavClick('freelancers')}
              className={`btn ${activeTab === 'freelancers' ? 'btn-secondary' : ''}`}
              style={{ color: activeTab === 'freelancers' ? 'var(--primary, #008080)' : '#334155', background: activeTab === 'freelancers' ? 'rgba(0, 128, 128, 0.1)' : 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, cursor: 'pointer' }}
            >
              Find Talent
            </button>

            {isLoggedIn && (
              <button 
                onClick={() => handleNavClick('dashboard')}
                className={`btn ${activeTab === 'dashboard' ? 'btn-secondary' : ''}`}
                style={{ color: activeTab === 'dashboard' ? 'var(--primary, #008080)' : '#334155', background: activeTab === 'dashboard' ? 'rgba(0, 128, 128, 0.1)' : 'transparent', border: 'none', position: 'relative', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, cursor: 'pointer' }}
              >
                <LayoutDashboard size={16} /> Workspace
                {proposalsCount > 0 && (
                  <span style={{ position: 'absolute', top: '4px', right: '4px', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                )}
              </button>
            )}
          </nav>

          <div style={{ display: 'none', alignItems: 'center', gap: '0.75rem' }} className="desktop-only-actions">
            {isLoggedIn ? (
              <>
                <div onClick={handleBrowseJobsClick} style={{ position: 'relative', cursor: 'pointer', padding: '0.5rem', color: '#64748B' }} title="Saved Jobs">
                  <Bookmark size={20} />
                  {savedCount > 0 && (
                    <span style={{ position: 'absolute', top: '0', right: '0', backgroundColor: '#F59E0B', color: '#FFF', fontSize: '0.65rem', fontWeight: 700, width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {savedCount}
                    </span>
                  )}
                </div>

                <div style={{ position: 'relative' }}>
                  <div onClick={() => setNotifDropdownOpen(!notifDropdownOpen)} style={{ position: 'relative', cursor: 'pointer', padding: '0.5rem', color: '#64748B' }}>
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <span style={{ position: 'absolute', top: '0', right: '0', backgroundColor: '#EF4444', color: '#FFF', fontSize: '0.65rem', fontWeight: 700, width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </div>

                  {notifDropdownOpen && (
                    <div style={{ position: 'absolute', top: '115%', right: 0, width: '320px', maxHeight: '400px', overflowY: 'auto', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', boxShadow: '0 15px 35px rgba(0,0,0,0.1)', zIndex: 1000 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', borderBottom: '1px solid #F1F5F9' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0F172A' }}>Notifications</span>
                        {unreadCount > 0 && (
                          <button onClick={handleMarkAllRead} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}>
                            Mark all read
                          </button>
                        )}
                      </div>
                      {notifications.length === 0 ? (
                        <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.85rem' }}>No notifications yet</div>
                      ) : (
                        notifications.map((n) => (
                          <div key={n._id} onClick={() => handleNotifClick(n)} style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #F1F5F9', cursor: 'pointer', background: n.read ? 'transparent' : 'rgba(0, 128, 128, 0.05)' }}>
                            <div style={{ fontSize: '0.82rem', color: '#334155' }}>{n.message}</div>
                            <div style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: '0.2rem' }}>{new Date(n.createdAt).toLocaleString()}</div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {isClient && (
                  <button onClick={onOpenPostModal} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 1rem', borderRadius: '10px', fontWeight: 700 }}>
                    <PlusCircle size={16} /> Post Job
                  </button>
                )}

                <div style={{ position: 'relative' }}>
                  <div onClick={() => setProfileDropdownOpen(!profileDropdownOpen)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.35rem 0.65rem', borderRadius: '20px', background: 'rgba(0, 0, 0, 0.04)', border: '1px solid #E2E8F0' }}>
                    <img src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'} alt={currentUser.name} style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover' }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main, #0F172A)' }}>{currentUser.name.split(' ')[0]}</span>
                    <ChevronDown size={14} color="#64748B" />
                  </div>

                  {profileDropdownOpen && (
                    <div style={{ position: 'absolute', top: '120%', right: 0, width: '240px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '0.75rem', boxShadow: '0 15px 35px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: '0.5rem', zIndex: 1000 }}>
                      <div style={{ paddingBottom: '0.5rem', borderBottom: '1px solid #F1F5F9' }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F172A' }}>{currentUser.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{currentUser.email}</div>
                        <span className="badge badge-category" style={{ marginTop: '0.35rem' }}>Mode: {isClient ? 'Employer' : 'Freelancer'}</span>
                      </div>

                      <button onClick={() => { handleNavClick('dashboard'); setProfileDropdownOpen(false); }} className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start' }}>
                        <LayoutDashboard size={14} /> My Workspace
                      </button>

                      <button onClick={() => avatarInputRef.current?.click()} disabled={uploadingAvatar} className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start' }}>
                        <Camera size={14} /> {uploadingAvatar ? 'Uploading…' : 'Change Photo'}
                      </button>
                      <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarFileSelected} style={{ display: 'none' }} />

                      <button onClick={() => { onLogout(); setProfileDropdownOpen(false); }} className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start' }}>
                        <LogOut size={14} /> Log Out
                      </button>

                      <button onClick={handleDeleteAccountClick} className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start', color: '#EF4444', background: '#FEF2F2', border: '1px solid #FECACA' }}>
                        <Trash2 size={14} /> Delete Account
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button onClick={() => handleNavClick('login')} className="btn btn-secondary btn-sm" style={{ color: '#334155', fontWeight: 600 }}>Log In</button>
                <button onClick={() => handleNavClick('signup')} className="btn btn-primary btn-sm" style={{ fontWeight: 700 }}>Sign Up</button>
              </div>
            )}
          </div>

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ display: 'none', background: 'rgba(0, 0, 0, 0.05)', border: '1px solid #E2E8F0', color: '#0F172A', width: '40px', height: '40px', borderRadius: '10px', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} className="mobile-hamburger-btn">
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

      </div>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div style={{ background: 'rgba(255, 255, 255, 0.98)', backdropFilter: 'blur(16px)', borderBottom: '1px solid #E2E8F0', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {isLoggedIn && (
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
              <Search size={16} color="#64748B" style={{ position: 'absolute', left: '12px' }} />
              <input type="text" placeholder="Search jobs, skills..." value={searchQuery} onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)} style={{ width: '100%', padding: '0.55rem 1rem 0.55rem 2.25rem', borderRadius: '20px', border: '1.5px solid #CBD5E1', background: '#F8FAFC', fontSize: '0.85rem' }} />
            </div>
          )}

          <button onClick={handleBrowseJobsClick} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: activeTab === 'explore' ? 'rgba(0, 128, 128, 0.1)' : 'transparent', color: activeTab === 'explore' ? '#008080' : '#334155', border: 'none', borderRadius: '10px', fontWeight: 700, textAlign: 'left', fontSize: '0.95rem' }}>
            <Search size={18} /> Browse Jobs
          </button>

          <button onClick={() => handleNavClick('freelancers')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: activeTab === 'freelancers' ? 'rgba(0, 128, 128, 0.1)' : 'transparent', color: activeTab === 'freelancers' ? '#008080' : '#334155', border: 'none', borderRadius: '10px', fontWeight: 700, textAlign: 'left', fontSize: '0.95rem' }}>
            <UserCheck size={18} /> Find Talent
          </button>

          {isLoggedIn ? (
            <>
              <button onClick={() => handleNavClick('dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: activeTab === 'dashboard' ? 'rgba(0, 128, 128, 0.1)' : 'transparent', color: activeTab === 'dashboard' ? '#008080' : '#334155', border: 'none', borderRadius: '10px', fontWeight: 700, textAlign: 'left', fontSize: '0.95rem' }}>
                <LayoutDashboard size={18} /> My Workspace
              </button>

              {isClient && (
                <button onClick={() => { onOpenPostModal(); setMobileMenuOpen(false); }} className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem', justifyContent: 'center' }}>
                  <PlusCircle size={18} /> Post a Job
                </button>
              )}

              <div style={{ paddingTop: '0.75rem', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748B' }}>Logged in as <strong>{currentUser.name}</strong></span>
                <button onClick={() => { onLogout(); setMobileMenuOpen(false); }} style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}>Log Out</button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #E2E8F0' }}>
              <button onClick={() => handleNavClick('login')} className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Log In</button>
              <button onClick={() => handleNavClick('signup')} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Sign Up</button>
            </div>
          )}
        </div>
      )}

      {/* RESPONSIVE CSS */}
      <style>{`
        header.workpulse-pure-glass-nav {
          position: sticky !important;
          top: 0 !important;
          z-index: 900 !important;
          background: rgba(255, 255, 255, 0.85) !important;
          backdrop-filter: blur(16px) !important;
          border-bottom: 1px solid rgba(226, 232, 240, 0.8) !important;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03) !important;
        }
        @media (min-width: 768px) {
          .desktop-only-nav { display: flex !important; }
          .desktop-only-actions { display: flex !important; }
          .mobile-hamburger-btn { display: none !important; }
        }
        @media (max-width: 767px) {
          .desktop-only-nav { display: none !important; }
          .desktop-only-actions { display: none !important; }
          .mobile-hamburger-btn { display: flex !important; }
          .navbar-linkedin-search-container { display: none !important; }
        }
      `}</style>
    </header>
  );
}