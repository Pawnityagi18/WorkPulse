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
  apiDeleteAccount,
  setAuthToken,
  checkServerHealth 
} from './api/client';

export default function App() {
  const getInitialRoute = () => {
    const path = window.location.pathname.replace('/', '').toLowerCase();
    if (['explore', 'freelancers', 'dashboard', 'login', 'signup'].includes(path)) return path;
    return 'explore';
  };

  const [activeTab, setActiveTabState] = useState(getInitialRoute);
  const [userRole, setUserRole] = useState('freelancer');
  const [serverOnline, setServerOnline] = useState(false);

  const setActiveTab = (tab) => {
    setActiveTabState(tab);
    const newPath = tab === 'explore' ? '/' : `/${tab}`;
    if (window.location.pathname !== newPath) {
      window.history.pushState({ tab }, '', newPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handlePopState = () => setActiveTabState(getInitialRoute());
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('workpulse_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [projects, setProjects] = useState([]);
  const [freelancers, setFreelancers] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [contracts, setContracts] = useState([]);

  const [savedProjectIds, setSavedProjectIds] = useState(() => {
    try {
      const saved = localStorage.getItem('workpulse_saved_projects');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) && !(parsed.includes(1) && parsed.includes(3)) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [budgetRange, setBudgetRange] = useState(10000);
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [projectSearchMeta, setProjectSearchMeta] = useState({ total: 0, page: 1, pages: 1 });
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectsError, setProjectsError] = useState('');

  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedFreelancer, setSelectedFreelancer] = useState(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    try { localStorage.setItem('workpulse_saved_projects', JSON.stringify(savedProjectIds)); } catch {}
  }, [savedProjectIds]);

  useEffect(() => {
    try {
      if (currentUser) localStorage.setItem('workpulse_user', JSON.stringify(currentUser));
      else localStorage.removeItem('workpulse_user');
    } catch {}
  }, [currentUser]);

  const loadContracts = async () => {
    try { setContracts((await apiFetchContracts()) || []); } catch { setContracts([]); }
  };

  const loadFreelancers = async () => {
    try { setFreelancers((await apiFetchFreelancers()) || []); } catch { setFreelancers([]); }
  };

  useEffect(() => {
    const initServerSync = async () => {
      const isOnline = await checkServerHealth();
      setServerOnline(isOnline);
      if (isOnline) {
        const me = await apiFetchMe();
        if (me) { setCurrentUser(me); setUserRole(me.role); }
        setProjects((await apiFetchProjects()) || []);
        setProposals((await apiFetchProposals()) || []);
        loadContracts();
        loadFreelancers();
      }
    };
    initServerSync();
  }, []);

  useEffect(() => {
    if (currentUser) loadContracts();
  }, [currentUser]);

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

  const showToast = (message, type = 'success') => setToast({ message, type });

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
      showToast(isSaved ? 'Removed from saved' : 'Project saved to bookmarks!', 'info');
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
      const savedResult = await apiCreateProject({
        ...newProjData,
        budget: Number(newProjData.budget),
        categoryId: newProjData.category
      });
      setProjects(prev => [savedResult, ...prev]);
      setIsPostModalOpen(false);
      showToast('Project posted successfully');
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
      const savedResult = await apiSubmitProposal({
        projectId: proposalData.projectId || proposalData.project,
        coverLetter: proposalData.coverLetter,
        bidAmount: Number(proposalData.bidAmount),
        estimatedDays: Number(proposalData.estimatedDays || 7)
      });
      setProposals(prev => [savedResult, ...prev]);
      setSelectedProject(null);
      showToast('Proposal submitted successfully');
    } catch (err) {
      showToast(err.message || 'Failed to submit proposal', 'error');
    }
  };

  const handleAcceptProposal = async (proposalId) => {
    try {
      await apiAcceptProposal(proposalId);
      setProposals(prev => prev.map(p => (p._id === proposalId || p.id === proposalId) ? { ...p, status: 'Accepted' } : p));
      await loadContracts();
      showToast('Proposal accepted. Contract created.', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to accept proposal', 'error');
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

  const handleDirectHire = async (hireData) => {
    if (!currentUser) { setSelectedFreelancer(null); setActiveTab('login'); return; }
    if (currentUser.role !== 'client') { showToast('Only clients can hire directly.', 'error'); return; }
    try {
      await apiDirectHire(selectedFreelancer?._id || selectedFreelancer?.id, hireData);
      setSelectedFreelancer(null);
      await loadContracts();
      showToast(`Direct Hire contract sent to ${selectedFreelancer.name}`, 'success');
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

  // 🌟 REAL BACKEND ACCOUNT DELETION HANDLER
  const handleDeleteAccount = async () => {
    try {
      await apiDeleteAccount();
      setCurrentUser(null);
      setAuthToken(null);
      setContracts([]);
      setActiveTab('explore');
      showToast('Your account has been deleted and personal data anonymized.', 'info');
    } catch (err) {
      // KEEP ACCOUNT & SESSION INTACT ON ERROR!
      showToast(err.message || 'Could not delete account', 'error');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
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
        onDeleteAccount={handleDeleteAccount}
        onUpdateUser={(u) => setCurrentUser(u)}
        onBrowseJobs={handleBrowseJobs}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <main style={{ flex: 1 }}>
        {activeTab === 'login' && (
          <AuthPage mode="login" onNavigate={(tab) => setActiveTab(tab)} onLoginSuccess={handleLoginSuccess} />
        )}

        {activeTab === 'signup' && (
          <AuthPage mode="signup" onNavigate={(tab) => setActiveTab(tab)} onLoginSuccess={handleLoginSuccess} />
        )}

        {activeTab === 'explore' && (
          <>
            <Hero onNavigate={(tab) => setActiveTab(tab)} currentUser={currentUser} />
            <CategoryGrid categories={CATEGORIES} selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} projects={projects} />
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
                  title="Log in to explore active jobs"
                  message="Join 28,000+ top engineering and design talent to view live project briefs and submit proposals."
                  onLogin={() => setActiveTab('login')}
                  onSignup={() => setActiveTab('signup')}
                />
              )}
            </div>
          </>
        )}

        {activeTab === 'freelancers' && (
          currentUser ? (
            <FreelancerList freelancers={freelancers} onSelectFreelancer={(freelancer) => setSelectedFreelancer(freelancer)} />
          ) : (
            <AuthGate title="Log in to find talent" message="Create a free client account to browse freelancer profiles and hire." onLogin={() => setActiveTab('login')} onSignup={() => setActiveTab('signup')} />
          )
        )}

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
            <AuthGate title="Log in to view your workspace" message="Log in to see your active proposals, projects, contracts, and messages." onLogin={() => setActiveTab('login')} onSignup={() => setActiveTab('signup')} />
          )
        )}
      </main>

      <Footer onNavigate={(tab) => { if (tab === 'explore') handleBrowseJobs(); else setActiveTab(tab); }} />

      {selectedProject && (
        <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} onSubmitProposal={handleSubmitProposal} currentUser={currentUser} onRequireAuth={(mode) => { setSelectedProject(null); setActiveTab(mode); }} />
      )}

      {selectedFreelancer && (
        <FreelancerModal freelancer={selectedFreelancer} onClose={() => setSelectedFreelancer(null)} onDirectHire={handleDirectHire} />
      )}

      {isPostModalOpen && (
        <PostProjectModal categories={CATEGORIES} onClose={() => setIsPostModalOpen(false)} onSubmitProject={handleCreateProject} currentUser={currentUser} />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}