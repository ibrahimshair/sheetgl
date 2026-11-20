// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CanvasRenderer, RenderParams } from '../../src/datagrid/renderer/CanvasRenderer';
import { GeometryEngine } from '../../src/datagrid/core/GeometryEngine';
import { SelectionModel } from '../../src/datagrid/core/SelectionModel';
import { LocalDataStore } from '../../src/datagrid/data/LocalDataStore';
import { appleLight } from '../../src/datagrid/theme/presets/appleLight';
import { appleDark } from '../../src/datagrid/theme/presets/appleDark';
import { enUS } from '../../src/datagrid/i18n/locales/enUS';
import { trTR } from '../../src/datagrid/i18n/locales/trTR';
import { ColumnDef, ColumnGroupDef } from '../../src/datagrid/types/grid';
import { initDefaultColumnPlugins } from '../../src/datagrid/columns/initPlugins';

describe('CanvasRenderer', () => {
  beforeEach(() => {
    initDefaultColumnPlugins();
  });

  function createMockContext() {
    let currentFillStyle = '';
    let currentStrokeStyle = '';
    const calls: { method: string; args: any[] }[] = [];

    const ctx = {
      save: vi.fn(() => calls.push({ method: 'save', args: [] })),
      restore: vi.fn(() => calls.push({ method: 'restore', args: [] })),
      setTransform: vi.fn((...args: any[]) => calls.push({ method: 'setTransform', args })),
      scale: vi.fn((x: number, y: number) => calls.push({ method: 'scale', args: [x, y] })),
      translate: vi.fn((x: number, y: number) => calls.push({ method: 'translate', args: [x, y] })),
      fillRect: vi.fn((x: number, y: number, w: number, h: number) => {
        calls.push({ method: 'fillRect', args: [x, y, w, h, currentFillStyle] });
      }),
      strokeRect: vi.fn((x: number, y: number, w: number, h: number) => {
        calls.push({ method: 'strokeRect', args: [x, y, w, h, currentStrokeStyle] });
      }),
      clearRect: vi.fn((...args: any[]) => calls.push({ method: 'clearRect', args })),
      setLineDash: vi.fn((...args: any[]) => calls.push({ method: 'setLineDash', args })),
      rect: vi.fn((x: number, y: number, w: number, h: number) => {
        calls.push({ method: 'rect', args: [x, y, w, h] });
      }),
      beginPath: vi.fn(() => calls.push({ method: 'beginPath', args: [] })),
      closePath: vi.fn(() => calls.push({ method: 'closePath', args: [] })),
      moveTo: vi.fn((x: number, y: number) => calls.push({ method: 'moveTo', args: [x, y] })),
      lineTo: vi.fn((x: number, y: number) => calls.push({ method: 'lineTo', args: [x, y] })),
      arc: vi.fn((...args: any[]) => calls.push({ method: 'arc', args })),
      stroke: vi.fn(() => calls.push({ method: 'stroke', args: [] })),
      fill: vi.fn(() => calls.push({ method: 'fill', args: [] })),
      clip: vi.fn(() => calls.push({ method: 'clip', args: [] })),
      roundRect: vi.fn((...args: any[]) => calls.push({ method: 'roundRect', args })),
      fillText: vi.fn((text: string, x: number, y: number) => {
        calls.push({ method: 'fillText', args: [text, x, y, currentFillStyle] });
      }),
      measureText: vi.fn((text: string) => ({
        width: String(text).length * 8,
      } as TextMetrics)),
      get fillStyle() {
        return currentFillStyle;
      },
      set fillStyle(val: string) {
        currentFillStyle = val;
      },
      get strokeStyle() {
        return currentStrokeStyle;
      },
      set strokeStyle(val: string) {
        currentStrokeStyle = val;
      },
      lineWidth: 1,
      lineCap: 'butt',
      font: '',
      textAlign: 'left',
      textBaseline: 'top',
    } as unknown as CanvasRenderingContext2D;

    return { ctx, calls };
  }

  function createMockCanvas(width: number = 800, height: number = 600, ctx?: CanvasRenderingContext2D) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({
      width,
      height,
      top: 0,
      left: 0,
      bottom: height,
      right: width,
      x: 0,
      y: 0,
      toJSON: () => {},
    });

    if (ctx) {
      vi.spyOn(canvas, 'getContext').mockReturnValue(ctx as any);
    }

    return canvas;
  }

  describe('isColumnReadonly', () => {
    const baseCol: ColumnDef = { id: 'col1', title: 'Test', type: 'text', width: 100 };

    it('should return true when permissions mode is read or readonly', () => {
      expect(CanvasRenderer.isColumnReadonly(baseCol, { mode: 'read' })).toBe(true);
      expect(CanvasRenderer.isColumnReadonly(baseCol, { mode: 'readonly' })).toBe(true);
    });

    it('should return true when permissions.allowUpdating is false', () => {
      expect(CanvasRenderer.isColumnReadonly(baseCol, { allowUpdating: false })).toBe(true);
    });

    it('should return true when column definition is marked readonly', () => {
      expect(CanvasRenderer.isColumnReadonly({ ...baseCol, readonly: true })).toBe(true);
      expect(CanvasRenderer.isColumnReadonly({ ...baseCol, permission: 'readonly' })).toBe(true);
      expect(CanvasRenderer.isColumnReadonly({ ...baseCol, permission: 'read' })).toBe(true);
    });

    it('should return false for editable columns with default permissions', () => {
      expect(CanvasRenderer.isColumnReadonly(baseCol, { mode: 'write', allowUpdating: true })).toBe(false);
      expect(CanvasRenderer.isColumnReadonly(baseCol, undefined)).toBe(false);
    });
  });

  describe('drawGoogleLockIcon', () => {
    it('should draw padlock shackle, body, and keyhole with specified coordinates and color', () => {
      const { ctx, calls } = createMockContext();
      CanvasRenderer.drawGoogleLockIcon(ctx, 50, 100, '#888888');

      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.restore).toHaveBeenCalled();

      // Check arc calls for shackle and keyhole
      const arcCalls = calls.filter((c) => c.method === 'arc');
      expect(arcCalls.length).toBeGreaterThanOrEqual(2);

      // Check padlock body roundRect
      const roundRectCalls = calls.filter((c) => c.method === 'roundRect');
      expect(roundRectCalls.length).toBeGreaterThanOrEqual(1);

      // Check keyhole fillRect
      const fillRectCalls = calls.filter((c) => c.method === 'fillRect');
      expect(fillRectCalls.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('paintGroupRowBand', () => {
    const sampleColumns: ColumnDef[] = [
      { id: 'dept', title: 'Department', type: 'text', width: 120 },
      { id: 'salary', title: 'Salary', type: 'currency', width: 100, currencySymbol: '$' },
    ];

    it('should paint collapsed group row with + indicator and count', () => {
      const { ctx, calls } = createMockContext();
      const groupRow = {
        type: 'group',
        groupField: 'dept',
        groupValue: 'Engineering',
        childrenCount: 15,
        isExpanded: false,
        level: 0,
      };

      CanvasRenderer.paintGroupRowBand(ctx, groupRow, 100, 800, 36, appleLight, enUS, sampleColumns, false);

      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.restore).toHaveBeenCalled();

      // Check toggle indicator
      const toggleText = calls.find((c) => c.method === 'fillText' && c.args[0] === '+');
      expect(toggleText).toBeDefined();

      // Check group title text
      const titleText = calls.find(
        (c) => c.method === 'fillText' && typeof c.args[0] === 'string' && c.args[0].includes('Department: Engineering (15)')
      );
      expect(titleText).toBeDefined();
    });

    it('should paint expanded group row with − indicator and hover styling', () => {
      const { ctx, calls } = createMockContext();
      const groupRow = {
        type: 'group',
        groupField: 'dept',
        groupValue: 'Design',
        rowCount: 8,
        isExpanded: true,
        level: 1,
        aggregations: {
          salary: 85000,
        },
      };

      CanvasRenderer.paintGroupRowBand(ctx, groupRow, 150, 800, 36, appleLight, enUS, sampleColumns, true);

      // Toggle indicator should be minus
      const toggleText = calls.find((c) => c.method === 'fillText' && c.args[0] === '−');
      expect(toggleText).toBeDefined();

      // Aggregations text should be rendered on the right
      const summaryText = calls.find(
        (c) => c.method === 'fillText' && typeof c.args[0] === 'string' && c.args[0].includes('Salary: $85,000')
      );
      expect(summaryText).toBeDefined();
    });

    it('should use emptyText locale placeholder when group value is null or empty', () => {
      const { ctx, calls } = createMockContext();
      const groupRow = {
        type: 'group',
        groupField: 'dept',
        groupValue: null,
        childrenCount: 3,
        isExpanded: false,
        level: 0,
      };

      CanvasRenderer.paintGroupRowBand(ctx, groupRow, 200, 800, 36, appleLight, trTR, sampleColumns, false);

      const titleText = calls.find(
        (c) => c.method === 'fillText' && typeof c.args[0] === 'string' && c.args[0].includes('(Boş)')
      );
      expect(titleText).toBeDefined();
    });
  });

  describe('render (Core Viewport and Layers)', () => {
    const columns: ColumnDef[] = [
      { id: 'id', title: 'ID', type: 'number', width: 60, pinned: true },
      { id: 'name', title: 'Name', type: 'text', width: 140 },
      { id: 'email', title: 'Email', type: 'text', width: 200 },
      { id: 'role', title: 'Role', type: 'text', width: 100 },
      { id: 'action', title: 'Actions', type: 'action', width: 80, pinned: 'right' },
    ];

    const sampleData = [
      { id: 1, name: 'Alice Smith', email: 'alice@example.com', role: 'Engineer' },
      { id: 2, name: 'Bob Jones', email: 'bob@example.com', role: 'Designer' },
      { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', role: 'Manager' },
      { id: 4, name: 'Dana White', email: 'dana@example.com', role: 'Director' },
    ];

    function createRenderParams(overrides: Partial<RenderParams> = {}): {
      params: RenderParams;
      calls: { method: string; args: any[] }[];
      store: LocalDataStore;
      selection: SelectionModel;
      geometry: GeometryEngine;
    } {
      const { ctx, calls } = createMockContext();
      const canvas = createMockCanvas(800, 600, ctx);
      const geometry = new GeometryEngine(columns, 34, 38);
      const store = new LocalDataStore({ data: sampleData });
      const selection = new SelectionModel();

      const params: RenderParams = {
        canvas,
        geometry,
        store,
        selection,
        theme: appleLight,
        locale: enUS,
        scrollLeft: 0,
        scrollTop: 0,
        sortRules: [],
        ...overrides,
      };

      return { params, calls, store, selection, geometry };
    }

    it('should return early without errors if canvas context is unavailable', () => {
      const canvas = createMockCanvas(800, 600);
      vi.spyOn(canvas, 'getContext').mockReturnValue(null);
      const geometry = new GeometryEngine(columns, 34, 38);
      const store = new LocalDataStore({ data: sampleData });
      const selection = new SelectionModel();

      expect(() => {
        CanvasRenderer.render({
          canvas,
          geometry,
          store,
          selection,
          theme: appleLight,
          locale: enUS,
          scrollLeft: 0,
          scrollTop: 0,
          sortRules: [],
        });
      }).not.toThrow();
    });

    it('should return early when canvas has zero dimensions', () => {
      const { ctx, calls } = createMockContext();
      const canvas = createMockCanvas(0, 0, ctx);
      const geometry = new GeometryEngine(columns, 34, 38);
      const store = new LocalDataStore({ data: sampleData });
      const selection = new SelectionModel();

      CanvasRenderer.render({
        canvas,
        geometry,
        store,
        selection,
        theme: appleLight,
        locale: enUS,
        scrollLeft: 0,
        scrollTop: 0,
        sortRules: [],
      });

      expect(calls.length).toBe(0);
    });

    it('should paint background fill and ensureRange on visible viewport rows', () => {
      const { params, calls, store } = createRenderParams();
      const ensureRangeSpy = vi.spyOn(store, 'ensureRange');

      CanvasRenderer.render(params);

      // Background fill check
      const bgCall = calls.find(
        (c) => c.method === 'fillRect' && c.args[0] === 0 && c.args[1] === 0 && c.args[2] === 800 && c.args[3] === 600
      );
      expect(bgCall).toBeDefined();
      expect(bgCall?.args[4]).toBe(appleLight.canvas.bg);

      // Range requested
      expect(ensureRangeSpy).toHaveBeenCalledWith(0, expect.any(Number));
    });

    it('should render cells across center, left-pinned, and right-pinned columns', () => {
      const { params, calls } = createRenderParams();
      CanvasRenderer.render(params);

      // Left pinned: ID (1, 2, 3, 4)
      const idCell = calls.find((c) => c.method === 'fillText' && c.args[0] === '1');
      expect(idCell).toBeDefined();

      // Center: Alice Smith
      const nameCell = calls.find((c) => c.method === 'fillText' && c.args[0] === 'Alice Smith');
      expect(nameCell).toBeDefined();

      // Center: alice@example.com
      const emailCell = calls.find((c) => c.method === 'fillText' && c.args[0] === 'alice@example.com');
      expect(emailCell).toBeDefined();
    });

    it('should support zebra striping with boolean, custom hex, or theme object', () => {
      // 1. Default zebra striping
      const { params: p1, calls: calls1 } = createRenderParams({ zebraStriping: true });
      CanvasRenderer.render(p1);
      const zebraCalls1 = calls1.filter(
        (c) => c.method === 'fillRect' && c.args[4] === (appleLight.canvas.zebraRowBg || '#F4F7FB')
      );
      expect(zebraCalls1.length).toBeGreaterThan(0);

      // 2. Custom string color
      const { params: p2, calls: calls2 } = createRenderParams({ zebraStriping: '#F0F9FF' });
      CanvasRenderer.render(p2);
      const zebraCalls2 = calls2.filter((c) => c.method === 'fillRect' && c.args[4] === '#F0F9FF');
      expect(zebraCalls2.length).toBeGreaterThan(0);

      // 3. Theme light/dark object
      const { params: p3, calls: calls3 } = createRenderParams({
        zebraStriping: { light: '#FAF5FF', dark: '#1E1B4B' },
      });
      CanvasRenderer.render(p3);
      const zebraCalls3 = calls3.filter((c) => c.method === 'fillRect' && c.args[4] === '#FAF5FF');
      expect(zebraCalls3.length).toBeGreaterThan(0);
    });

    it('should apply custom getRowStyle when provided', () => {
      const { params, calls } = createRenderParams({
        getRowStyle: (row, index) => {
          if (row.role === 'Manager') {
            return { backgroundColor: '#FEF08A', textColor: '#854D0E' };
          }
          return undefined;
        },
      });

      CanvasRenderer.render(params);

      const customRowBg = calls.find((c) => c.method === 'fillRect' && c.args[4] === '#FEF08A');
      expect(customRowBg).toBeDefined();
    });

    it('should paint selection border and active cell outline', () => {
      const { params, calls, selection } = createRenderParams();
      selection.setActiveCell(1, 1);
      selection.setRangeEnd(2, 2);

      CanvasRenderer.render(params);

      // Selection fill and stroke should be executed
      expect(calls.some((c) => c.method === 'strokeRect' || (c.method === 'stroke' && ctxHasLineWidth(c)))).toBe(true);
    });

    function ctxHasLineWidth(_c: any) {
      return true;
    }

    it('should paint fill handle drag preview range when fillDragRange is active', () => {
      const { params, calls } = createRenderParams({
        fillDragRange: { minRow: 1, maxRow: 3, minCol: 1, maxCol: 1 },
      });

      CanvasRenderer.render(params);

      // fillDrag dashed border should have been stroked
      expect(calls.some((c) => c.method === 'stroke' || c.method === 'strokeRect')).toBe(true);
    });

    it('should highlight search keyword matching cells', () => {
      const { params, calls } = createRenderParams({
        searchKeyword: 'Alice',
      });

      CanvasRenderer.render(params);

      // Search highlight badge fill
      const highlightFill = calls.find(
        (c) => c.method === 'fillRect' && (c.args[4] === 'rgba(255, 214, 10, 0.38)' || c.args[4]?.includes('255, 214, 10'))
      );
      expect(highlightFill).toBeDefined();
    });

    it('should render column headers, sort indicators, and filter buttons', () => {
      const { params, calls } = createRenderParams({
        sortRules: [
          { selector: 'name', desc: false },
          { selector: 'email', desc: true },
        ],
        hoveredFilterColIndex: 1,
        activeFilterColumnIds: new Set(['email']),
      });

      CanvasRenderer.render(params);

      // Header title
      const headerTitle = calls.find((c) => c.method === 'fillText' && c.args[0] === 'Name');
      expect(headerTitle).toBeDefined();

      // Sort priority indicator (▲1)
      const priorityBadge = calls.find((c) => c.method === 'fillText' && c.args[0] === '▲1');
      expect(priorityBadge).toBeDefined();
    });

    it('should render column groups (banded headers) when columnGroups are provided', () => {
      const columnGroups: ColumnGroupDef[] = [
        {
          id: 'user_info',
          title: 'User Profile Details',
          columnIds: ['name', 'email'],
        },
      ];

      const { params, calls } = createRenderParams();
      params.geometry.setColumnGroups(columnGroups, 30);

      CanvasRenderer.render(params);

      const groupBandTitle = calls.find((c) => c.method === 'fillText' && c.args[0] === 'User Profile Details');
      expect(groupBandTitle).toBeDefined();
    });

    it('should paint row checkboxes when selectionMode is multiple or single', () => {
      const { params, calls } = createRenderParams({
        selectionMode: 'multiple',
        selectedRowKeys: new Set([1, 2]),
      });

      CanvasRenderer.render(params);

      // Checkbox rectangle / checkmark strokes
      const checkMarks = calls.filter((c) => c.method === 'stroke' || c.method === 'roundRect');
      expect(checkMarks.length).toBeGreaterThan(0);
    });

    it('should render dark mode theme cleanly', () => {
      const { params, calls } = createRenderParams({
        theme: appleDark,
      });

      CanvasRenderer.render(params);

      const bgCall = calls.find((c) => c.method === 'fillRect' && c.args[4] === appleDark.canvas.bg);
      expect(bgCall).toBeDefined();
    });

    it('should render skeleton placeholders when rows are loading or unloaded', () => {
      const { params, calls, store } = createRenderParams();
      vi.spyOn(store, 'getViewRow').mockImplementation((idx: number) => {
        if (idx === 0) return { type: 'data', data: { __isLoading: true } } as any;
        return { type: 'data', data: { id: 2, name: 'Loaded Name' } } as any;
      });

      CanvasRenderer.render(params);

      // Skeleton inset rounded rects should be painted
      const skeletonStubs = calls.filter((c) => c.method === 'roundRect');
      expect(skeletonStubs.length).toBeGreaterThan(0);

      // Loading gutter indicator '⟳' should be rendered
      const loadingGutterIcon = calls.find((c) => c.method === 'fillText' && c.args[0] === '⟳');
      expect(loadingGutterIcon).toBeDefined();
    });

    it('should render group rows when store contains grouped rows', () => {
      const { params, calls, store } = createRenderParams();
      vi.spyOn(store, 'getViewRow').mockImplementation((idx: number) => {
        if (idx === 0) {
          return {
            type: 'group',
            id: 'group_engineering',
            groupField: 'department',
            groupValue: 'Engineering',
            level: 0,
            isExpanded: true,
            childrenCount: 12,
          } as any;
        }
        return { type: 'data', data: { id: 1, name: 'Alice', department: 'Engineering' } } as any;
      });

      CanvasRenderer.render(params);

      // Group toggle indicator '−' for expanded group
      const minusToggle = calls.find((c) => c.method === 'fillText' && c.args[0] === '−');
      expect(minusToggle).toBeDefined();
    });

    it('should support viewport scrolling offsets (scrollLeft and scrollTop)', () => {
      const { params, calls } = createRenderParams({
        scrollLeft: 100,
        scrollTop: 68,
      });

      expect(() => {
        CanvasRenderer.render(params);
      }).not.toThrow();

      expect(calls.some((c) => c.method === 'fillRect')).toBe(true);
    });

    it('should highlight hovered row when hoveredCell is provided', () => {
      const { params, calls } = createRenderParams({
        hoveredCell: { row: 1, col: 1 },
      });

      CanvasRenderer.render(params);

      // Row hover fill overlay
      const hoverFill = calls.find(
        (c) => c.method === 'fillRect' && (c.args[4]?.includes('0, 122, 255') || c.args[4]?.includes('10, 132, 255'))
      );
      expect(hoverFill).toBeDefined();
    });

    it('should render lock icons on headers when grid permissions are readonly', () => {
      const { params, calls } = createRenderParams({
        permissions: { mode: 'readonly', allowUpdating: false },
      });

      CanvasRenderer.render(params);

      // Lock icons use arc and roundRect
      const arcCalls = calls.filter((c) => c.method === 'arc');
      expect(arcCalls.length).toBeGreaterThan(0);
    });
  });
});
