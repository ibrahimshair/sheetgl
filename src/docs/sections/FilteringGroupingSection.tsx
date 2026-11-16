import React from 'react';
import { DocThemeColors } from '../types';
import {
  ALL_COLUMNS_DEMO_DATA,
  DOC_CITY_OPTIONS,
  DOC_STATUS_OPTIONS,
} from '../data/docOptionsAndRows';
import { LiveDemoBox } from '../components/LiveDemoBox';
import { CodeBlock } from '../components/CodeBlock';

export interface FilteringGroupingSectionProps {
  isDark: boolean;
  isTR: boolean;
  colors: DocThemeColors;
}

export const FilteringGroupingSection: React.FC<FilteringGroupingSectionProps> = ({
  isDark,
  isTR,
  colors,
}) => {
  return (
    <div>
      <div id="flt-live">
        <LiveDemoBox
          title={
            isTR
              ? 'Canlı Gruplama, Başlık Filtresi ve Özet Satırı Örneği'
              : 'Live Grouping, Header Filter & Summary Footer Example'
          }
          subtitle={
            isTR
              ? 'Sütun başlıklarındaki filtre (huni) ikonuna tıklayarak Değer veya Koşul filtresi uygulayın; üstteki grup çubuğundan gruplamayı yönetin.'
              : 'Click the funnel icon on any column header to filter by formatted values or conditions; click group rows to expand/collapse.'
          }
          hints={
            isTR
              ? [
                  'Bakiye ($) sütun başlığındaki filtre ikonuna tıklayıp "Koşul Filtresi -> Büyük (>)" deneyin',
                  'Grup satırlarına tıklayarak grupları daraltıp genişletin',
                ]
              : [
                  'Click the filter funnel icon on Gross Balance ($) and test Condition Filter -> Greater than (>)',
                  'Click group header rows to collapse or expand grouped records',
                ]
          }
          height={290}
          isDark={isDark}
          isTR={isTR}
          colors={colors}
          data={ALL_COLUMNS_DEMO_DATA}
          showGroupPanel={true}
          showSummaryFooter={true}
          initialGroups={[{ selector: 'city' }]}
          columns={[
            { id: 'id', title: 'ID', type: 'number', decimalDigits: 0, width: 65, readonly: true },
            { id: 'company', title: isTR ? 'Şirket' : 'Company', type: 'text', width: 190 },
            { id: 'city', title: isTR ? 'Şehir' : 'City', type: 'dropdown', width: 165, groupable: true, options: DOC_CITY_OPTIONS },
            { id: 'status', title: isTR ? 'Durum' : 'Status', type: 'select', width: 145, groupable: true, options: DOC_STATUS_OPTIONS },
            { id: 'balance', title: isTR ? 'Brüt Bakiye ($)' : 'Gross Balance ($)', type: 'currency', width: 165, currencySymbol: '$', summaryType: 'sum' },
            { id: 'progress', title: isTR ? 'Kota (%)' : 'Quota (%)', type: 'progress', width: 140, summaryType: 'avg' },
          ]}
        />
      </div>

      <div id="flt-code">
        <CodeBlock
          id="filter-group-code"
          title={
            isTR
              ? 'Gruplama ve Alt Özet Satırı (Summary Footer)'
              : 'Multi-Column Grouping & Sticky Summary Footer'
          }
          langBadge="TSX"
          isDark={isDark}
          isTR={isTR}
          colors={colors}
          code={`<SheetGL
  dataSource={rows}
  columns={[
    { id: 'company', title: '${isTR ? 'Şirket' : 'Company'}', type: 'text', width: 190 },
    { id: 'city', title: '${isTR ? 'Şehir' : 'City'}', type: 'dropdown', width: 165, groupable: true, filterable: true },
    { id: 'balance', title: '${isTR ? 'Brüt Bakiye ($)' : 'Gross Balance ($)'}', type: 'currency', width: 165, summaryType: 'sum' },
    { id: 'progress', title: '${isTR ? 'Kota (%)' : 'Quota (%)'}', type: 'progress', width: 140, summaryType: 'avg' },
  ]}
  initialGroups={[{ selector: 'city' }]}
  summaryRow={{
    visible: true,
    showTotalCount: true,
    showSelectionStats: true,
    showColumnSummaries: true,
  }}
/>`}
        />
      </div>

      <div id="flt-enterprise-grouping" style={{ marginTop: 28 }}>
        <div
          style={{
            padding: '18px 20px',
            borderRadius: 12,
            border: `1px solid ${colors.border}`,
            background: colors.surface,
            marginBottom: 16,
          }}
        >
          <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700, color: colors.text }}>
            {isTR
              ? 'Çok Seviyeli Kontrollü Satır Gruplama (groupBy & Tam Genişlikli Grup Bantları)'
              : 'Enterprise Multi-Level Row Grouping (groupBy & Full-Width Canvas Bands)'}
          </h3>
          <p style={{ margin: '0 0 12px', fontSize: 13.5, lineHeight: 1.6, color: colors.muted }}>
            {isTR
              ? 'SheetGL v2.2.5+, sabitlenmiş (pinned) sütunların üzerinde tek parça çizilen tam genişlikli Canvas grup bantları ve O(N) sanal ağaç projeksiyonu sunar. Kontrollü veya kontrolsüz modda groupBy, expandedGroupKeys ve onGroupExpansionChanged proplarıyla çok seviyeli gruplamayı yönetebilirsiniz.'
              : 'SheetGL v2.2.5+ renders continuous full-width Canvas group header bands across pinned zones using an O(N) virtual tree projection. Manage multi-level grouping in controlled or uncontrolled mode via groupBy, expandedGroupKeys, and onGroupExpansionChanged.'}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
            {[
              {
                name: 'groupBy?: string[]',
                desc: isTR
                  ? 'Hiyerarşik gruplama alanları sırası (örn. ["city", "status"]). Araç çubuğu gruplama seçicisiyle senkronize çalışır.'
                  : 'Ordered list of column field keys to group by (e.g. ["city", "status"]). Automatically syncs with the toolbar group selector.',
              },
              {
                name: 'expandedGroupKeys?: Set<string> | string[]',
                desc: isTR
                  ? 'Açık (expanded) tutulacak grup düğümü anahtarları. Kontrollü genişletme/daraltma durumları için kullanılır.'
                  : 'Set or array of expanded group node keys for controlled expand/collapse state management.',
              },
              {
                name: 'onGroupExpansionChanged?: (keys: Set<string>) => void',
                desc: isTR
                  ? 'Kullanıcı bir grup bandını (+/-) açıp kapattığında güncel açık grup anahtarlarıyla tetiklenir.'
                  : 'Callback fired with the updated Set of expanded group keys whenever a user toggles a group band.',
              },
            ].map((item) => (
              <div
                key={item.name}
                style={{
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: `1px solid ${colors.border}`,
                  background: colors.surfaceAlt,
                }}
              >
                <code style={{ fontSize: 12, fontWeight: 700, color: colors.accent }}>{item.name}</code>
                <div style={{ fontSize: 12.5, lineHeight: 1.5, color: colors.muted, marginTop: 4 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <CodeBlock
          id="controlled-row-grouping-code"
          title={
            isTR
              ? 'Kontrollü Çok Seviyeli Gruplama (groupBy + expandedGroupKeys)'
              : 'Controlled Multi-Level Grouping (groupBy + expandedGroupKeys)'
          }
          langBadge="TSX"
          isDark={isDark}
          isTR={isTR}
          colors={colors}
          code={`const [expandedKeys, setExpandedKeys] = useState<Set<string>>(
  () => new Set(['city:Istanbul', 'city:Istanbul|status:Active'])
);

<SheetGL
  dataSource={rows}
  columns={[
    { id: 'city', title: '${isTR ? 'Şehir' : 'City'}', type: 'dropdown', width: 160, groupable: true },
    { id: 'status', title: '${isTR ? 'Durum' : 'Status'}', type: 'select', width: 140, groupable: true },
    { id: 'balance', title: '${isTR ? 'Bakiye ($)' : 'Balance ($)'}', type: 'currency', width: 160, currencySymbol: '$', summaryType: 'sum' },
    { id: 'progress', title: '${isTR ? 'Kota (%)' : 'Quota (%)'}', type: 'progress', width: 140, summaryType: 'avg' },
  ]}
  groupBy={['city', 'status']}
  expandedGroupKeys={expandedKeys}
  onGroupExpansionChanged={setExpandedKeys}
/>`}
        />
      </div>

      <div id="flt-grouping-engine" style={{ marginTop: 20 }}>
        <CodeBlock
          id="row-grouping-engine-code"
          title={
            isTR
              ? 'RowGroupingEngine ile Programatik Gruplama & Alt Toplam Hesaplama'
              : 'Standalone RowGroupingEngine & Group Aggregations'
          }
          langBadge="TS"
          isDark={isDark}
          isTR={isTR}
          colors={colors}
          code={`import { RowGroupingEngine, isGroupRow } from 'sheetgl';

const virtualRows = RowGroupingEngine.transform(rows, ['city', 'status'], {
  defaultExpanded: true,
  aggregations: [
    { field: 'balance', type: 'sum' },
    { field: 'progress', type: 'avg' },
    { field: 'id', type: 'count' },
  ],
});

for (const row of virtualRows) {
  if (isGroupRow(row)) {
    console.log(row.groupKey, row.level, row.childrenCount, row.aggregations);
  }
}`}
        />
      </div>
    </div>
  );
};
