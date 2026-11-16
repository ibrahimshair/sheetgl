// @vitest-environment jsdom
import { describe, it, expect, beforeAll, vi } from 'vitest';
import { ColumnManager } from '../../src/datagrid/core/ColumnManager';
import { ColumnDef, ColumnId } from '../../src/datagrid/types/grid';
import { IDataStore } from '../../src/datagrid/types/store';
import { appleLight } from '../../src/datagrid/theme/presets/appleLight';
import { ColumnTypeRegistry } from '../../src/datagrid/columns/ColumnTypeRegistry';
import { initDefaultColumnPlugins } from '../../src/datagrid/columns/initPlugins';

describe('ColumnManager', () => {
  beforeAll(() => {
    initDefaultColumnPlugins();
  });

  describe('applyColumnOrder', () => {
    const baseColumns: ColumnDef[] = [
      { id: 'id', title: 'ID', width: 60, type: 'text' },
      { id: 'name', title: 'Full Name', width: 150, type: 'text' },
      { id: 'email', title: 'Email', width: 200, type: 'text' },
      { id: 'role', title: 'Role', width: 100, type: 'text' },
      { id: 'status', title: 'Status', width: 80, type: 'text' },
    ];

    it('should return a copy of columns when order is empty, null, or undefined', () => {
      const res1 = ColumnManager.applyColumnOrder(baseColumns, []);
      expect(res1).toEqual(baseColumns);
      expect(res1).not.toBe(baseColumns);

      const res2 = ColumnManager.applyColumnOrder(baseColumns, undefined as any);
      expect(res2).toEqual(baseColumns);
      expect(res2).not.toBe(baseColumns);
    });

    it('should reorder columns according to explicit column ID order', () => {
      const explicitOrder: ColumnId[] = ['status', 'email', 'id', 'name', 'role'];
      const result = ColumnManager.applyColumnOrder(baseColumns, explicitOrder);

      expect(result.map((c) => c.id)).toEqual(['status', 'email', 'id', 'name', 'role']);
    });

    it('should preserve original order for columns not mentioned in the order array at the end', () => {
      const partialOrder: ColumnId[] = ['role', 'id'];
      const result = ColumnManager.applyColumnOrder(baseColumns, partialOrder);

      expect(result[0].id).toBe('role');
      expect(result[1].id).toBe('id');
      // The remaining columns (name, email, status) remain at the end
      expect(result.slice(2).map((c) => c.id)).toEqual(['name', 'email', 'status']);
    });

    it('should not mutate original columns array', () => {
      const columnsCopy = [...baseColumns];
      ColumnManager.applyColumnOrder(baseColumns, ['status', 'name']);
      expect(baseColumns).toEqual(columnsCopy);
    });
  });

  describe('filterVisibleColumns', () => {
    const columns: ColumnDef[] = [
      { id: 'col1', title: 'Col 1', width: 100, type: 'text' },
      { id: 'col2', title: 'Col 2', width: 100, type: 'text', visible: false },
      { id: 'col3', title: 'Col 3', width: 100, type: 'text' },
      { id: 'col4', title: 'Col 4', width: 100, type: 'text', visible: true },
      { id: 'col5', title: 'Col 5', width: 100, type: 'text' },
    ];

    it('should filter out columns with visible === false when no hiddenColumns provided', () => {
      const visible = ColumnManager.filterVisibleColumns(columns);
      expect(visible.map((c) => c.id)).toEqual(['col1', 'col3', 'col4', 'col5']);
    });

    it('should filter out columns specified in hiddenColumns Set', () => {
      const hidden = new Set<ColumnId>(['col1', 'col5']);
      const visible = ColumnManager.filterVisibleColumns(columns, hidden);
      expect(visible.map((c) => c.id)).toEqual(['col3', 'col4']);
    });

    it('should filter out columns specified in hiddenColumns array', () => {
      const hidden: ColumnId[] = ['col3', 'col4'];
      const visible = ColumnManager.filterVisibleColumns(columns, hidden);
      expect(visible.map((c) => c.id)).toEqual(['col1', 'col5']);
    });

    it('should correctly handle both col.visible === false and hiddenColumns simultaneously', () => {
      const hidden = new Set<ColumnId>(['col1']);
      const visible = ColumnManager.filterVisibleColumns(columns, hidden);
      // col2 is hidden via visible: false, col1 is hidden via Set
      expect(visible.map((c) => c.id)).toEqual(['col3', 'col4', 'col5']);
    });

    it('should return an empty array if all columns are hidden', () => {
      const hidden = new Set<ColumnId>(['col1', 'col3', 'col4', 'col5']);
      const visible = ColumnManager.filterVisibleColumns(columns, hidden);
      expect(visible).toEqual([]);
    });
  });

  describe('calculateBestFitWidth', () => {
    const createMockStore = (rows: any[]): IDataStore => ({
      getRowCount: () => rows.length,
      getViewRow: (index: number) => {
        if (index < 0 || index >= rows.length) return null as any;
        return {
          type: 'data',
          index,
          data: rows[index],
        };
      },
    } as any);

    it('should perform fallback clamping when measure context is null', () => {
      const column: ColumnDef = { id: 'test', title: 'Test Col', width: 150, type: 'text' };
      const store = createMockStore([]);

      // Pass null ctx to simulate headless or missing canvas
      const width = ColumnManager.calculateBestFitWidth(column, store, appleLight, null);
      expect(width).toBe(150);
    });

    it('should respect column.minWidth and column.maxWidth in headless fallback', () => {
      const column1: ColumnDef = { id: 'test1', title: 'T1', type: 'text', minWidth: 200, width: 80 };
      const column2: ColumnDef = { id: 'test2', title: 'T2', type: 'text', maxWidth: 100, width: 300 };
      const store = createMockStore([]);

      expect(ColumnManager.calculateBestFitWidth(column1, store, appleLight, null)).toBe(200);
      expect(ColumnManager.calculateBestFitWidth(column2, store, appleLight, null)).toBe(100);
    });

    it('should calculate best-fit width based on header text and data content', () => {
      const column: ColumnDef = {
        id: 'name',
        title: 'Customer Name',
        type: 'text',
        width: 120,
        sortable: true,
        filterable: true,
      };

      const data = [
        { name: 'Short' },
        { name: 'A Much Longer Customer Company Name LLC' },
        { name: 'Medium Name' },
      ];
      const store = createMockStore(data);

      const mockCtx: Partial<CanvasRenderingContext2D> = {
        save: vi.fn(),
        restore: vi.fn(),
        font: '',
        measureText: vi.fn((text: string) => ({
          width: text.length * 8, // Simple 8px per character simulation
        } as TextMetrics)),
      };

      const calculatedWidth = ColumnManager.calculateBestFitWidth(
        column,
        store,
        appleLight,
        mockCtx as CanvasRenderingContext2D,
        { padding: 20 }
      );

      // Longest text: 'A Much Longer Customer Company Name LLC' (39 chars * 8 = 312px) + padding (20px) = 332px
      expect(calculatedWidth).toBe(332);
      expect(mockCtx.save).toHaveBeenCalled();
      expect(mockCtx.restore).toHaveBeenCalled();
    });

    it('should handle constructor ID safely without falling into Object prototype', () => {
      const column: ColumnDef = { id: 'constructor', title: '', type: 'text', width: 100 };
      const store = createMockStore([]);

      const mockCtx: Partial<CanvasRenderingContext2D> = {
        save: vi.fn(),
        restore: vi.fn(),
        font: '',
        measureText: vi.fn((text: string) => ({
          width: text.length * 8,
        } as TextMetrics)),
      };

      const width = ColumnManager.calculateBestFitWidth(
        column,
        store,
        appleLight,
        mockCtx as CanvasRenderingContext2D
      );

      // 'Constructor' has 11 chars * 8 = 88px + reserved icons + padding
      expect(width).toBeGreaterThan(100);
    });

    it('should respect sampleRows limit and skip non-data rows or null values', () => {
      const rows = [
        { desc: 'First' },
        { desc: null },
        { desc: undefined },
        { desc: '' },
        { desc: 'Very long text after sample limit should not be measured' },
      ];

      const store: IDataStore = {
        getRowCount: () => rows.length,
        getViewRow: (idx: number) => {
          if (idx === 1) {
            return { type: 'group', index: idx, data: {} } as any; // group row should be skipped
          }
          return { type: 'data', index: idx, data: rows[idx] } as any;
        },
      } as any;

      const column: ColumnDef = { id: 'desc', title: 'Desc', type: 'text', width: 100 };

      const measuredTexts: string[] = [];
      const mockCtx: Partial<CanvasRenderingContext2D> = {
        save: vi.fn(),
        restore: vi.fn(),
        font: '',
        measureText: vi.fn((text: string) => {
          measuredTexts.push(text);
          return { width: text.length * 8 } as TextMetrics;
        }),
      };

      ColumnManager.calculateBestFitWidth(
        column,
        store,
        appleLight,
        mockCtx as CanvasRenderingContext2D,
        { sampleRows: 3 }
      );

      expect(measuredTexts).toContain('Desc');
      expect(measuredTexts).toContain('First');
      // Should not contain the text from row index 4 because sampleRows is 3
      expect(
        measuredTexts.some((t) => t.includes('Very long text after sample limit'))
      ).toBe(false);
    });

    it('should format object values with JSON.stringify if plugin clipboard formatter is not present', () => {
      // Register a plugin without formatClipboard
      ColumnTypeRegistry.register({
        type: 'raw-object-type',
        paint: () => {},
      });

      const store = createMockStore([{ metadata: { key: 'value', active: true } }]);
      const column: ColumnDef = { id: 'metadata', title: 'Meta', type: 'raw-object-type', width: 100 };

      const measuredTexts: string[] = [];
      const mockCtx: Partial<CanvasRenderingContext2D> = {
        save: vi.fn(),
        restore: vi.fn(),
        font: '',
        measureText: vi.fn((text: string) => {
          measuredTexts.push(text);
          return { width: text.length * 6 } as TextMetrics;
        }),
      };

      ColumnManager.calculateBestFitWidth(
        column,
        store,
        appleLight,
        mockCtx as CanvasRenderingContext2D
      );

      expect(measuredTexts).toContain('{"key":"value","active":true}');
    });

    it('should clamp result between minWidth and maxWidth options', () => {
      const column: ColumnDef = { id: 'title', title: 'T', type: 'text', width: 80 };
      const store = createMockStore([{ title: 'X' }]);

      const mockCtx: Partial<CanvasRenderingContext2D> = {
        save: vi.fn(),
        restore: vi.fn(),
        font: '',
        measureText: vi.fn(() => ({ width: 10 } as TextMetrics)),
      };

      const clampedLow = ColumnManager.calculateBestFitWidth(
        column,
        store,
        appleLight,
        mockCtx as CanvasRenderingContext2D,
        { minWidth: 90 }
      );
      expect(clampedLow).toBe(90);

      const mockCtxHigh: Partial<CanvasRenderingContext2D> = {
        save: vi.fn(),
        restore: vi.fn(),
        font: '',
        measureText: vi.fn(() => ({ width: 1000 } as TextMetrics)),
      };

      const clampedHigh = ColumnManager.calculateBestFitWidth(
        column,
        store,
        appleLight,
        mockCtxHigh as CanvasRenderingContext2D,
        { maxWidth: 250 }
      );
      expect(clampedHigh).toBe(250);
    });
  });
});
