import React from 'react';

/**
 * StatusBadge - Editorial ink-stamped indicator
 * Variants: not-started, ongoing, ended, verified, admin, guest, neutral
 */
export default function StatusBadge({ variant = 'neutral', children, className = '' }) {
  const variantClass = {
    'not-started': 'not-started',
    'ongoing': 'ongoing',
    'ended': 'ended',
    'verified': 'verified',
    'admin': 'admin',
    'guest': 'not-started',
    'neutral': ''
  }[variant] || '';

  return (
    <span className={`status-badge ${variantClass} ${className}`}>
      {children}
    </span>
  );
}
