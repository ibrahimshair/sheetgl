import React from 'react';
import { ColumnCategory, DocThemeColors } from '../types';
import { ColumnsOverviewPage } from './columns/ColumnsOverviewPage';
import { ColumnDetailPage } from './columns/ColumnDetailPage';

export interface ColumnsSectionProps {
  isDark: boolean;
  isTR: boolean;
  colors: DocThemeColors;
  colCategoryFilter: ColumnCategory;
  onCategoryFilterChange: (cat: ColumnCategory) => void;
  selectedColumnType: string | null;
  onSelectColumnType: (colType: string | null) => void;
}

export const ColumnsSection: React.FC<ColumnsSectionProps> = ({
  isDark,
  isTR,
  colors,
  colCategoryFilter,
  onCategoryFilterChange,
  selectedColumnType,
  onSelectColumnType,
}) => {
  if (selectedColumnType) {
    return (
      <ColumnDetailPage
        colType={selectedColumnType}
        isDark={isDark}
        isTR={isTR}
        colors={colors}
        onSelectColumnType={onSelectColumnType}
      />
    );
  }

  return (
    <ColumnsOverviewPage
      isDark={isDark}
      isTR={isTR}
      colors={colors}
      colCategoryFilter={colCategoryFilter}
      onCategoryFilterChange={onCategoryFilterChange}
      onSelectColumnType={(type) => onSelectColumnType(type)}
    />
  );
};
