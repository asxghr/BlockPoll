import React from 'react';

/**
 * TransactionFeedbackPanel - Educational feedback banner that explains
 * the local simulated action and corresponding smart contract behavior.
 */
export default function TransactionFeedbackPanel({ feedback, onDismiss }) {
  if (!feedback) return null;

  const { type = 'info', title, message, details } = feedback;

  const borderColors = {
    success: 'var(--color-chartreuse)',
    error: 'var(--color-vermilion)',
    info: 'var(--color-cobalt)',
    warning: '#D4A017'
  };

  const bgColors = {
    success: '#F3FCE7',
    error: '#FFF0ED',
    info: '#EDF2FE',
    warning: '#FFFDF5'
  };

  return (
    <div
      className="paper-card"
      style={{
        backgroundColor: bgColors[type] || bgColors.info,
        borderLeft: `6px solid ${borderColors[type] || borderColors.info}`,
        marginBottom: '1.5rem',
        padding: '1rem 1.25rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '1rem'
      }}
      role="status"
      aria-live="polite"
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <span
            className="mono-tag"
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase'
            }}
          >
            [SYSTEM FEEDBACK: {type.toUpperCase()}]
          </span>
          <h4 style={{ fontSize: '1rem', margin: 0 }}>{title}</h4>
        </div>
        <p style={{ fontSize: '0.875rem', color: '#2C2A29', margin: '0.25rem 0' }}>
          {message}
        </p>
        {details && (
          <p className="mono-label" style={{ fontSize: '0.75rem', color: 'var(--color-ink-muted)', marginTop: '0.25rem' }}>
            {details}
          </p>
        )}
      </div>

      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          style={{
            background: 'none',
            border: 'none',
            fontFamily: 'var(--font-mono)',
            fontSize: '1rem',
            cursor: 'pointer',
            padding: '0.2rem 0.4rem'
          }}
          aria-label="Dismiss message"
        >
          ✕
        </button>
      )}
    </div>
  );
}
