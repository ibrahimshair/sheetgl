// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React, { createRef } from 'react';
import { render, act } from '@testing-library/react';
import { SheetGL } from '../../src/datagrid/ui/SheetGL';
import { GridApi } from '../../src/datagrid/core/GridApi';
import { ColumnDef } from '../../src/datagrid/types/grid';
import { initDefaultColumnPlugins } from '../../src/datagrid/columns/initPlugins';
import { ExportEngine } from '../../src/datagrid/export/ExportEngine';

describe('GridApi Imperative Interface', () => {
  beforeEach(() => {
    initDefaultColumnPlugins();

    // Mock HTMLCanvasElement getContext
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
      save: vi.fn(),
      restore: vi.fn(),
      setTransform: vi.fn(),
      scale: vi.fn(),
      translate: vi.fn(),
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      clearRect: vi.fn(),
      rect: vi.fn(),
      beginPath: vi.fn(),
      closePath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      arc: vi.fn(),
      stroke: vi.fn(),
      fill: vi.fn(),
      clip: vi.fn(),
      roundRect: vi.fn(),
      fillText: vi.fn(),
      measureText: vi.fn().mockReturnValue({ width: 50 }),
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
      font: '',
      textAlign: 'left',
      textBaseline: 'top',
    });

    // Mock getBoundingClientRect for canvas and container
    HTMLCanvasElement.prototype.getBoundingClientRect = vi.fn().mockReturnValue({
      width: 800,
      height: 600,
      top: 0,
      left: 0,
      bottom: 600,
      right: 800,
      x: 0,
      y: 0,
      toJSON: () => {},
    });
  });

  const columns: ColumnDef[] = [
    { id: 'id', title: 'ID', type: 'number', width: 60, pinned: true },
    { id: 'name', title: 'Full Name', type: 'text', width: 150 },
    { id: 'email', title: 'Email Address', type: 'text', width: 200 },
    { id: 'role', title: 'Role', type: 'text', width: 120 },
    { id: 'department', title: 'Department', type: 'text', width: 140 },
  ];

  const testData = [
    { id: 1, name: 'Alice Smith', email: 'alice@example.com', role: 'Engineer', department: 'R&D' },
    { id: 2, name: 'Bob Jones', email: 'bob@example.com', role: 'Designer', department: 'Product' },
    { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', role: 'Manager', department: 'Operations' },
    { id: 4, name: 'Dana White', email: 'dana@example.com', role: 'VP', department: 'Executive' },
    { id: 5, name: 'Eve Black', email: 'eve@example.com', role: 'Security', department: 'SecOps' },
  ];

  it('should expose the complete GridApi interface via component ref', () => {
    const apiRef = createRef<GridApi>();
    render(<SheetGL ref={apiRef} columns={columns} dataSource={testData} />);

    expect(apiRef.current).not.toBeNull();
    const api = apiRef.current!;

    // Selection methods
    expect(typeof api.selectCell).toBe('function');
    expect(typeof api.selectRange).toBe('function');
    expect(typeof api.clearSelection).toBe('function');
    expect(typeof api.selectAll).toBe('function');
    expect(typeof api.getActiveCell).toBe('function');
    expect(typeof api.getSelectedRange).toBe('function');

    // Scroll & Viewport methods
    expect(typeof api.scrollTo).toBe('function');
    expect(typeof api.getScrollPosition).toBe('function');
    expect(typeof api.ensureCellVisible).toBe('function');
    expect(typeof api.requestRender).toBe('function');

    // Column geometry & manipulation methods
    expect(typeof api.setColumnWidth).toBe('function');
    expect(typeof api.getColumnWidth).toBe('function');
    expect(typeof api.getTotalWidth).toBe('function');
    expect(typeof api.getTotalHeight).toBe('function');
    expect(typeof api.setColumnVisibility).toBe('function');
    expect(typeof api.getHiddenColumns).toBe('function');
    expect(typeof api.setColumnOrder).toBe('function');
    expect(typeof api.getColumnOrder).toBe('function');
    expect(typeof api.moveColumn).toBe('function');

    // Filter, State & Export methods
    expect(typeof api.clearFilters).toBe('function');
    expect(typeof api.resetState).toBe('function');
    expect(typeof api.exportDataAsCsv).toBe('function');
    expect(typeof api.exportDataAsExcel).toBe('function');
    expect(typeof api.showToast).toBe('function');
    expect(typeof api.getStreamingEngine).toBe('function');
    expect(typeof api.applyTransaction).toBe('function');
  });

  describe('Selection API', () => {
    it('should select cell and update active cell coordinates', () => {
      const apiRef = createRef<GridApi>();
      render(<SheetGL ref={apiRef} columns={columns} dataSource={testData} />);
      const api = apiRef.current!;

      act(() => {
        api.selectCell(2, 3);
      });

      expect(api.getActiveCell()).toEqual({ row: 2, col: 3 });
      expect(api.getSelectedRange()).toEqual({ minRow: 2, maxRow: 2, minCol: 3, maxCol: 3 });
    });

    it('should select rectangular range and return normalized bounds', () => {
      const apiRef = createRef<GridApi>();
      render(<SheetGL ref={apiRef} columns={columns} dataSource={testData} />);
      const api = apiRef.current!;

      act(() => {
        api.selectRange(3, 4, 1, 2);
      });

      expect(api.getSelectedRange()).toEqual({ minRow: 1, maxRow: 3, minCol: 2, maxCol: 4 });
    });

    it('should clear selection back to origin', () => {
      const apiRef = createRef<GridApi>();
      render(<SheetGL ref={apiRef} columns={columns} dataSource={testData} />);
      const api = apiRef.current!;

      act(() => {
        api.selectCell(4, 2);
        api.clearSelection();
      });

      expect(api.getActiveCell()).toEqual({ row: 0, col: 0 });
    });

    it('should select all cells in grid', () => {
      const apiRef = createRef<GridApi>();
      render(<SheetGL ref={apiRef} columns={columns} dataSource={testData} />);
      const api = apiRef.current!;

      act(() => {
        api.selectAll();
      });

      const range = api.getSelectedRange();
      expect(range.minRow).toBe(0);
      expect(range.maxRow).toBe(testData.length - 1);
      expect(range.minCol).toBe(0);
      expect(range.maxCol).toBe(columns.length - 1);
    });
  });

  describe('Geometry and Scrolling API', () => {
    it('should compute virtual total width and total height', () => {
      const apiRef = createRef<GridApi>();
      render(<SheetGL ref={apiRef} columns={columns} dataSource={testData} rowHeight={32} />);
      const api = apiRef.current!;

      expect(api.getTotalWidth()).toBeGreaterThan(0);
      expect(api.getTotalHeight()).toBeGreaterThanOrEqual(testData.length * 32);
    });

    it('should update scroll position via scrollTo and getScrollPosition', () => {
      const apiRef = createRef<GridApi>();
      render(<SheetGL ref={apiRef} columns={columns} dataSource={testData} />);
      const api = apiRef.current!;

      act(() => {
        api.scrollTo({ top: 120, left: 80 });
      });

      const pos = api.getScrollPosition();
      expect(pos.top).toBe(120);
      expect(pos.left).toBe(80);
    });

    it('should invoke ensureCellVisible without errors', () => {
      const apiRef = createRef<GridApi>();
      render(<SheetGL ref={apiRef} columns={columns} dataSource={testData} />);
      const api = apiRef.current!;

      expect(() => {
        act(() => {
          api.ensureCellVisible(4, 3);
        });
      }).not.toThrow();
    });

    it('should update column width dynamically via setColumnWidth and getColumnWidth', () => {
      const apiRef = createRef<GridApi>();
      render(<SheetGL ref={apiRef} columns={columns} dataSource={testData} />);
      const api = apiRef.current!;

      act(() => {
        api.setColumnWidth('name', 280);
      });

      expect(api.getColumnWidth('name')).toBe(280);
    });
  });

  describe('Column Layout & Visibility API', () => {
    it('should hide and reveal columns via setColumnVisibility and getHiddenColumns', () => {
      const apiRef = createRef<GridApi>();
      render(<SheetGL ref={apiRef} columns={columns} dataSource={testData} />);

      act(() => {
        apiRef.current!.setColumnVisibility!('email', false);
      });

      expect(apiRef.current!.getHiddenColumns!()).toContain('email');

      act(() => {
        apiRef.current!.setColumnVisibility!('email', true);
      });

      expect(apiRef.current!.getHiddenColumns!()).not.toContain('email');
    });

    it('should reorder columns via setColumnOrder and getColumnOrder', () => {
      const apiRef = createRef<GridApi>();
      render(<SheetGL ref={apiRef} columns={columns} dataSource={testData} />);

      const newOrder = ['role', 'name', 'id', 'department', 'email'];
      act(() => {
        apiRef.current!.setColumnOrder!(newOrder);
      });

      expect(apiRef.current!.getColumnOrder!()).toEqual(newOrder);
    });

    it('should move column position relative to another column via moveColumn', () => {
      const apiRef = createRef<GridApi>();
      render(<SheetGL ref={apiRef} columns={columns} dataSource={testData} />);

      act(() => {
        apiRef.current!.moveColumn!('department', 'name', 'before');
      });

      const order = apiRef.current!.getColumnOrder!();
      const deptIdx = order.indexOf('department');
      const nameIdx = order.indexOf('name');
      expect(deptIdx).toBeLessThan(nameIdx);
    });

    it('should support autoSizeColumn and autoSizeAllColumns', () => {
      const apiRef = createRef<GridApi>();
      render(<SheetGL ref={apiRef} columns={columns} dataSource={testData} />);

      expect(() => {
        act(() => {
          apiRef.current!.autoSizeColumn!('name');
          apiRef.current!.autoSizeAllColumns!();
        });
      }).not.toThrow();
    });
  });

  describe('Filter & State Management API', () => {
    it('should clear filters and reset scroll position', async () => {
      const onFilterChange = vi.fn();
      const apiRef = createRef<GridApi>();
      render(<SheetGL ref={apiRef} columns={columns} dataSource={testData} onFilterChange={onFilterChange} />);
      const api = apiRef.current!;

      await act(async () => {
        await api.clearFilters();
      });

      expect(api.getScrollPosition().top).toBe(0);
      expect(onFilterChange).toHaveBeenCalled();
    });

    it('should reset grid state via resetState', async () => {
      const apiRef = createRef<GridApi>();
      render(<SheetGL ref={apiRef} columns={columns} dataSource={testData} storageKey="test-grid" />);
      const api = apiRef.current!;

      await act(async () => {
        await api.resetState();
      });

      expect(api.getScrollPosition()).toEqual({ top: 0, left: 0 });
    });
  });

  describe('Editing & Focus API', () => {
    it('should trigger startEditingCell and stopEditingCell without throwing', () => {
      const apiRef = createRef<GridApi>();
      render(<SheetGL ref={apiRef} columns={columns} dataSource={testData} />);
      const api = apiRef.current!;

      expect(() => {
        act(() => {
          api.startEditingCell!(1, 2, 'A');
          api.stopEditingCell!(true);
        });
      }).not.toThrow();
    });

    it('should focus cell and scroll into view via focusCell', () => {
      const apiRef = createRef<GridApi>();
      render(<SheetGL ref={apiRef} columns={columns} dataSource={testData} />);
      const api = apiRef.current!;

      act(() => {
        api.focusCell!(3, 'email');
      });

      expect(api.getActiveCell().row).toBe(3);
    });
  });

  describe('Streaming & Transactions API', () => {
    it('should return StreamingEngine instance and apply realtime transactions', async () => {
      const apiRef = createRef<GridApi>();
      render(<SheetGL ref={apiRef} columns={columns} dataSource={testData} />);
      const api = apiRef.current!;

      const streamingEngine = api.getStreamingEngine!();
      expect(streamingEngine).toBeDefined();

      await act(async () => {
        await api.applyTransaction!([{ id: 1, role: 'Principal Engineer' }]);
      });
    });
  });

  describe('Export API', () => {
    it('should trigger ExportEngine.exportAsCsv and ExportEngine.exportAsExcel', () => {
      const csvSpy = vi.spyOn(ExportEngine, 'exportAsCsv').mockImplementation(() => {});
      const excelSpy = vi.spyOn(ExportEngine, 'exportAsExcel').mockImplementation(() => {});

      const apiRef = createRef<GridApi>();
      render(<SheetGL ref={apiRef} columns={columns} dataSource={testData} />);
      const api = apiRef.current!;

      act(() => {
        api.exportDataAsCsv!('employees.csv');
      });
      expect(csvSpy).toHaveBeenCalledWith(expect.any(Array), expect.any(Object), 'employees.csv');

      act(() => {
        api.exportDataAsExcel!('employees.xlsx');
      });
      expect(excelSpy).toHaveBeenCalledWith(expect.any(Array), expect.any(Object), 'employees.xlsx');

      csvSpy.mockRestore();
      excelSpy.mockRestore();
    });
  });

  describe('Toasts & Render Triggers', () => {
    it('should trigger showToast and requestRender cleanly', () => {
      const apiRef = createRef<GridApi>();
      render(<SheetGL ref={apiRef} columns={columns} dataSource={testData} />);
      const api = apiRef.current!;

      expect(() => {
        act(() => {
          api.showToast!('Operation successful', 'success');
          api.requestRender();
        });
      }).not.toThrow();
    });
  });
});
