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

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    settings: {
      'import/resolver': { typescript: { project: './tsconfig.json' } },
    },
    rules: {
      'import/no-restricted-paths': ['error', { zones: layerZones }],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/entities/*/**'],
              message: 'Import an entity through its public API (index.ts).',
            },
          ],
        },
      ],
    },
  },
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
]);

export default eslintConfig;
