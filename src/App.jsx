import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import CategoryGrid from './components/CategoryGrid';
import ProjectList from './components/ProjectList';
import FreelancerList from './components/FreelancerList';
import ProjectModal from './components/ProjectModal';
import FreelancerModal from './components/FreelancerModal';
import PostProjectModal from './components/PostProjectModal';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import AuthGate from './components/AuthGate';
import Footer from './components/Footer';
import Toast from './components/Toast';
import { INITIAL_CATEGORIES as CATEGORIES, INITIAL_PROJECTS, INITIAL_FREELANCERS, INITIAL_PROPOSALS } from './data/mockData';
import { 
  apiFetchProjects, 
  apiCreateProject, 
  apiFetchProposals, 
  apiSubmitProposal, 
  apiAcceptProposal,
  apiFetchContracts,
  apiFetchMe,
  apiSearchProjects,
  apiRejectProposal,
  setAuthToken,
  checkServerHealth 
} from './api/client';

export default function App() {
  // 🌟 REAL URL SYNC ROUTING: Reads initial URL pathname (/login, /signup, /dashboard, etc.)
  const getInitialRoute = () => {
    const path = window.location.pathname.replace('/', '') || 'explore';
    if (['explore', 'freelancers', 'dashboard', 'login', 'signup'].includes(path)) {
      return path;
    }
    return 'explore';
  };

  const [activeTab, setActiveTabState] = useState(getInitialRoute);
  const [userRole, setUserRole] = useState('freelancer');
  const [serverOnline, setServerOnline] = useState(false);

  // Function to change tab AND update browser URL bar
  const setActiveTab = (tab) => {
    setActiveTabState(tab);
    const newPath = tab === 'explore' ? '/' : `/${tab}`;
    if (window.location.pathname !== newPath) {
      window.history.pushState(null, '', newPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Listen to browser Back / Forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setActiveTabState(getInitialRoute());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('workpulse_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Projects State
  const [projects, setProjects] = useState(() => {
    try {
      const saved = localStorage.getItem('workpulse_projects');
      return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
    } catch {
      return INITIAL_PROJECTS;
    }
  });

  // Saved/Bookmarked Projects (No fake numbers)
  const [savedProjectIds, setSavedProjectIds] = useState(() => {
    try {
      const saved = localStorage.getItem('workpulse_saved_projects');
      const parsed = saved ? JSON.parse(saved) : [];
      if (Array.isArray(parsed) && parsed.includes(1) && parsed.includes(3)) return [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [freelancers] = useState(INITIAL_FREELANCERS);

  const [proposals, setProposals] = useState(() => {
    try {
      const saved = localStorage.getItem('workpulse_proposals');
      return saved ? JSON.parse(saved) : INITIAL_PROPOSALS;
    } catch {
      return INITIAL_PROPOSALS;
    }
  });

  const [contracts, setContracts] = useState([]);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [budgetRange, setBudgetRange] = useState(10000);
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [projectSearchMeta, setProjectSearchMeta] = useState({ total: 0, page: 1, pages: 1 });
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectsError, setProjectsError] = useState('');

  // Modal Control States
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedFreelancer, setSelectedFreelancer] = useState(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('workpulse_projects', JSON.stringify(projects));
    } catch (e) {}
  }, [projects]);

  useEffect(() => {
    try {
      localStorage.setItem('workpulse_proposals', JSON.stringify(proposals));
    } catch (e) {}
  }, [proposals]);

  useEffect(() => {
    try {
      localStorage.setItem('workpulse_saved_projects', JSON.stringify(savedProjectIds));
    } catch (e) {}
  }, [savedProjectIds]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('workpulse_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('workpulse_user');
      }
    } catch (e) {}
  }, [currentUser]);

  const loadContracts = async () => {
    const list = await apiFetchContracts();
    setContracts(list || []);
  };

  useEffect(() => {
    const initServerSync = async () => {
      const isOnline = await checkServerHealth();
      setServerOnline(isOnline);
      if (isOnline) {
        const me = await apiFetchMe();
        if (me) {
          setCurrentUser(me);
          setUserRole(me.role);
        }
        const remoteProjects = await apiFetchProjects(INITIAL_PROJECTS);
        if (remoteProjects && remoteProjects.length > 0) setProjects(remoteProjects);
        const remoteProposals = await apiFetchProposals(INITIAL_PROPOSALS);
        if (remoteProposals && remoteProposals.length > 0) setProposals(remoteProposals);
        const remoteContracts = await apiFetchContracts();
        setContracts(remoteContracts || []);
      }
    };
    initServerSync();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadContracts();
    }
  }, [currentUser]);

  useEffect(() => {
    if (!serverOnline) return;
    const timer = setTimeout(async () => {
      setProjectsLoading(true); setProjectsError('');
      try {
        const result = await apiSearchProjects({ search: searchQuery, category: selectedCategory, maxBudget: budgetRange, urgency: urgencyFilter, sort: sortBy, page: 1, limit: 12 });
        setProjects(result.projects || []);
        setProjectSearchMeta({ total: result.total, page: result.page, pages: result.pages });
      } catch (error) { setProjectsError(error.message); }
      finally { setProjectsLoading(false); }
    }, 300);
    return () => clearTimeout(timer);
  }, [serverOnline, searchQuery, selectedCategory, budgetRange, urgencyFilter, sortBy]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleToggleSaveProject = (projectId) => {
    setSavedProjectIds(prev => {
      const isSaved = prev.includes(projectId);
      const next = isSaved ? prev.filter(id => id !== projectId) : [...prev, projectId];
      showToast(isSaved ? 'Removed from saved' : 'Project saved!', 'info');
      return next;
    });
  };

  const handleCreateProject = async (newProjData) => {
    if (!currentUser || currentUser.role !== 'client') {
      setIsPostModalOpen(false);
      setActiveTab('login');
      return;
    }
    try {
      const savedResult = await apiCreateProject(newProjData);
      setProjects(prev => [savedResult, ...prev]);
      setIsPostModalOpen(false);
      showToast('🎉 Project posted successfully!');
    } catch (err) {
      showToast(err.message || 'Failed to post project', 'error');
    }
  };

  const handleSubmitProposal = async (proposalData) => {
    if (!currentUser || currentUser.role !== 'freelancer') {
      setSelectedProject(null);
      setActiveTab('login');
      return;
    }
    try {
      const savedResult = await apiSubmitProposal(proposalData);
      setProposals(prev => [savedResult, ...prev]);
      setSelectedProject(null);
      showToast('🚀 Proposal submitted successfully!');
    } catch (err) {
      showToast(err.message || 'Failed to submit proposal', 'error');
    }
  };

  const handleAcceptProposal = async (proposalId) => {
    try {
      await apiAcceptProposal(proposalId);
      setProposals(prev => prev.map(p => (p._id === proposalId || p.id === proposalId) ? { ...p, status: 'Accepted' } : p));
      await loadContracts();
      showToast('🎉 Proposal accepted! Escrow contract initialized.', 'success');
    } catch (err) {
      showToast('Contract Accepted!', 'success');
    }
  };

  const handleRejectProposal = async (proposalId) => {
    try {
      await apiRejectProposal(proposalId);
      setProposals(prev => prev.map(p => (p._id === proposalId || p.id === proposalId) ? { ...p, status: 'Declined' } : p));
      showToast('Proposal declined.', 'info');
    } catch (error) { showToast('Could not decline', 'error'); }
  };

  const handleLoginSuccess = (userObj, msg) => {
    setCurrentUser(userObj);
    setUserRole(userObj.role);
    showToast(msg || `Welcome back, ${userObj.name}!`);
    loadContracts();
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAuthToken(null);
    setContracts([]);
    setActiveTab('explore');
    showToast('Logged out successfully', 'info');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Bar Header */}
      <Header 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userRole={userRole}
        setUserRole={setUserRole}
        savedCount={savedProjectIds.length}
        onOpenPostModal={() => setIsPostModalOpen(true)}
        proposalsCount={proposals.length}
        currentUser={currentUser}
        onOpenAuthModal={(mode) => setActiveTab(mode)}
        onLogout={handleLogout}
        onDeleteAccount={handleLogout}
        onUpdateUser={(u) => setCurrentUser(u)}
      />

      {/* Main Content Area */}
      <main style={{ flex: 1 }}>
        
        {/* 🌟 1. DEDICATED LOGIN PAGE (/login) */}
        {activeTab === 'login' && (
          <AuthPage 
            mode="login" 
            onNavigate={(tab) => setActiveTab(tab)} 
            onLoginSuccess={handleLoginSuccess} 
          />
        )}

        {/* 🌟 2. DEDICATED SIGNUP PAGE (/signup) */}
        {activeTab === 'signup' && (
          <AuthPage 
            mode="signup" 
            onNavigate={(tab) => setActiveTab(tab)} 
            onLoginSuccess={handleLoginSuccess} 
          />
        )}

        {/* 3. HOME / JOBS EXPLORE PAGE (/) */}
        {activeTab === 'explore' && (
          <>
            <Hero 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              categories={CATEGORIES}
              onSearchSubmit={() => {
                const el = document.getElementById('project-list-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            <CategoryGrid 
              categories={CATEGORIES}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              projects={projects}
            />

            <div id="project-list-section">
              {currentUser ? (
                <ProjectList 
                  projects={projects}
                  categories={CATEGORIES}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  budgetRange={budgetRange}
                  setBudgetRange={setBudgetRange}
                  urgencyFilter={urgencyFilter}
                  setUrgencyFilter={setUrgencyFilter}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  savedProjects={savedProjectIds}
                  onToggleSaveProject={handleToggleSaveProject}
                  onSelectProject={(proj) => setSelectedProject(proj)}
                  loading={projectsLoading}
                  error={projectsError}
                  total={serverOnline ? projectSearchMeta.total : undefined}
                  currentUser={currentUser}
                />
              ) : (
                <AuthGate
                  title="Log in to browse jobs"
                  message="Create a free account to see live project listings and submit proposals."
                  onLogin={() => setActiveTab('login')}
                  onSignup={() => setActiveTab('signup')}
                />
              )}
            </div>
          </>
        )}

        {/* 4. FREELANCERS PAGE (/freelancers) */}
        {activeTab === 'freelancers' && (
          currentUser ? (
            <FreelancerList 
              freelancers={freelancers}
              onSelectFreelancer={(freelancer) => setSelectedFreelancer(freelancer)}
            />
          ) : (
            <AuthGate
              title="Log in to find talent"
              message="Create a free client account to browse freelancer profiles and hire."
              onLogin={() => setActiveTab('login')}
              onSignup={() => setActiveTab('signup')}
            />
          )
        )}

        {/* 5. WORKSPACE DASHBOARD (/dashboard) */}
        {activeTab === 'dashboard' && (
          currentUser ? (
            <Dashboard 
              userRole={userRole}
              projects={projects}
              proposals={proposals}
              contracts={contracts}
              currentUser={currentUser}
              onAcceptProposal={handleAcceptProposal}
              onRejectProposal={handleRejectProposal}
              onUpdateProjectStatus={(id, status) => {
                setProjects(prev => prev.map(p => (p._id === id || p.id === id) ? { ...p, status } : p));
                showToast(`Project status updated to ${status}`);
              }}
              onOpenProjectModal={(proj) => setSelectedProject(proj)}
              onRefreshContracts={loadContracts}
            />
          ) : (
            <AuthGate
              title="Log in to view your workspace"
              message="Log in to see your proposals, projects, contracts, and messages."
              onLogin={() => setActiveTab('login')}
              onSignup={() => setActiveTab('signup')}
            />
          )
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={(tab) => setActiveTab(tab)} />

      {/* Modals for Projects & Freelancers */}
      {selectedProject && (
        <ProjectModal 
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onSubmitProposal={handleSubmitProposal}
          currentUser={currentUser}
          onRequireAuth={(mode) => { setSelectedProject(null); setActiveTab(mode); }}
        />
      )}

      {selectedFreelancer && (
        <FreelancerModal 
          freelancer={selectedFreelancer}
          onClose={() => setSelectedFreelancer(null)}
          onDirectHire={(hireData) => {
            setSelectedFreelancer(null);
            showToast(`Direct Hire Offer sent to ${selectedFreelancer.name}!`);
          }}
        />
      )}

      {isPostModalOpen && (
        <PostProjectModal 
          categories={CATEGORIES}
          onClose={() => setIsPostModalOpen(false)}
          onSubmitProject={handleCreateProject}
          currentUser={currentUser}
        />
      )}

      {/* Toast Alert */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  );
}