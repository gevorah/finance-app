import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { NumberField } from './number-field';
import { TextField } from './text-field';

const render = (node: Parameters<typeof renderToStaticMarkup>[0]) =>
  renderToStaticMarkup(node);

/**
 * React Aria only renders a field's message once the field is marked invalid.
 * Passing errorMessage on its own leaves the form refusing to submit with
 * nothing on screen to explain why. Every field wrapper derives the flag the
 * same way, so proving two of them proves the wiring.
 */
describe('a field carrying an error message', () => {
  it('shows it on a text field', () => {
    const html = render(
      createElement(TextField, {
        label: 'Name',
        errorMessage: 'Name is required',
      }),
    );

    expect(html).toContain('Name is required');
  });

  it('shows it on a number field', () => {
    const html = render(
      createElement(NumberField, {
        label: 'Rate',
        errorMessage: 'Rate should be 0 or above',
      }),
    );

    expect(html).toContain('Rate should be 0 or above');
  });

  it('says nothing when there is no error', () => {
    const html = render(createElement(TextField, { label: 'Name' }));

    expect(html).not.toContain('aria-invalid="true"');
  });
});
