import { readdirSync } from 'node:fs';
import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const LAYERS = ['app', 'widgets', 'features', 'entities', 'shared'];

const ALLOWED_CROSS_IMPORTS = {
  entities: {
    account: ['transaction'],
    budget: ['category', 'transaction'],
    transaction: ['account', 'category'],
  },
};

const readSlices = (layer) => {
  try {
    return readdirSync(`./src/${layer}`, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);
  } catch {
    return [];
  }
};

const layerZones = LAYERS.flatMap((layer, index) =>
  LAYERS.slice(0, index).map((upperLayer) => ({
    target: `./src/${layer}`,
    from: `./src/${upperLayer}`,
    message: `${layer} cannot import from ${upperLayer}: imports only go down the layers.`,
  })),
);

const sliceZones = LAYERS.filter(
  (layer) => layer !== 'app' && layer !== 'shared',
).flatMap((layer) =>
  readSlices(layer).map((slice) => {
    const allowed = ALLOWED_CROSS_IMPORTS[layer]?.[slice] ?? [];
    return {
      target: `./src/${layer}/${slice}`,
      from: `./src/${layer}`,
      except: [...new Set([slice, ...allowed])].map((name) => `./${name}`),
      message: `${layer}/${slice} cannot import a sibling slice. Declare the cross-import in ALLOWED_CROSS_IMPORTS if it is deliberate.`,
    };
  }),
);

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
        { zones: [...layerZones, ...sliceZones] },
      ],
    },
  },
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
]);

export default eslintConfig;
