import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ActionMenuItem } from '../types/grid';
import { IGridThemeTokens } from '../theme/IGridTheme';
import { MaterialIcon } from '../ui/MaterialIcon';

export interface ActionDropdownOverlayProps {
  x: number;
  y: number;
  width: number;
  height: number;
  align?: 'left' | 'right';
  items: ActionMenuItem[];
  row: any;
  rowIndex: number;
  theme: IGridThemeTokens;
  onClose: () => void;
}

export const ActionDropdownOverlay: React.FC<ActionDropdownOverlayProps> = ({
  x,
  y,
  width,
  height,
  align = 'right',
  items,
  row,
  rowIndex,
  theme,
  onClose,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('mousedown', handleOutside, true);
    window.addEventListener('touchstart', handleOutside, true);
    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('scroll', onClose, true);
    window.addEventListener('resize', onClose);

    return () => {
      window.removeEventListener('mousedown', handleOutside, true);
      window.removeEventListener('touchstart', handleOutside, true);
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('scroll', onClose, true);
      window.removeEventListener('resize', onClose);
    };
  }, [onClose]);

  if (!items || items.length === 0) return null;

  // Calculate coordinates
  const menuWidth = 210;
  const menuHeightApprox = items.length * 36 + 16;
  const viewportW = typeof window !== 'undefined' ? window.innerWidth : 1000;
  const viewportH = typeof window !== 'undefined' ? window.innerHeight : 1000;

  // Horizontal position
  let left = align === 'right' ? x + width - menuWidth : x;
  if (left + menuWidth > viewportW - 8) {
    left = viewportW - menuWidth - 8;
  }
  if (left < 8) {
    left = 8;
  }

  // Vertical position
  let top = y + height + 4;
  if (top + menuHeightApprox > viewportH - 8) {
    top = Math.max(8, y - menuHeightApprox - 4);
  }

  const bg = theme.dom?.popoverBg || theme.canvas?.bg || '#ffffff';
  const border = theme.dom?.popoverBorder || theme.canvas?.gridLine || '#e2e8f0';
  const textColor = theme.dom?.popoverText || theme.canvas?.cellText || '#0f172a';
  const hoverBg = theme.dom?.buttonHoverBg || 'rgba(0, 0, 0, 0.05)';

  return createPortal(
    <div
      ref={menuRef}
      role="menu"
      style={{
        position: 'fixed',
        left,
        top,
        minWidth: menuWidth,
        maxWidth: 320,
        background: bg,
        color: textColor,
        borderRadius: 10,
        boxShadow: theme.dom?.popoverShadow || '0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.15)',
        border: `1px solid ${border}`,
        padding: '6px 0',
        zIndex: 999999,
        fontFamily: theme.fontFamily || 'Inter, -apple-system, sans-serif',
        fontSize: 13,
        userSelect: 'none',
        animation: 'sheetglFadeIn 120ms ease-out',
      }}
    >
      <style>{`
        @keyframes sheetglFadeIn {
          from { opacity: 0; transform: scale(0.96) translateY(-4px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
      {items.map((item, idx) => {
        if (item.divider) {
          return (
            <div
              key={`div-${idx}`}
              style={{
                height: 1,
                background: border,
                margin: '5px 0',
              }}
            />
          );
        }

        const isDanger = Boolean(item.danger);
        const isDisabled = Boolean(item.disabled);
        const itemTextColor = isDisabled
          ? 'rgba(148, 163, 184, 0.7)'
          : isDanger
          ? '#ef4444'
          : textColor;

        return (
          <div
            key={item.id || `item-${idx}`}
            role="menuitem"
            aria-disabled={isDisabled}
            onClick={(e) => {
              e.stopPropagation();
              if (isDisabled) return;
              onClose();
              if (item.onClick) {
                item.onClick(row, rowIndex);
              }
            }}
            onMouseEnter={(e) => {
              if (isDisabled) return;
              e.currentTarget.style.backgroundColor = isDanger
                ? 'rgba(239, 68, 68, 0.1)'
                : hoverBg;
            }}
            onMouseLeave={(e) => {
              if (isDisabled) return;
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              padding: '7px 14px',
              cursor: isDisabled ? 'not-allowed' : 'pointer',
              color: itemTextColor,
              fontWeight: 500,
              transition: 'background-color 100ms ease',
              opacity: isDisabled ? 0.5 : 1,
            }}
          >
            {item.icon && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 18,
                  height: 18,
                  flexShrink: 0,
                  fontSize: 14,
                  color: isDanger ? '#ef4444' : undefined,
                }}
              >
                {/* Check if emoji or Material icon name */}
                {item.icon.length > 2 && !/\p{Emoji}/u.test(item.icon) ? (
                  <MaterialIcon name={item.icon} size={15} color={isDanger ? '#ef4444' : undefined} />
                ) : (
                  <span>{item.icon}</span>
                )}
              </span>
            )}
            <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {item.label}
            </span>
          </div>
        );
      })}
    </div>,
    document.body
  );
};
