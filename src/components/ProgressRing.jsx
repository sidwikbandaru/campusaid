import React from 'react';

/**
 * Reusable Circular Progress Ring Component
 * @param {object} props
 * @param {number} props.percentage - 0 to 100
 * @param {string} props.color - CSS color string for stroke
 * @param {string} props.label - Title label below the ring
 * @param {string} props.sublabel - Optional helper text
 * @param {number} [props.size=110] - Diameter in px
 * @param {number} [props.strokeWidth=9] - Thickness of stroke
 */
export default function ProgressRing({
  percentage = 0,
  color = '#6366F1',
  label = '',
  sublabel = '',
  size = 110,
  strokeWidth = 9
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="progress-ring-container">
      <div className="progress-ring" style={{ width: size, height: size }}>
        <svg width={size} height={size}>
          {/* Background circle */}
          <circle
            className="progress-ring-bg"
            strokeWidth={strokeWidth}
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          {/* Animated progress circle */}
          <circle
            className="progress-ring-circle"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
            style={{
              filter: `drop-shadow(0 0 6px ${color}66)`
            }}
          />
        </svg>

        <div className="progress-ring-text">
          <span className="progress-ring-value">{Math.round(percentage)}%</span>
        </div>
      </div>

      {label && (
        <span style={{ marginTop: '0.65rem', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          {label}
        </span>
      )}
      {sublabel && (
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          {sublabel}
        </span>
      )}
    </div>
  );
}
