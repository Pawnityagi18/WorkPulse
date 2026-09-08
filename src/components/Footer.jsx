import React, { useState } from 'react';
import { Globe, Share2, Send, Mail, Phone, Heart, Shield, CheckCircle2, X } from 'lucide-react';

export default function Footer({ onNavigate }) {
  const [showEscrowModal, setShowEscrowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);

  // Smooth scroll to specific sections
  const scrollToSection = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 500, behavior: 'smooth' });
    }
  };

  const handleLinkClick = (action, payload) => {
    if (action === 'navigate') {
      if (onNavigate) onNavigate(payload);
      if (payload === 'explore') {
        scrollToSection('projects-section');
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else if (action === 'scroll') {
      scrollToSection(payload);
    } else if (action === 'info') {
      setModalContent(payload);
      setShowEscrowModal(true);
    }
  };

  return (
    <footer style={{
      background: 'var(--bg-glass-heavy, #0f172a)',
      borderTop: '1px solid var(--border-subtle, rgba(255,255,255,0.08))',
      padding: '4rem 0 2rem 0',
      color: 'var(--text-muted, #94a3b8)'
    }}>
      <div className="container">
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '2.5rem',
          marginBottom: '3rem'
        }}>
          {/* Brand Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', cursor: 'pointer' }} onClick={() => handleLinkClick('navigate', 'explore')}>
              <img 
                src="/logo.jpg" 
                alt="WorkPulse Logo"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  objectFit: 'cover',
                  border: '1.5px solid var(--border-teal, #0ea5e9)'
                }}
              />
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary, #6366f1)' }}>
                WorkPulse
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1.25rem', color: 'var(--text-muted, #94a3b8)' }}>
              The premiere freelance marketplace connecting visionaries with top engineering, design, and AI talent worldwide.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {[
                { icon: Globe, link: 'https://workpulse-force.vercel.app', title: 'Website' },
                { icon: Share2, action: () => navigator.clipboard.writeText(window.location.href).then(() => alert('Link copied to clipboard!')), title: 'Share' },
                { icon: Send, link: 'mailto:support@workpulse.io', title: 'Telegram / Message' },
                { icon: Mail, link: 'mailto:support@workpulse.io', title: 'Email' }
              ].map((item, idx) => (
                <a 
                  key={idx} 
                  href={item.link || '#!'}
                  onClick={(e) => {
                    if (item.action) {
                      e.preventDefault();
                      item.action();
                    }
                  }}
                  title={item.title}
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--border-subtle, rgba(255,255,255,0.1))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'var(--primary, #6366f1)',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(99,102,241,0.2)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                >
                  <item.icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links: For Clients */}
          <div>
            <h4 style={{ color: 'var(--text-main, #ffffff)', fontWeight: 700, marginBottom: '1rem', fontSize: '1rem' }}>
              For Clients
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.875rem' }}>
              <li>
                <span 
                  style={{ cursor: 'pointer', transition: 'color 0.2s' }}
                  onClick={() => handleLinkClick('navigate', 'explore')}
                  onMouseEnter={(e) => e.target.style.color = 'var(--primary, #6366f1)'}
                  onMouseLeave={(e) => e.target.style.color = 'var(--text-muted, #94a3b8)'}
                >
                  Post a Job Brief
                </span>
              </li>
              <li>
                <span 
                  style={{ cursor: 'pointer', transition: 'color 0.2s' }}
                  onClick={() => handleLinkClick('navigate', 'freelancers')}
                  onMouseEnter={(e) => e.target.style.color = 'var(--primary, #6366f1)'}
                  onMouseLeave={(e) => e.target.style.color = 'var(--text-muted, #94a3b8)'}
                >
                  Browse Top Freelancers
                </span>
              </li>
              <li>
                <a 
                  href="mailto:support@workpulse.io?subject=Enterprise%20Solutions%20Inquiry"
                  style={{ color: 'inherit', textDecoration: 'none', cursor: 'pointer', transition: 'color 0.2s' }}
                  onMouseEnter={(e) => e.target.style.color = 'var(--primary, #6366f1)'}
                  onMouseLeave={(e) => e.target.style.color = 'var(--text-muted, #94a3b8)'}
                >
                  Enterprise Solutions
                </a>
              </li>
              <li>
                <span 
                  style={{ cursor: 'pointer', transition: 'color 0.2s' }}
                  onClick={() => handleLinkClick('info', {
                    title: 'WorkPulse Escrow Protection',
                    desc: 'Every contract is secured with 100% milestone escrow. Client deposits are held in a trusted holding account and only released when deliverables are reviewed and approved.'
                  })}
                  onMouseEnter={(e) => e.target.style.color = 'var(--primary, #6366f1)'}
                  onMouseLeave={(e) => e.target.style.color = 'var(--text-muted, #94a3b8)'}
                >
                  Escrow Payment Protection
                </span>
              </li>
            </ul>
          </div>

          {/* Quick Links: For Talent */}
          <div>
            <h4 style={{ color: 'var(--text-main, #ffffff)', fontWeight: 700, marginBottom: '1rem', fontSize: '1rem' }}>
              For Talent
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.875rem' }}>
              <li>
                <span 
                  style={{ cursor: 'pointer', transition: 'color 0.2s' }}
                  onClick={() => handleLinkClick('navigate', 'explore')}
                  onMouseEnter={(e) => e.target.style.color = 'var(--primary, #6366f1)'}
                  onMouseLeave={(e) => e.target.style.color = 'var(--text-muted, #94a3b8)'}
                >
                  Find Freelance Jobs
                </span>
              </li>
              <li>
                <span 
                  style={{ cursor: 'pointer', transition: 'color 0.2s' }}
                  onClick={() => handleLinkClick('navigate', 'signup')}
                  onMouseEnter={(e) => e.target.style.color = 'var(--primary, #6366f1)'}
                  onMouseLeave={(e) => e.target.style.color = 'var(--text-muted, #94a3b8)'}
                >
                  Create Freelancer Profile
                </span>
              </li>
              <li>
                <span 
                  style={{ cursor: 'pointer', transition: 'color 0.2s' }}
                  onClick={() => handleLinkClick('scroll', 'projects-section')}
                  onMouseEnter={(e) => e.target.style.color = 'var(--primary, #6366f1)'}
                  onMouseLeave={(e) => e.target.style.color = 'var(--text-muted, #94a3b8)'}
                >
                  Explore In-Demand Skills
                </span>
              </li>
              <li>
                <span 
                  style={{ cursor: 'pointer', transition: 'color 0.2s' }}
                  onClick={() => handleLinkClick('info', {
                    title: 'WorkPulse Community Guidelines',
                    desc: 'Join our global network of verified talent. Collaborate with leading enterprise clients, participate in community hackathons, and build cutting-edge software products.'
                  })}
                  onMouseEnter={(e) => e.target.style.color = 'var(--primary, #6366f1)'}
                  onMouseLeave={(e) => e.target.style.color = 'var(--text-muted, #94a3b8)'}
                >
                  Community & Guidelines
                </span>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 style={{ color: 'var(--text-main, #ffffff)', fontWeight: 700, marginBottom: '1rem', fontSize: '1rem' }}>
              Contact & Support
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
              <a 
                href="mailto:support@workpulse.io" 
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary, #6366f1)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted, #94a3b8)'}
              >
                <Mail size={16} color="var(--primary, #6366f1)" /> support@workpulse.io
              </a>
              <a 
                href="tel:+18005559675" 
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary, #6366f1)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted, #94a3b8)'}
              >
                <Phone size={16} color="#10b981" /> +1 (800) 555-WORKPULSE
              </a>
              <div style={{ fontSize: '0.78rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.25rem' }}>
                <CheckCircle2 size={13} /> 24/7 Global Support & Escrow Assistance
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          paddingTop: '1.75rem',
          borderTop: '1px solid var(--border-subtle, rgba(255,255,255,0.08))',
          fontSize: '0.825rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>© 2026 WorkPulse Marketplace. All rights reserved.</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <span 
              style={{ cursor: 'pointer', transition: 'color 0.2s' }}
              onClick={() => handleLinkClick('info', {
                title: 'Privacy Policy',
                desc: 'Your data privacy is our utmost priority. All personal and transaction data is encrypted with bank-level 256-bit SSL protocols.'
              })}
              onMouseEnter={(e) => e.target.style.color = '#fff'}
              onMouseLeave={(e) => e.target.style.color = 'inherit'}
            >
              Privacy Policy
            </span>
            <span 
              style={{ cursor: 'pointer', transition: 'color 0.2s' }}
              onClick={() => handleLinkClick('info', {
                title: 'Terms of Service',
                desc: 'By using WorkPulse, both clients and freelancers agree to fair milestone completion, dispute resolution protocols, and escrow fulfillment standards.'
              })}
              onMouseEnter={(e) => e.target.style.color = '#fff'}
              onMouseLeave={(e) => e.target.style.color = 'inherit'}
            >
              Terms of Service
            </span>
            <span 
              style={{ cursor: 'pointer', transition: 'color 0.2s' }}
              onClick={() => handleLinkClick('info', {
                title: 'Security & Escrow Guarantee',
                desc: 'WorkPulse partners with Razorpay and bank gateways to guarantee safe, verified payments worldwide.'
              })}
              onMouseEnter={(e) => e.target.style.color = '#fff'}
              onMouseLeave={(e) => e.target.style.color = 'inherit'}
            >
              Security
            </span>
          </div>
        </div>
      </div>

      {/* Informative Modal for Escrow, Terms, Privacy */}
      {showEscrowModal && modalContent && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            maxWidth: '480px',
            width: '100%',
            borderRadius: '20px',
            padding: '2rem',
            background: 'var(--bg-card, #111827)',
            border: '1px solid var(--border-medium, rgba(255,255,255,0.15))',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
            position: 'relative'
          }}>
            <button 
              onClick={() => setShowEscrowModal(false)}
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary, #6366f1)' }}>
                <Shield size={22} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                {modalContent.title}
              </h3>
            </div>

            <p style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.6, margin: 0 }}>
              {modalContent.desc}
            </p>

            <button
              onClick={() => setShowEscrowModal(false)}
              className="btn btn-primary"
              style={{ marginTop: '1.5rem', width: '100%', padding: '0.65rem', borderRadius: '12px', fontWeight: 700 }}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </footer>
  );
}