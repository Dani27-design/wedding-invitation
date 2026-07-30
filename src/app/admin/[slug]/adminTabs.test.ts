import { describe, expect, it } from 'vitest';
import { ADMIN_TABS } from './adminTabs';

describe('ADMIN_TABS', () => {
  it('places Pesan before Tamu and Tamu before Preview', () => {
    const labels = ADMIN_TABS.map(tab => tab.label);

    expect(labels.indexOf('Pesan')).toBeLessThan(labels.indexOf('Tamu'));
    expect(labels.indexOf('Tamu')).toBeLessThan(labels.indexOf('Preview'));
  });
});
