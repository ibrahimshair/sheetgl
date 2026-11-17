import { describe, it, expect } from 'vitest';
import {
  RowGroupingEngine,
  isGroupRow,
  GroupAggregation,
  GroupRowMetadata,
} from '../../src/datagrid/utils/grouping/RowGroupingEngine';

describe('RowGroupingEngine', () => {
  interface Employee {
    id: number;
    name: string;
    department: string;
    role: string;
    country: string;
    city: string;
    salary: number;
  }

  const sampleData: Employee[] = [
    { id: 1, name: 'Alice', department: 'Engineering', role: 'Frontend', country: 'TR', city: 'Istanbul', salary: 60000 },
    { id: 2, name: 'Bob', department: 'Engineering', role: 'Backend', country: 'TR', city: 'Ankara', salary: 75000 },
    { id: 3, name: 'Charlie', department: 'Engineering', role: 'Frontend', country: 'DE', city: 'Berlin', salary: 80000 },
    { id: 4, name: 'Diana', department: 'Sales', role: 'Representative', country: 'TR', city: 'Istanbul', salary: 50000 },
    { id: 5, name: 'Edward', department: 'Sales', role: 'Manager', country: 'DE', city: 'Munich', salary: 90000 },
  ];

  describe('isGroupRow', () => {
    it('should return true for valid GroupRowMetadata objects', () => {
      const groupRow: GroupRowMetadata = {
        __isGroup: true,
        groupKey: 'department:Engineering',
        groupField: 'department',
        groupValue: 'Engineering',
        level: 0,
        childrenCount: 3,
        isExpanded: true,
      };
      expect(isGroupRow(groupRow)).toBe(true);
    });

    it('should return false for regular data rows, primitives, null and undefined', () => {
      expect(isGroupRow(sampleData[0])).toBe(false);
      expect(isGroupRow(null)).toBe(false);
      expect(isGroupRow(undefined)).toBe(false);
      expect(isGroupRow('some string')).toBe(false);
      expect(isGroupRow(123)).toBe(false);
      expect(isGroupRow({ __isGroup: false })).toBe(false);
    });
  });

  describe('formatGroupValue (static)', () => {
    it('should format null, undefined, and empty string as (Blank)', () => {
      expect(RowGroupingEngine.formatGroupValue(null)).toBe('(Blank)');
      expect(RowGroupingEngine.formatGroupValue(undefined)).toBe('(Blank)');
      expect(RowGroupingEngine.formatGroupValue('')).toBe('(Blank)');
    });

    it('should format non-empty arrays by joining elements with comma', () => {
      expect(RowGroupingEngine.formatGroupValue(['TR', 'DE', 'US'])).toBe('TR, DE, US');
      expect(RowGroupingEngine.formatGroupValue([])).toBe('(Blank)');
    });

    it('should format objects by joining key-value entries', () => {
      expect(RowGroupingEngine.formatGroupValue({ key: 'val', num: 1 })).toBe('key: val • num: 1');
      expect(RowGroupingEngine.formatGroupValue({})).toBe('(Blank)');
    });

    it('should convert numbers, booleans, and strings to string', () => {
      expect(RowGroupingEngine.formatGroupValue(100)).toBe('100');
      expect(RowGroupingEngine.formatGroupValue(true)).toBe('true');
      expect(RowGroupingEngine.formatGroupValue('Active')).toBe('Active');
    });
  });

  describe('computeAggregations (static)', () => {
    const aggs: GroupAggregation[] = [
      { field: 'salary', type: 'sum' },
      { field: 'salary', type: 'avg' },
      { field: 'salary', type: 'min' },
      { field: 'salary', type: 'max' },
      { field: 'id', type: 'count' },
    ];

    it('should return empty object if aggregations or items are empty', () => {
      expect(RowGroupingEngine.computeAggregations([], aggs)).toEqual({});
      expect(RowGroupingEngine.computeAggregations(sampleData, [])).toEqual({});
    });

    it('should compute sum, avg, min, max, and count accurately', () => {
      const engineeringRows = sampleData.slice(0, 3); // salaries: 60000, 75000, 80000
      const sumAgg: GroupAggregation[] = [{ field: 'salary', type: 'sum' }];
      const avgAgg: GroupAggregation[] = [{ field: 'salary', type: 'avg' }];
      const minAgg: GroupAggregation[] = [{ field: 'salary', type: 'min' }];
      const maxAgg: GroupAggregation[] = [{ field: 'salary', type: 'max' }];
      const countAgg: GroupAggregation[] = [{ field: 'salary', type: 'count' }];

      expect(RowGroupingEngine.computeAggregations(engineeringRows, sumAgg)).toEqual({ salary: 215000 });
      expect(RowGroupingEngine.computeAggregations(engineeringRows, avgAgg)).toEqual({ salary: 215000 / 3 });
      expect(RowGroupingEngine.computeAggregations(engineeringRows, minAgg)).toEqual({ salary: 60000 });
      expect(RowGroupingEngine.computeAggregations(engineeringRows, maxAgg)).toEqual({ salary: 80000 });
      expect(RowGroupingEngine.computeAggregations(engineeringRows, countAgg)).toEqual({ salary: 3 });
    });

    it('should skip non-numeric and null/undefined values in aggregation calculation', () => {
      const dirtyData = [
        { price: 100 },
        { price: null },
        { price: undefined },
        { price: 'invalid' },
        { price: '200' }, // parsed float
      ];
      const sumAgg: GroupAggregation[] = [{ field: 'price', type: 'sum' }];
      const avgAgg: GroupAggregation[] = [{ field: 'price', type: 'avg' }];

      const computedSum = RowGroupingEngine.computeAggregations(dirtyData, sumAgg);
      const computedAvg = RowGroupingEngine.computeAggregations(dirtyData, avgAgg);

      expect(computedSum).toEqual({ price: 300 });
      expect(computedAvg).toEqual({ price: 150 });
    });
  });

  describe('Configuration & State Management', () => {
    it('should initialize with default config and allow fluent configuration', () => {
      const engine = new RowGroupingEngine<Employee>();
      expect(engine.getGroupBy()).toEqual([]);
      expect(engine.getExpandedKeys().size).toBe(0);

      engine
        .setData(sampleData)
        .setGroupBy(['department'])
        .setAggregations([{ field: 'salary', type: 'sum' }])
        .setExpandedKeys(['department:Engineering']);

      expect(engine.getGroupBy()).toEqual(['department']);
      expect(engine.getExpandedKeys()).toEqual(new Set(['department:Engineering']));
    });

    it('should support defaultExpanded option in constructor', () => {
      const engineExpanded = new RowGroupingEngine({ defaultExpanded: true });
      expect(engineExpanded.isExpanded('any-key')).toBe(true);

      const engineCollapsed = new RowGroupingEngine({ defaultExpanded: false });
      expect(engineCollapsed.isExpanded('any-key')).toBe(false);
    });
  });

  describe('Single-level Grouping', () => {
    it('should return raw data if groupBy is empty', () => {
      const engine = new RowGroupingEngine<Employee>();
      engine.setData(sampleData).setGroupBy([]);

      const rows = engine.getFlattenedRows();
      expect(rows.length).toBe(sampleData.length);
      expect(rows).toEqual(sampleData);
    });

    it('should generate group header rows and nested items when expanded', () => {
      const engine = new RowGroupingEngine<Employee>({
        groupBy: ['department'],
        defaultExpanded: true,
      });
      engine.setData(sampleData);

      const rows = engine.getFlattenedRows();
      // 2 departments (Engineering has 3 items, Sales has 2 items)
      // Total visible: 1 (Eng Header) + 3 (items) + 1 (Sales Header) + 2 (items) = 7
      expect(rows.length).toBe(7);

      const engHeader = rows[0] as GroupRowMetadata;
      expect(isGroupRow(engHeader)).toBe(true);
      expect(engHeader.groupField).toBe('department');
      expect(engHeader.groupValue).toBe('Engineering');
      expect(engHeader.level).toBe(0);
      expect(engHeader.childrenCount).toBe(3);
      expect(engHeader.isExpanded).toBe(true);
      expect(engHeader.department).toBe('Engineering');

      // Next 3 items are the employees in Engineering
      expect(isGroupRow(rows[1])).toBe(false);
      expect((rows[1] as Employee).name).toBe('Alice');
      expect((rows[2] as Employee).name).toBe('Bob');
      expect((rows[3] as Employee).name).toBe('Charlie');

      // 4th item is Sales header
      const salesHeader = rows[4] as GroupRowMetadata;
      expect(isGroupRow(salesHeader)).toBe(true);
      expect(salesHeader.groupValue).toBe('Sales');
      expect(salesHeader.childrenCount).toBe(2);

      // Remaining 2 items are Sales employees
      expect((rows[5] as Employee).name).toBe('Diana');
      expect((rows[6] as Employee).name).toBe('Edward');
    });

    it('should only show group header rows when all groups are collapsed', () => {
      const engine = new RowGroupingEngine<Employee>({
        groupBy: ['department'],
        defaultExpanded: false,
      });
      engine.setData(sampleData);

      const rows = engine.getFlattenedRows();
      // Only 2 group header rows (Engineering, Sales)
      expect(rows.length).toBe(2);
      expect(isGroupRow(rows[0])).toBe(true);
      expect(isGroupRow(rows[1])).toBe(true);
      expect((rows[0] as GroupRowMetadata).isExpanded).toBe(false);
      expect((rows[1] as GroupRowMetadata).isExpanded).toBe(false);
    });

    it('should include live aggregations in group headers', () => {
      const engine = new RowGroupingEngine<Employee>({
        groupBy: ['department'],
        aggregations: [
          { field: 'salary', type: 'sum' },
          { field: 'id', type: 'count' },
        ],
      });
      engine.setData(sampleData);

      const rows = engine.getFlattenedRows();
      const engHeader = rows[0] as GroupRowMetadata;
      expect(engHeader.aggregations).toBeDefined();
      expect(engHeader.aggregations?.salary).toBe(215000); // 60000 + 75000 + 80000
      expect(engHeader.aggregations?.id).toBe(3);
    });
  });

  describe('Multi-level Grouping', () => {
    it('should generate hierarchical group keys and multiple levels', () => {
      const engine = new RowGroupingEngine<Employee>({
        groupBy: ['department', 'country'],
        defaultExpanded: true,
      });
      engine.setData(sampleData);

      const rows = engine.getFlattenedRows();
      // Level 0: Engineering
      const eng = rows[0] as GroupRowMetadata;
      expect(eng.level).toBe(0);
      expect(eng.groupKey).toBe('department:Engineering');

      // Level 1: Engineering -> TR
      const engTR = rows[1] as GroupRowMetadata;
      expect(engTR.level).toBe(1);
      expect(engTR.groupKey).toBe('department:Engineering|country:TR');
      expect(engTR.childrenCount).toBe(2); // Alice, Bob

      // Child rows for Eng -> TR
      expect((rows[2] as Employee).name).toBe('Alice');
      expect((rows[3] as Employee).name).toBe('Bob');

      // Level 1: Engineering -> DE
      const engDE = rows[4] as GroupRowMetadata;
      expect(engDE.level).toBe(1);
      expect(engDE.groupKey).toBe('department:Engineering|country:DE');
      expect(engDE.childrenCount).toBe(1); // Charlie
      expect((rows[5] as Employee).name).toBe('Charlie');
    });

    it('should hide all child subgroups and rows when a parent group is collapsed', () => {
      const engine = new RowGroupingEngine<Employee>({
        groupBy: ['department', 'country'],
        defaultExpanded: true,
      });
      engine.setData(sampleData);

      // Collapse Engineering parent group
      engine.collapseGroup('department:Engineering');

      const rows = engine.getFlattenedRows();
      // Engineering (collapsed) + Sales (expanded) + Sales children
      expect((rows[0] as GroupRowMetadata).groupKey).toBe('department:Engineering');
      expect((rows[0] as GroupRowMetadata).isExpanded).toBe(false);

      // The next row should be Sales header (level 0), skipping all Engineering children
      const sales = rows[1] as GroupRowMetadata;
      expect(sales.groupKey).toBe('department:Sales');
      expect(sales.level).toBe(0);
    });
  });

  describe('Expand / Collapse Toggles', () => {
    it('should toggle group expansion state correctly', () => {
      const engine = new RowGroupingEngine<Employee>({
        groupBy: ['department'],
        defaultExpanded: true,
      });
      engine.setData(sampleData);

      expect(engine.isExpanded('department:Engineering')).toBe(true);

      const newState1 = engine.toggleGroup('department:Engineering');
      expect(newState1).toBe(false);
      expect(engine.isExpanded('department:Engineering')).toBe(false);

      const newState2 = engine.toggleGroup('department:Engineering');
      expect(newState2).toBe(true);
      expect(engine.isExpanded('department:Engineering')).toBe(true);
    });

    it('should expandAll and collapseAll groups', () => {
      const engine = new RowGroupingEngine<Employee>({
        groupBy: ['department'],
        defaultExpanded: true,
      });
      engine.setData(sampleData);

      engine.collapseAll();
      expect(engine.getFlattenedRows().length).toBe(2);

      engine.expandAll();
      expect(engine.getFlattenedRows().length).toBe(7);
    });
  });

  describe('Caching & Invalidation', () => {
    it('should return cached flattened rows on consecutive calls until mutated', () => {
      const engine = new RowGroupingEngine<Employee>({ groupBy: ['department'] });
      engine.setData(sampleData);

      const firstResult = engine.getFlattenedRows();
      const secondResult = engine.getFlattenedRows();
      expect(firstResult).toBe(secondResult); // strict reference equality

      // Mutation invalidates cache
      engine.collapseGroup('department:Engineering');
      const thirdResult = engine.getFlattenedRows();
      expect(thirdResult).not.toBe(firstResult);
    });
  });

  describe('transform (static helper)', () => {
    it('should perform one-shot row grouping transformation', () => {
      const result = RowGroupingEngine.transform(sampleData, ['department'], {
        defaultExpanded: false,
        aggregations: [{ field: 'salary', type: 'sum' }],
      });

      expect(result.length).toBe(2);
      expect(isGroupRow(result[0])).toBe(true);
      expect((result[0] as GroupRowMetadata).aggregations?.salary).toBe(215000);
    });
  });
});
