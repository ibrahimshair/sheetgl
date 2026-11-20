// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { SkeletonPainter } from '../../src/datagrid/renderer/SkeletonPainter';
import { appleLight } from '../../src/datagrid/theme/presets/appleLight';
import { appleDark } from '../../src/datagrid/theme/presets/appleDark';

describe('SkeletonPainter', () => {
  function createMockCtx() {
    let currentFillStyle = '';
    let currentStrokeStyle = '';
    const calls: { method: string; args: any[] }[] = [];

    const ctx = {
      save: vi.fn(() => calls.push({ method: 'save', args: [] })),
      restore: vi.fn(() => calls.push({ method: 'restore', args: [] })),
      fillRect: vi.fn((x: number, y: number, w: number, h: number) => {
        calls.push({ method: 'fillRect', args: [x, y, w, h, currentFillStyle] });
      }),
      beginPath: vi.fn(() => calls.push({ method: 'beginPath', args: [] })),
      moveTo: vi.fn((x: number, y: number) => calls.push({ method: 'moveTo', args: [x, y] })),
      lineTo: vi.fn((x: number, y: number) => calls.push({ method: 'lineTo', args: [x, y] })),
      stroke: vi.fn(() => calls.push({ method: 'stroke', args: [] })),
      fill: vi.fn(() => calls.push({ method: 'fill', args: [] })),
      roundRect: vi.fn((x: number, y: number, w: number, h: number, r: number) => {
        calls.push({ method: 'roundRect', args: [x, y, w, h, r] });
      }),
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
    } as unknown as CanvasRenderingContext2D;

    return { ctx, calls };
  }

  it('should return early without painting when width or height is <= 0', () => {
    const { ctx, calls } = createMockCtx();
    SkeletonPainter.paintSkeletonCell(ctx, 0, 0, 0, 34, appleLight);
    expect(calls.length).toBe(0);

    SkeletonPainter.paintSkeletonCell(ctx, 0, 0, 100, 0, appleLight);
    expect(calls.length).toBe(0);
  });

  it('should paint base cell background and grid lines in light theme', () => {
    const { ctx, calls } = createMockCtx();
    SkeletonPainter.paintSkeletonCell(ctx, 10, 20, 120, 34, appleLight);

    expect(ctx.save).toHaveBeenCalled();
    expect(ctx.restore).toHaveBeenCalled();

    // Base background fill
    const bgFill = calls.find((c) => c.method === 'fillRect');
    expect(bgFill).toBeDefined();
    expect(bgFill?.args[0]).toBe(10);
    expect(bgFill?.args[1]).toBe(20);
    expect(bgFill?.args[2]).toBe(120);
    expect(bgFill?.args[3]).toBe(34);
    expect(bgFill?.args[4]).toBe(appleLight.canvas.bg);

    // Grid stroke
    expect(ctx.beginPath).toHaveBeenCalled();
    expect(ctx.stroke).toHaveBeenCalled();
    expect(ctx.strokeStyle).toBe(appleLight.canvas.gridLine);

    // Inset rounded rect skeleton stub
    const stub = calls.find((c) => c.method === 'roundRect');
    expect(stub).toBeDefined();
    expect(stub?.args[0]).toBe(10 + 8); // x + padX
    expect(stub?.args[4]).toBe(4); // corner radius 4
  });

  it('should paint with dark theme skeleton colors', () => {
    const { ctx, calls } = createMockCtx();
    SkeletonPainter.paintSkeletonCell(ctx, 0, 0, 80, 30, appleDark);

    const bgFill = calls.find((c) => c.method === 'fillRect');
    expect(bgFill?.args[4]).toBe(appleDark.canvas.bg);

    const stub = calls.find((c) => c.method === 'roundRect');
    expect(stub).toBeDefined();
    expect(ctx.fillStyle).toBe(appleDark.canvas.skeletonBar || '#333333');
  });
});
