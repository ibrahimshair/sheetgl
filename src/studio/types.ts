import { ColumnColorPreset, GridToolbarConfig, RowSelectionMode } from '../datagrid';

export type DatasetFillMode = 'populated' | 'sparse' | 'empty';

export type StudioWizardTab = 'data' | 'columns' | 'toolbar' | 'diagnostics';

export type ColumnPresetId = 'minimal' | 'finance' | 'enterprise' | 'all';

export interface StudioWizardState {
  rowCount: number;
  datasetFillMode: DatasetFillMode;
  selectionMode: RowSelectionMode;
  batchEditMode: boolean;
  columnPreset: ColumnPresetId;
  enabledColumnIds: string[];
  enableColumnGroups: boolean;
  inheritGroupColumnColors: boolean;
  groupColorMap: Record<string, ColumnColorPreset>;
  columnColorOverrides: Record<
    string,
    { headerColor?: ColumnColorPreset | ''; columnColor?: ColumnColorPreset | '' }
  >;
  toolbarConfig: Required<
    Pick<
      GridToolbarConfig,
      | 'visible'
      | 'buttonDisplayMode'
      | 'showBrand'
      | 'showAddRow'
      | 'showDuplicateRow'
      | 'showDeleteRow'
      | 'showUndoRedo'
      | 'showSearch'
      | 'showGroupBy'
      | 'showClearFilters'
      | 'showBatchActions'
      | 'showSelectionModeSwitch'
      | 'showPermissionsSwitch'
      | 'showColumnSettings'
      | 'showLocaleSwitch'
      | 'showThemeSwitch'
      | 'showExportCsv'
    >
  >;
  showFormulaBar: boolean;
  showSummaryRow: boolean;
  lockRejectedRows: boolean;
}

export const COLUMN_PRESETS: Record<ColumnPresetId, string[]> = {
  minimal: ['id', 'code', 'company', 'status', 'balance'],
  finance: [
    'id',
    'code',
    'company',
    'city',
    'category',
    'status',
    'balance',
    'taxRate',
    'netBalance',
    'yoyGrowth',
  ],
  enterprise: [
    'id',
    'code',
    'company',
    'managerId',
    'city',
    'category',
    'status',
    'tags',
    'balance',
    'taxRate',
    'netBalance',
    'yoyGrowth',
    'isApproved',
    'isActiveSwitch',
    'rating',
    'progress',
    'date',
  ],
  all: [
    'id',
    'code',
    'company',
    'managerId',
    'metadata',
    'city',
    'category',
    'status',
    'tags',
    'balance',
    'taxRate',
    'netBalance',
    'yoyGrowth',
    'isApproved',
    'isActiveSwitch',
    'rating',
    'progress',
    'date',
    'lastAuditAt',
    'cutoffTime',
    'email',
    'website',
    'phone',
    'tagColor',
    'sparkline',
    'actions',
    'exportMenu',
  ],
};

export const DEFAULT_STUDIO_WIZARD_STATE: StudioWizardState = {
  rowCount: 10000,
  datasetFillMode: 'populated',
  selectionMode: 'multiple',
  batchEditMode: true,
  columnPreset: 'all',
  enabledColumnIds: [...COLUMN_PRESETS.all],
  enableColumnGroups: true,
  inheritGroupColumnColors: true,
  groupColorMap: {
    identity: 'indigo',
    organization: 'blue',
    financials: 'emerald',
    performance: 'violet',
    timeline: 'amber',
    contact: 'cyan',
  },
  columnColorOverrides: {
    netBalance: {
      headerColor: 'teal',
      columnColor: 'teal',
    },
  },
  toolbarConfig: {
    visible: true,
    buttonDisplayMode: 'icon-text',
    showBrand: true,
    showAddRow: true,
    showDuplicateRow: true,
    showDeleteRow: true,
    showUndoRedo: true,
    showSearch: true,
    showGroupBy: true,
    showClearFilters: true,
    showBatchActions: true,
    showSelectionModeSwitch: true,
    showPermissionsSwitch: true,
    showColumnSettings: true,
    showLocaleSwitch: true,
    showThemeSwitch: true,
    showExportCsv: true,
  },
  showFormulaBar: true,
  showSummaryRow: true,
  lockRejectedRows: false,
};
