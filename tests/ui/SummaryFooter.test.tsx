// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { SummaryFooter, SelectionSummaryStats } from '../../src/datagrid/ui/SummaryFooter';
import { ColumnDef } from '../../src/datagrid/types/grid';
import { appleLight } from '../../src/datagrid/theme/presets/appleLight';
import { trTR } from '../../src/datagrid/i18n/locales/trTR';
import { enUS } from '../../src/datagrid/i18n/locales/enUS';

describe('SummaryFooter Component', () => {
  const sampleColumns: ColumnDef[] = [
    { id: 'id', title: 'ID', type: 'number', width: 60 },
    { id: 'name', title: 'Name', type: 'text', width: 150 },
    { id: 'salary', title: 'Salary', type: 'number', width: 120, summaryType: 'sum' },
  ];

  it('should render selection summary statistics (Selected count, SUM, AVG, MIN, MAX) when count > 1', () => {
    const stats: SelectionSummaryStats = {
      count: 10,
      numericCount: 8,
      sum: 2400,
      avg: 300,
      min: 150,
      max: 600,
    };

    render(
      <SummaryFooter
        columns={sampleColumns}
        totalRowCount={100}
        selectionStats={stats}
        theme={appleLight}
        locale={enUS}
      />
    );

    expect(screen.getByText(/Selected \(10\)/i)).toBeDefined();
    expect(screen.getByText('2,400')).toBeDefined();
    expect(screen.getByText('300')).toBeDefined();
    expect(screen.getByText('150')).toBeDefined();
    expect(screen.getByText('600')).toBeDefined();
  });

  it('should render Turkish localized selection stats', () => {
    const stats: SelectionSummaryStats = {
      count: 5,
      numericCount: 5,
      sum: 1000,
      avg: 200,
      min: 50,
      max: 500,
    };

    render(
      <SummaryFooter
        columns={sampleColumns}
        totalRowCount={50}
        selectionStats={stats}
        theme={appleLight}
        locale={trTR}
      />
    );

    expect(screen.getByText(/Seçim \(5\)/i)).toBeDefined();
    expect(screen.getByText('1.000')).toBeDefined();
    expect(screen.getByText('200')).toBeDefined();
  });

  it('should not render selection stats bar when count <= 1', () => {
    const stats: SelectionSummaryStats = {
      count: 1,
      numericCount: 1,
      sum: 50,
      avg: 50,
      min: 50,
      max: 50,
    };

    render(
      <SummaryFooter
        columns={sampleColumns}
        totalRowCount={100}
        selectionStats={stats}
        theme={appleLight}
        locale={enUS}
      />
    );

    expect(screen.queryByText(/Selected \(1\)/i)).toBeNull();
  });

  it('should render column summaries in the pinned summary row', () => {
    render(
      <SummaryFooter
        columns={sampleColumns}
        totalRowCount={100}
        summaries={{ salary: 75000 }}
        summaryTypes={{ salary: 'sum' }}
        theme={appleLight}
        locale={enUS}
      />
    );

    expect(screen.getByText('SUM')).toBeDefined();
    expect(screen.getByText('75,000')).toBeDefined();
  });

  it('should format currency column summaries with currency symbol', () => {
    const currencyCols: ColumnDef[] = [
      { id: 'amount', title: 'Amount', type: 'currency', width: 120, currencySymbol: '€', summaryType: 'sum' },
    ];

    render(
      <SummaryFooter
        columns={currencyCols}
        totalRowCount={20}
        summaries={{ amount: 1250.5 }}
        theme={appleLight}
        locale={enUS}
      />
    );

    expect(screen.getByText('€1,250.50')).toBeDefined();
  });

  it('should trigger onChangeSummaryType when selecting an aggregation option from the popover', () => {
    const onChangeSummaryType = vi.fn();

    render(
      <SummaryFooter
        columns={sampleColumns}
        totalRowCount={100}
        summaries={{ salary: 75000 }}
        summaryTypes={{ salary: 'sum' }}
        onChangeSummaryType={onChangeSummaryType}
        theme={appleLight}
        locale={enUS}
      />
    );

    // Click on the summary cell
    const salaryVal = screen.getByText('75,000');
    fireEvent.click(salaryVal);

    // Popover appears with 'Average (AVG)'
    const avgButton = screen.getByText('Average (AVG)');
    fireEvent.click(avgButton);

    expect(onChangeSummaryType).toHaveBeenCalledWith('salary', 'avg');
  });

  it('should open summary settings modal when clicking the sigma button', () => {
    const onChangeSummaryType = vi.fn();
    render(
      <SummaryFooter
        columns={sampleColumns}
        totalRowCount={100}
        onChangeSummaryType={onChangeSummaryType}
        theme={appleLight}
        locale={enUS}
      />
    );

    const sigmaBtn = screen.getByTitle('Summary Settings');
    expect(sigmaBtn).toBeDefined();
    fireEvent.click(sigmaBtn);

    // Modal opens with 'Summary Row Configuration'
    expect(screen.getByText(/Summary Row Configuration/i)).toBeDefined();
  });
});
