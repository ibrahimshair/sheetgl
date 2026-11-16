export type AppView = 'landing' | 'studio' | 'docs';

export interface RouteState {
  view: AppView;
  docSection?: string;
  docSub?: string;
}

export function parseLocationPath(pathname: string): RouteState {
  const clean = (pathname || '/').replace(/\/+$/, '') || '/';

  if (clean === '/demo' || clean === '/studio') {
    return { view: 'studio' };
  }

  if (clean === '/documentation' || clean === '/docs') {
    return { view: 'docs', docSection: 'quickstart' };
  }

  if (clean.startsWith('/documentation/') || clean.startsWith('/docs/')) {
    const parts = clean.split('/').filter(Boolean);
    const docSection = parts[1] || 'quickstart';
    const docSub = parts.length > 2 ? parts.slice(2).join('/') : undefined;
    return { view: 'docs', docSection, docSub };
  }

  return { view: 'landing' };
}

export function buildRoutePath(view: AppView, docSection?: string, docSub?: string): string {
  if (view === 'studio') return '/demo';
  if (view === 'docs') {
    const sec = docSection || 'quickstart';
    if (docSub) {
      return `/documentation/${sec}/${docSub}`;
    }
    return sec !== 'quickstart' ? `/documentation/${sec}` : '/documentation';
  }
  return '/';
}

const DOC_SECTION_META: Record<
  string,
  { titleEn: string; titleTr: string; descEn: string; descTr: string }
> = {
  quickstart: {
    titleEn: 'Quick Start & Installation | SheetGL Docs',
    titleTr: 'Kurulum & Hızlı Başlangıç | SheetGL Dokümantasyon',
    descEn:
      'Install SheetGL in React 18/19 via npm or npx sheetgl init. Render a zero-dependency 100k-row Canvas Excel DataGrid in 30 seconds.',
    descTr:
      'SheetGL React 18/19 kurulumu: npm install sheetgl veya npx sheetgl init ile sıfır bağımlılıklı Canvas Excel DataGrid başlatın.',
  },
  columns: {
    titleEn: '25 Built-in Column Types | SheetGL Docs',
    titleTr: '25 Yerleşik Sütun Türü | SheetGL Dokümantasyon',
    descEn:
      'Explore all 25 SheetGL column plugins: text, currency, lookup, multiselect, date, rating, sparkline, action, pdf, and custom columns.',
    descTr:
      'SheetGL 25 yerleşik sütun türü: text, currency, lookup, multiselect, date, rating, sparkline, action, pdf ve özel sütun rehberi.',
  },
  validation: {
    titleEn: 'Sync & Async Cell Validation | SheetGL Docs',
    titleTr: 'Senkron & Asenkron Hücre Doğrulama | SheetGL Dokümantasyon',
    descEn:
      'Configure synchronous rules and deferred async validation in SheetGL React DataGrid with inline error badges.',
    descTr:
      'SheetGL React DataGrid içinde senkron kurallar ve gecikmeli asenkron doğrulama (deferred async validation) rehberi.',
  },
  permissions: {
    titleEn: '3-Tier RBAC Cell Permissions | SheetGL Docs',
    titleTr: '3 Katmanlı Hücre Yetkilendirme | SheetGL Dokümantasyon',
    descEn:
      'Control grid, column, and conditional row/cell editing permissions (write, readonly, read) in SheetGL.',
    descTr:
      'SheetGL ile tablo, sütun ve satır/hücre bazlı koşullu yazma/salt-okunur (write, readonly, read) yetkilendirme kuralları.',
  },
  events: {
    titleEn: 'Lifecycle Events & Async Cascade | SheetGL Docs',
    titleTr: 'Yaşam Döngüsü Olayları & Asenkron Tetikleme | SheetGL Docs',
    descEn:
      'Use setCellValue promises and lifecycle hooks (onSaving, onCellValueChanged) for reactive backend cascading updates.',
    descTr:
      'setCellValue Promise desteği ve yaşam döngüsü olayları (onSaving, onCellValueChanged) ile asenkron backend güncellemeleri.',
  },
  filtering: {
    titleEn: 'Grouping, Sorting & Dual Filters | SheetGL Docs',
    titleTr: 'Çoklu Gruplama & Çift Modlu Filtreleme | SheetGL Docs',
    descEn:
      'Multi-column row grouping, O(1) WeakMap filtering, Excel Value/Condition header popovers, and dynamic summaries.',
    descTr:
      'Çoklu sütun gruplama, O(1) WeakMap filtreleme, Excel Değer/Koşul başlık filtreleri ve dinamik özet satırları.',
  },
  'excel-ux': {
    titleEn: 'Excel Fill Handle & Keyboard Shortcuts | SheetGL Docs',
    titleTr: 'Excel Fill Handle & Klavye Kısayolları | SheetGL Docs',
    descEn:
      'Master Fill Handle auto-increment, TSV Excel copy/paste (Ctrl+C/V), Ctrl+D/R, 100-step Undo/Redo, and Formula Bar.',
    descTr:
      'Fill Handle seri doldurma, Excel/Google Sheets TSV kopyala-yapıştır, Ctrl+D/R, 100 adımlı Geri Al/Yinele ve Formül Barı.',
  },
  'batch-store': {
    titleEn: 'Batch CRUD & Server-Side Row Model (SSRM) | SheetGL Docs',
    titleTr: 'Batch CRUD & Sunucu Taraflı Satır Modeli (SSRM) | SheetGL Docs',
    descEn:
      'Atomic Batch CRUD dirty-cell tracking (inserted, updated, deleted) and ServerSideRowStore for million-row remote datasets.',
    descTr:
      'Batch CRUD yeşil hücre takibi (inserted, updated, deleted) ve milyon satırlı uzak veriler için ServerSideRowStore.',
  },
  'toolbar-summary': {
    titleEn: 'Toolbar, Summary Rows & Icons | SheetGL Docs',
    titleTr: 'Araç Çubuğu, Özet Satırları & İkonlar | SheetGL Docs',
    descEn:
      'Configure SheetGL toolbar modes, runtime SUM/AVG/MIN/MAX/COUNT summaries, and Google Material Symbols.',
    descTr:
      'SheetGL araç çubuğu modları, çalışma zamanı SUM/AVG/MIN/MAX/COUNT özet satırları ve Material Symbols entegrasyonu.',
  },
  'theming-i18n': {
    titleEn: 'Theme Engine & i18n Localization | SheetGL Docs',
    titleTr: 'Tema Motoru & Çoklu Dil (TR / EN) | SheetGL Docs',
    descEn:
      'Customize apple-dark, apple-light, google-dark, and google-light themes with design tokens and EN/TR locales.',
    descTr:
      'apple-dark, apple-light, google-dark, google-light temaları, özel tasarım belirteçleri ve TR/EN dil desteği.',
  },
  'column-groups-colors': {
    titleEn: 'Banded Column Groups & Theme Colors | SheetGL Docs',
    titleTr: 'Sütun Grupları & Tema Uyumlu Renkler | SheetGL Docs',
    descEn:
      'Group columns under Banded Headers (ColumnGroupDef) and apply Dark/Light adaptive headerColor and columnColor presets.',
    descTr:
      'Banded Column Groups (ColumnGroupDef) ve Dark/Light uyumlu headerColor / columnColor semantik renk paletleri.',
  },
};

