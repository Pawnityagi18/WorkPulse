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
import { INITIAL_CATEGORIES as CATEGORIES } from './data/mockData';
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
  apiFetchFreelancers,
  apiDirectHire,
  setAuthToken,
  checkServerHealth 
} from './api/client';

export default function App() {
  // 🌟 REAL URL ROUTING: Reads initial URL pathname (/login, /signup, /dashboard, etc.)
  const getInitialRoute = () => {
    const path = window.location.pathname.replace('/', '').toLowerCase();
    if (['explore', 'freelancers', 'dashboard', 'login', 'signup'].includes(path)) {
      return path;
    }
    return 'explore';
  };

  const [activeTab, setActiveTabState] = useState(getInitialRoute);
  const [userRole, setUserRole] = useState('freelancer');
  const [serverOnline, setServerOnline] = useState(false);

  // Updates activeTab and synchronizes browser address bar
  const setActiveTab = (tab) => {
    setActiveTabState(tab);
    const newPath = tab === 'explore' ? '/' : `/${tab}`;
    if (window.location.pathname !== newPath) {
      window.history.pushState({ tab }, '', newPath);
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

  // Real Database Entities (No fake fallback storage)
  const [projects, setProjects] = useState([]);
  const [freelancers, setFreelancers] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [contracts, setContracts] = useState([]);

  // Bookmarked Project IDs (Empty default, no fake 2 badge)
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

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [budgetRange, setBudgetRange] = useState(10000);
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [projectSearchMeta, setProjectSearchMeta] = useState({ total: 0, page: 1, pages: 1 });
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectsError, setProjectsError] = useState('');

  // Modals & Toast State
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedFreelancer, setSelectedFreelancer] = useState(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Sync bookmarks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('workpulse_saved_projects', JSON.stringify(savedProjectIds));
    } catch (e) {}
  }, [savedProjectIds]);

  // Sync logged in user to localStorage
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
    try {
      const list = await apiFetchContracts();
      setContracts(list || []);
    } catch {
      setContracts([]);
    }
  };

  const loadFreelancers = async () => {
    try {
      const list = await apiFetchFreelancers();
      setFreelancers(list || []);
    } catch {
      setFreelancers([]);
    }
  };

  // Initial Full-Stack API Sync
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
        const remoteProjects = await apiFetchProjects();
        setProjects(remoteProjects || []);
        const remoteProposals = await apiFetchProposals();
        setProposals(remoteProposals || []);
        loadContracts();
        loadFreelancers();
      }
    };
    initServerSync();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadContracts();
    }
  }, [currentUser]);

  // Real Database Search & Filtering (Debounced)
  useEffect(() => {
    if (!serverOnline) return;
    const timer = setTimeout(async () => {
      setProjectsLoading(true); 
      setProjectsError('');
      try {
        const result = await apiSearchProjects({ 
          search: searchQuery, 
          category: selectedCategory, 
          maxBudget: budgetRange, 
          urgency: urgencyFilter, 
          sort: sortBy, 
          page: 1, 
          limit: 12 
        });
        setProjects(result.projects || []);
        setProjectSearchMeta({ total: result.total, page: result.page, pages: result.pages });
      } catch (error) { 
        setProjectsError(error.message); 
      } finally { 
        setProjectsLoading(false); 
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [serverOnline, searchQuery, selectedCategory, budgetRange, urgencyFilter, sortBy]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Browse Jobs Click Handler (Resets Search & Smooth Scrolls to Jobs)
  const handleBrowseJobs = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setActiveTab('explore');
    setTimeout(() => {
      const el = document.getElementById('project-list-section') || document.getElementById('projects-section');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  };

  const handleToggleSaveProject = (projectId) => {
    setSavedProjectIds(prev => {
      const isSaved = prev.includes(projectId);
      const next = isSaved ? prev.filter(id => id !== projectId) : [...prev, projectId];
      showToast(isSaved ? 'Removed from saved projects' : 'Project saved to bookmarks!', 'info');
      return next;
    });
  };

  // Create Project: Strict Real Backend Handling
  const handleCreateProject = async (newProjData) => {
    if (!currentUser || currentUser.role !== 'client') {
      setIsPostModalOpen(false);
      setActiveTab('login');
      return;
    }
    try {
      const newProject = {
        title: newProjData.title,
        description: newProjData.description,
        category: newProjData.category,
        categoryId: newProjData.category,
        categoryName: newProjData.categoryName,
        budget: Number(newProjData.budget),
        skills: newProjData.skills,
        duration: newProjData.duration || '1-3 months',
        budgetType: newProjData.budgetType,
        deadline: newProjData.deadline,
        daysLeft: newProjData.daysLeft,
        urgency: newProjData.urgency,
        deliverables: newProjData.deliverables
      };
      const savedResult = await apiCreateProject(newProject);
      setProjects(prev => [savedResult, ...prev]);
      setIsPostModalOpen(false);
      showToast('🎉 Project posted successfully on WorkPulse!');
    } catch (err) {
      showToast(err.message || 'Failed to post project', 'error');
    }
  };

  // Submit Proposal: Strict Real Backend Handling
  const handleSubmitProposal = async (proposalData) => {
    if (!currentUser || currentUser.role !== 'freelancer') {
      setSelectedProject(null);
      setActiveTab('login');
      return;
    }
    try {
      const payload = {
        projectId: proposalData.projectId || proposalData.project,
        coverLetter: proposalData.coverLetter,
        bidAmount: Number(proposalData.bidAmount),
        estimatedDays: Number(proposalData.estimatedDays || 7),
        platformFee: Number(proposalData.platformFee || 0),
        netAmount: Number(proposalData.netAmount || proposalData.bidAmount)
      };
      const savedResult = await apiSubmitProposal(payload);
      setProposals(prev => [savedResult, ...prev]);
      setSelectedProject(null);
      showToast('🚀 Proposal submitted successfully to employer!');
    } catch (err) {
      showToast(err.message || 'Failed to submit proposal', 'error');
    }
  };

  // Accept Proposal: Strict Real Backend Handling (NO FAKE SUCCESS)
  const handleAcceptProposal = async (proposalId) => {
    try {
      await apiAcceptProposal(proposalId);
      setProposals(prev => prev.map(p => (p._id === proposalId || p.id === proposalId) ? { ...p, status: 'Accepted' } : p));
      await loadContracts();
      showToast('🎉 Proposal accepted! Escrow contract initialized successfully.', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to accept proposal on server', 'error');
    }
  };

  const handleRejectProposal = async (proposalId) => {
    try {
      await apiRejectProposal(proposalId);
      setProposals(prev => prev.map(p => (p._id === proposalId || p.id === proposalId) ? { ...p, status: 'Declined' } : p));
      showToast('Proposal declined.', 'info');
    } catch (error) { 
      showToast(error.message || 'Could not decline proposal', 'error'); 
    }
  };

  // Direct Hire: Real Backend Call
  const handleDirectHire = async (hireData) => {
    if (!currentUser) {
      setSelectedFreelancer(null);
      setActiveTab('login');
      return;
    }
    if (currentUser.role !== 'client') {
      showToast('Only employers/clients can hire freelancers directly.', 'error');
      return;
    }
    try {
      await apiDirectHire(selectedFreelancer?._id || selectedFreelancer?.id, hireData);
      setSelectedFreelancer(null);
      await loadContracts();
      showToast(`🎉 Direct Hire contract sent to ${selectedFreelancer.name}!`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to send direct hire offer', 'error');
    }
  };

  const handleLoginSuccess = (userObj, msg) => {
    setCurrentUser(userObj);
    setUserRole(userObj.role);
    showToast(msg || `Welcome back, ${userObj.name}!`);
    loadContracts();
    loadFreelancers();
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
      
      {/* 🌟 TOP NAVBAR (LinkedIn Search only visible when logged in) */}
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
        onBrowseJobs={handleBrowseJobs}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* MAIN CONTENT ROUTER */}
      <main style={{ flex: 1 }}>
        
        {/* 1. DEDICATED LOGIN PAGE (/login) */}
        {activeTab === 'login' && (
          <AuthPage 
            mode="login" 
            onNavigate={(tab) => setActiveTab(tab)} 
            onLoginSuccess={handleLoginSuccess} 
          />
        )}

        {/* 2. DEDICATED SIGNUP PAGE (/signup) */}
        {activeTab === 'signup' && (
          <AuthPage 
            mode="signup" 
            onNavigate={(tab) => setActiveTab(tab)} 
            onLoginSuccess={handleLoginSuccess} 
          />
        )}

        {/* 3. HOME / EXPLORE PAGE (/) */}
        {activeTab === 'explore' && (
          <>
            {/* Clean Landing Hero (No search bar inside hero) */}
            <Hero 
              onNavigate={(tab) => setActiveTab(tab)} 
              currentUser={currentUser} 
            />

            {/* Popular Categories with Real Projects Count */}
            <CategoryGrid 
              categories={CATEGORIES}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              projects={projects}
            />

            {/* 🌟 GATED JOBS: ONLY LOGGED-IN USERS CAN VIEW LIVE JOBS */}
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
                /* Public Landing Banner */
                <AuthGate
                  title="Log in to explore active jobs"
                  message="Join 28,000+ top engineering and design talent to view live project briefs and submit proposals."
                  onLogin={() => setActiveTab('login')}
                  onSignup={() => setActiveTab('signup')}
                />
              )}
            </div>
          </>
        )}

        {/* 4. FREELANCERS TALENT PAGE: GATED (/freelancers) */}
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

        {/* 5. WORKSPACE DASHBOARD: GATED (/dashboard) */}
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
              message="Log in to see your active proposals, projects, contracts, and messages."
              onLogin={() => setActiveTab('login')}
              onSignup={() => setActiveTab('signup')}
            />
          )
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={(tab) => {
        if (tab === 'explore') handleBrowseJobs();
        else setActiveTab(tab);
      }} />

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
          onDirectHire={handleDirectHire}
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