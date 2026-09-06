import React from 'react';
import { Globe, Share2, Send, Mail, Phone, Heart } from 'lucide-react';

export default function Footer({ onNavigate }) {
  return (
    <footer style={{
      background: 'var(--bg-glass-heavy)',
      borderTop: '1px solid var(--border-subtle)',
      padding: '4rem 0 2rem 0',
      color: 'var(--text-muted)'
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <img 
                src="/logo.jpg" 
                alt="WorkPulse Logo"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  objectFit: 'cover',
                  border: '1.5px solid var(--border-teal)'
                }}
              />
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary)' }}>
                WorkPulse
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1.25rem', color: 'var(--text-muted)' }}>
              The premiere freelance marketplace connecting visionaries with top engineering, design, and AI talent worldwide.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {[Globe, Share2, Send, Mail].map((Icon, idx) => (
                <div key={idx} style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}>
                  <Icon size={16} color="var(--primary)" />
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: 'var(--text-main)', fontWeight: 700, marginBottom: '1rem', fontSize: '1rem' }}>For Clients</h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
              <li style={{ cursor: 'pointer' }} onClick={() => onNavigate('explore')}>Post a Job Brief</li>
              <li style={{ cursor: 'pointer' }} onClick={() => onNavigate('freelancers')}>Browse Top Freelancers</li>
              <li style={{ cursor: 'pointer' }}>Enterprise Solutions</li>
              <li style={{ cursor: 'pointer' }}>Escrow Payment Protection</li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: 'var(--text-main)', fontWeight: 700, marginBottom: '1rem', fontSize: '1rem' }}>For Talent</h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
              <li style={{ cursor: 'pointer' }} onClick={() => onNavigate('explore')}>Find Freelance Jobs</li>
              <li style={{ cursor: 'pointer' }}>Create Freelancer Profile</li>
              <li style={{ cursor: 'pointer' }}>Skill Certifications</li>
              <li style={{ cursor: 'pointer' }}>Community & Forum</li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 style={{ color: 'var(--text-main)', fontWeight: 700, marginBottom: '1rem', fontSize: '1rem' }}>Contact & Support</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={16} color="var(--primary)" /> support@workpulse.io
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Phone size={16} color="var(--secondary)" /> +1 (800) 555-WORKPULSE
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.5rem' }}>
                
              </div>
            </div>
          </div>

        </div>

        <div style={{
          paddingTop: '1.75rem',
          borderTop: '1px solid var(--border-subtle)',
          textAlign: 'center',
          fontSize: '0.825rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}>
          <div>© 2026 WorkPulse Marketplace. All rights reserved.</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
           
          </div>
        </div>

      </div>
    </footer>
  );
}
