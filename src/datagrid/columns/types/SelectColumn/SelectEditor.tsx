import React, { useEffect, useRef, useState } from 'react';
import { CellEditorProps } from '../../IColumnTypePlugin';

export const SelectEditor: React.FC<CellEditorProps<string>> = ({
  value,
  column,
  rect,
  theme,
  locale,
  initialChar,
  onCommit,
  onCancel,
}) => {
  const options = column.options || [];
  const valStr = String(value ?? '').trim();
  const valLower = valStr.toLowerCase();

  // If current cell value is not part of options, include it as an active/discovered option
  const effectiveOptions = React.useMemo(() => {
    if (!valStr) return options;
    const exists = options.some(
      (o) =>
        o.value === value ||
        String(o.value).trim().toLowerCase() === valLower ||
        (Boolean(o.label) && String(o.label).trim().toLowerCase() === valLower)
    );
    if (!exists) {
      const isBadgeCol = options.some((o) => Boolean(o.bg || o.darkBg));
      return [
        {
          value: String(value),
          label: String(value),
          bg: isBadgeCol ? (theme.isDark ? 'rgba(148, 163, 184, 0.16)' : '#F1F5F9') : undefined,
          fg: isBadgeCol ? (theme.isDark ? '#94A3B8' : '#475569') : undefined,
        },
        ...options,
      ];
    }
    return options;
  }, [options, value, valStr, valLower, theme.isDark]);

  const [search, setSearch] = useState<string>(initialChar || '');
  const [highlightedIndex, setHighlightedIndex] = useState<number>(() => {
    const idx = effectiveOptions.findIndex(
      (o) =>
        o.value === value ||
        String(o.value).trim().toLowerCase() === valLower ||
        (Boolean(o.label) && String(o.label).trim().toLowerCase() === valLower)
    );
    return idx >= 0 ? idx : 0;
  });
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const filtered = effectiveOptions.filter(
    (o) =>
      o.label.toLowerCase().includes(search.toLowerCase()) ||
      o.value.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onCancel();
      }
    };
    document.addEventListener('mousedown', handleOutside, true);
    return () => document.removeEventListener('mousedown', handleOutside, true);
  }, [onCancel]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.min(prev + 1, Math.max(0, filtered.length - 1)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[highlightedIndex]) {
        onCommit(filtered[highlightedIndex].value, 'down');
      } else {
        onCancel();
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (filtered[highlightedIndex]) {
        onCommit(filtered[highlightedIndex].value, e.shiftKey ? 'left' : 'right');
      } else {
        onCancel();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
      style={{
        position: 'absolute',
        left: Math.max(4, rect.x),
        top: rect.y,
        minWidth: Math.max(rect.width, 190),
        zIndex: 120,
        backgroundColor: theme.dom.popoverBg,
        color: theme.dom.popoverText,
        border: `1px solid ${theme.dom.popoverBorder}`,
        borderRadius: 8,
        boxShadow: theme.dom.popoverShadow,
        backdropFilter: theme.dom.glassBackdrop,
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: 6, borderBottom: `1px solid ${theme.dom.popoverBorder}` }}>
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setHighlightedIndex(0);
          }}
          onKeyDown={handleKeyDown}
          placeholder={locale?.searchValuesPlaceholder || 'Search values...'}
          style={{
            width: '100%',
            padding: '5px 8px',
            backgroundColor: theme.dom.inputBg,
            color: theme.dom.inputText,
            border: `1px solid ${theme.dom.inputBorder}`,
            borderRadius: 4,
            outline: 'none',
            fontSize: 12,
            fontFamily: theme.fontFamily,
            boxSizing: 'border-box',
          }}
        />
      </div>

      <div style={{ maxHeight: 190, overflowY: 'auto', padding: 4 }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '8px 12px', fontSize: 12, color: '#8E8E93' }}>
            {locale?.noMatches || 'No matching records'}
          </div>
        ) : (
          filtered.map((opt, i) => {
            const isSelected =
              opt.value === value ||
              String(opt.value).trim().toLowerCase() === valLower ||
              (Boolean(opt.label) && String(opt.label).trim().toLowerCase() === valLower);
            const isHigh = i === highlightedIndex;
            return (
              <div
                key={opt.value}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  onCommit(opt.value, 'none');
                }}
                onMouseEnter={() => setHighlightedIndex(i)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 10px',
                  borderRadius: 4,
                  cursor: 'pointer',
                  backgroundColor: isHigh
                    ? theme.isDark
                      ? 'rgba(255,255,255,0.08)'
                      : 'rgba(0,0,0,0.05)'
                    : 'transparent',
                  fontSize: 12,
                  fontFamily: theme.fontFamily,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {(opt.bg || opt.darkFg) && (
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: theme.isDark
                          ? opt.darkFg || '#60A5FA'
                          : opt.fg || opt.bg || '#3B82F6',
                      }}
                    />
                  )}
                  <span>{opt.label}</span>
                </div>
                {isSelected && <span style={{ color: theme.dom.accentColor, fontWeight: 700 }}>✓</span>}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
