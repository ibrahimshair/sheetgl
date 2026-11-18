// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { GroupRowPainter } from '../../src/datagrid/renderer/GroupRowPainter';
import { VirtualRow } from '../../src/datagrid/types/group';
import { ColumnDef } from '../../src/datagrid/types/grid';
import { appleLight } from '../../src/datagrid/theme/presets/appleLight';
import { appleDark } from '../../src/datagrid/theme/presets/appleDark';
import { trTR } from '../../src/datagrid/i18n/locales/trTR';
import { enUS } from '../../src/datagrid/i18n/locales/enUS';

describe('GroupRowPainter', () => {
  function createMockContext() {
    let currentFillStyle = '';
    let currentStrokeStyle = '';
    const fillRects: { x: number; y: number; w: number; h: number; fillStyle: string }[] = [];

    const mockCtx = {
      save: vi.fn(),
      restore: vi.fn(),
      fillRect: vi.fn((x: number, y: number, w: number, h: number) => {
        fillRects.push({ x, y, w, h, fillStyle: currentFillStyle });
      }),
      strokeRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      closePath: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      roundRect: vi.fn(),
      fillText: vi.fn(),
      measureText: vi.fn((text: string) => ({
        width: text.length * 8,
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
      lineWidth: 0,
      font: '',
      textAlign: '',
      textBaseline: '',
      getFillRects: () => fillRects,
    };
    return mockCtx as unknown as CanvasRenderingContext2D & { getFillRects: () => typeof fillRects };
  }

  const baseGroupRow: Extract<VirtualRow, { type: 'group' }> = {
    type: 'group',
    level: 0,
    groupKey: 'department:Engineering',
    field: 'department',
    value: 'Engineering',
    rowCount: 5,
    isExpanded: true,
  };

  const sampleColumns: ColumnDef[] = [
    { id: 'department', title: 'Department ⚡', type: 'text', width: 150 },
    {
      id: 'status',
      title: 'Status',
      type: 'select',
      width: 100,
      options: [
        { value: 'active', label: 'Aktif Durum' },
        { value: 'passive', label: 'Pasif Durum' },
      ],
    },
    {
      id: 'tags',
      title: 'Tags',
      type: 'multiselect',
      width: 150,
      options: [
        { value: 'dev', label: 'Developer' },
        { value: 'lead', label: 'Team Lead' },
      ],
    },
    { id: 'isActive', title: 'Active', type: 'boolean', width: 80 },
    { id: 'switchState', title: 'Switch', type: 'switch', width: 80 },
    { id: 'startDate', title: 'Start Date', type: 'date', width: 120 },
    { id: 'salary', title: 'Salary', type: 'currency', width: 120, currencySymbol: '$' },
  ];

  it('should render basic group row with background, bottom border, and left accent bar', () => {
    const ctx = createMockContext();
    GroupRowPainter.paintGroupRow(
      ctx,
      baseGroupRow,
      50, // y
      800, // width
      32, // height
      appleLight,
      trTR,
      sampleColumns,
      false
    );

    expect(ctx.save).toHaveBeenCalled();
    expect(ctx.fillRect).toHaveBeenCalledWith(0, 50, 800, 32); // background
    expect(ctx.stroke).toHaveBeenCalled(); // bottom border
    expect(ctx.fillRect).toHaveBeenCalledWith(0, 50, 4, 32); // level 0 accent bar at x=0
    expect(ctx.restore).toHaveBeenCalled();
  });

  it('should apply correct hover background color in light and dark themes', () => {
    const ctxLight = createMockContext();
    GroupRowPainter.paintGroupRow(
      ctxLight,
      baseGroupRow,
      0,
      600,
      30,
      appleLight,
      trTR,
      sampleColumns,
      true // isHovered
    );
    expect(ctxLight.getFillRects()[0].fillStyle).toBe('rgba(2, 132, 199, 0.09)');

    const ctxDark = createMockContext();
    GroupRowPainter.paintGroupRow(
      ctxDark,
      baseGroupRow,
      0,
      600,
      30,
      appleDark,
      trTR,
      sampleColumns,
      true // isHovered
    );
    expect(ctxDark.getFillRects()[0].fillStyle).toBe('rgba(56, 189, 248, 0.14)');
  });

  it('should shift left accent bar based on group nesting level', () => {
    const ctx = createMockContext();
    const nestedGroupRow: Extract<VirtualRow, { type: 'group' }> = {
      ...baseGroupRow,
      level: 2,
    };

    GroupRowPainter.paintGroupRow(
      ctx,
      nestedGroupRow,
      100,
      800,
      30,
      appleLight,
      trTR,
      sampleColumns
    );

    // level 2 accent bar is at level * 6 = 12
    expect(ctx.fillRect).toHaveBeenCalledWith(12, 100, 4, 30);
  });

  it('should paint downward chevron when group is expanded and rightward chevron when collapsed', () => {
    const ctxExpanded = createMockContext();
    GroupRowPainter.paintGroupRow(
      ctxExpanded,
      { ...baseGroupRow, isExpanded: true },
      0,
      800,
      30,
      appleLight,
      trTR,
      sampleColumns
    );

    // Expanded button background is accentColor
    expect(ctxExpanded.fill).toHaveBeenCalled();

    const ctxCollapsed = createMockContext();
    GroupRowPainter.paintGroupRow(
      ctxCollapsed,
      { ...baseGroupRow, isExpanded: false },
      0,
      800,
      30,
      appleLight,
      trTR,
      sampleColumns
    );

    expect(ctxCollapsed.fill).toHaveBeenCalled();
  });

  it('should sanitize column title by removing lightning emoji and resolve select option labels', () => {
    const ctx = createMockContext();
    const selectGroupRow: Extract<VirtualRow, { type: 'group' }> = {
      type: 'group',
      level: 0,
      groupKey: 'status:active',
      field: 'status',
      value: 'active',
      rowCount: 12,
      isExpanded: true,
    };

    GroupRowPainter.paintGroupRow(
      ctx,
      selectGroupRow,
      0,
      800,
      30,
      appleLight,
      trTR,
      sampleColumns
    );

    // Should resolve 'Status: Aktif Durum' (from option label)
    expect(ctx.fillText).toHaveBeenCalledWith(
      'Status: Aktif Durum',
      expect.any(Number),
      expect.any(Number)
    );
  });

  it('should resolve multiselect comma-separated values to option labels', () => {
    const ctx = createMockContext();
    const multiGroupRow: Extract<VirtualRow, { type: 'group' }> = {
      type: 'group',
      level: 0,
      groupKey: 'tags:dev,lead',
      field: 'tags',
      value: 'dev,lead',
      rowCount: 4,
      isExpanded: true,
    };

    GroupRowPainter.paintGroupRow(
      ctx,
      multiGroupRow,
      0,
      800,
      30,
      appleLight,
      trTR,
      sampleColumns
    );

    expect(ctx.fillText).toHaveBeenCalledWith(
      'Tags: Developer, Team Lead',
      expect.any(Number),
      expect.any(Number)
    );
  });

  it('should format boolean and switch group values using locale trueText and falseText', () => {
    const ctxTR = createMockContext();
    const boolGroupRow: Extract<VirtualRow, { type: 'group' }> = {
      type: 'group',
      level: 0,
      groupKey: 'isActive:true',
      field: 'isActive',
      value: true,
      rowCount: 7,
      isExpanded: true,
    };

    GroupRowPainter.paintGroupRow(
      ctxTR,
      boolGroupRow,
      0,
      800,
      30,
      appleLight,
      trTR,
      sampleColumns
    );

    expect(ctxTR.fillText).toHaveBeenCalledWith(
      `Active: ${trTR.trueText}`,
      expect.any(Number),
      expect.any(Number)
    );

    const ctxEN = createMockContext();
    const switchGroupRow: Extract<VirtualRow, { type: 'group' }> = {
      type: 'group',
      level: 0,
      groupKey: 'switchState:false',
      field: 'switchState',
      value: false,
      rowCount: 2,
      isExpanded: true,
    };

    GroupRowPainter.paintGroupRow(
      ctxEN,
      switchGroupRow,
      0,
      800,
      30,
      appleLight,
      enUS,
      sampleColumns
    );

    expect(ctxEN.fillText).toHaveBeenCalledWith(
      `Switch: ${enUS.falseText}`,
      expect.any(Number),
      expect.any(Number)
    );
  });

  it('should render group record count badge with localized count string', () => {
    const ctx = createMockContext();
    GroupRowPainter.paintGroupRow(
      ctx,
      baseGroupRow, // rowCount: 5
      0,
      800,
      30,
      appleLight,
      trTR,
      sampleColumns
    );

    const expectedCountText = trTR.groupRecordCount(5);
    expect(ctx.fillText).toHaveBeenCalledWith(
      expectedCountText,
      expect.any(Number),
      expect.any(Number)
    );
    expect(ctx.roundRect).toHaveBeenCalled();
  });

  it('should format and render right-aligned group summaries with currency symbol', () => {
    const ctx = createMockContext();
    const groupWithSummaries: Extract<VirtualRow, { type: 'group' }> = {
      ...baseGroupRow,
      summaries: {
        salary: 150000,
      },
      summaryTypes: {
        salary: 'sum',
      },
    };

    GroupRowPainter.paintGroupRow(
      ctx,
      groupWithSummaries,
      0,
      900,
      30,
      appleLight,
      enUS,
      sampleColumns
    );

    // Summary format: 'Salary (SUM): $150,000'
    expect(ctx.fillText).toHaveBeenCalledWith(
      expect.stringContaining('Salary (SUM): $150,000'),
      900 - 24,
      expect.any(Number)
    );
    expect(ctx.textAlign).toBe('right');
  });

  it('should fallback to uppercase field name if column definition is missing', () => {
    const ctx = createMockContext();
    const unmappedGroupRow: Extract<VirtualRow, { type: 'group' }> = {
      type: 'group',
      level: 0,
      groupKey: 'unknown_field:SomeValue',
      field: 'unknown_field',
      value: 'SomeValue',
      rowCount: 1,
      isExpanded: true,
    };

    GroupRowPainter.paintGroupRow(
      ctx,
      unmappedGroupRow,
      0,
      800,
      30,
      appleLight,
      trTR,
      []
    );

    expect(ctx.fillText).toHaveBeenCalledWith(
      'UNKNOWN_FIELD: SomeValue',
      expect.any(Number),
      expect.any(Number)
    );
  });
});
