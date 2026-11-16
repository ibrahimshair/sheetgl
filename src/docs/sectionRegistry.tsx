import React from 'react';
import { ColumnCategory, DocSection, DocThemeColors } from './types';
import { COLUMN_GUIDES } from './data/columnGuides';
import { QuickStartSection } from './sections/QuickStartSection';
import { ColumnsSection } from './sections/ColumnsSection';
import { ValidationSection } from './sections/ValidationSection';
import { PermissionsSection } from './sections/PermissionsSection';
import { EventsSection } from './sections/EventsSection';
import { FilteringGroupingSection } from './sections/FilteringGroupingSection';
import { ExcelUxSection } from './sections/ExcelUxSection';
import { BatchStoreSection } from './sections/BatchStoreSection';
import { ToolbarSummarySection } from './sections/ToolbarSummarySection';
import { ThemingI18nSection } from './sections/ThemingI18nSection';
import { ColumnGroupsAndColorsSection } from './sections/ColumnGroupsAndColorsSection';

export interface BuildDocSectionsParams {
  isDark: boolean;
  isTR: boolean;
  colors: DocThemeColors;
  colCategoryFilter: ColumnCategory;
  onCategoryFilterChange: (cat: ColumnCategory) => void;
  selectedColumnType: string | null;
  onSelectColumnType: (colType: string | null, syncUrl?: boolean) => void;
}

