import React, { useState, useMemo } from 'react';
import { ColumnCategory, DocThemeColors } from '../../types';
import { COLUMN_GUIDES } from '../../data/columnGuides';
import { ALL_COLUMNS_DEMO_DATA } from '../../data/docOptionsAndRows';
import { LiveDemoBox } from '../../components/LiveDemoBox';

export interface ColumnsOverviewPageProps {
  isDark: boolean;
  isTR: boolean;
  colors: DocThemeColors;
  colCategoryFilter: ColumnCategory;
  onCategoryFilterChange: (cat: ColumnCategory) => void;
  onSelectColumnType: (colType: string) => void;
}

export const ColumnsOverviewPage: React.FC<ColumnsOverviewPageProps> = ({
  isDark,
  isTR,
  colors,
  colCategoryFilter,
  onCategoryFilterChange,
  onSelectColumnType,
}) => {
  const [colSearch, setColSearch] = useState<string>('');

  const categoryCounts = useMemo(() => {
    const counts: Record<ColumnCategory, number> = {
      all: COLUMN_GUIDES.length,
      text: 0,
      numeric: 0,
      choice: 0,
      structured: 0,
      visual: 0,
    };
    for (const item of COLUMN_GUIDES) {
      counts[item.category] += 1;
    }
    return counts;
  }, []);

  const filteredColumnGuides = useMemo(() => {
    return COLUMN_GUIDES.filter((item) => {
      if (colCategoryFilter !== 'all' && item.category !== colCategoryFilter) return false;
      if (!colSearch.trim()) return true;
      const q = colSearch.toLowerCase();
      return (
        item.type.toLowerCase().includes(q) ||
        item.titleTr.toLowerCase().includes(q) ||
        item.titleEn.toLowerCase().includes(q) ||
        item.summaryTr.toLowerCase().includes(q) ||
        item.summaryEn.toLowerCase().includes(q)
      );
    });
  }, [colCategoryFilter, colSearch]);

  return (
    <div>
      <p style={{ fontSize: 16, lineHeight: 1.7, color: colors.muted, marginTop: 0 }}>
        {isTR
          ? `SheetGL, kurumsal uygulamalar için kutudan çıktığı anda hazır ${COLUMN_GUIDES.length} yerleşik sütun türü (ColumnType) sunar. Aşağıda tüm sütunların bir arada bulunduğu canlı deneme tablosunu kullanabilir veya herhangi bir sütun türüne tıklayarak o sütunun özel demo ve yapılandırma sayfasını açabilirsiniz.`
          : `SheetGL ships with ${COLUMN_GUIDES.length} built-in enterprise column types out of the box. Use the combined interactive playground below, or select any column type card to open its dedicated live demo and configuration page.`}
      </p>

      {/* Interactive Category Tabs + Search */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          padding: 14,
          borderRadius: 12,
          backgroundColor: colors.surface,
          border: `1px solid ${colors.border}`,
          margin: '20px 0 24px',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {(
            [
              { id: 'all', labelTr: `Tümü (${categoryCounts.all})`, labelEn: `All Types (${categoryCounts.all})` },
              { id: 'text', labelTr: `Metin & İletişim (${categoryCounts.text})`, labelEn: `Text & Contact (${categoryCounts.text})` },
              { id: 'numeric', labelTr: `Sayısal & Finansal (${categoryCounts.numeric})`, labelEn: `Numeric & Financial (${categoryCounts.numeric})` },
              { id: 'choice', labelTr: `Seçim & Lookup (${categoryCounts.choice})`, labelEn: `Choice & Lookup (${categoryCounts.choice})` },
              { id: 'structured', labelTr: `Object & Tarih/Saat (${categoryCounts.structured})`, labelEn: `Object & Date/Time (${categoryCounts.structured})` },
              { id: 'visual', labelTr: `Görsel & Aksiyon (${categoryCounts.visual})`, labelEn: `Visual & Action (${categoryCounts.visual})` },
            ] as const
          ).map((tab) => {
            const active = colCategoryFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onCategoryFilterChange(tab.id)}
                style={{
                  padding: '7px 13px',
                  borderRadius: 8,
                  border: `1px solid ${active ? colors.accent : colors.border}`,
                  backgroundColor: active ? colors.accentBg : 'transparent',
                  color: active ? colors.accent : colors.text,
                  fontSize: 13,
                  fontWeight: active ? 700 : 500,
                  cursor: 'pointer',
                }}
              >
                {isTR ? tab.labelTr : tab.labelEn}
              </button>
            );
          })}
        </div>

        <input
          type="text"
          value={colSearch}
          onChange={(e) => setColSearch(e.target.value)}
          placeholder={
            isTR
              ? 'Sütun türü ara (ör. object, lookup, switch)...'
              : 'Filter column types (e.g. object, lookup, switch)...'
          }
          style={{
            flex: '1 1 200px',
            width: '100%',
            padding: '8px 12px',
            borderRadius: 8,
            border: `1px solid ${colors.border}`,
            backgroundColor: colors.bg,
            color: colors.text,
            fontSize: 13.5,
            outline: 'none',
          }}
        />
      </div>

      {/* Live Master Interactive Showcase */}
      <div id="col-playground">
        <LiveDemoBox
          title={
            isTR
              ? `Tüm Sütun Türleri Bir Arada (${filteredColumnGuides.length} Sütun Aktif)`
              : `All Column Types Combined Playground (${filteredColumnGuides.length} Active Columns)`
          }
          subtitle={
            isTR
              ? `Sağa doğru kaydırarak ${COLUMN_GUIDES.length} sütun türünün tamamını tek tabloda görebilir, hücrelere çift tıklayarak düzenleyebilirsiniz.`
              : `Scroll horizontally to inspect all ${COLUMN_GUIDES.length} column types in a single table and double-click any cell to test its inline editor.`
          }
          hints={
            isTR
              ? [
                  'Metadata (Object) hücresine çift tıklayıp Key-Value / JSON düzenleyiciyi açın',
                  'Manager (Lookup) veya City (Dropdown) hücresinde arama yapın',
                  '7-Day Trend (Sparkline) hücresindeki büyüteç ikonuna tıklayın',
                ]
              : [
                  'Double-click Metadata (Object) to open the Visual Key-Value / JSON editor',
                  'Click Manager (Lookup) or City (Dropdown) to search options',
                  'Click the expand icon on 7-Day Trend (Sparkline) to open the chart modal',
                ]
          }
          height={235}
          isDark={isDark}
          isTR={isTR}
          colors={colors}
          showToolbar={true}
          showFormulaBar={false}
          showSummaryFooter={false}
          data={ALL_COLUMNS_DEMO_DATA}
          columns={[
            { id: 'id', title: 'ID', type: 'number', decimalDigits: 0, width: 60, pinned: 'left', readonly: true },
            ...filteredColumnGuides.map((g) => g.sampleColumnDef),
          ]}
        />
      </div>

      {/* Directory Grid linking to each dedicated Column Type page */}
      <div style={{ marginTop: 28 }}>
        <h3
          style={{
            fontSize: 17,
            fontWeight: 800,
            color: colors.text,
            margin: '0 0 14px',
          }}
        >
          {isTR
            ? `Sütun Türü Sayfaları (${filteredColumnGuides.length})`
            : `Column Type Pages (${filteredColumnGuides.length})`}
        </h3>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(275px, 1fr))',
            gap: 14,
          }}
        >
          {filteredColumnGuides.map((col) => (
            <button
              key={col.type}
              type="button"
              onClick={() => onSelectColumnType(col.type)}
              style={{
                textAlign: 'left',
                padding: 16,
                borderRadius: 12,
                border: `1px solid ${colors.border}`,
                backgroundColor: colors.surface,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 10,
                transition: 'border-color 0.15s ease, transform 0.15s ease',
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                    marginBottom: 8,
                  }}
                >
                  <span
                    style={{
                      padding: '3px 8px',
                      borderRadius: 6,
                      backgroundColor: colors.accentBg,
                      color: colors.accent,
                      fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: 700,
                      fontSize: 12.5,
                    }}
                  >
                    {col.type}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: colors.muted,
                    }}
                  >
                    {isTR ? col.categoryLabelTr : col.categoryLabelEn}
                  </span>
                </div>

                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: colors.text,
                    marginBottom: 6,
                  }}
                >
                  {isTR ? col.titleTr : col.titleEn}
                </div>

                <div
                  style={{
                    fontSize: 13,
                    lineHeight: 1.5,
                    color: colors.muted,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {isTR ? col.summaryTr : col.summaryEn}
                </div>
              </div>

              <div
                style={{
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: colors.accent,
                  marginTop: 4,
                }}
              >
                {isTR ? 'Canlı Demoyu & Kodu Aç →' : 'Open Live Demo & Code →'}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

