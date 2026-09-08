import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import CategoryGrid from './components/CategoryGrid';
import ProjectList from './components/ProjectList';
import FreelancerList from './components/FreelancerList';
import ProjectModal from './components/ProjectModal';
import FreelancerModal from './components/FreelancerModal';
import PostProjectModal from './components/PostProjectModal';
import AuthModal from './components/AuthModal';
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
  // Navigation & Role State
  const [activeTab, setActiveTab] = useState('explore'); // 'explore' | 'freelancers' | 'dashboard'
  const [userRole, setUserRole] = useState('freelancer'); // 'freelancer' | 'client'
  
  // Full-Stack Server Status State
  const [serverOnline, setServerOnline] = useState(false);

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

  // Saved/Bookmarked Project IDs (Clean empty array by default, no fake)
  const [savedProjectIds, setSavedProjectIds] = useState(() => {
    try {
      const saved = localStorage.getItem('workpulse_saved_projects');
      const parsed = saved ? JSON.parse(saved) : [];
      // Agar purani dummy IDs hon toh unhe clear karke khali karein
      if (Array.isArray(parsed) && parsed.includes(1) && parsed.includes(3)) {
        return [];
      }
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  // Freelancers State
  const [freelancers] = useState(INITIAL_FREELANCERS);

  // Proposals State
  const [proposals, setProposals] = useState(() => {
    try {
      const saved = localStorage.getItem('workpulse_proposals');
      return saved ? JSON.parse(saved) : INITIAL_PROPOSALS;
    } catch {
      return INITIAL_PROPOSALS;
    }
  });

  // Contracts State
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
  const [authModalConfig, setAuthModalConfig] = useState({ isOpen: false, mode: 'login' });

  // Toast Notification State
  const [toast, setToast] = useState(null);

  // Sync state to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('workpulse_projects', JSON.stringify(projects));
    } catch (e) {
      console.warn('Storage sync error', e);
    }
  }, [projects]);

  useEffect(() => {
    try {
      localStorage.setItem('workpulse_proposals', JSON.stringify(proposals));
    } catch (e) {
      console.warn('Storage sync error', e);
    }
  }, [proposals]);

  useEffect(() => {
    try {
      localStorage.setItem('workpulse_saved_projects', JSON.stringify(savedProjectIds));
    } catch (e) {
      console.warn('Storage sync error', e);
    }
  }, [savedProjectIds]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('workpulse_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('workpulse_user');
      }
    } catch (e) {
      console.warn('Storage sync error', e);
    }
  }, [currentUser]);

  const loadContracts = async () => {
    const list = await apiFetchContracts();
    setContracts(list || []);
  };

  // Initial Full-Stack API Sync & Auth verify
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

  // Toggle Bookmark Handler
  const handleToggleSaveProject = (projectId) => {
    setSavedProjectIds(prev => {
      const isSaved = prev.includes(projectId);
      const next = isSaved ? prev.filter(id => id !== projectId) : [...prev, projectId];
      showToast(isSaved ? 'Removed from saved projects' : 'Project saved to bookmarks!', 'info');
      return next;
    });
  };

  // Create Project Handler
  const handleCreateProject = async (newProjData) => {
    if (!currentUser) {
      setIsPostModalOpen(false);
      showToast('Please log in to post a project.', 'info');
      setAuthModalConfig({ isOpen: true, mode: 'login' });
      return;
    }
    if (currentUser.role !== 'client') {
      setIsPostModalOpen(false);
      showToast('Only clients can post projects.', 'error');
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

  // Submit Proposal Handler
  const handleSubmitProposal = async (proposalData) => {
    if (!currentUser) {
      setSelectedProject(null);
      showToast('Please log in as a freelancer to submit a proposal.', 'info');
      setAuthModalConfig({ isOpen: true, mode: 'login' });
      return;
    }
    if (currentUser.role !== 'freelancer') {
      setSelectedProject(null);
      showToast('Only freelancers can submit proposals.', 'error');
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

  // Accept / Decline Proposal Handler
  const handleAcceptProposal = async (proposalId) => {
    try {
      const res = await apiAcceptProposal(proposalId);
      setProposals(prev => prev.map(p => (p._id === proposalId || p.id === proposalId) ? { ...p, status: 'Accepted' } : p));
      await loadContracts();
      showToast('🎉 Proposal accepted! Escrow contract initialized successfully.', 'success');
    } catch (err) {
      setProposals(prev => prev.map(p => (p._id === proposalId || p.id === proposalId) ? { ...p, status: 'Accepted' } : p));
      showToast('Contract Accepted!', 'success');
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

  // Auth Handlers
  const handleLoginSuccess = (userObj, msg) => {
    setCurrentUser(userObj);
    setUserRole(userObj.role);
    setAuthModalConfig({ isOpen: false, mode: 'login' });
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

  const handleUpdateUser = (updatedUser) => {
    setCurrentUser(updatedUser);
    showToast('Profile updated', 'success');
  };

  const handleDeleteAccount = () => {
    setCurrentUser(null);
    setAuthToken(null);
    setContracts([]);
    localStorage.removeItem('workpulse_user');
    showToast('Your account has been deleted permanently.', 'info');
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
        onOpenAuthModal={(mode) => setAuthModalConfig({ isOpen: true, mode })}
        onLogout={handleLogout}
        onDeleteAccount={handleDeleteAccount}
        onUpdateUser={handleUpdateUser}
      />

      {/* Main Content Area */}
      <main style={{ flex: 1 }}>
        {activeTab === 'explore' && (
          <>
            {/* Hero Section */}
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

            {/* Service Categories Grid WITH LIVE PROJECTS PASSED */}
            <CategoryGrid 
              categories={CATEGORIES}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              projects={projects}
            />

            {/* Projects Explorer */}
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
                  onLogin={() => setAuthModalConfig({ isOpen: true, mode: 'login' })}
                  onSignup={() => setAuthModalConfig({ isOpen: true, mode: 'signup' })}
                />
              )}
            </div>
          </>
        )}

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
              onLogin={() => setAuthModalConfig({ isOpen: true, mode: 'login' })}
              onSignup={() => setAuthModalConfig({ isOpen: true, mode: 'signup' })}
            />
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
            <AuthGate
              title="Log in to view your dashboard"
              message="Log in to see your proposals, projects, contracts, and messages."
              onLogin={() => setAuthModalConfig({ isOpen: true, mode: 'login' })}
              onSignup={() => setAuthModalConfig({ isOpen: true, mode: 'signup' })}
            />
          )
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={(tab) => setActiveTab(tab)} />

      {/* Modals */}
      {selectedProject && (
        <ProjectModal 
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onSubmitProposal={handleSubmitProposal}
          currentUser={currentUser}
          onRequireAuth={(mode) => { setSelectedProject(null); setAuthModalConfig({ isOpen: true, mode }); }}
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

      {authModalConfig.isOpen && (
        <AuthModal 
          initialMode={authModalConfig.mode}
          onClose={() => setAuthModalConfig({ isOpen: false, mode: 'login' })}
          onLoginSuccess={handleLoginSuccess}
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