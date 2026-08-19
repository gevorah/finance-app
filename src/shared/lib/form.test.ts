import { describe, expect, it } from 'vitest';

import { collectErrorMessages } from './form';

describe('collectErrorMessages', () => {
  it('finds a message nested as deep as the schema goes', () => {
    const errors = {
      name: { message: 'Name is required' },
      paymentTerms: { installmentAmount: { message: 'Should be above 0' } },
      interest: { rate: { message: 'Rate should be 0 or above' } },
    };

    expect(collectErrorMessages(errors)).toEqual([
      'Name is required',
      'Should be above 0',
      'Rate should be 0 or above',
    ]);
  });

  it('says nothing when the form is clean', () => {
    expect(collectErrorMessages({})).toEqual([]);
    expect(collectErrorMessages(undefined)).toEqual([]);
  });

  it('ignores the bookkeeping react-hook-form hangs off an error', () => {
    const errors = {
      name: { type: 'too_small', ref: {}, message: 'Required' },
    };

    expect(collectErrorMessages(errors)).toEqual(['Required']);
  });
});
