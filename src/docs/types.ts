import React from 'react';
import { ColumnDef } from '../datagrid/types/grid';

export interface DocsPortalProps {
  isDark: boolean;
  lang: 'tr' | 'en';
  initialSection?: string;
  initialSectionId?: string;
  initialSubPath?: string;
  onSectionChange?: (sectionId: string, subPath?: string) => void;
  onToggleTheme: () => void;
  onToggleLang: () => void;
  onNavigateStudio?: () => void;
  onNavigateLanding?: () => void;
  onOpenStudio?: () => void;
  onOpenLanding?: () => void;
}

export interface DocSubItem {
  id: string;
  labelTr: string;
  labelEn: string;
  onSelect?: () => void;
  children?: DocSubItem[];
}

export interface DocSection {
  id: string;
  step: string;
  badgeTr: string;
  badgeEn: string;
  titleTr: string;
  titleEn: string;
  subtitleTr: string;
  subtitleEn: string;
  subItems: DocSubItem[];
  render: () => React.ReactNode;
}

export type ColumnCategory = 'all' | 'text' | 'numeric' | 'choice' | 'structured' | 'visual';

export interface ColumnGuideItem {
  type: string;
  colId: string;
  category: Exclude<ColumnCategory, 'all'>;
  categoryLabelTr: string;
  categoryLabelEn: string;
  titleTr: string;
  titleEn: string;
  dataType: string;
  sampleValue: string;
  summaryTr: string;
  summaryEn: string;
  editorTr: string;
  editorEn: string;
  propsList: Array<{ prop: string; type: string; descTr: string; descEn: string }>;
  sampleColumnDef: ColumnDef;
  sampleRows: Record<string, any>[];
  code: string;
}

export interface DocThemeColors {
  bg: string;
  sidebarBg: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  text: string;
  muted: string;
  accent: string;
  accentBg: string;
  codeBg: string;
  codeHeaderBg: string;
}

export function getDocThemeColors(isDark: boolean): DocThemeColors {
  return {
    bg: isDark ? '#0B0F19' : '#F8FAFC',
    sidebarBg: isDark ? '#070A12' : '#FFFFFF',
    surface: isDark ? '#111827' : '#FFFFFF',
    surfaceAlt: isDark ? '#1E293B' : '#F1F5F9',
    border: isDark ? '#1F2937' : '#E2E8F0',
    text: isDark ? '#F9FAFB' : '#0F172A',
    muted: isDark ? '#94A3B8' : '#475569',
    accent: isDark ? '#38BDF8' : '#0284C7',
    accentBg: isDark ? 'rgba(56, 189, 248, 0.14)' : 'rgba(2, 132, 199, 0.1)',
    codeBg: isDark ? '#070B14' : '#FFFFFF',
    codeHeaderBg: isDark ? '#111827' : '#F1F5F9',
  };
}
