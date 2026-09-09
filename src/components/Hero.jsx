import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Shield, 
  CheckCircle2, 
  Briefcase, 
  ChevronRight, 
  CreditCard, 
  Activity, 
  ShoppingBag, 
  Cpu, 
  GraduationCap 
} from 'lucide-react';

export default function Hero({ 
  searchQuery, 
  setSearchQuery, 
  selectedCategory, 
  setSelectedCategory, 
  categories = [], 
  onSearchSubmit 
}) {

  // 🌟 Real Industry Sectors Served by WorkPulse with High-Res Images
  const SECTORS = [
    {
      id: 'fintech',
      title: 'FinTech & Digital Banking',
      icon: CreditCard,
      badge: 'High Demand',
      description: 'Building secure payment gateways, crypto wallets, and algorithmic trading systems with 100% compliance.',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=700&auto=format&fit=crop&q=80',
      stats: '180+ Projects Delivered',
      highlight: 'Stripe & Razorpay Certified'
    },
    {
      id: 'healthtech',
      title: 'HealthTech & Telemedicine',
      icon: Activity,
      badge: 'Enterprise Grade',
      description: 'HIPAA-ready doctor-patient web applications, fitness trackers, and AI-driven medical data diagnostics.',
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=700&auto=format&fit=crop&q=80',
      stats: '95+ Verified Apps Built',
      highlight: 'Secure Patient Portals'
    },
    {
      id: 'ecommerce',
      title: 'E-Commerce & Digital Retail',
      icon: ShoppingBag,
      badge: 'Top Volume',
      description: 'High-converting online storefronts, multi-vendor marketplaces, and automated inventory sync architectures.',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=700&auto=format&fit=crop&q=80',
      stats: '340+ Stores Scaled',
      highlight: 'Fast Next.js Checkouts'
    },
    {
      id: 'ai-saas',
      title: 'AI & Enterprise SaaS Systems',
      icon: Cpu,
      badge: 'Next-Gen',
      description: 'Autonomous AI agents, LangChain RAG document search engines, and multi-tenant cloud SaaS platforms.',
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=700&auto=format&fit=crop&q=80',
      stats: '210+ AI Models Deployed',
      highlight: 'Powered by Gemini & LLMs'
    },
    {
      id: 'edtech',
      title: 'EdTech & Smart Learning',
      icon: GraduationCap,
      badge: 'Interactive',
      description: 'Interactive learning management platforms, live video coding classrooms, and student assessment engines.',
      image: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=700&auto=format&fit=crop&q=80',
      stats: '120+ Campuses Onboarded',
      highlight: 'Real-time Dashboards'
    }
  ];

  const [activeSectorIndex, setActiveSectorIndex] = useState(0);
  const activeSector = SECTORS[activeSectorIndex];

  // Auto-cycle through sectors every 4.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSectorIndex((prev) => (prev + 1) % SECTORS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [SECTORS.length]);

  return (
    <div style={{
      position: 'relative',
      padding: '4rem 0 3.5rem 0',
      background: 'linear-gradient(135deg, #E6F4F1 0%, #F0FAF8 40%, #FFFFFF 100%)',
      borderBottom: '1px solid var(--border-subtle, #E2E8F0)',
      overflow: 'hidden'
    }}>
      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '3.5rem',
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
                <span>Empowering Global Industries • Top 1% Verified Talent</span>
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
              Hire Domain Experts Across{' '}
              <span className="shimmer-sector-text">
                Every Major Industry
              </span>
            </h1>

            <p style={{
              fontSize: '1.05rem',
              color: 'var(--text-muted, #475569)',
              marginBottom: '2rem',
              lineHeight: 1.6,
              maxWidth: '520px'
            }}>
              From FinTech and HealthTech to AI and E-Commerce. Connect with specialized developers and designers backed by 100% milestone escrow protection.
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
                  placeholder="Search industries: FinTech, HealthTech, AI..." 
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
                  <option value="all">All Industries</option>
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

            {/* Popular Industry Tags */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.85rem' }}>
              <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>Key Sectors:</span>
              {['FinTech', 'HealthTech', 'E-Commerce', 'Artificial Intelligence', 'EdTech'].map((tag) => (
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

          {/* ================= RIGHT COLUMN: INTERACTIVE INDUSTRY SHOWCASE DECK ================= */}
          <div>
            
            {/* Interactive Sector Navigation Tabs */}
            <div style={{
              display: 'flex',
              gap: '0.4rem',
              overflowX: 'auto',
              paddingBottom: '0.75rem',
              marginBottom: '1rem'
            }}>
              {SECTORS.map((sec, idx) => {
                const IconComponent = sec.icon;
                const isActive = activeSectorIndex === idx;

                return (
                  <button
                    key={sec.id}
                    onClick={() => setActiveSectorIndex(idx)}
                    style={{
                      padding: '0.5rem 0.9rem',
                      borderRadius: '12px',
                      border: isActive ? '1.5px solid #008080' : '1px solid #E2E8F0',
                      background: isActive ? '#008080' : '#FFFFFF',
                      color: isActive ? '#FFFFFF' : '#475569',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      boxShadow: isActive ? '0 4px 12px rgba(0,128,128,0.25)' : 'none',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <IconComponent size={14} />
                    <span>{sec.id.toUpperCase()}</span>
                  </button>
                );
              })}
            </div>

            {/* Showcase Visual Card */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '24px',
              border: '1.5px solid rgba(0, 128, 128, 0.18)',
              overflow: 'hidden',
              boxShadow: '0 20px 45px rgba(0, 128, 128, 0.12)',
              position: 'relative'
            }}>
              
              {/* Sector High-Res Image with Gradient Overlay */}
              <div style={{ position: 'relative', height: '240px', overflow: 'hidden' }}>
                <img 
                  src={activeSector.image} 
                  alt={activeSector.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.5s ease'
                  }}
                />
                
                {/* Image Overlay Gradient */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(15, 23, 42, 0.8) 100%)'
                }} />

                {/* Floating Top Badge */}
                <div style={{
                  position: 'absolute',
                  top: '1rem',
                  left: '1rem',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(8px)',
                  color: '#008080',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                }}>
                  ★ {activeSector.badge}
                </div>

                {/* Escrow Badge on Image */}
                <div style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  background: 'rgba(16, 185, 129, 0.9)',
                  color: '#FFFFFF',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem'
                }}>
                  <Shield size={12} /> 100% Escrow
                </div>

                {/* Sector Title on Image */}
                <div style={{ position: 'absolute', bottom: '1rem', left: '1.25rem', right: '1.25rem' }}>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#FFFFFF', margin: 0, textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
                    {activeSector.title}
                  </h3>
                </div>
              </div>

              {/* Sector Content Body */}
              <div style={{ padding: '1.5rem' }}>
                <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                  {activeSector.description}
                </p>

                {/* Sector Metrics & Highlights */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem 1rem',
                  background: '#F0FAF8',
                  borderRadius: '14px',
                  border: '1px solid #B2DFDB'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 700, color: '#006666' }}>
                    <CheckCircle2 size={16} color="#008080" />
                    <span>{activeSector.stats}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0284C7' }}>
                    {activeSector.highlight}
                  </span>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>

      {/* CSS Animation */}
      <style>{`
        .shimmer-sector-text {
          background: linear-gradient(135deg, #008080 0%, #0EA5E9 50%, #008080 100%);
          background-size: 200% auto;
          color: transparent;
          -webkit-background-clip: text;
          background-clip: text;
          animation: shimmerSector 5s linear infinite;
        }

        @keyframes shimmerSector {
          to { background-position: 200% center; }
        }
      `}</style>
    </div>
  );
}