export function syncSeoMeta(route: RouteState, lang: 'tr' | 'en'): void {
  if (typeof document === 'undefined') return;

  const isTR = lang === 'tr';
  document.documentElement.lang = isTR ? 'tr' : 'en';

  const baseUrl = 'https://sheetgl.truncgil.com';
  const path = buildRoutePath(route.view, route.docSection, route.docSub);
  const canonicalBase = `${baseUrl}${path === '/' ? '/' : path}`;
  const fullUrl = isTR ? `${canonicalBase}${canonicalBase.includes('?') ? '&' : '?'}lang=tr` : canonicalBase;

  let title = '';
  let description = '';

  if (route.view === 'studio') {
    title = isTR
      ? 'Canlı Demo Stüdyosu (10.000 Satır) | SheetGL'
      : 'Live Demo Studio (10,000 Rows) | SheetGL';
    description = isTR
      ? 'SheetGL canlı Excel DataGrid demosu: 25 sütun türü, Fill Handle çoğaltma, 3 katmanlı yetkilendirme, SSRM ve Batch Save.'
      : 'Interactive 10,000-row React Excel DataGrid live demo featuring 25 column types, Fill Handle, 3-tier permissions, and Batch CRUD.';
  } else if (route.view === 'docs') {
    const secMeta = route.docSection ? DOC_SECTION_META[route.docSection] : undefined;
    if (secMeta) {
      title = isTR ? secMeta.titleTr : secMeta.titleEn;
      description = isTR ? secMeta.descTr : secMeta.descEn;
    } else {
      title = isTR
        ? 'Dokümantasyon & Hızlı Başlangıç Rehberi | SheetGL'
        : 'Documentation & Quick Start Guide | SheetGL';
      description = isTR
        ? 'SheetGL React Excel DataGrid kurulumu, 25 sütun tipi, Excel kısayolları, yetkilendirme kuralları, SSRM ve Batch Save dokümantasyonu.'
        : 'Complete developer documentation for SheetGL: NPM/NPX setup, 25 column types, Excel shortcuts, RBAC permissions, SSRM, and Batch CRUD.';
    }
  } else {
    title = isTR
      ? 'SheetGL — React İçin WebGL & Canvas Excel DataGrid (MIT)'
      : 'SheetGL — WebGL & Canvas Excel DataGrid for React (MIT)';
    description = isTR
      ? 'MIT lisanslı, sıfır bağımlılıklı HTML5 Canvas React Excel DataGrid. 100.000+ satırda 60 FPS, 25 sütun türü, Fill Handle ve Batch CRUD.'
      : 'Free MIT-licensed React Excel DataGrid powered by HTML5 Canvas. 100,000+ rows at 60 FPS, 25 column types, Fill Handle, Batch CRUD & zero dependencies.';
  }

  document.title = title;

  const setMeta = (selector: string, attr: string, val: string) => {
    const el = document.querySelector(selector);
    if (el) el.setAttribute(attr, val);
  };

  setMeta('meta[name="description"]', 'content', description);
  setMeta('#og-title', 'content', title);
  setMeta('#og-description', 'content', description);
  setMeta('#og-url', 'content', fullUrl);
  setMeta('#twitter-title', 'content', title);
  setMeta('#twitter-description', 'content', description);
  setMeta('#canonical-link', 'href', canonicalBase);
  setMeta('#hreflang-en', 'href', canonicalBase);
  setMeta('#hreflang-tr', 'href', `${canonicalBase}?lang=tr`);
  setMeta('#hreflang-default', 'href', canonicalBase);
}
