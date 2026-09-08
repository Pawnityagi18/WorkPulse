import React, { useState, useEffect } from 'react';
import { 
  Filter, 
  DollarSign, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  Bookmark, 
  Send, 
  Sparkles, 
  AlertCircle, 
  ArrowUpDown, 
  ChevronDown, 
  Trash2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function ProjectList({ 
  projects = [], 
  categories = [], 
  selectedCategory, 
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  budgetRange,
  setBudgetRange,
  urgencyFilter,
  setUrgencyFilter,
  sortBy,
  setSortBy,
  savedProjects = [],
  onToggleSaveProject,
  onSelectProject,
  onDeleteProject,
  loading = false,
  error = '',
  total,
  currentUser
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 10; // Ek page me 10 jobs

  const filteredProjects = projects;

  // Jab bhi category, search ya filter change ho, wapas Page 1 par aa jaye
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, budgetRange, urgencyFilter, sortBy]);

  // 1. Pagination Calculation (10 jobs per page)
  const totalJobs = filteredProjects.length;
  const totalPages = Math.ceil(totalJobs / jobsPerPage) || 1;
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = filteredProjects.slice(indexOfFirstJob, indexOfLastJob);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 200, behavior: 'smooth' }); // Smooth scroll to top of list
    }
  };

  // 2. Dynamic Job Count per Category
  const getCategoryCount = (catId, catName) => {
    if (catId === 'all') return projects.length;
    return projects.filter(p => {
      const pCat = p.categoryName || p.category || p.categoryId;
      return pCat === catId || pCat === catName;
    }).length;
  };

  // 3. Dynamic Job Count per Urgency Badge
  const getUrgencyCount = (urgencyId) => {
    if (urgencyId === 'all') return projects.length;
    return projects.filter(p => p.urgency === urgencyId).length;
  };

  // 4. Delete Project Handler with DEMO GUARD
  const handleDelete = async (e, projectId) => {
    e.stopPropagation();

    // DEMO USER GUARD: LocalStorage aur Prop dono se check karega
    const user = currentUser || JSON.parse(localStorage.getItem('user') || '{}');
    const isDemo = user?.isDemo || 
      (user?.email && (user.email.toLowerCase().includes('demo') || user.email.toLowerCase().includes('elena.rostova'))) ||
      (user?.name && user.name.toLowerCase().includes('demo'));

    if (isDemo) {
      alert('🛡️ Demo Mode: Deleting jobs is disabled in demo preview to preserve showcase projects. Please create your own free account to manage your own jobs!');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this job posting?')) return;

    if (onDeleteProject) {
      onDeleteProject(projectId);
    } else {
      try {
        const token = localStorage.getItem('token') || JSON.parse(localStorage.getItem('user') || '{}')?.token;
        const res = await fetch(`/api/projects/${projectId}`, {
          method: 'DELETE',
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
        });
        if (res.ok) {
          window.location.reload();
        }
      } catch (err) {
        console.error('Failed to delete project:', err);
      }
    }
  };

  return (
    <section id="projects-section" style={{ padding: '3.5rem 0' }}>
      <div className="container">
        
        {/* Section Header & Controls */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.25rem' }}>
              Available Projects & Jobs ({total ?? totalJobs})
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem' }}>
              Showing {totalJobs > 0 ? indexOfFirstJob + 1 : 0}–{Math.min(indexOfLastJob, totalJobs)} of {totalJobs} active postings (10 per page)
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            {/* Sort Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)', padding: '0.4rem 0.75rem' }}>
              <ArrowUpDown size={15} color="var(--text-muted)" />
              <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>Sort by:</span>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-main)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="latest" style={{ background: '#111726' }}>Latest Postings</option>
                <option value="budget-high" style={{ background: '#111726' }}>Highest Budget</option>
                <option value="budget-low" style={{ background: '#111726' }}>Lowest Budget</option>
                <option value="proposals" style={{ background: '#111726' }}>Most Proposals</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Content Layout (Sidebar + Card Grid) */}
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2rem' }}>
          
          {/* Left Filter Sidebar */}
          <aside className="glass-card" style={{ padding: '1.5rem', height: 'fit-content' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Filter size={18} color="var(--primary)" /> Filter Projects
              </h3>
              <button 
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                  setBudgetRange(10000);
                  setUrgencyFilter('all');
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--primary)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Clear All
              </button>
            </div>

            {/* Search Keyword Filter */}
            <div className="form-group">
              <label className="form-label">Search Keyword</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input 
                  type="text"
                  placeholder="e.g. Next.js, Figma..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            {/* Category Filter Dropdown with Dynamic Count */}
            <div className="form-group">
              <label className="form-label">Category</label>
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="form-select"
              >
                <option value="all">All Categories ({projects.length})</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({getCategoryCount(cat.id, cat.name)})
                  </option>
                ))}
              </select>
            </div>

            {/* Max Budget Range Slider */}
            <div className="form-group" style={{ margin: '1.25rem 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <label className="form-label">Max Budget ($)</label>
                <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.875rem' }}>
                  ${budgetRange.toLocaleString()}
                </span>
              </div>
              <input 
                type="range" 
                min="500" 
                max="10000" 
                step="500"
                value={budgetRange}
                onChange={(e) => setBudgetRange(Number(e.target.value))}
                style={{
                  width: '100%',
                  accentColor: 'var(--primary)',
                  cursor: 'pointer'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                <span>$500</span>
                <span>$10,000+</span>
              </div>
            </div>

            {/* Urgency Badge Filter with Live Badges */}
            <div className="form-group">
              <label className="form-label">Project Urgency</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.4rem' }}>
                {[
                  { id: 'all', label: 'All Jobs', count: projects.length },
                  { id: 'Featured', label: '★ Featured Only', count: getUrgencyCount('Featured') },
                  { id: 'Urgent', label: '⚡ Urgent Only', count: getUrgencyCount('Urgent') },
                  { id: 'Hot', label: '🔥 Hot Bids', count: getUrgencyCount('Hot') }
                ].map(item => (
                  <label 
                    key={item.id} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      fontSize: '0.85rem', 
                      cursor: 'pointer', 
                      color: urgencyFilter === item.id ? '#FFF' : 'var(--text-muted)',
                      padding: '0.2rem 0'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input 
                        type="radio"
                        name="urgency"
                        checked={urgencyFilter === item.id}
                        onChange={() => setUrgencyFilter(item.id)}
                        style={{ accentColor: 'var(--primary)' }}
                      />
                      {item.label}
                    </div>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      background: urgencyFilter === item.id ? 'var(--primary)' : 'rgba(255,255,255,0.08)', 
                      color: '#FFF',
                      padding: '2px 8px', 
                      borderRadius: '10px',
                      fontWeight: 600
                    }}>
                      {item.count}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Project Cards List (10 per page) */}
          <div>
            {loading ? (
              <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>Loading projects…</div>
            ) : error ? (
              <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>{error}</div>
            ) : currentJobs.length === 0 ? (
              <div className="glass-card" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
                <AlertCircle size={42} color="var(--text-dim)" style={{ marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>No projects match your criteria</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Try clearing filters or adjusting search parameters</p>
                <button 
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                    setBudgetRange(10000);
                    setUrgencyFilter('all');
                  }}
                  className="btn btn-primary"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {currentJobs.map((proj) => {
                    const projectId = proj._id || proj.id;
                    const isSaved = savedProjects.includes(projectId);
                    const client = proj.client || {
                      name: proj.clientName || 'WorkPulse client',
                      avatar: proj.clientAvatar,
                      verified: proj.verifiedClient,
                      rating: proj.clientRating,
                      location: proj.clientLocation
                    };

                    return (
                      <div 
                        key={projectId}
                        className="glass-card glass-card-hoverable"
                        style={{ padding: '1.5rem', cursor: 'pointer', transition: 'transform 0.15s ease, box-shadow 0.15s ease' }}
                        onClick={() => onSelectProject && onSelectProject(proj)}
                      >
                        {/* Top Meta Line: Urgency Tag + Category + Actions */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            {proj.urgency === 'Featured' && <span className="badge badge-featured">★ Featured</span>}
                            {proj.urgency === 'Urgent' && <span className="badge badge-urgent">⚡ Urgent</span>}
                            {proj.urgency === 'Hot' && <span className="badge badge-hot">🔥 Hot</span>}
                            <span className="badge badge-category">{proj.categoryName || proj.category}</span>
                          </div>

                          {/* Action Buttons: Delete + Bookmark */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <button 
                              onClick={(e) => handleDelete(e, projectId)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#ef4444',
                                opacity: 0.8,
                                transition: 'opacity 0.2s ease, transform 0.2s ease'
                              }}
                              onMouseEnter={(e) => e.target.style.opacity = '1'}
                              onMouseLeave={(e) => e.target.style.opacity = '0.8'}
                              title="Delete Job"
                            >
                              <Trash2 size={18} />
                            </button>

                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleSaveProject(projectId);
                              }}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                color: isSaved ? 'var(--accent-amber)' : 'var(--text-dim)',
                                transition: 'transform 0.2s ease'
                              }}
                              title={isSaved ? 'Remove Bookmark' : 'Bookmark Job'}
                            >
                              <Bookmark size={20} fill={isSaved ? 'var(--accent-amber)' : 'none'} />
                            </button>
                          </div>
                        </div>

                        {/* Project Title */}
                        <h3 
                          style={{
                            fontSize: '1.2rem',
                            fontWeight: 700,
                            marginBottom: '0.75rem',
                            color: '#FFFFFF',
                            transition: 'color 0.2s ease'
                          }}
                          onMouseEnter={(e) => e.target.style.color = 'var(--primary)'}
                          onMouseLeave={(e) => e.target.style.color = '#FFFFFF'}
                        >
                          {proj.title}
                        </h3>

                        {/* Project Brief Snippet */}
                        <p style={{
                          color: 'var(--text-muted)',
                          fontSize: '0.9rem',
                          marginBottom: '1rem',
                          lineHeight: 1.5,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {proj.description}
                        </p>

                        {/* Required Skills Pills */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.25rem' }}>
                          {(proj.skills || []).map((skill, idx) => (
                            <span key={idx} className="skill-pill">{skill}</span>
                          ))}
                        </div>

                        {/* Card Bottom Meta */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          paddingTop: '1rem',
                          borderTop: '1px solid var(--border-subtle)',
                          flexWrap: 'wrap',
                          gap: '1rem'
                        }}>
                          {/* Client details */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            <img 
                              src={client.avatar || '/logo.jpg'} 
                              alt={client.name}
                              style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                            />
                            <div>
                              <div style={{ fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                {client.name}
                                {client.verified && <CheckCircle2 size={14} color="var(--accent-emerald)" />}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'flex', gap: '0.5rem' }}>
                                <span>★ {client.rating || 'New'}</span> • <span>{client.location || 'Remote'}</span>
                              </div>
                            </div>
                          </div>

                          {/* Budget & Submissions */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                            <div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                                {proj.budgetType} Price
                              </div>
                              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent-emerald)', fontFamily: 'var(--font-heading)' }}>
                                ${Number(proj.budget || 0).toLocaleString()}{proj.budgetType === 'Hourly' ? '/hr' : ''}
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Proposals</div>
                              <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{proj.proposalsCount || 0} bids</div>
                            </div>

                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectProject && onSelectProject(proj);
                              }}
                              className="btn btn-primary btn-sm"
                            >
                              <Send size={14} /> Submit Proposal
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* --- 10 JOBS PER PAGE PAGINATION BAR --- */}
                {totalPages > 1 && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginTop: '2.5rem',
                    padding: '1rem',
                    flexWrap: 'wrap'
                  }}>
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="btn btn-secondary btn-sm"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        opacity: currentPage === 1 ? 0.4 : 1,
                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                      }}
                    >
                      <ChevronLeft size={16} /> Prev
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        style={{
                          minWidth: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          border: pageNum === currentPage ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                          background: pageNum === currentPage ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                          color: '#FFFFFF',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {pageNum}
                      </button>
                    ))}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="btn btn-secondary btn-sm"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        opacity: currentPage === totalPages ? 0.4 : 1,
                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                      }}
                    >
                      Next <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}