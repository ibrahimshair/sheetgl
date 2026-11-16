import React from 'react';
import { ColumnGuideItem, DocThemeColors } from '../types';
import { LiveDemoBox } from './LiveDemoBox';
import { SimpleTable } from './SimpleTable';
import { CodeBlock } from './CodeBlock';

export interface ColumnGuideCardProps {
  col: ColumnGuideItem;
  idx: number;
  isDark: boolean;
  isTR: boolean;
  colors: DocThemeColors;
}

export const ColumnGuideCard: React.FC<ColumnGuideCardProps> = ({
  col,
  idx,
  isDark,
  isTR,
  colors,
}) => {
  return (
    <div
      id={`col-type-${col.type}`}
      style={{
        borderRadius: 14,
        border: `1px solid ${colors.border}`,
        backgroundColor: colors.surface,
        padding: 'clamp(14px, 3vw, 24px)',
        boxShadow: isDark
          ? '0 6px 20px rgba(0,0,0,0.25)'
          : '0 4px 14px rgba(15,23,42,0.04)',
      }}
    >
      {/* Card Header */}
      <div
        id={`col-type-${col.type}-overview`}
        style={{
          scrollMarginTop: 16,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          paddingBottom: 14,
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span
            style={{
              padding: '4px 10px',
              borderRadius: 6,
              backgroundColor: colors.accentBg,
              color: colors.accent,
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 800,
              fontSize: 14,
            }}
          >
            type: '{col.type}'
          </span>
          <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: colors.text }}>
            {isTR ? col.titleTr : col.titleEn}
          </h3>
        </div>

        <span
          style={{
            padding: '4px 10px',
            borderRadius: 999,
            backgroundColor: colors.surfaceAlt,
            color: colors.muted,
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {isTR ? col.categoryLabelTr : col.categoryLabelEn}
        </span>
      </div>

      {/* Description */}
      <p style={{ fontSize: 15.5, lineHeight: 1.7, color: colors.text, margin: '14px 0' }}>
        {isTR ? col.summaryTr : col.summaryEn}
      </p>

      {/* Metadata Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 12,
          margin: '14px 0 16px',
        }}
      >
        <div
          style={{
            padding: '12px 14px',
            borderRadius: 10,
            backgroundColor: colors.surfaceAlt,
            border: `1px solid ${colors.border}`,
          }}
        >
          <div
            style={{
              fontSize: 11.5,
              fontWeight: 700,
              color: colors.muted,
              textTransform: 'uppercase',
            }}
          >
            {isTR ? 'Veri Tipi & Örnek Hücre Değeri' : 'Row Data Type & Sample Value'}
          </div>
          <div
            style={{
              marginTop: 6,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 13,
              fontWeight: 700,
              color: colors.accent,
            }}
          >
            {col.dataType}
          </div>
          <div
            style={{
              marginTop: 4,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12.5,
              color: colors.text,
            }}
          >
            {col.sampleValue}
          </div>
        </div>

        <div
          style={{
            padding: '12px 14px',
            borderRadius: 10,
            backgroundColor: colors.surfaceAlt,
            border: `1px solid ${colors.border}`,
          }}
        >
          <div
            style={{
              fontSize: 11.5,
              fontWeight: 700,
              color: colors.muted,
              textTransform: 'uppercase',
            }}
          >
            {isTR ? 'Düzenleyici (Editor) Davranışı' : 'Inline Editor Behavior'}
          </div>
          <div style={{ marginTop: 6, fontSize: 13.5, lineHeight: 1.55, color: colors.text }}>
            {isTR ? col.editorTr : col.editorEn}
          </div>
        </div>
      </div>

      {/* Type-Specific Props Table */}
      <div id={`col-type-${col.type}-formatting`} style={{ scrollMarginTop: 16 }} />
      {col.propsList.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: colors.muted, marginBottom: 8 }}>
            {isTR
              ? 'Bu Sütun Türüne Özel ColumnDef Özellikleri:'
              : 'Type-Specific ColumnDef Properties:'}
          </div>
          <SimpleTable
            colors={colors}
            headers={
              isTR
                ? ['Özellik (Prop)', 'Tip', 'Açıklama']
                : ['Property', 'Type', 'Description']
            }
            rows={col.propsList.map((p) => [
              p.prop,
              p.type,
              isTR ? p.descTr : p.descEn,
            ])}
          />
        </div>
      )}

      {/* Always-Visible Dedicated Live Interactive Demo for this Column Type */}
      <LiveDemoBox
        title={
          isTR
            ? `${col.titleTr} — Canlı Örnek (type: '${col.type}')`
            : `${col.titleEn} — Live Example (type: '${col.type}')`
        }
        subtitle={isTR ? col.editorTr : col.editorEn}
        height={176}
        isDark={isDark}
        isTR={isTR}
        colors={colors}
        showToolbar={false}
        showFormulaBar={false}
        showSummaryFooter={false}
        data={col.sampleRows}
        columns={[
          { id: 'id', title: 'ID', type: 'number', decimalDigits: 0, width: 65, readonly: true },
          { id: 'company', title: isTR ? 'Şirket Adı' : 'Company Name', type: 'text', width: 185 },
          {
            ...col.sampleColumnDef,
            width: Math.max(col.sampleColumnDef.width || 200, 260),
          },
        ]}
      />

      {/* Code Example */}
      <CodeBlock
        id={`col-code-${col.type}-${idx}`}
        title={`ColumnDef — type: '${col.type}'`}
        langBadge="TSX"
        isDark={isDark}
        isTR={isTR}
        colors={colors}
        code={col.code}
      />
    </div>
  );
};
