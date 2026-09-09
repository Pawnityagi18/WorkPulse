import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Shield, 
  CheckCircle2, 
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

  // Lightweight & Compressed Sector Showcase Data (Sub-100KB images)
  const SECTORS = [
    {
      id: 'fintech',
      title: 'FinTech & Banking',
      icon: CreditCard,
      badge: 'High Demand',
      description: 'Building secure payment gateways, crypto wallets, and automated trading algorithms.',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=420&q=60&auto=format&fit=crop',
      stats: '180+ Projects Delivered',
      highlight: 'Stripe & Razorpay Certified'
    },
    {
      id: 'healthtech',
      title: 'HealthTech & Medicine',
      icon: Activity,
      badge: 'Enterprise',
      description: 'HIPAA-ready telemedicine platforms, health tracking apps, and AI diagnostics.',
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=420&q=60&auto=format&fit=crop',
      stats: '95+ Verified Apps Built',
      highlight: 'Secure Patient Portals'
    },
    {
      id: 'ecommerce',
      title: 'E-Commerce & Retail',
      icon: ShoppingBag,
      badge: 'Top Volume',
      description: 'High-speed custom storefronts, multi-vendor marketplaces, and inventory pipelines.',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=420&q=60&auto=format&fit=crop',
      stats: '340+ Stores Scaled',
      highlight: 'Fast Next.js Checkouts'
    },
    {
      id: 'ai-saas',
      title: 'AI & Enterprise SaaS',
      icon: Cpu,
      badge: 'Next-Gen',
      description: 'Autonomous AI agents, LangChain RAG search pipelines, and enterprise automation.',
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=420&q=60&auto=format&fit=crop',
      stats: '210+ AI Models Deployed',
      highlight: 'Powered by Gemini & LLMs'
    },
    {
      id: 'edtech',
      title: 'EdTech & Learning',
      icon: GraduationCap,
      badge: 'Interactive',
      description: 'Online learning platforms, virtual coding bootcamps, and assessment engines.',
      image: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=420&q=60&auto=format&fit=crop',
      stats: '120+ Campuses Onboarded',
      highlight: 'Real-time Dashboards'
    }
  ];

  const [activeSectorIndex, setActiveSectorIndex] = useState(0);
  const activeSector = SECTORS[activeSectorIndex];

  return (
    <div style={{
      position: 'relative',
      padding: '3.5rem 0 3rem 0',
      background: 'linear-gradient(135deg, #E6F4F1 0%, #F0FAF8 40%, #FFFFFF 100%)',
      borderBottom: '1px solid var(--border-subtle, #E2E8F0)',
      overflow: 'hidden'
    }}>
      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '3rem',
          alignItems: 'center'
        }}>
          
          {/* LEFT COLUMN: HEADLINE & SEARCH */}
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
                <span>Empowering Global Industries • Top 1% Verified Talent</span>
              </div>
            </div>

            <h1 style={{
              fontSize: '3rem',
              lineHeight: 1.15,
              fontWeight: 900,
              marginBottom: '1.25rem',
              letterSpacing: '-0.03em',
              color: 'var(--text-main, #0F172A)'
            }}>
              Hire Domain Experts Across{' '}
              <span style={{ color: 'var(--primary, #008080)' }}>
                Every Industry
              </span>
            </h1>

            <p style={{
              fontSize: '1.05rem',
              color: 'var(--text-muted, #475569)',
              marginBottom: '1.75rem',
              lineHeight: 1.6,
              maxWidth: '520px'
            }}>
              From FinTech and HealthTech to AI and E-Commerce. Connect with specialized developers backed by 100% milestone escrow protection.
            </p>

            {/* Search Box */}
            <div style={{
              background: '#FFFFFF',
              border: '2px solid var(--primary, #008080)',
              borderRadius: 'var(--radius-xl, 24px)',
              padding: '0.65rem',
              boxShadow: '0 10px 30px rgba(0, 128, 128, 0.1)',
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
                  placeholder="Search industries: FinTech, AI, Health..." 
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
                  <option value="all">All Industries</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <button 
                onClick={onSearchSubmit}
                className="btn btn-primary"
                style={{ borderRadius: 'var(--radius-full)', padding: '0.75rem 1.4rem', fontWeight: 800 }}
              >
                Explore Talent <ArrowRight size={17} />
              </button>
            </div>

            {/* Tags */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.85rem' }}>
              <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>Key Sectors:</span>
              {['FinTech', 'HealthTech', 'E-Commerce', 'AI & SaaS', 'EdTech'].map((tag) => (
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

          {/* RIGHT COLUMN: LIGHTWEIGHT SECTOR SHOWCASE */}
          <div>
            
            {/* Clickable Sector Tabs */}
            <div style={{
              display: 'flex',
              gap: '0.4rem',
              overflowX: 'auto',
              paddingBottom: '0.65rem',
              marginBottom: '0.85rem'
            }}>
              {SECTORS.map((sec, idx) => {
                const IconComponent = sec.icon;
                const isActive = activeSectorIndex === idx;

                return (
                  <button
                    key={sec.id}
                    onClick={() => setActiveSectorIndex(idx)}
                    style={{
                      padding: '0.45rem 0.85rem',
                      borderRadius: '10px',
                      border: isActive ? '1.5px solid #008080' : '1px solid #E2E8F0',
                      background: isActive ? '#008080' : '#FFFFFF',
                      color: isActive ? '#FFFFFF' : '#475569',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    <IconComponent size={14} />
                    <span>{sec.id.toUpperCase()}</span>
                  </button>
                );
              })}
            </div>

            {/* Fast Visual Card */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              border: '1px solid rgba(0, 128, 128, 0.15)',
              overflow: 'hidden',
              boxShadow: '0 15px 35px rgba(0, 128, 128, 0.08)'
            }}>
              
              {/* Optimized Image with Lazy Loading */}
              <div style={{ position: 'relative', height: '220px', overflow: 'hidden', background: '#F1F5F9' }}>
                <img 
                  key={activeSector.id}
                  src={activeSector.image} 
                  alt={activeSector.title}
                  loading="lazy"
                  decoding="async"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
                
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(15, 23, 42, 0.8) 100%)'
                }} />

                <div style={{
                  position: 'absolute',
                  top: '0.85rem',
                  left: '0.85rem',
                  padding: '3px 9px',
                  borderRadius: '16px',
                  background: 'rgba(255, 255, 255, 0.92)',
                  color: '#008080',
                  fontSize: '0.72rem',
                  fontWeight: 800
                }}>
                  ★ {activeSector.badge}
                </div>

                <div style={{
                  position: 'absolute',
                  top: '0.85rem',
                  right: '0.85rem',
                  padding: '3px 9px',
                  borderRadius: '16px',
                  background: '#10B981',
                  color: '#FFFFFF',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}>
                  <Shield size={12} /> 100% Escrow
                </div>

                <div style={{ position: 'absolute', bottom: '0.85rem', left: '1rem', right: '1rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                    {activeSector.title}
                  </h3>
                </div>
              </div>

              {/* Body */}
              <div style={{ padding: '1.25rem' }}>
                <p style={{ color: '#475569', fontSize: '0.875rem', lineHeight: 1.5, marginBottom: '1rem' }}>
                  {activeSector.description}
                </p>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.65rem 0.85rem',
                  background: '#F0FAF8',
                  borderRadius: '12px',
                  border: '1px solid #B2DFDB'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', fontWeight: 700, color: '#006666' }}>
                    <CheckCircle2 size={15} color="#008080" />
                    <span>{activeSector.stats}</span>
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0284C7' }}>
                    {activeSector.highlight}
                  </span>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
}