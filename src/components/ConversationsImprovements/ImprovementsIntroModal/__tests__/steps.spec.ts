import { describe, expect, it } from 'vitest';

import { getHelpGuideUrl } from '../steps';

describe('getHelpGuideUrl', () => {
  it('returns the English help article for en', () => {
    expect(getHelpGuideUrl('en')).toBe(
      'https://help.vtex.com/en/docs/tutorials/audit-improvements-backlog',
    );
  });

  it('returns the Spanish help article for es', () => {
    expect(getHelpGuideUrl('es')).toBe(
      'https://help.vtex.com/es/docs/tutorials/auditoria-backlog-de-mejoras',
    );
  });

  it('returns the Portuguese help article for pt-br', () => {
    expect(getHelpGuideUrl('pt-br')).toBe(
      'https://help.vtex.com/pt/docs/tutorials/auditoria-backlog-de-melhorias',
    );
  });

  it('falls back to the English help article for locales without a dedicated article', () => {
    expect(getHelpGuideUrl('ro')).toBe(
      'https://help.vtex.com/en/docs/tutorials/audit-improvements-backlog',
    );
  });
});
