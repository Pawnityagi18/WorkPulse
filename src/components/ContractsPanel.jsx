import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Shield, 
  CheckCircle2, 
  Clock, 
  Send, 
  FileText, 
  ChevronRight, 
  X, 
  Lock, 
  CreditCard, 
  Sparkles, 
  AlertCircle, 
  ArrowRight 
} from 'lucide-react';
import { 
  apiFundMilestone, 
  apiVerifyPayment, 
  apiCancelMilestoneCheckout, 
  apiSubmitMilestone, 
  apiReleaseMilestone, 
  apiGetPayoutStatus, 
  apiStartPayoutOnboarding 
} from '../api/client';

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function ContractsPanel({ contracts = [], currentUser, onRefresh, onOpenChat }) {
  const [loadingId, setLoadingId] = useState(null);
  const [submitNotes, setSubmitNotes] = useState({});
  const [errorMsg, setErrorMsg] = useState('');
  const [payoutStatus, setPayoutStatus] = useState(null);
  const [showOnboardingForm, setShowOnboardingForm] = useState(false);
  const [checkoutModal, setCheckoutModal] = useState(null); // { contract, milestone }

  const [onboardingData, setOnboardingData] = useState({
    name: currentUser?.name || '', 
    email: currentUser?.email || '', 
    phone: '',
    businessName: '', 
    accountNumber: '', 
    ifscCode: '', 
    beneficiaryName: currentUser?.name || ''
  });
  const [onboardingSubmitting, setOnboardingSubmitting] = useState(false);

  useEffect(() => {
    if (currentUser?.role === 'freelancer') {
      apiGetPayoutStatus().then(setPayoutStatus).catch(() => {});
    }
  }, [currentUser]);

  const handleOnboardingSubmit = async (e) => {
    e.preventDefault();
    setOnboardingSubmitting(true);
    setErrorMsg('');
    try {
      await apiStartPayoutOnboarding(onboardingData);
      setShowOnboardingForm(false);
      const status = await apiGetPayoutStatus();
      setPayoutStatus(status);
    } catch (err) {
      setErrorMsg(err.message || 'Could not set up payouts');
    } finally {
      setOnboardingSubmitting(false);
    }
  };

  const handleFund = async (contractId, milestoneId) => {
    try {
      setLoadingId(milestoneId);
      setErrorMsg('');
      setCheckoutModal(null); // Close preview modal

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setErrorMsg('Could not load Razorpay Checkout. Check your internet connection.');
        setLoadingId(null);
        return;
      }

      const order = await apiFundMilestone(contractId, milestoneId);
      let checkoutCompleted = false;

      const cancelCheckout = async () => {
        if (checkoutCompleted) return;
        try {
          await apiCancelMilestoneCheckout(contractId, milestoneId, order.orderId);
          await onRefresh();
        } catch (err) {
          setErrorMsg(err.message || 'Checkout was closed.');
        } finally {
          setLoadingId(null);
        }
      };

      const razorpayOptions = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency || 'INR',
        order_id: order.orderId,
        name: 'WorkPulse Escrow',
        description: 'Milestone Escrow Deposit (100% Protected)',
        theme: { color: '#6366f1' },
        handler: async (response) => {
          checkoutCompleted = true;
          try {
            const verifyResult = await apiVerifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            if (verifyResult.funded) {
              onRefresh();
            } else {
              setErrorMsg('Payment processed. Refresh in a moment to see updated status.');
            }
          } catch (err) {
            setErrorMsg(err.message || 'Payment verification failed');
          } finally {
            setLoadingId(null);
          }
        },
        modal: {
          ondismiss: cancelCheckout
        },
        retry: { enabled: false }
      };

      const rzp = new window.Razorpay(razorpayOptions);
      rzp.on('payment.failed', cancelCheckout);
      rzp.open();
    } catch (err) {
      setErrorMsg(err.message || 'Funding failed');
      setLoadingId(null);
    }
  };

  const handleSubmit = async (contractId, milestoneId) => {
    try {
      setLoadingId(milestoneId);
      setErrorMsg('');
      const notes = submitNotes[milestoneId] || 'Completed deliverable attached for review.';
      await apiSubmitMilestone(contractId, milestoneId, notes);
      onRefresh();
    } catch (err) {
      setErrorMsg(err.message || 'Submission failed');
    } finally {
      setLoadingId(null);
    }
  };

  const handleRelease = async (contractId, milestoneId) => {
    try {
      setLoadingId(milestoneId);
      setErrorMsg('');
      await apiReleaseMilestone(contractId, milestoneId);
      onRefresh();
    } catch (err) {
      setErrorMsg(err.message || 'Payment release failed');
    } finally {
      setLoadingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'funded':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '4px 10px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', fontSize: '0.75rem', fontWeight: 700, borderRadius: '20px', border: '1px solid rgba(52, 211, 153, 0.3)' }}>
            <Shield size={13} /> Funded in Escrow
          </span>
        );
      case 'submitted':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '4px 10px', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', fontSize: '0.75rem', fontWeight: 700, borderRadius: '20px', border: '1px solid rgba(251, 191, 36, 0.3)' }}>
            <Clock size={13} /> Work Submitted
          </span>
        );
      case 'released':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '4px 10px', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', fontSize: '0.75rem', fontWeight: 700, borderRadius: '20px', border: '1px solid rgba(96, 165, 250, 0.3)' }}>
            <CheckCircle2 size={13} /> Payment Released
          </span>
        );
      default:
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '4px 10px', background: 'rgba(255, 255, 255, 0.08)', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700, borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <Clock size={13} /> Pending Deposit
          </span>
        );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* 1. TOP ESCROW PROTECTION GUARANTEE BANNER */}
      <div style={{
        padding: '1.25rem 1.5rem',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(99, 102, 241, 0.08) 100%)',
        border: '1px solid rgba(16, 185, 129, 0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'rgba(16, 185, 129, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#10b981'
          }}>
            <Shield size={24} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.2rem' }}>
              WorkPulse 100% Escrow Protection
            </h4>
            <p style={{ fontSize: '0.825rem', color: '#94a3b8', margin: 0 }}>
              Funds are held securely by WorkPulse Escrow. Money is only transferred to the freelancer when the client reviews and approves the deliverable.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#34d399', fontWeight: 600, background: 'rgba(16, 185, 129, 0.1)', padding: '6px 12px', borderRadius: '20px' }}>
          <Lock size={13} /> 256-Bit SSL Encrypted
        </div>
      </div>

      {/* Freelancer Payout Alert */}
      {currentUser?.role === 'freelancer' && payoutStatus && !payoutStatus.onboardingComplete && (
        <div style={{
          padding: '1rem 1.25rem',
          borderRadius: '14px',
          background: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Shield size={20} color="#f59e0b" />
            <div style={{ fontSize: '0.85rem', color: '#fef3c7' }}>
              <strong>Set up Payouts:</strong> Add your test bank details so released funds can be credited to your account.
            </div>
          </div>
          <button
            onClick={() => setShowOnboardingForm(true)}
            className="btn btn-sm"
            style={{ background: '#f59e0b', color: '#000', fontWeight: 700, borderRadius: '8px', padding: '6px 14px' }}
          >
            Add Bank Info
          </button>
        </div>
      )}

      {/* Error Message */}
      {errorMsg && (
        <div style={{ padding: '0.85rem 1.25rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', color: '#fca5a5', fontSize: '0.85rem' }}>
          {errorMsg}
        </div>
      )}

      {/* 2. NO CONTRACTS EMPTY STATE */}
      {(!contracts || contracts.length === 0) ? (
        <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center', borderRadius: '20px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--primary)' }}>
            <Shield size={32} />
          </div>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.5rem' }}>
            No Active Contracts Yet
          </h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '460px', margin: '0 auto 1.5rem', fontSize: '0.925rem' }}>
            {currentUser?.role === 'client'
              ? 'When you accept a freelancer proposal on your posted job, an active escrow contract will appear here.'
              : 'Once a client hires you and accepts your proposal, your milestone contract will be created here.'}
          </p>
        </div>
      ) : (
        /* 3. CONTRACTS LIST */
        contracts.map((contract) => {
          const otherParty = currentUser?.role === 'client' ? contract.freelancer : contract.client;

          return (
            <div key={contract._id} className="glass-card" style={{ borderRadius: '20px', overflow: 'hidden', border: '1px solid var(--border-medium)' }}>
              
              {/* Contract Top Header */}
              <div style={{
                padding: '1.75rem',
                background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1.25rem'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.4rem' }}>
                    <span style={{ padding: '2px 8px', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', fontSize: '0.72rem', fontWeight: 800, borderRadius: '6px', textTransform: 'uppercase' }}>
                      {contract.status || 'Active'} Contract
                    </span>
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                      REF: #{contract._id.slice(-6)}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.35rem' }}>
                    {contract.title}
                  </h3>

                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {currentUser?.role === 'client' ? 'Assigned Freelancer: ' : 'Hiring Client: '}
                    <strong style={{ color: '#FFFFFF' }}>{otherParty?.name || 'User'}</strong>
                    {otherParty?.email && <span style={{ color: 'var(--text-dim)' }}> ({otherParty.email})</span>}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Total Value</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#10b981', fontFamily: 'var(--font-heading)' }}>
                      ₹{contract.totalAmount?.toLocaleString()}
                    </div>
                  </div>

                  {onOpenChat && (
                    <button
                      onClick={() => onOpenChat(contract)}
                      className="btn btn-primary btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: '10px', padding: '0.5rem 1rem' }}
                    >
                      <Send size={14} /> Workroom Chat
                    </button>
                  )}
                </div>
              </div>

              {/* Milestones Container */}
              <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <FileText size={16} color="var(--primary)" /> Milestone Deliverables & Escrow
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    {contract.milestones?.length || 0} Milestone(s)
                  </span>
                </div>

                {contract.milestones && contract.milestones.map((m, idx) => (
                  <div 
                    key={m._id} 
                    style={{
                      padding: '1.35rem',
                      borderRadius: '16px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                          <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.2)', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {idx + 1}
                          </span>
                          <h5 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
                            {m.title}
                          </h5>
                          {getStatusBadge(m.status)}
                        </div>

                        <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#10b981', marginLeft: '1.9rem' }}>
                          ₹{m.amount?.toLocaleString()}
                        </div>
                      </div>

                      {/* ACTIONS */}
                      <div>
                        {/* CLIENT: Fund Milestone */}
                        {currentUser?.role === 'client' && m.status === 'pending' && (
                          <button
                            onClick={() => setCheckoutModal({ contract, milestone: m })}
                            disabled={loadingId === m._id}
                            className="btn btn-primary"
                            style={{
                              padding: '0.55rem 1.25rem',
                              borderRadius: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              fontWeight: 700,
                              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)'
                            }}
                          >
                            <Lock size={15} /> Fund in Escrow (₹{m.amount?.toLocaleString()})
                          </button>
                        )}

                        {/* CLIENT: Approve & Release */}
                        {currentUser?.role === 'client' && m.status === 'submitted' && (
                          <button
                            onClick={() => handleRelease(contract._id, m._id)}
                            disabled={loadingId === m._id}
                            className="btn btn-primary"
                            style={{
                              padding: '0.55rem 1.25rem',
                              borderRadius: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              fontWeight: 700,
                              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                            }}
                          >
                            <CheckCircle2 size={16} /> Approve & Release Payment
                          </button>
                        )}

                        {/* FREELANCER: Submit Work */}
                        {currentUser?.role === 'freelancer' && m.status === 'funded' && (
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <input
                              type="text"
                              placeholder="Submission link or notes (e.g. GitHub/Drive link)..."
                              value={submitNotes[m._id] || ''}
                              onChange={(e) => setSubmitNotes({ ...submitNotes, [m._id]: e.target.value })}
                              style={{
                                padding: '0.5rem 0.85rem',
                                borderRadius: '10px',
                                border: '1px solid var(--border-medium)',
                                background: 'rgba(0,0,0,0.3)',
                                color: '#FFF',
                                fontSize: '0.825rem',
                                minWidth: '220px'
                              }}
                            />
                            <button
                              onClick={() => handleSubmit(contract._id, m._id)}
                              disabled={loadingId === m._id}
                              className="btn btn-sm"
                              style={{ background: '#f59e0b', color: '#000', fontWeight: 700, borderRadius: '10px', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                            >
                              <Send size={14} /> Submit Work
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Submission Note display */}
                    {m.submissionNotes && (
                      <div style={{ padding: '0.75rem 1rem', background: 'rgba(0,0,0,0.25)', borderRadius: '10px', border: '1px solid var(--border-subtle)', fontSize: '0.825rem', color: '#cbd5e1' }}>
                        <strong style={{ color: '#38bdf8' }}>Freelancer Submission:</strong> {m.submissionNotes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}

      {/* 4. MODERN ESCROW CHECKOUT SUMMARY MODAL (BEFORE RAZORPAY) */}
      {checkoutModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1rem'
        }}>
          <div className="glass-card" style={{
            maxWidth: '480px',
            width: '100%',
            borderRadius: '24px',
            padding: '2rem',
            background: 'var(--bg-card, #111827)',
            border: '1px solid var(--border-medium)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
            position: 'relative'
          }}>
            {/* Close Button */}
            <button 
              onClick={() => setCheckoutModal(null)}
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                <Shield size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>Secure Escrow Deposit</h3>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Powered by Razorpay (Test Mode)</span>
              </div>
            </div>

            {/* Project / Milestone Details Box */}
            <div style={{ padding: '1rem', borderRadius: '14px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-subtle)', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Milestone Item</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFFFFF', marginTop: '0.2rem' }}>
                {checkoutModal.milestone.title}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Project: {checkoutModal.contract.title}
              </div>
            </div>

            {/* Transparent Cost Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
                <span>Milestone Amount</span>
                <span style={{ fontWeight: 700, color: '#FFFFFF' }}>₹{checkoutModal.milestone.amount?.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
                <span>Escrow Protection Fee</span>
                <span style={{ color: '#10b981', fontWeight: 600 }}>FREE (0%)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
                <span>Payment Gateway Charges</span>
                <span style={{ color: '#10b981', fontWeight: 600 }}>Waived</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 800, color: '#FFFFFF', paddingTop: '0.5rem', borderTop: '1px dashed var(--border-subtle)' }}>
                <span>Total Payable Now</span>
                <span style={{ color: '#10b981' }}>₹{checkoutModal.milestone.amount?.toLocaleString()}</span>
              </div>
            </div>

            {/* Escrow Guarantee Text */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.78rem', color: '#94a3b8', background: 'rgba(16, 185, 129, 0.08)', padding: '0.75rem', borderRadius: '10px', marginBottom: '1.5rem' }}>
              <Lock size={15} color="#10b981" style={{ flexShrink: 0 }} />
              <span>Your funds remain safely locked in escrow until you verify and approve the final work.</span>
            </div>

            {/* CTA Button */}
            <button
              onClick={() => handleFund(checkoutModal.contract._id, checkoutModal.milestone._id)}
              disabled={loadingId === checkoutModal.milestone._id}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '0.85rem',
                borderRadius: '14px',
                fontSize: '0.95rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                boxShadow: '0 8px 20px rgba(16, 185, 129, 0.35)'
              }}
            >
              <CreditCard size={18} />
              {loadingId === checkoutModal.milestone._id ? 'Opening Razorpay…' : `Pay ₹${checkoutModal.milestone.amount?.toLocaleString()} via Razorpay`}
            </button>
          </div>
        </div>
      )}

      {/* 5. PAYOUT ONBOARDING MODAL */}
      {showOnboardingForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div className="glass-card" style={{ maxWidth: '440px', width: '100%', padding: '2rem', borderRadius: '20px', background: 'var(--bg-card, #111827)', border: '1px solid var(--border-medium)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFF' }}>Setup Freelancer Payouts</h3>
              <button onClick={() => setShowOnboardingForm(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Razorpay Test Mode: Add test bank details to receive payments when client releases milestones.
            </p>

            <form onSubmit={handleOnboardingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <input required placeholder="Full Name" value={onboardingData.name} onChange={e => setOnboardingData({ ...onboardingData, name: e.target.value })} className="form-input" style={{ fontSize: '0.85rem' }} />
              <input required type="email" placeholder="Email" value={onboardingData.email} onChange={e => setOnboardingData({ ...onboardingData, email: e.target.value })} className="form-input" style={{ fontSize: '0.85rem' }} />
              <input required placeholder="Phone Number (10 digits)" value={onboardingData.phone} onChange={e => setOnboardingData({ ...onboardingData, phone: e.target.value })} className="form-input" style={{ fontSize: '0.85rem' }} />
              <input required placeholder="Bank Account Number" value={onboardingData.accountNumber} onChange={e => setOnboardingData({ ...onboardingData, accountNumber: e.target.value })} className="form-input" style={{ fontSize: '0.85rem' }} />
              <input required placeholder="IFSC Code (e.g. HDFC0001234)" value={onboardingData.ifscCode} onChange={e => setOnboardingData({ ...onboardingData, ifscCode: e.target.value.toUpperCase() })} className="form-input" style={{ fontSize: '0.85rem' }} />
              <button type="submit" disabled={onboardingSubmitting} className="btn btn-primary" style={{ marginTop: '0.5rem', width: '100%', padding: '0.75rem', borderRadius: '12px', fontWeight: 700 }}>
                {onboardingSubmitting ? 'Saving...' : 'Save Bank Details'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}