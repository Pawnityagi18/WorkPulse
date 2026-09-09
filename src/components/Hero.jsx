import React from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  CreditCard, 
  Activity, 
  ShoppingBag, 
  Cpu, 
  GraduationCap, 
  Cloud, 
  ShieldCheck, 
  Palette,
  Briefcase
} from 'lucide-react';

export default function Hero({ 
  searchQuery, 
  setSearchQuery, 
  selectedCategory, 
  setSelectedCategory, 
  categories = [], 
  onSearchSubmit 
}) {

  // 🌟 Real Industry Sectors in Interactive Bubble Format
  const SECTOR_BUBBLES = [
    { id: 'fintech', name: 'FinTech & Banking', icon: CreditCard, color: '#008080', bg: 'rgba(0, 128, 128, 0.1)', pos: 'bubble-pos-1' },
    { id: 'healthtech', name: 'HealthTech & AI', icon: Activity, color: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)', pos: 'bubble-pos-2' },
    { id: 'ai-saas', name: 'Generative AI & SaaS', icon: Cpu, color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.1)', pos: 'bubble-pos-3' },
    { id: 'ecommerce', name: 'E-Commerce & Retail', icon: ShoppingBag, color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)', pos: 'bubble-pos-4' },
    { id: 'cloud', name: 'Cloud & DevOps', icon: Cloud, color: '#0EA5E9', bg: 'rgba(14, 165, 233, 0.1)', pos: 'bubble-pos-5' },
    { id: 'edtech', name: 'EdTech & Learning', icon: GraduationCap, color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)', pos: 'bubble-pos-6' },
    { id: 'cyber', name: 'CyberSecurity & Web3', icon: ShieldCheck, color: '#6366F1', bg: 'rgba(99, 102, 241, 0.1)', pos: 'bubble-pos-7' },
    { id: 'uiux', name: 'UI/UX & Product Design', icon: Palette, color: '#EC4899', bg: 'rgba(236, 72, 153, 0.1)', pos: 'bubble-pos-8' },
  ];

  const handleBubbleClick = (sectorName) => {
    setSearchQuery(sectorName);
    onSearchSubmit && onSearchSubmit();
  };

  return (
    <div style={{
      position: 'relative',
      padding: '4rem 0 3.5rem 0',
      background: 'linear-gradient(135deg, #E6F4F1 0%, #F0FAF8 40%, #FFFFFF 100%)',
      borderBottom: '1px solid var(--border-subtle, #E2E8F0)',
      overflow: 'hidden'
    }}>
      
      {/* Background Soft Glow Orbs */}
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
                <span>Empowering Global Sectors • Top 1% Verified Talent</span>
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
              Hire Domain Experts Across{' '}
              <span className="shimmer-hero-gradient">
                Key Global Sectors
              </span>
            </h1>

            <p style={{
              fontSize: '1.05rem',
              color: 'var(--text-muted, #475569)',
              marginBottom: '2rem',
              lineHeight: 1.6,
              maxWidth: '520px'
            }}>
              From FinTech and HealthTech to AI, E-Commerce, and Cloud DevOps. Connect with specialized developers and designers backed by 100% milestone escrow protection.
            </p>

            {/* Search Box */}
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
                  placeholder="Search industries: FinTech, AI, Health, Web..." 
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
                  <option value="all">All Sectors</option>
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
                Explore Talent <ArrowRight size={17} />
              </button>
            </div>

            {/* Quick Filter Tags */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.85rem' }}>
              <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>Industries:</span>
              {['FinTech', 'HealthTech', 'E-Commerce', 'AI & SaaS', 'DevOps'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSearchQuery(tag)}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid var(--border-subtle, #E2E8F0)',
                    color: 'var(--text-muted, #475569)',
                    padding: '0.3rem 0.75rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.03)'
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* ================= RIGHT COLUMN: ANIMATED SECTOR BUBBLES UNIVERSE ================= */}
          <div style={{
            position: 'relative',
            minHeight: '460px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            
            {/* Center Anchor Hub */}
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
                <Briefcase size={28} />
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', marginBottom: '0.35rem' }}>
                Multi-Sector Ecosystem
              </h3>
              <p style={{ fontSize: '0.825rem', color: '#64748B', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                Connecting specialized engineering & design domain experts across major global sectors.
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
                <Sparkles size={13} fill="#008080" /> 100% Escrow in Every Sector
              </div>
            </div>

            {/* 🌟 8 ANIMATED FLOATING SECTOR BUBBLES */}
            {SECTOR_BUBBLES.map((sec) => {
              const IconComponent = sec.icon;
              return (
                <div
                  key={sec.id}
                  onClick={() => handleBubbleClick(sec.name)}
                  className={`sector-floating-bubble ${sec.pos}`}
                  title={`Click to search ${sec.name}`}
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '10px',
                    background: sec.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: sec.color,
                    flexShrink: 0
                  }}>
                    <IconComponent size={18} />
                  </div>
                  <span>{sec.name}</span>
                </div>
              );
            })}

          </div>

        </div>
      </div>

      {/* ================= 100% GPU SMOOTH CSS ANIMATIONS (ZERO LAG) ================= */}
      <style>{`
        /* Floating Sector Bubble Base */
        .sector-floating-bubble {
          position: absolute;
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1.5px solid rgba(0, 128, 128, 0.18);
          border-radius: 50px;
          padding: 0.5rem 1rem;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          box-shadow: 0 10px 25px rgba(0, 128, 128, 0.08);
          font-size: 0.825rem;
          font-weight: 800;
          color: #0F172A;
          cursor: pointer;
          will-change: transform;
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
          z-index: 4;
          white-space: nowrap;
        }

        .sector-floating-bubble:hover {
          transform: scale(1.1) !important;
          box-shadow: 0 15px 35px rgba(0, 128, 128, 0.25);
          border-color: #008080;
          background: #FFFFFF;
        }

        /* 🌟 Smooth 60 FPS Floating Keyframes */
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

        /* Positions & Assigned Floating Animations */
        .bubble-pos-1 {
          top: -15px;
          left: 5px;
          animation: floatSmooth1 5s ease-in-out infinite;
        }

        .bubble-pos-2 {
          top: 10px;
          right: -15px;
          animation: floatSmooth2 5.5s ease-in-out infinite;
        }

        .bubble-pos-3 {
          top: -35px;
          left: 35%;
          animation: floatSmooth3 6s ease-in-out infinite;
        }

        .bubble-pos-4 {
          top: 130px;
          right: -35px;
          animation: floatSmooth1 6.5s ease-in-out infinite;
        }

        .bubble-pos-5 {
          bottom: 120px;
          left: -30px;
          animation: floatSmooth2 5.2s ease-in-out infinite;
        }

        .bubble-pos-6 {
          bottom: -15px;
          left: 10px;
          animation: floatSmooth4 5.8s ease-in-out infinite;
        }

        .bubble-pos-7 {
          bottom: 0px;
          right: 5px;
          animation: floatSmooth3 4.8s ease-in-out infinite;
        }

        .bubble-pos-8 {
          bottom: -35px;
          left: 38%;
          animation: floatSmooth1 5.4s ease-in-out infinite;
        }

        /* Headline Gradient Shimmer */
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

        /* Ambient Orbs */
        .ambient-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.35;
          pointer-events: none;
          z-index: 1;
        }
        .orb-teal-light {
          width: 320px;
          height: 320px;
          background: #B2DFDB;
          top: -40px;
          right: 10%;
        }
        .orb-cyan-light {
          width: 260px;
          height: 260px;
          background: #BAE6FD;
          bottom: 10px;
          left: 10%;
        }

        @media (max-width: 768px) {
          .bubble-pos-3 { display: none !important; }
          .bubble-pos-8 { display: none !important; }
          .bubble-pos-1 { left: 0px !important; }
          .bubble-pos-2 { right: 0px !important; }
          .bubble-pos-4 { right: 0px !important; }
          .bubble-pos-5 { left: 0px !important; }
        }
      `}</style>
    </div>
  );
}