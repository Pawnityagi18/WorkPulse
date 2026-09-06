import React from 'react';
import { Code, Palette, Smartphone, Cpu, FileText, TrendingUp, Server } from 'lucide-react';

const iconMap = {
  Code,
  Palette,
  Smartphone,
  Cpu,
  FileText,
  TrendingUp,
  Server
};

export default function CategoryGrid({ categories = [], selectedCategory, onSelectCategory, projects = [] }) {

  const handleCategoryClick = (catId) => {
    const targetCategory = selectedCategory === catId ? 'all' : catId;
    onSelectCategory(targetCategory);

    setTimeout(() => {
      const projectsSection = document.getElementById('projects-section') || document.querySelector('section:nth-of-type(2)');
      if (projectsSection) {
        projectsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollBy({ top: 500, behavior: 'smooth' });
      }
    }, 50);
  };

  const getLiveCount = (cat) => {
    if (!projects || projects.length === 0) return cat.count ?? 0;
    return projects.filter(p => {
      const pCat = p.category || p.categoryId || p.categoryName;
      return pCat === cat.id || pCat === cat.name;
    }).length;
  };

  return (
    <section style={{ padding: '3.5rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
      <div className="container">
        
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: '2rem'
        }}>
          <div>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.4rem', color: 'var(--text-main, #0f172a)' }}>
              Popular Service Categories
            </h2>
            <p style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.95rem' }}>
              Explore top-demand skills and find domain experts for your project
            </p>
          </div>
          {selectedCategory !== 'all' && (
            <button 
              onClick={() => onSelectCategory('all')}
              className="btn btn-sm btn-secondary"
            >
              Reset Category Filter
            </button>
          )}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '1.25rem'
        }}>
          {categories.map((cat) => {
            const IconComponent = iconMap[cat.icon] || Code;
            const isSelected = selectedCategory === cat.id;
            const liveJobCount = getLiveCount(cat);

            return (
              <div
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className="glass-card glass-card-hoverable"
                style={{
                  padding: '1.5rem',
                  cursor: 'pointer',
                  borderRadius: '16px',
                  border: isSelected ? '2px solid var(--primary, #6366f1)' : '1px solid var(--border-medium, rgba(255,255,255,0.1))',
                  background: isSelected ? 'rgba(99, 102, 241, 0.18)' : 'var(--bg-card, rgba(17, 24, 39, 0.6))',
                  boxShadow: isSelected ? '0 8px 24px rgba(99, 102, 241, 0.25)' : '0 4px 12px rgba(0, 0, 0, 0.08)',
                  transform: isSelected ? 'translateY(-3px)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1rem'
                }}>
                  {/* Category Icon */}
                  <div style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    background: isSelected ? 'var(--primary, #6366f1)' : 'rgba(99, 102, 241, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isSelected ? '#FFFFFF' : 'var(--primary, #6366f1)'
                  }}>
                    <IconComponent size={22} />
                  </div>

                  {/* Category Job Count Badge */}
                  <span style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: '20px',
                    background: isSelected ? 'var(--primary, #6366f1)' : 'rgba(99, 102, 241, 0.1)',
                    color: isSelected ? '#FFFFFF' : 'var(--primary, #6366f1)'
                  }}>
                    {liveJobCount} {liveJobCount === 1 ? 'Job' : 'Jobs'}
                  </span>
                </div>

                {/* Category Title */}
                <h3 style={{
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  marginBottom: '0.4rem',
                  color: isSelected ? 'var(--primary, #818cf8)' : 'var(--text-main, #ffffff)'
                }}>
                  {cat.name}
                </h3>
                
                {/* Category Skills */}
                <div style={{ fontSize: '0.825rem', color: 'var(--text-muted, #94a3b8)' }}>
                  Skills: <span style={{ color: 'var(--text-main, #e2e8f0)', fontWeight: 600 }}>{cat.topSkill}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}