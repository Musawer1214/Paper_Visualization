
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';

export type PaperTheme = 'quantum' | 'ai' | 'biology' | 'cosmos' | 'material' | 'general';

export interface KeyConcept {
  title: string;
  description: string;
  type: 'process' | 'structure' | 'abstract';
}

export interface PaperData {
  title: string;
  subtitle: string;
  journal?: string;
  date?: string;
  authors: { name: string; role: string }[];
  summary: string; // The "Introduction" text
  introTitle?: string;
  theme: PaperTheme;
  concepts: KeyConcept[];
  impact: string; // The "Impact" text
  url?: string;
}

export interface SectionProps {
  id: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}
