import React, { useMemo } from 'react';
import { DocThemeColors } from '../../types';
import { COLUMN_GUIDES } from '../../data/columnGuides';
import { ColumnGuideCard } from '../../components/ColumnGuideCard';

export interface ColumnDetailPageProps {
  colType: string;
  isDark: boolean;
  isTR: boolean;
  colors: DocThemeColors;
  onSelectColumnType: (colType: string | null) => void;
}

export const ColumnDetailPage: React.FC<ColumnDetailPageProps> = ({
  colType,
  isDark,
  isTR,
  colors,
  onSelectColumnType,
}) => {
  const { col, idx, prevCol, nextCol } = useMemo(() => {
    const foundIdx = COLUMN_GUIDES.findIndex((g) => g.type === colType);
    const safeIdx = foundIdx >= 0 ? foundIdx : 0;
    return {
      col: COLUMN_GUIDES[safeIdx],
      idx: safeIdx,
      prevCol: safeIdx > 0 ? COLUMN_GUIDES[safeIdx - 1] : null,
      nextCol: safeIdx < COLUMN_GUIDES.length - 1 ? COLUMN_GUIDES[safeIdx + 1] : null,
    };
  }, [colType]);

  return (
    <div>
      {/* Top Breadcrumb / Back to Columns Overview */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: 18,
          padding: '10px 14px',
          borderRadius: 10,
          backgroundColor: colors.surface,
          border: `1px solid ${colors.border}`,
        }}
      >
        <button
          type="button"
          onClick={() => onSelectColumnType(null)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            borderRadius: 7,
            border: `1px solid ${colors.border}`,
            backgroundColor: colors.surfaceAlt,
            color: colors.text,
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          ← {isTR ? 'Tüm Sütun Türleri & Canlı Tablo' : 'All Column Types & Playground'}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: colors.muted }}>
          <span>{isTR ? col.categoryLabelTr : col.categoryLabelEn}</span>
          <span>/</span>
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 700,
              color: colors.accent,
            }}
          >
            {col.type}
          </span>
          <span style={{ opacity: 0.7 }}>
            ({idx + 1} / {COLUMN_GUIDES.length})
          </span>
        </div>
      </div>

      {/* Dedicated Single Column Guide + Live Demo */}
      <ColumnGuideCard col={col} idx={idx} isDark={isDark} isTR={isTR} colors={colors} />

      {/* Prev / Next Column Type Navigation */}
      <div
        style={{
          marginTop: 22,
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        {prevCol ? (
          <button
            type="button"
            onClick={() => onSelectColumnType(prevCol.type)}
            style={{
              padding: '10px 16px',
              borderRadius: 10,
              border: `1px solid ${colors.border}`,
              backgroundColor: colors.surface,
              color: colors.text,
              fontSize: 13.5,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            ← <code style={{ color: colors.accent }}>{prevCol.type}</code> —{' '}
            {isTR ? prevCol.titleTr : prevCol.titleEn}
          </button>
        ) : (
          <div />
        )}

        {nextCol && (
          <button
            type="button"
            onClick={() => onSelectColumnType(nextCol.type)}
            style={{
              padding: '10px 16px',
              borderRadius: 10,
              border: `1px solid ${colors.accent}`,
              backgroundColor: colors.accentBg,
              color: colors.accent,
              fontSize: 13.5,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <code>{nextCol.type}</code> — {isTR ? nextCol.titleTr : nextCol.titleEn} →
          </button>
        )}
      </div>
    </div>
  );
};

