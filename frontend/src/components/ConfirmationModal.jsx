import React, { useEffect, useRef } from 'react';

/**
 * ConfirmationModal - Accessible modal dialog for casting a vote.
 * Complies with WAI-ARIA modal dialog best practices (ESC key to dismiss, focus management).
 */
export default function ConfirmationModal({
  isOpen,
  candidate = null,
  voterAddress = null,
  title = 'Confirm Ballot Submission',
  description = 'You are about to cast your official ballot for the candidate below. Once submitted, your choice is permanently recorded and cannot be altered or re-cast.',
  badgeText = 'OFFICIAL BALLOT CONFIRMATION',
  confirmText = 'Yes, Cast Vote',
  isDanger = false,
  onConfirm,
  onClose,
  isProcessing = false
}) {
  const confirmBtnRef = useRef(null);
  const cancelBtnRef = useRef(null);

  // Keyboard accessibility: ESC to close, focus trap
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
      if (e.key === 'Tab') {
        // Focus trap between cancel and confirm buttons
        if (e.shiftKey && document.activeElement === cancelBtnRef.current) {
          e.preventDefault();
          confirmBtnRef.current?.focus();
        } else if (!e.shiftKey && document.activeElement === confirmBtnRef.current) {
          e.preventDefault();
          cancelBtnRef.current?.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    // Focus the primary action on open
    setTimeout(() => {
      confirmBtnRef.current?.focus();
    }, 50);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isProcessing) onClose();
      }}
      role="presentation"
    >
      <div
        className="modal-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-desc"
        style={{
          borderLeft: isDanger ? '6px solid var(--color-vermilion)' : 'var(--border-width) solid var(--color-border)'
        }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <span
            className="mono-tag"
            style={{
              fontSize: '0.75rem',
              backgroundColor: isDanger ? '#FFF0ED' : 'var(--color-panel)',
              color: isDanger ? 'var(--color-vermilion)' : 'inherit',
              padding: '0.2rem 0.6rem',
              border: '1.5px solid var(--color-border)',
              borderRadius: '2px',
              fontWeight: 700
            }}
          >
            {badgeText}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            disabled={isProcessing}
            style={{
              background: 'none',
              border: 'none',
              fontFamily: 'var(--font-mono)',
              fontSize: '1.25rem',
              fontWeight: 700,
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              color: 'var(--color-ink)',
              padding: '0.2rem 0.5rem'
            }}
          >
            ✕
          </button>
        </div>

        <h2 id="modal-title" style={{ fontSize: '1.6rem', marginBottom: '0.75rem' }}>
          {title}
        </h2>

        <p id="modal-desc" style={{ fontSize: '0.9375rem', color: '#3A3835', marginBottom: '1.5rem' }}>
          {description}
        </p>

        {/* Selected Candidate Summary Box (if voting) */}
        {candidate && (
          <div
            className="paper-panel"
            style={{
              borderLeft: `5px solid ${candidate.accentColor || '#3156D3'}`,
              marginBottom: '1.25rem'
            }}
          >
            <div className="mono-label" style={{ fontSize: '0.75rem', color: 'var(--color-ink-muted)', marginBottom: '0.25rem' }}>
              OFFICIAL BALLOT // CANDIDATE #{candidate.id}
            </div>
            <div style={{ fontSize: '1.25rem', fontFamily: 'var(--font-serif)', fontWeight: 700 }}>
              {candidate.name}
            </div>
            {candidate.department && (
              <div className="mono-tag" style={{ fontSize: '0.8125rem', marginTop: '0.2rem' }}>
                {candidate.department}
              </div>
            )}

            {voterAddress && (
              <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--color-border)' }}>
                <span className="mono-label" style={{ fontSize: '0.725rem', color: 'var(--color-ink-muted)' }}>
                  OFFICIAL VOTER WALLET ADDRESS:
                </span>
                <div className="mono-tag" style={{ fontSize: '0.8125rem', marginTop: '0.2rem', wordBreak: 'break-all', fontWeight: 600 }}>
                  {voterAddress}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Danger Warning Box (if ending election) */}
        {isDanger && (
          <div
            style={{
              backgroundColor: '#FFF0ED',
              border: '1.5px solid var(--color-vermilion)',
              borderRadius: '4px',
              padding: '0.85rem',
              fontSize: '0.8125rem',
              marginBottom: '1.5rem',
              color: '#4A1408'
            }}
          >
            <strong>Warning:</strong> Ending the election is an irreversible on-chain state transition (State: 2). All voting will immediately cease and the results will become final.
          </div>
        )}

        {/* Notice on Prototype Rules if voting */}
        {!isDanger && candidate && (
          <div
            style={{
              backgroundColor: '#FFF8E7',
              border: '1.5px solid #D4A017',
              borderRadius: '4px',
              padding: '0.75rem',
              fontSize: '0.8125rem',
              marginBottom: '1.5rem',
              color: '#5C4400'
            }}
          >
            <strong>Notice:</strong> One-vote rule enforced. This action marks your wallet as voted in on-chain storage.
          </div>
        )}

        {/* Modal Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button
            type="button"
            ref={cancelBtnRef}
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button
            type="button"
            ref={confirmBtnRef}
            className={isDanger ? 'btn btn-primary' : 'btn btn-primary'}
            style={isDanger ? { backgroundColor: 'var(--color-vermilion)', borderColor: '#1C1B1A' } : {}}
            onClick={onConfirm}
            disabled={isProcessing}
          >
            {isProcessing ? 'Confirming in Wallet...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