export function buildDocSections({
  isDark,
  isTR,
  colors,
  colCategoryFilter,
  onCategoryFilterChange,
  selectedColumnType,
  onSelectColumnType,
}: BuildDocSectionsParams): DocSection[] {
  return [
    {
      id: 'quickstart',
      step: '1',
      badgeTr: 'BAŞLANGIÇ & CANLI ÖRNEK',
      badgeEn: 'QUICK START & LIVE EXAMPLE',
      titleTr: 'Kurulum, Mimari & Hızlı Başlangıç',
      titleEn: 'Installation, Architecture & Quick Start',
      subtitleTr:
        'SheetGL paketini NPM veya NPX CLI ile kurun; aşağıdaki canlı interaktif tabloyu ve başlangıç kodunu inceleyin.',
      subtitleEn:
        'Install SheetGL via NPM or NPX CLI; explore the live interactive starter grid and code below.',
      subItems: [
        { id: 'qs-live', labelTr: 'Canlı Başlangıç Tablosu', labelEn: 'Live Starter Grid' },
        { id: 'qs-install', labelTr: 'NPM & NPX CLI Kurulumu', labelEn: 'NPM & NPX CLI Setup' },
        { id: 'qs-code', labelTr: 'Başlangıç Tablo Kodu', labelEn: 'Starter Component Code' },
      ],
      render: () => <QuickStartSection isDark={isDark} isTR={isTR} colors={colors} />,
    },
    {
      id: 'columns',
      step: '2',
      badgeTr: `${COLUMN_GUIDES.length} SÜTUN TÜRÜ & CANLI ÖRNEKLER`,
      badgeEn: `${COLUMN_GUIDES.length} COLUMN TYPES & LIVE EXAMPLES`,
      titleTr: `Tüm Sütun Türleri Rehberi (${COLUMN_GUIDES.length} Tip)`,
      titleEn: `Complete Guide to All ${COLUMN_GUIDES.length} Column Types`,
      subtitleTr:
        'Her bir sütun türünü ayrı demo sayfasında inceleyin; veri yapısını, özel ayarlarını ve kod örneklerini test edin.',
      subtitleEn:
        'Explore each column type on its own dedicated page; test data formats, type-specific properties, and TSX code.',
      subItems: [
        {
          id: 'col-playground',
          labelTr: 'Canlı Sütun Deneme Tablosu',
          labelEn: 'Live Columns Playground',
          onSelect: () => {
            onCategoryFilterChange('all');
            onSelectColumnType(null, false);
          },
        },
        ...COLUMN_GUIDES.map((g) => ({
          id: `col-type-${g.type}`,
          labelTr: g.type,
          labelEn: g.type,
          onSelect: () => {
            onCategoryFilterChange('all');
            onSelectColumnType(g.type, false);
          },
          children: [
            {
              id: `col-type-${g.type}-overview`,
              labelTr: 'Overview',
              labelEn: 'Overview',
              onSelect: () => {
                onCategoryFilterChange('all');
                onSelectColumnType(g.type, false);
              },
            },
            {
              id: `col-type-${g.type}-formatting`,
              labelTr: 'Formatting',
              labelEn: 'Formatting',
              onSelect: () => {
                onCategoryFilterChange('all');
                onSelectColumnType(g.type, false);
              },
            },
          ],
        })),
      ],
      render: () => (
        <ColumnsSection
          isDark={isDark}
          isTR={isTR}
          colors={colors}
          colCategoryFilter={colCategoryFilter}
          onCategoryFilterChange={onCategoryFilterChange}
          selectedColumnType={selectedColumnType}
          onSelectColumnType={onSelectColumnType}
        />
      ),
    },
    {
      id: 'validation',
      step: '3',
      badgeTr: 'DEFERRED ASYNC & STATIC VALIDATION',
      badgeEn: 'DEFERRED ASYNC & STATIC VALIDATION',
      titleTr: 'Doğrulama Kuralları (Static & Deferred Async)',
      titleEn: 'Validation Rules (Static & Deferred Async)',
      subtitleTr:
        'Statik kurallara veya Backend API Deferred nesnesinden dönen true / false sonucuna göre geçersiz girişleri engelleyin.',
      subtitleEn:
        'Block invalid cell updates based on static rules or backend Deferred.resolve(true / false) responses.',
      subItems: [
        { id: 'val-live', labelTr: 'Canlı Doğrulama Test Tablosu', labelEn: 'Live Validation Playground' },
        { id: 'val-deferred', labelTr: 'DevExtreme Deferred Async (true/false)', labelEn: 'DevExtreme Deferred Async (true/false)' },
        { id: 'val-table', labelTr: 'Tüm Doğrulama Kuralları Tablosu', labelEn: 'All Validation Rules Reference' },
      ],
      render: () => <ValidationSection isDark={isDark} isTR={isTR} colors={colors} />,
    },
    {
      id: 'permissions',
      step: '4',
      badgeTr: 'YETKİLENDİRME & CANLI ÖRNEK',
      badgeEn: 'PERMISSIONS & LIVE EXAMPLE',
      titleTr: '3 Katmanlı Yetkilendirme (RBAC)',
      titleEn: '3-Tier Permissions (Grid, Column & Row Locks)',
      subtitleTr:
        'Tablo genelinde, sütun bazında veya satır koşuluna göre yazma ve salt-okunur (Read-Only) kurallarını canlı test edin.',
      subtitleEn:
        'Test global Grid permissions, Column-level locks, and dynamic Row/Cell locks in the live example below.',
      subItems: [
        { id: 'perm-live', labelTr: 'Canlı Yetkilendirme Testi', labelEn: 'Live Permissions Playground' },
        { id: 'perm-code', labelTr: 'Grid, Sütun & Satır Kilidi Kodu', labelEn: '3-Tier Permissions Code' },
      ],
      render: () => <PermissionsSection isDark={isDark} isTR={isTR} colors={colors} />,
    },
    {
      id: 'events',
      step: '5',
      badgeTr: 'ASYNC CASCADE & CANLI ÖRNEK',
      badgeEn: 'ASYNC CASCADE & LIVE EXAMPLE',
      titleTr: 'Asenkron Backend Tetikleyicileri & Olaylar',
      titleEn: 'Cascading Cell Triggers & Lifecycle Events',
      subtitleTr:
        'Bir hücre değiştiğinde aynı satırdaki bağımlı sütunları senkron veya Backend API üzerinden otomatik güncelleyin.',
      subtitleEn:
        'Update dependent columns on the same row synchronously or asynchronously via backend APIs when a cell changes.',
      subItems: [
        { id: 'evt-live', labelTr: 'Canlı Kademeli Güncelleme (setCellValue)', labelEn: 'Live Cascading Lookup' },
        { id: 'evt-code', labelTr: 'Asenkron Backend setCellValue Kodu', labelEn: 'Async Backend setCellValue Code' },
      ],
      render: () => <EventsSection isDark={isDark} isTR={isTR} colors={colors} />,
    },
    {
      id: 'filtering',
      step: '6',
      badgeTr: 'FİLTRE, GRUPLAMA & CANLI ÖRNEK',
      badgeEn: 'FILTER, GROUPING & LIVE EXAMPLE',
      titleTr: 'Filtreleme, Gruplama & Özet Satırları',
      titleEn: 'Header Filtering, Grouping & Summary Rows',
      subtitleTr:
        'Hücre formatına duyarlı değer/koşul filtreleme, çoklu sütun gruplama ve alt toplam (Summary Footer) örneği.',
      subtitleEn:
        'Cell-format-aware value & condition filtering, multi-column grouping, and sticky footer aggregations.',
      subItems: [
        { id: 'flt-live', labelTr: 'Canlı Gruplama & Filtre Örneği', labelEn: 'Live Grouping & Filter Demo' },
        { id: 'flt-code', labelTr: 'Gruplama & Summary Footer Kodu', labelEn: 'Grouping & Summary Footer Code' },
        { id: 'flt-enterprise-grouping', labelTr: 'Çok Seviyeli Kontrollü Gruplama (groupBy)', labelEn: 'Enterprise Controlled Grouping (groupBy)' },
        { id: 'flt-grouping-engine', labelTr: 'RowGroupingEngine API & Alt Toplamlar', labelEn: 'RowGroupingEngine API & Aggregations' },
      ],
      render: () => <FilteringGroupingSection isDark={isDark} isTR={isTR} colors={colors} />,
    },
    {
      id: 'excel-ux',
      step: '7',
      badgeTr: 'EXCEL KISAYOLLARI',
      badgeEn: 'EXCEL SHORTCUTS',
      titleTr: 'Excel Klavye Kısayolları, Fill Handle & Pano',
      titleEn: 'Excel Shortcuts, Fill Handle & TSV Clipboard',
      subtitleTr:
        'Microsoft Excel ve Google Sheets uyumlu tüm klavye ve fare kısayolları.',
      subtitleEn:
        'Complete keyboard navigation, Fill Handle series auto-increment, and Microsoft Excel / Google Sheets clipboard integration.',
      subItems: [
        { id: 'ux-table', labelTr: 'Klavye & Fare Kısayolları Tablosu', labelEn: 'Keyboard & Mouse Shortcuts' },
      ],
      render: () => <ExcelUxSection isTR={isTR} colors={colors} />,
    },
    {
      id: 'batch-store',
      step: '8',
      badgeTr: 'BATCH SAVE & CANLI ÖRNEK',
      badgeEn: 'BATCH SAVE & LIVE EXAMPLE',
      titleTr: 'Batch Save (Yeşil Hücre Vurgusu) & Veri Katmanı',
      titleEn: 'Batch Save (Dirty Cell Highlighting) & Data Stores',
      subtitleTr:
        'DevExtreme tarzı değiştirilen hücrelerin yeşil vurgulanması, yeni satır ekleme/çoğaltma ve toplu kaydetme örneği.',
      subtitleEn:
        'DevExtreme-style dirty cell highlighting, row insertion/duplication, and transactional Batch Save / Discard.',
      subItems: [
        { id: 'batch-live', labelTr: 'Canlı Batch Save & Yeşil Hücre Vurgusu', labelEn: 'Live Batch Save Playground' },
        { id: 'batch-code', labelTr: 'onSaving Backend Kayıt Kodu', labelEn: 'onSaving Backend Commit Code' },
      ],
      render: () => <BatchStoreSection isDark={isDark} isTR={isTR} colors={colors} />,
    },
    {
      id: 'toolbar-summary',
      step: '9',
      badgeTr: 'TOOLBAR (ICON / ICON+TEXT / TEXT) & SUMMARY ROW',
      badgeEn: 'TOOLBAR (ICON / ICON+TEXT / TEXT) & SUMMARY ROW',
      titleTr: 'Toolbar (İkon / İkon+Metin / Metin), Google Icons & Özet Satırı',
      titleEn: 'Toolbar (Icon / Icon+Text / Text), Google Icons & Summary Row',
      subtitleTr:
        'Google Fonts Material Symbols (fonts.google.com/icons) entegrasyonu, 3 farklı Toolbar buton görünüm modu (icon, icon-text, text) ve Summary Row yapılandırması.',
      subtitleEn:
        'Google Fonts Material Symbols (fonts.google.com/icons) integration, 3 Toolbar button display modes (icon, icon-text, text), and Summary Row configuration.',
      subItems: [
        { id: 'tb-live', labelTr: 'Canlı Toolbar & Summary Row Deneme Alanı', labelEn: 'Live Toolbar & Summary Row Configurator' },
        { id: 'tb-modes', labelTr: 'Toolbar Görünüm Modları (icon / icon-text / text)', labelEn: 'Toolbar Display Modes (icon / icon-text / text)' },
        { id: 'tb-summary', labelTr: 'Summary Row (Özet Satırı) Ayarları', labelEn: 'Summary Row Configuration' },
        { id: 'tb-icons', labelTr: 'Google Material Symbols (<MaterialIcon />)', labelEn: 'Google Material Symbols (<MaterialIcon />)' },
      ],
      render: () => <ToolbarSummarySection isDark={isDark} isTR={isTR} colors={colors} />,
    },
    {
      id: 'theming-i18n',
      step: '10',
      badgeTr: 'TEMA & DİL (i18n)',
      badgeEn: 'THEMING & i18n',
      titleTr: 'Tema Motoru & Çoklu Dil (TR / EN)',
      titleEn: 'Theme Engine & Localization (i18n)',
      subtitleTr:
        '4 hazır kurumsal tema, özel tasarım belirteçleri (Design Tokens) ve tarayıcı dili algılama destekli i18n motoru.',
      subtitleEn:
        '4 built-in theme presets, custom design token overrides, and automatic browser language detection.',
      subItems: [
        { id: 'thm-code', labelTr: 'Hazır Temalar & Özel Token Kodu', labelEn: 'Theme Presets & Custom Tokens' },
      ],
      render: () => <ThemingI18nSection isDark={isDark} isTR={isTR} colors={colors} />,
    },
    {
      id: 'column-groups-colors',
      step: '11',
      badgeTr: 'SÜTUN GRUPLARI & DARK/LIGHT RENKLENDİRME',
      badgeEn: 'COLUMN GROUPS & DARK/LIGHT COLORING',
      titleTr: 'Sütun Grupları (Banded Headers) & Tema Uyumlu Renklendirme',
      titleEn: 'Banded Column Groups & Theme-Aware Column/Header Coloring',
      subtitleTr:
        'Üst sütun grupları (columnGroups), grup sütunlara renk mirası, başlık (headerColor) ve sütun (columnColor) renklerini Dark & Light temaya uyumlu olarak atama rehberi.',
      subtitleEn:
        'Complete guide to Banded Column Groups (columnGroups), group color inheritance, and Dark & Light theme-aware headerColor and columnColor customization.',
      subItems: [
        { id: 'cgc-live', labelTr: 'Canlı Sütun Grupları & Renk Testi', labelEn: 'Live Column Groups & Color Playground' },
        { id: 'cgc-groups', labelTr: 'Banded Sütun Grupları (ColumnGroupDef)', labelEn: 'Banded Column Groups (ColumnGroupDef)' },
        { id: 'cgc-colors', labelTr: 'Dark/Light Başlık & Sütun Renkleri', labelEn: 'Dark/Light Header & Column Colors' },
        { id: 'cgc-reference', labelTr: '13 Semantik Renk Paleti & Referans', labelEn: '13 Semantic Color Presets & Reference' },
      ],
      render: () => <ColumnGroupsAndColorsSection isDark={isDark} isTR={isTR} colors={colors} />,
    },
  ];
}
