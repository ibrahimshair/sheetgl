import React, { useState, useMemo } from 'react';
import { ColumnDef } from '../../datagrid/types/grid';
import { DocThemeColors } from '../types';
import { DOC_CITY_OPTIONS } from '../data/docOptionsAndRows';
import { LiveDemoBox } from '../components/LiveDemoBox';
import { CodeBlock } from '../components/CodeBlock';

export interface EventsSectionProps {
  isDark: boolean;
  isTR: boolean;
  colors: DocThemeColors;
}

const CASCADE_DEMO_DATA = [
  { id: 1, city: 'Istanbul', balance: 100000, taxRate: 20, netBalance: 80000 },
  { id: 2, city: 'London', balance: 80000, taxRate: 15, netBalance: 68000 },
  { id: 3, city: 'New York', balance: 150000, taxRate: 10, netBalance: 135000 },
];

export const EventsSection: React.FC<EventsSectionProps> = ({
  isDark,
  isTR,
  colors,
}) => {
  const [cascadeLogs, setCascadeLogs] = useState<string[]>([]);

  const cascadePlaygroundCols = useMemo<ColumnDef[]>(
    () => [
      { id: 'id', title: 'ID', type: 'number', decimalDigits: 0, width: 60, readonly: true },
      {
        id: 'city',
        title: isTR ? 'Şehir Seçin (Async Cascade) ⚡' : 'Select City (Async Cascade) ⚡',
        type: 'dropdown',
        width: 210,
        options: DOC_CITY_OPTIONS,
        setCellValue: async (newData, newCity, currentRow) => {
          await new Promise((r) => setTimeout(r, 200));
          const taxMap: Record<string, number> = {
            Istanbul: 20,
            London: 15,
            'New York': 10,
            Tokyo: 12,
          };
          const tax = taxMap[newCity] ?? 18;
          const gross = Number(currentRow.balance) || 0;
          const net = Math.round(gross * (1 - tax / 100) * 100) / 100;
          newData.taxRate = tax;
          newData.netBalance = net;
          setCascadeLogs((prev) => [
            `[${new Date().toLocaleTimeString()}] Row #${currentRow.id}: city="${newCity}" → Backend returned taxRate=${tax}%, netBalance=$${net.toLocaleString()}`,
            ...prev.slice(0, 4),
          ]);
        },
      },
      {
        id: 'balance',
        title: isTR ? 'Brüt Bakiye ($) ⚡' : 'Gross Balance ($) ⚡',
        type: 'currency',
        width: 165,
        currencySymbol: '$',
        setCellValue: (newData, newBal, currentRow) => {
          const tax = Number(currentRow.taxRate) || 0;
          newData.netBalance = Math.round(Number(newBal) * (1 - tax / 100) * 100) / 100;
        },
      },
      {
        id: 'taxRate',
        title: isTR ? 'Vergi Oranı (%)' : 'Tax Rate (%)',
        type: 'progress',
        width: 140,
        readonly: true,
        permission: 'readonly',
      },
      {
        id: 'netBalance',
        title: isTR ? 'Net Bakiye ($)' : 'Net Balance ($)',
        type: 'currency',
        width: 165,
        currencySymbol: '$',
        readonly: true,
        permission: 'readonly',
      },
    ],
    [isTR]
  );

  return (
    <div>
      <div id="evt-live">
        <LiveDemoBox
          title={
            isTR
              ? 'Canlı Kademeli Güncelleme (Async setCellValue) Test Tablosu'
              : 'Live Cascading Cells (Async setCellValue) Playground'
          }
          subtitle={
            isTR
              ? 'Şehir sütununu değiştirdiğinizde 200ms Backend simülasyonu çalışır ve o şehrin Vergi Oranı (%) ile Net Bakiyesini ($) otomatik günceller!'
              : 'Change the City column below: a 200ms async backend lookup runs and automatically updates Tax Rate (%) and Net Balance ($)!'
          }
          hints={
            isTR
              ? [
                  '1. satırdaki Şehir (Istanbul) hücresine çift tıklayıp "New York" veya "London" seçin',
                  'Brüt Bakiye ($) hücresini değiştirip Net Bakiyenin anında yeniden hesaplandığını görün',
                ]
              : [
                  'Double-click City on Row #1 (Istanbul) and change it to "New York" or "London"',
                  'Edit Gross Balance ($) and watch Net Balance ($) recalculate immediately',
                ]
          }
          height={235}
          isDark={isDark}
          isTR={isTR}
          colors={colors}
          data={CASCADE_DEMO_DATA}
          columns={cascadePlaygroundCols}
        />
      </div>

      {cascadeLogs.length > 0 && (
        <div
          style={{
            marginBottom: 20,
            padding: '12px 16px',
            borderRadius: 10,
            backgroundColor: colors.codeBg,
            border: `1px solid ${colors.border}`,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12.5,
            color: isDark ? '#34D399' : '#059669',
          }}
        >
          {cascadeLogs.map((l, i) => (
            <div key={i}>{l}</div>
          ))}
        </div>
      )}

      <div id="evt-code">
        <CodeBlock
          id="cascade-code"
          title="setCellValue — Async Backend Cascading Lookup"
          langBadge="TSX"
          isDark={isDark}
          isTR={isTR}
          colors={colors}
          code={`const columns: ColumnDef[] = [
  {
    id: 'city',
    title: '${isTR ? 'Şehir Seçin ⚡' : 'Select City ⚡'}',
    type: 'dropdown',
    width: 200,
    options: CITY_OPTIONS,
    setCellValue: async (newData, newCity, currentRow) => {
      const res = await fetch(\`/api/region-policy?city=\${encodeURIComponent(newCity)}\`);
      const policy = await res.json(); // { taxRate: 15 }

      const gross = Number(currentRow.balance) || 0;
      newData.taxRate = policy.taxRate;
      newData.netBalance = Math.round(gross * (1 - policy.taxRate / 100) * 100) / 100;
    },
  },
];`}
        />
      </div>
    </div>
  );
};
