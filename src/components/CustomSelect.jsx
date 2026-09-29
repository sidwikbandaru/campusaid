import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

/**
 * CustomSelect - Sleek, glitch-free dark dropdown component.
 * Replaces native HTML <select> to completely prevent Windows/Chromium white box popup glitches.
 * 
 * @param {object} props
 * @param {string} [props.id]
 * @param {string} props.value - Currently selected value
 * @param {Function} props.onChange - (val) => void
 * @param {Array<{value: string, label: string}> | Array<string>} props.options
 * @param {string} [props.placeholder]
 * @param {boolean} [props.disabled]
 * @param {object} [props.style]
 */
export default function CustomSelect({
  id,
  value,
  onChange,
  options = [],
  placeholder = 'Select an option...',
  disabled = false,
  style = {}
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Normalize options into { value, label } format
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === 'object' && opt !== null) {
      return { value: opt.value, label: opt.label || opt.value };
    }
    return { value: opt, label: opt };
  });

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      id={id ? `${id}-container` : undefined}
      style={{
        position: 'relative',
        width: '100%',
        userSelect: 'none',
        zIndex: isOpen ? 1000 : 'auto',
        ...style
      }}
    >
      {/* Trigger Button */}
      <button
        type="button"
        id={id}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-input)',
          border: isOpen ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          color: selectedOption ? 'var(--text-primary)' : 'var(--text-muted)',
          padding: '0.62rem 0.95rem',
          fontSize: '0.9rem',
          fontFamily: 'inherit',
          cursor: disabled ? 'not-allowed' : 'pointer',
          outline: 'none',
          boxShadow: isOpen ? '0 0 0 3px rgba(99, 102, 241, 0.25)' : 'none',
          transition: 'all 0.15s ease',
          opacity: disabled ? 0.6 : 1,
          textAlign: 'left'
        }}
      >
        <span style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          paddingRight: '0.5rem',
          fontWeight: 500
        }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={16}
          style={{
            flexShrink: 0,
            color: isOpen ? 'var(--accent-primary)' : 'var(--text-muted)',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        />
      </button>

      {/* Dropdown Menu Popup (100% styled dark glassmorphism, no native OS popup) */}
      {isOpen && (
        <ul
          role="listbox"
          style={{
            position: 'absolute',
            top: 'calc(100% + 5px)',
            left: 0,
            right: 0,
            zIndex: 9999,
            background: 'rgba(15, 23, 42, 0.98)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: 'var(--radius-sm)',
            boxShadow: '0 16px 36px -4px rgba(0, 0, 0, 0.75), 0 0 20px rgba(99, 102, 241, 0.15)',
            maxHeight: '260px',
            overflowY: 'auto',
            padding: '0.35rem',
            margin: 0,
            listStyle: 'none'
          }}
        >
          {normalizedOptions.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <li
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(opt.value)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.55rem 0.85rem',
                  fontSize: '0.88rem',
                  color: isSelected ? '#FFFFFF' : 'var(--text-secondary)',
                  background: isSelected
                    ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(79, 70, 229, 0.3) 100%)'
                    : 'transparent',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: isSelected ? 600 : 400,
                  transition: 'all 0.12s ease',
                  marginBottom: '2px'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {opt.label}
                </span>
                {isSelected && (
                  <Check size={14} color="#818CF8" style={{ flexShrink: 0, marginLeft: '0.5rem' }} />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
