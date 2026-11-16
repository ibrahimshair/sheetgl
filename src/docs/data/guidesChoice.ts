import { ColumnGuideItem } from '../types';
import {
  DOC_CITY_OPTIONS,
  DOC_LOOKUP_OPTIONS,
  DOC_STATUS_OPTIONS,
  DOC_TAGS_OPTIONS,
} from './docOptionsAndRows';

export const CHOICE_GUIDES: ColumnGuideItem[] = [
  {
    type: 'boolean',
    colId: 'isApproved',
    category: 'choice',
    categoryLabelTr: 'Seçim & İlişkisel',
    categoryLabelEn: 'Selection & Relational',
    titleTr: 'Onay Kutusu Sütunu (Boolean)',
    titleEn: 'Checkbox Column (boolean)',
    dataType: 'boolean',
    sampleValue: 'true | false',
    summaryTr:
      'Onay durumu, aktif/pasif bayrağı veya ikili (evet/hayır) alanlar için kullanılır. Düzenleyici açmaya gerek kalmadan tek tıklama ile değeri değiştirir.',
    summaryEn:
      'Renders an interactive vector checkbox directly on the HTML5 Canvas. Clicking the checkbox toggles the value immediately without opening a DOM overlay.',
    editorTr: 'Hücre içindeki onay kutusuna tek tıklama veya Space/Enter tuşu ile anında değişir.',
    editorEn: 'Single-click directly on the canvas checkbox or press Space/Enter to toggle.',
    propsList: [
      { prop: 'canEdit', type: '(row, col) => boolean', descTr: 'Satır bazlı kilit kontrolü', descEn: 'Row-level conditional lock' },
    ],
    sampleColumnDef: {
      id: 'isApproved',
      title: 'Approved (boolean)',
      type: 'boolean',
      width: 160,
    },
    sampleRows: [
      { id: 1, company: 'Acme Global', isApproved: true },
      { id: 2, company: 'Nexus Cloud', isApproved: false },
      { id: 3, company: 'Vertex Labs', isApproved: true },
    ],
    code: `{
  id: 'isApproved',
  title: 'Approved',
  type: 'boolean',
  width: 110,
  sortable: true,
  filterable: true,
}`,
  },
  {
    type: 'switch',
    colId: 'isActiveSwitch',
    category: 'choice',
    categoryLabelTr: 'Seçim & İlişkisel',
    categoryLabelEn: 'Selection & Relational',
    titleTr: 'Anahtar Sütunu (Switch)',
    titleEn: 'Toggle Switch Column (switch)',
    dataType: 'boolean',
    sampleValue: 'true | false',
    summaryTr:
      'Onay kutusuna (boolean) alternatif olarak modern bir Açık/Kapalı anahtar (toggle switch) çizer. Açık durumda yeşil zemin üzerinde ✓ ikonu, kapalı durumda gri zemin üzerinde ✕ ikonu gösterir. Tek tıklama veya Space/Enter ile değer anında değişir.',
    summaryEn:
      'Renders a modern pill toggle switch on the HTML5 Canvas as an alternative to a checkbox. Shows an emerald track with a ✓ thumb when ON and a slate track with a ✕ thumb when OFF. Toggles immediately on single click or Space/Enter.',
    editorTr: 'Hücre içindeki anahtara tek tıklama veya Space/Enter tuşu ile anında değişir.',
    editorEn: 'Single-click directly on the canvas switch or press Space/Enter to toggle.',
    propsList: [
      { prop: 'canEdit', type: '(row, col) => boolean', descTr: 'Satır bazlı kilit kontrolü', descEn: 'Row-level conditional lock' },
    ],
    sampleColumnDef: {
      id: 'isActiveSwitch',
      title: 'Aktif (switch)',
      type: 'switch',
      width: 140,
    },
    sampleRows: [
      { id: 1, company: 'Acme Global', isActiveSwitch: true },
      { id: 2, company: 'Nexus Cloud', isActiveSwitch: false },
      { id: 3, company: 'Vertex Labs', isActiveSwitch: true },
    ],
    code: `{
  id: 'isActiveSwitch',
  title: 'Aktif',
  type: 'switch',
  width: 110,
  sortable: true,
  filterable: true,
}`,
  },
  {
    type: 'select',
    colId: 'status',
    category: 'choice',
    categoryLabelTr: 'Seçim & İlişkisel',
    categoryLabelEn: 'Selection & Relational',
    titleTr: 'Durum Rozeti Sütunu (Select)',
    titleEn: 'Status Badge Select Column (select)',
    dataType: 'string',
    sampleValue: '"active" | "pending" | "rejected"',
    summaryTr:
      'Renkli durum rozetleri (Status Pill) göstermek ve açılır listeden tekli seçim yapmak için kullanılır. Her seçeneğe özel arka plan ve metin rengi atanabilir.',
    summaryEn:
      'Renders a rounded status pill badge with custom background/text colors and a chevron indicator. Ideal for workflow states like Active, Pending, or Rejected.',
    editorTr: 'Hücreye tıklandığında veya çift tıklandığında renkli rozetli açılır menü (Popover) açılır.',
    editorEn: 'Opens a themed popover menu displaying colored status pills and keyboard navigation.',
    propsList: [
      { prop: 'options', type: 'SelectOption[]', descTr: '{ value, label, color, bgColor } dizisi', descEn: 'Array of { value, label, color, bgColor } items' },
    ],
    sampleColumnDef: {
      id: 'status',
      title: 'Status (select)',
      type: 'select',
      width: 170,
      options: DOC_STATUS_OPTIONS,
    },
    sampleRows: [
      { id: 1, company: 'Acme Global', status: 'active' },
      { id: 2, company: 'Nexus Cloud', status: 'pending' },
      { id: 3, company: 'Vertex Labs', status: 'rejected' },
    ],
    code: `{
  id: 'status',
  title: 'Account Status',
  type: 'select',
  width: 150,
  options: [
    { value: 'active', label: 'Active', color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.16)' },
    { value: 'pending', label: 'Pending', color: '#F59E0B', bgColor: 'rgba(245, 158, 11, 0.16)' },
    { value: 'rejected', label: 'Rejected', color: '#EF4444', bgColor: 'rgba(239, 68, 68, 0.16)' },
  ],
}`,
  },
  {
    type: 'dropdown',
    colId: 'city',
    category: 'choice',
    categoryLabelTr: 'Seçim & İlişkisel',
    categoryLabelEn: 'Selection & Relational',
    titleTr: 'Aranabilir Açılır Liste (Dropdown)',
    titleEn: 'Searchable Dropdown Column (dropdown)',
    dataType: 'string',
    sampleValue: '"Istanbul" | "London" | "New York"',
    summaryTr:
      'İkon, başlık ve alt açıklama (subtitle) içeren zengin seçenek listeleri için kullanılır. Açılır pencerede anlık arama (Search) yapılabilir.',
    summaryEn:
      'Rich single-select combobox supporting option icons, primary labels, subtitles, and instant type-to-filter search inside the popover.',
    editorTr: 'Arama çubuklu, ikonlu ve alt başlıklı açılır liste penceresi açılır.',
    editorEn: 'Opens a searchable dropdown popover with icon, label, and subtitle rows.',
    propsList: [
      { prop: 'options', type: 'SelectOption[]', descTr: '{ value, label, icon?, subtitle? } dizisi', descEn: 'Array of { value, label, icon?, subtitle? } options' },
      { prop: 'setCellValue', type: 'function', descTr: 'Seçim değiştiğinde diğer sütunları otomatik güncelleme', descEn: 'Cascading callback when selection changes' },
    ],
    sampleColumnDef: {
      id: 'city',
      title: 'Region / City (dropdown)',
      type: 'dropdown',
      width: 195,
      options: DOC_CITY_OPTIONS,
    },
    sampleRows: [
      { id: 1, company: 'Acme Global', city: 'Istanbul' },
      { id: 2, company: 'Nexus Cloud', city: 'London' },
      { id: 3, company: 'Vertex Labs', city: 'New York' },
    ],
    code: `{
  id: 'city',
  title: 'Region / City',
  type: 'dropdown',
  width: 180,
  options: [
    { value: 'Istanbul', label: 'Istanbul', icon: '🌉', subtitle: 'EMEA Hub • 20% Tax' },
    { value: 'London', label: 'London', icon: '🇬🇧', subtitle: 'Europe • 15% Tax' },
    { value: 'New York', label: 'New York', icon: '🗽', subtitle: 'Americas • 10% Tax' },
  ],
}`,
  },
  {
    type: 'multiselect',
    colId: 'tags',
    category: 'choice',
    categoryLabelTr: 'Seçim & İlişkisel',
    categoryLabelEn: 'Selection & Relational',
    titleTr: 'Çoklu Seçim Etiket Sütunu (Multi-Select)',
    titleEn: 'Multi-Select Tag Chips Column (multiselect)',
    dataType: 'string[]',
    sampleValue: '["SOC2", "GDPR", "ISO27001"]',
    summaryTr:
      'Bir hücrede birden fazla etiket, sertifika veya kategori seçmek için kullanılır. Hücre içinde yan yana renkli rozetler (Tag Chips) olarak çizilir.',
    summaryEn:
      'Stores an array of selected option values and renders multiple colored tag chips inside the cell (with "+N" overflow counter when space is tight).',
    editorTr: 'Onay kutulu (Checkbox), tümünü seç/temizle butonlu ve arama destekli çoklu seçim penceresi açılır.',
    editorEn: 'Opens a searchable multi-checkbox popover with Select All / Clear buttons.',
    propsList: [
      { prop: 'options', type: 'SelectOption[]', descTr: 'Seçilebilir etiketlerin { value, label, color, bgColor } listesi', descEn: 'Available tag options { value, label, color, bgColor }' },
    ],
    sampleColumnDef: {
      id: 'tags',
      title: 'Compliance (multiselect)',
      type: 'multiselect',
      width: 230,
      options: DOC_TAGS_OPTIONS,
    },
    sampleRows: [
      { id: 1, company: 'Acme Global', tags: ['SOC2', 'GDPR'] },
      { id: 2, company: 'Nexus Cloud', tags: ['ISO27001', 'SOC2', 'HIPAA'] },
      { id: 3, company: 'Vertex Labs', tags: ['GDPR'] },
    ],
    code: `{
  id: 'tags',
  title: 'Compliance Standards',
  type: 'multiselect',
  width: 220,
  options: [
    { value: 'SOC2', label: 'SOC2 Type II', color: '#38BDF8', bgColor: 'rgba(56, 189, 248, 0.16)' },
    { value: 'GDPR', label: 'EU GDPR', color: '#A855F7', bgColor: 'rgba(168, 85, 247, 0.16)' },
    { value: 'ISO27001', label: 'ISO 27001', color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.16)' },
  ],
}`,
  },
  {
    type: 'lookup',
    colId: 'managerId',
    category: 'choice',
    categoryLabelTr: 'Seçim & İlişkisel',
    categoryLabelEn: 'Selection & Relational',
    titleTr: 'İlişkisel Kayıt Arama Sütunu (Lookup)',
    titleEn: 'Relational Foreign-Key Lookup (lookup)',
    dataType: 'string | number',
    sampleValue: '"MGR-01" (Görünen: "Elena Rostova")',
    summaryTr:
      'Veritabanındaki Foreign Key ID değerini ("MGR-01") tutup ekranda ilişkili kaydın adını, baş harf avatarını ve unvanını göstermek için kullanılır.',
    summaryEn:
      'Maps foreign-key IDs (e.g. "MGR-01") to human-readable display records with an initials avatar badge, full name, and role subtitle.',
    editorTr: 'ID, isim veya unvana göre aranabilen ilişkisel kayıt seçici penceresi açılır.',
    editorEn: 'Opens a relational record picker searchable by ID, display label, or subtitle.',
    propsList: [
      { prop: 'options', type: 'SelectOption[]', descTr: '{ value: ID, label: Ad, subtitle: Unvan, color } dizisi', descEn: 'Array of foreign-key records { value, label, subtitle, color }' },
    ],
    sampleColumnDef: {
      id: 'managerId',
      title: 'Manager (lookup)',
      type: 'lookup',
      width: 230,
      options: DOC_LOOKUP_OPTIONS,
    },
    sampleRows: [
      { id: 1, company: 'Acme Global', managerId: 'MGR-01' },
      { id: 2, company: 'Nexus Cloud', managerId: 'MGR-02' },
      { id: 3, company: 'Vertex Labs', managerId: 'MGR-03' },
    ],
    code: `{
  id: 'managerId',
  title: 'Account Manager',
  type: 'lookup',
  width: 220,
  options: [
    { value: 'MGR-01', label: 'Elena Rostova', subtitle: 'VP of Enterprise Sales • EMEA', color: '#38BDF8' },
    { value: 'MGR-02', label: 'Marcus Vance', subtitle: 'Managing Director • Americas', color: '#8B5CF6' },
  ],
}`,
  },
];
