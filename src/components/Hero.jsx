import React from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Cpu, 
  CheckCircle2, 
  Layers, 
  Zap, 
  Code2 
} from 'lucide-react';

export default function Hero({ 
  searchQuery, 
  setSearchQuery, 
  selectedCategory, 
  setSelectedCategory, 
  categories = [], 
  onSearchSubmit 
}) {

  // Technology Logos List with Real Official SVGs
  const TECH_LOGOS = [
    { name: 'React', svg: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original.svg', color: '#00d8ff' },
    { name: 'Python', svg: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/python/python-original.svg', color: '#3776ab' },
    { name: 'Node.js', svg: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/nodejs/nodejs-original.svg', color: '#68a063' },
    { name: 'TypeScript', svg: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/typescript/typescript-original.svg', color: '#3178c6' },
    { name: 'Figma', svg: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/figma/figma-original.svg', color: '#f24e1e' },
    { name: 'Next.js', svg: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/nextjs/nextjs-original.svg', color: '#000000' },
    { name: 'Docker', svg: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/docker/docker-original.svg', color: '#2496ed' },
    { name: 'MongoDB', svg: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/mongodb/mongodb-original.svg', color: '#47a248' },
    { name: 'Flutter', svg: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/flutter/flutter-original.svg', color: '#02569b' },
  ];

  return (
    <div style={{
      position: 'relative',
      padding: '4rem 0 2.5rem 0',
      background: 'linear-gradient(135deg, #E6F4F1 0%, #F0FAF8 40%, #FFFFFF 100%)',
      borderBottom: '1px solid var(--border-subtle, #E2E8F0)',
      overflow: 'hidden'
    }}>
      
      {/* Background Glowing Mesh Orbs */}
      <div className="tech-glow-orb orb-teal" />
      <div className="tech-glow-orb orb-cyan" />

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '3rem',
          alignItems: 'center'
        }}>
          
          {/* ================= LEFT COLUMN: HEADLINE & SEARCH ================= */}
          <div>
            
            {/* Top Interactive Pill */}
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
                <span>AI-Powered Tech & Engineering Marketplace</span>
              </div>
            </div>

            {/* Main Headline */}
            <h1 style={{
              fontSize: '3.1rem',
              lineHeight: 1.15,
              fontWeight: 900,
              marginBottom: '1.25rem',
              letterSpacing: '-0.03em',
              color: 'var(--text-main, #0F172A)'
            }}>
              Hire Top{' '}
              <span className="shimmer-tech-text">
                Tech Talent
              </span>
              <br />For Web, AI & Cloud
            </h1>

            <p style={{
              fontSize: '1.05rem',
              color: 'var(--text-muted, #475569)',
              marginBottom: '2rem',
              lineHeight: 1.6,
              maxWidth: '520px'
            }}>
              Connect with verified React, Python, Node, and AI developers. Protected by 100% milestone escrow with instant automated matching.
            </p>

            {/* Multi-Input Search Box */}
            <div style={{
              background: '#FFFFFF',
              border: '2px solid var(--primary, #008080)',
              borderRadius: 'var(--radius-xl, 24px)',
              padding: '0.65rem',
              boxShadow: '0 12px 35px rgba(0, 128, 128, 0.12)',
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
                  placeholder="Search by tech: React, Python, Next.js..." 
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

              <div style={{ flex: '0 0 170px', borderLeft: '1px solid var(--border-subtle, #E2E8F0)', paddingLeft: '0.5rem' }}>
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
                Find Developers <ArrowRight size={17} />
              </button>
            </div>

            {/* Trending Tech Pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.85rem' }}>
              <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>Hot Tech:</span>
              {['React.js', 'Python AI', 'Next.js 15', 'Docker', 'Figma UI'].map((tag) => (
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
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                    transition: 'all 0.2s ease'
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

          {/* ================= RIGHT COLUMN: 3D FLOATING TECH LOGO UNIVERSE ================= */}
          <div style={{
            position: 'relative',
            minHeight: '440px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            
            {/* Center Core Hub Card */}
            <div className="central-tech-hub" style={{
              width: '100%',
              maxWidth: '360px',
              background: '#FFFFFF',
              border: '1.5px solid rgba(0, 128, 128, 0.2)',
              borderRadius: '24px',
              padding: '2rem 1.5rem',
              boxShadow: '0 20px 45px rgba(0, 128, 128, 0.12)',
              textAlign: 'center',
              position: 'relative',
              zIndex: 3
            }}>
              <div style={{
                width: '54px',
                height: '54px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #008080 0%, #0EA5E9 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                color: '#FFF',
                boxShadow: '0 6px 18px rgba(0, 128, 128, 0.3)'
              }}>
                <Code2 size={28} />
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.4rem' }}>
                Full-Stack Tech Ecosystem
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                Over 50+ modern frameworks, languages, and generative AI models integrated seamlessly.
              </p>

              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.4rem 0.9rem',
                borderRadius: '20px',
                background: '#E6F4F1',
                color: '#008080',
                fontSize: '0.78rem',
                fontWeight: 700
              }}>
                <Zap size={14} fill="#008080" /> Automated Gemini AI Scoping
              </div>
            </div>

            {/* 🌟 1. FLOATING REACT LOGO (TOP-LEFT) */}
            <div className="floating-tech-badge badge-pos-react">
              <img src={TECH_LOGOS[0].svg} alt="React" style={{ width: '28px', height: '28px' }} />
              <span>React.js</span>
            </div>

            {/* 🌟 2. FLOATING PYTHON LOGO (TOP-RIGHT) */}
            <div className="floating-tech-badge badge-pos-python">
              <img src={TECH_LOGOS.svg} alt="Python" style={{ width: '26px', height: '26px' }} />
              <span>Python AI</span>
            </div>

            {/* 🌟 3. FLOATING NODE.JS LOGO (MIDDLE-LEFT) */}
            <div className="floating-tech-badge badge-pos-node">
              <img src={TECH_LOGOS.svg} alt="Node" style={{ width: '26px', height: '26px' }} />
              <span>Node.js</span>
            </div>

            {/* 🌟 4. FLOATING FIGMA LOGO (MIDDLE-RIGHT) */}
            <div className="floating-tech-badge badge-pos-figma">
              <img src={TECH_LOGOS.svg} alt="Figma" style={{ width: '24px', height: '24px' }} />
              <span>Figma UI/UX</span>
            </div>

            {/* 🌟 5. FLOATING DOCKER LOGO (BOTTOM-LEFT) */}
            <div className="floating-tech-badge badge-pos-docker">
              <img src={TECH_LOGOS.svg} alt="Docker" style={{ width: '26px', height: '26px' }} />
              <span>Docker & K8s</span>
            </div>

            {/* 🌟 6. FLOATING NEXT.JS LOGO (BOTTOM-RIGHT) */}
            <div className="floating-tech-badge badge-pos-next">
              <img src={TECH_LOGOS.svg} alt="Next.js" style={{ width: '26px', height: '26px' }} />
              <span>Next.js 15</span>
            </div>

            {/* 🌟 7. FLOATING TYPESCRIPT BADGE (TOP-CENTER) */}
            <div className="floating-tech-badge badge-pos-ts">
              <img src={TECH_LOGOS.svg} alt="TypeScript" style={{ width: '22px', height: '22px' }} />
              <span>TypeScript</span>
            </div>

          </div>
        </div>

        {/* ================= BOTTOM: INFINITE MOVING TECH MARQUEE ================= */}
        <div style={{ marginTop: '3.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(0, 128, 128, 0.1)' }}>
          <div style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748B', marginBottom: '1rem' }}>
            Powered by Modern Technologies & Verified Stacks
          </div>

          <div className="tech-marquee-wrapper">
            <div className="tech-marquee-track">
              {[...TECH_LOGOS, ...TECH_LOGOS].map((t, idx) => (
                <div key={idx} className="marquee-tech-item">
                  <img src={t.svg} alt={t.name} style={{ width: '22px', height: '22px' }} />
                  <span>{t.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* ================= CSS ANIMATIONS & FLOATING TRAJECTORIES ================= */}
      <style>{`
        /* Floating Tech Badges Styling */
        .floating-tech-badge {
          position: absolute;
          background: #FFFFFF;
          border: 1px solid rgba(0, 128, 128, 0.18);
          border-radius: 50px;
          padding: 0.5rem 0.95rem;
          display: flex;
          align-items: center;
          gap: 0.55rem;
          box-shadow: 0 10px 25px rgba(0, 128, 128, 0.1);
          font-size: 0.825rem;
          font-weight: 700;
          color: #0F172A;
          cursor: pointer;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          z-index: 4;
        }

        .floating-tech-badge:hover {
          transform: scale(1.1) !important;
          box-shadow: 0 15px 35px rgba(0, 128, 128, 0.25);
          border-color: #008080;
        }

        /* Distinct Floating Animations & Positions */
        @keyframes float1 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(2deg); }
        }
        @keyframes float2 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(14px) rotate(-3deg); }
        }
        @keyframes float3 {
          0%, 100% { transform: translateX(0px) translateY(0px); }
          50% { transform: translateX(-8px) translateY(-10px); }
        }
        @keyframes float4 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(10px); }
        }

        .badge-pos-react {
          top: -10px;
          left: 5px;
          animation: float1 4.5s ease-in-out infinite;
        }

        .badge-pos-python {
          top: 15px;
          right: -10px;
          animation: float2 5s ease-in-out infinite;
        }

        .badge-pos-node {
          bottom: 120px;
          left: -25px;
          animation: float3 6s ease-in-out infinite;
        }

        .badge-pos-figma {
          top: 130px;
          right: -30px;
          animation: float1 5.5s ease-in-out infinite;
        }

        .badge-pos-docker {
          bottom: -15px;
          left: 10px;
          animation: float2 4.8s ease-in-out infinite;
        }

        .badge-pos-next {
          bottom: 5px;
          right: 5px;
          animation: float3 5.2s ease-in-out infinite;
        }

        .badge-pos-ts {
          top: -30px;
          left: 42%;
          animation: float4 4s ease-in-out infinite;
        }

        /* Text Shimmer Effect */
        .shimmer-tech-text {
          background: linear-gradient(135deg, #008080 0%, #0EA5E9 50%, #008080 100%);
          background-size: 200% auto;
          color: transparent;
          -webkit-background-clip: text;
          background-clip: text;
          animation: shimmerTech 5s linear infinite;
        }

        @keyframes shimmerTech {
          to { background-position: 200% center; }
        }

        /* Glowing Orbs */
        .tech-glow-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(90px);
          opacity: 0.45;
          pointer-events: none;
          z-index: 1;
        }
        .orb-teal {
          width: 350px;
          height: 350px;
          background: #B2DFDB;
          top: -60px;
          right: 5%;
        }
        .orb-cyan {
          width: 280px;
          height: 280px;
          background: #BAE6FD;
          bottom: 10px;
          left: 10%;
        }

        /* Continuous Infinite Marquee */
        .tech-marquee-wrapper {
          overflow: hidden;
          width: 100%;
          display: flex;
          mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
        }

        .tech-marquee-track {
          display: flex;
          gap: 1.5rem;
          width: max-content;
          animation: marqueeScroll 22s linear infinite;
        }

        .marquee-tech-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.4rem 0.9rem;
          border-radius: 12px;
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          font-size: 0.8rem;
          font-weight: 700;
          color: #334155;
          box-shadow: 0 2px 6px rgba(0,0,0,0.02);
          white-space: nowrap;
        }

        @keyframes marqueeScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        @media (max-width: 768px) {
          .badge-pos-ts { display: none !important; }
          .badge-pos-node { left: 0px !important; }
          .badge-pos-figma { right: 0px !important; }
        }
      `}</style>
    </div>
  );
}