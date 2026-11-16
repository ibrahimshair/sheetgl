import React, { useState } from 'react';
import { DocThemeColors } from '../types';
import { renderHighlightedLine } from '../utils/syntaxHighlighter';

export interface CodeBlockProps {
  id: string;
  title: string;
  langBadge?: string;
  code: string;
  isDark: boolean;
  isTR: boolean;
  colors: DocThemeColors;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  id,
  title,
  langBadge = 'TSX',
  code,
  isDark,
  isTR,
  colors,
}) => {
  const [copied, setCopied] = useState(false);
  const lines = code.trimEnd().split('\n');

  const handleCopy = () => {
    navigator.clipboard?.writeText(code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div
      id={id}
      style={{
        margin: '16px 0 24px',
        borderRadius: 12,
        overflow: 'hidden',
        border: `1px solid ${isDark ? '#1E293B' : colors.border}`,
        backgroundColor: colors.codeBg,
        boxShadow: isDark ? '0 12px 30px rgba(0,0,0,0.4)' : '0 4px 16px rgba(15,23,42,0.06)',
      }}
    >
      {/* IDE Top Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          padding: '10px 14px',
          backgroundColor: colors.codeHeaderBg,
          borderBottom: `1px solid ${isDark ? '#1E293B' : colors.border}`,
          fontSize: 12.5,
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', minWidth: 0 }}>
          <div style={{ display: 'flex', gap: 6, marginRight: 2, flexShrink: 0 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#EF4444', opacity: 0.85 }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#F59E0B', opacity: 0.85 }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#10B981', opacity: 0.85 }} />
          </div>
          <span
            style={{
              padding: '2px 8px',
              borderRadius: 5,
              backgroundColor: colors.accentBg,
              color: colors.accent,
              fontWeight: 700,
              fontSize: 11,
              flexShrink: 0,
            }}
          >
            {langBadge}
          </span>
          <span style={{ color: isDark ? '#F8FAFC' : colors.text, fontWeight: 600, wordBreak: 'break-word' }}>{title}</span>
          <span style={{ color: '#64748B', fontSize: 11 }}>({lines.length} lines)</span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          style={{
            padding: '5px 12px',
            borderRadius: 6,
            border: `1px solid ${isDark ? '#334155' : '#CBD5E1'}`,
            backgroundColor: copied ? '#10B981' : isDark ? '#0F172A' : '#FFFFFF',
            color: copied ? '#FFFFFF' : isDark ? '#FFFFFF' : '#334155',
            fontSize: 12,
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          {copied ? (isTR ? '✓ Kopyalandı' : '✓ Copied') : isTR ? 'Kodu Kopyala' : 'Copy Code'}
        </button>
      </div>

      {/* Code Lines */}
      <div
        style={{
          padding: '16px 18px',
          overflowX: 'auto',
          fontSize: 13.5,
          lineHeight: 1.68,
          fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
          color: isDark ? '#E2E8F0' : '#0F172A',
        }}
      >
        {lines.map((line, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'baseline',
              minHeight: 22,
            }}
          >
            <span
              style={{
                width: 34,
                flexShrink: 0,
                userSelect: 'none',
                paddingRight: 16,
                textAlign: 'right',
                color: isDark ? '#475569' : '#94A3B8',
                fontSize: 12,
              }}
            >
              {i + 1}
            </span>
            <span style={{ whiteSpace: 'pre', flex: 1 }}>
              {renderHighlightedLine(line, isDark)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
