import React from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Code2, 
  CheckCircle2, 
  Zap, 
  Layers 
} from 'lucide-react';

export default function Hero({ 
  searchQuery, 
  setSearchQuery, 
  selectedCategory, 
  setSelectedCategory, 
  categories = [], 
  onSearchSubmit 
}) {

  // Real Database Skills matching projects in MongoDB
  const SKILL_BUBBLES = [
    { id: 'react', name: 'React.js', svg: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original.svg', pos: 'bubble-pos-1' },
    { id: 'python', name: 'Python', svg: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/python/python-original.svg', pos: 'bubble-pos-2' },
    { id: 'node', name: 'Node.js', svg: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/nodejs/nodejs-original.svg', pos: 'bubble-pos-3' },
    { id: 'next', name: 'Next.js', svg: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/nextjs/nextjs-original.svg', pos: 'bubble-pos-4' },
    { id: 'figma', name: 'Figma', svg: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/figma/figma-original.svg', pos: 'bubble-pos-5' },
    { id: 'docker', name: 'Docker', svg: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/docker/docker-original.svg', pos: 'bubble-pos-6' },
    { id: 'ts', name: 'TypeScript', svg: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/typescript/typescript-original.svg', pos: 'bubble-pos-7' },
  ];

  const handleSkillClick = (skillName) => {
    setSearchQuery(skillName);
    setTimeout(() => {
      const el = document.getElementById('project-list-section') || document.getElementById('projects-section');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  return (
    <div style={{
      position: 'relative',
      padding: '4rem 0 3.5rem 0',
      background: 'linear-gradient(135deg, #E6F4F1 0%, #F0FAF8 40%, #FFFFFF 100%)',
      borderBottom: '1px solid var(--border-subtle, #E2E8F0)',
      overflow: 'hidden'
    }}>
      
      {/* Background Soft Orbs */}
      <div className="ambient-glow orb-teal-light" />
      <div className="ambient-glow orb-cyan-light" />

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '3.5rem',
          alignItems: 'center'
        }}>
          
          {/* ================= LEFT COLUMN: HEADLINE & SEARCH ================= */}
          <div>
            
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.45rem 1.1rem',
                borderRadius: 'var(--radius-full)',
                background: '#FFFFFF',
                border: '1px solid var(--border-teal, #B2DFDB)',
                color: 'var(--primary, #008080)',
                fontSize: '0.85rem',
                fontWeight: 700,
                boxShadow: '0 2px 10px rgba(0, 128, 128, 0.06)'
              }}>
                <Sparkles size={16} color="#F59E0B" fill="#F59E0B" /> 
                <span>WorkPulse Marketplace • Verified Developers & Designers</span>
              </div>
            </div>

            <h1 style={{
              fontSize: '3.1rem',
              lineHeight: 1.15,
              fontWeight: 900,
              marginBottom: '1.25rem',
              letterSpacing: '-0.03em',
              color: 'var(--text-main, #0F172A)'
            }}>
              Find Creative{' '}
              <span className="shimmer-hero-gradient">
                Freelancers
              </span>
              <br />For Your Next Big Idea
            </h1>

            <p style={{
              fontSize: '1.05rem',
              color: 'var(--text-muted, #475569)',
              marginBottom: '2rem',
              lineHeight: 1.6,
              maxWidth: '520px'
            }}>
              Connect with top-rated React developers, AI engineers, and UI/UX designers. Protected by 100% milestone escrow with instant automated matching.
            </p>

            {/* Multi-Input Search Box */}
            <div style={{
              background: '#FFFFFF',
              border: '2px solid var(--primary, #008080)',
              borderRadius: 'var(--radius-xl, 24px)',
              padding: '0.65rem',
              boxShadow: '0 12px 35px rgba(0, 128, 128, 0.1)',
              display: 'flex',
              gap: '0.5rem',
              flexWrap: 'wrap',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <div style={{ flex: '1 1 220px', display: 'flex', alignItems: 'center', padding: '0 0.5rem', gap: '0.65rem' }}>
                <img 
                  src="/logo.jpg" 
                  alt="WorkPulse"
                  style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'cover' }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <input 
                  type="text" 
                  placeholder="Search skills: React, Node, Python, Next.js..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-main, #0F172A)',
                    outline: 'none',
                    fontSize: '0.95rem',
                    fontWeight: 500
                  }}
                />
              </div>

              <div style={{ flex: '0 0 160px', borderLeft: '1px solid var(--border-subtle, #E2E8F0)', paddingLeft: '0.5rem' }}>
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-main, #0F172A)',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    outline: 'none',
                    cursor: 'pointer',
                    padding: '0.5rem'
                  }}
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <button 
                onClick={onSearchSubmit}
                className="btn btn-primary"
                style={{ borderRadius: 'var(--radius-full)', padding: '0.75rem 1.5rem', fontWeight: 800 }}
              >
                Find Jobs <ArrowRight size={17} />
              </button>
            </div>

            {/* Popular Skills Tags (Real Database Matching) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.85rem' }}>
              <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>Popular Skills:</span>
              {['React.js', 'Next.js', 'Python', 'Node.js', 'Figma', 'Docker'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleSkillClick(tag)}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid var(--border-subtle, #E2E8F0)',
                    color: 'var(--text-muted, #475569)',
                    padding: '0.3rem 0.75rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.03)',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary, #008080)';
                    e.currentTarget.style.color = 'var(--primary, #008080)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#E2E8F0';
                    e.currentTarget.style.color = '#475569';
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* ================= RIGHT COLUMN: ANIMATED FLOATING SKILL BUBBLES ================= */}
          <div style={{
            position: 'relative',
            minHeight: '460px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            
            {/* Center Anchor Hub Card */}
            <div className="center-hub-card" style={{
              width: '100%',
              maxWidth: '340px',
              background: '#FFFFFF',
              border: '2px solid rgba(0, 128, 128, 0.2)',
              borderRadius: '24px',
              padding: '2rem 1.5rem',
              boxShadow: '0 20px 45px rgba(0, 128, 128, 0.12)',
              textAlign: 'center',
              position: 'relative',
              zIndex: 3
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #008080 0%, #0EA5E9 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                color: '#FFF',
                boxShadow: '0 8px 20px rgba(0, 128, 128, 0.3)'
              }}>
                <Code2 size={28} />
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', marginBottom: '0.35rem' }}>
                Full-Stack Tech Ecosystem
              </h3>
              <p style={{ fontSize: '0.825rem', color: '#64748B', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                Connecting specialized engineering, AI & design experts with active milestone projects.
              </p>

              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.35rem 0.85rem',
                borderRadius: '20px',
                background: '#E6F4F1',
                color: '#008080',
                fontSize: '0.75rem',
                fontWeight: 800
              }}>
                <Zap size={13} fill="#008080" /> 100% Escrow on Every Project
              </div>
            </div>

            {/* 🌟 7 ANIMATED FLOATING SKILL BUBBLES */}
            {SKILL_BUBBLES.map((bubble) => (
              <div
                key={bubble.id}
                onClick={() => handleSkillClick(bubble.name)}
                className={`skill-floating-bubble ${bubble.pos}`}
                title={`Click to view ${bubble.name} jobs`}
              >
                <img src={bubble.svg} alt={bubble.name} style={{ width: '24px', height: '24px' }} />
                <span>{bubble.name}</span>
              </div>
            ))}

          </div>

        </div>
      </div>

      {/* ================= 100% GPU SMOOTH CSS ANIMATIONS (ZERO LAG) ================= */}
      <style>{`
        /* Floating Skill Bubble Styling */
        .skill-floating-bubble {
          position: absolute;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1.5px solid rgba(0, 128, 128, 0.18);
          border-radius: 50px;
          padding: 0.5rem 1rem;
          display: flex;
          align-items: center;
          gap: 0.55rem;
          box-shadow: 0 10px 25px rgba(0, 128, 128, 0.08);
          font-size: 0.825rem;
          font-weight: 800;
          color: #0F172A;
          cursor: pointer;
          will-change: transform;
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
          z-index: 4;
          white-space: nowrap;
        }

        .skill-floating-bubble:hover {
          transform: scale(1.12) !important;
          box-shadow: 0 15px 35px rgba(0, 128, 128, 0.25);
          border-color: #008080;
          background: #FFFFFF;
        }

        /* Smooth 60 FPS Keyframes */
        @keyframes floatSmooth1 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-14px) rotate(1.5deg); }
        }

        @keyframes floatSmooth2 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(14px) rotate(-1.5deg); }
        }

        @keyframes floatSmooth3 {
          0%, 100% { transform: translateX(0px) translateY(0px); }
          50% { transform: translateX(-8px) translateY(-10px); }
        }

        @keyframes floatSmooth4 {
          0%, 100% { transform: translateX(0px) translateY(0px); }
          50% { transform: translateX(8px) translateY(10px); }
        }

        /* Bubble Positions */
        .bubble-pos-1 { top: -10px; left: 5px; animation: floatSmooth1 5s ease-in-out infinite; }
        .bubble-pos-2 { top: 15px; right: -15px; animation: floatSmooth2 5.5s ease-in-out infinite; }
        .bubble-pos-3 { bottom: 120px; left: -30px; animation: floatSmooth3 6s ease-in-out infinite; }
        .bubble-pos-4 { top: 130px; right: -35px; animation: floatSmooth1 6.5s ease-in-out infinite; }
        .bubble-pos-5 { bottom: -15px; left: 10px; animation: floatSmooth2 5.2s ease-in-out infinite; }
        .bubble-pos-6 { bottom: 5px; right: 5px; animation: floatSmooth4 5.8s ease-in-out infinite; }
        .bubble-pos-7 { top: -35px; left: 38%; animation: floatSmooth3 4.8s ease-in-out infinite; }

        .shimmer-hero-gradient {
          background: linear-gradient(135deg, #008080 0%, #0EA5E9 50%, #008080 100%);
          background-size: 200% auto;
          color: transparent;
          -webkit-background-clip: text;
          background-clip: text;
          animation: shimmerText 5s linear infinite;
        }

        @keyframes shimmerText {
          to { background-position: 200% center; }
        }

        .ambient-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.35;
          pointer-events: none;
          z-index: 1;
        }
        .orb-teal-light { width: 320px; height: 320px; background: #B2DFDB; top: -40px; right: 10%; }
        .orb-cyan-light { width: 260px; height: 260px; background: #BAE6FD; bottom: 10px; left: 10%; }

        @media (max-width: 768px) {
          .bubble-pos-7 { display: none !important; }
          .bubble-pos-1 { left: 0px !important; }
          .bubble-pos-2 { right: 0px !important; }
          .bubble-pos-3 { left: 0px !important; }
          .bubble-pos-4 { right: 0px !important; }
        }
      `}</style>
    </div>
  );
}