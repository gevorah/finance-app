import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const LAYERS = ['app', 'widgets', 'features', 'entities', 'shared'];

const layerZones = LAYERS.flatMap((layer, index) =>
  LAYERS.slice(0, index).map((upperLayer) => ({
    target: `./src/${layer}`,
    from: `./src/${upperLayer}`,
    message: `${layer} cannot import from ${upperLayer}: imports only go down the layers.`,
  })),
);

const sliceZones = (layer, slices, sharedSlices = []) =>
  slices.map((slice) => ({
    target: `./src/${layer}/${slice}`,
    from: `./src/${layer}`,
    except: [...new Set([slice, ...sharedSlices])].map((name) => `./${name}`),
    message: `${layer}/${slice} cannot import a sibling slice.`,
  }));

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    settings: {
      'import/resolver': { typescript: { project: './tsconfig.json' } },
    },
    rules: {
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            ...layerZones,
            ...sliceZones(
              'entities',
              ['account', 'budget', 'category', 'debt', 'transaction'],
              ['category'],
            ),
            ...sliceZones('features', [
              'budgets',
              'charts',
              'debts',
              'navbar',
              'navigation',
              'transactions',
            ]),
            ...sliceZones('widgets', ['app-shell', 'budget-summary']),
          ],
        },
      ],
    },
  },
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
]);

export default eslintConfig;
