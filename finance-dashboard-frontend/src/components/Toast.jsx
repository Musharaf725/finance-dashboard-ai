import { useEffect } from 'react';

const Toast = ({ message, type = 'success', onDismiss, duration = 3000 }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onDismiss]);

  if (!message) return null;

  const bgColor = type === 'success' ? '#EAF3DE' : '#FFF0EA';
  const borderColor = type === 'success' ? '#CFE2AE' : '#F3C5B5';
  const textColor = type === 'success' ? '#3B6D11' : '#993C1D';
  const iconColor = type === 'success' ? '#639922' : '#D85A30';

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        background: bgColor,
        border: `1px solid ${borderColor}`,
        borderRadius: 12,
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        zIndex: 100,
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
        animation: 'slideUp 0.3s ease both',
        fontFamily: 'DM Sans, sans-serif',
        fontSize: 13,
        color: textColor,
        fontWeight: 500,
        maxWidth: 'min(320px, calc(100% - 48px))',
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {type === 'success' ? (
          <path d="M20 6L9 17l-5-5" />
        ) : (
          <>
            <path d="M12 3l9 16H3l9-16z" />
            <path d="M12 9v5" />
            <path d="M12 17h.01" />
          </>
        )}
      </svg>
      <span>{message}</span>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(120px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Toast;
