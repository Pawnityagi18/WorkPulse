import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, CheckCircle2, Lock, Users } from 'lucide-react';

export default function Hero({ onNavigate, currentUser }) {
  const isLoggedIn = Boolean(currentUser);

  return (
    <div style={{
      position: 'relative',
      padding: '4.5rem 0 4rem 0',
      background: 'linear-gradient(135deg, #E6F4F1 0%, #F0FAF8 50%, #FFFFFF 100%)',
      borderBottom: '1px solid var(--border-subtle, #E2E8F0)',
      overflow: 'hidden'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '3.5rem',
          alignItems: 'center'
        }}>
          
          {/* LEFT: CLEAN HEADLINE & CALL-TO-ACTIONS (NO SEARCH BAR) */}
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.4rem 1rem',
              borderRadius: '20px',
              background: '#FFFFFF',
              border: '1px solid var(--border-teal, #B2DFDB)',
              color: 'var(--primary, #008080)',
              fontSize: '0.825rem',
              fontWeight: 700,
              boxShadow: '0 2px 8px rgba(0, 128, 128, 0.05)',
              marginBottom: '1.25rem'
            }}>
              <Sparkles size={15} color="#F59E0B" fill="#F59E0B" /> 
              <span>WorkPulse Autonomous Marketplace • Zero-Paywall Hiring</span>
            </div>

            <h1 style={{
              fontSize: '3.1rem',
              lineHeight: 1.15,
              fontWeight: 900,
              color: 'var(--text-main, #0F172A)',
              marginBottom: '1.25rem',
              letterSpacing: '-0.02em'
            }}>
              Where Visionaries Meet{' '}
              <span style={{ color: 'var(--primary, #008080)' }}>
                World-Class Tech Talent
              </span>
            </h1>

            <p style={{
              fontSize: '1.1rem',
              color: 'var(--text-muted, #475569)',
              lineHeight: 1.65,
              marginBottom: '2rem',
              maxWidth: '520px'
            }}>
              An AI-first freelance platform connecting clients with verified React, Python, and AI engineers. Built with 100% milestone escrow and a flat 5% commission.
            </p>

            {/* CALL TO ACTION BUTTONS (FOR LOGGED-OUT VISITORS) */}
            {!isLoggedIn ? (
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => onNavigate('signup')}
                  className="btn btn-primary btn-lg"
                  style={{ borderRadius: 'var(--radius-full)', fontWeight: 800, padding: '0.85rem 2rem', boxShadow: '0 8px 25px rgba(0, 128, 128, 0.25)' }}
                >
                  Join WorkPulse Free <ArrowRight size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('login')}
                  className="btn btn-secondary btn-lg"
                  style={{ borderRadius: 'var(--radius-full)', fontWeight: 700, padding: '0.85rem 1.85rem' }}
                >
                  Log In to Workspace
                </button>
              </div>
            ) : (
              /* LOGGED IN WELCOME CTA */
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => onNavigate('dashboard')}
                  className="btn btn-primary btn-lg"
                  style={{ borderRadius: 'var(--radius-full)', fontWeight: 800, padding: '0.85rem 2rem' }}
                >
                  Go to My Workspace <ArrowRight size={18} />
                </button>
              </div>
            )}

            {/* Feature Badges */}
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '2.5rem', flexWrap: 'wrap', fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={16} color="#008080" /> Flat 5% Platform Fee
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={16} color="#008080" /> 100% Milestone Escrow
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={16} color="#008080" /> Gemini 3.6 Flash AI Scoping
              </div>
            </div>
          </div>

          {/* RIGHT: CLEAN ENTERPRISE GUARANTEE CARD (NO BUBBLES, NO STOCK PHOTOS) */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{
              width: '100%',
              maxWidth: '390px',
              background: '#FFFFFF',
              border: '1.5px solid rgba(0, 128, 128, 0.15)',
              borderRadius: '24px',
              padding: '2rem',
              boxShadow: '0 20px 45px rgba(0, 128, 128, 0.08)'
            }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.75rem',
                fontWeight: 800,
                color: '#008080',
                background: '#E6F4F1',
                padding: '4px 12px',
                borderRadius: '16px',
                marginBottom: '1.25rem'
              }}>
                <ShieldCheck size={14} /> Trust & Security Guarantee
              </div>

              <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0F172A', marginBottom: '0.5rem', lineHeight: 1.3 }}>
                Fair & Protected Milestone Contracts
              </h3>

              <p style={{ fontSize: '0.875rem', color: '#64748B', lineHeight: 1.55, marginBottom: '1.5rem' }}>
                Client funds are held in secure escrow. Freelancers start work with guaranteed payment; clients release funds only upon final deliverable review.
              </p>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0.9rem 1.1rem',
                background: '#F8FAFC',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                marginBottom: '1.25rem'
              }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>Commission</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#008080' }}>5% Flat</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>Connect Fees</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#059669' }}>$0 (Free Bids)</div>
                </div>
              </div>

              <div style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem', justifyContent: 'center' }}>
                <Lock size={13} /> 256-Bit SSL Encrypted Escrow Transactions
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}