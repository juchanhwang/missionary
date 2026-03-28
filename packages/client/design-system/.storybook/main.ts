import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

import svgr from 'vite-plugin-svgr';

import type { StorybookConfig } from '@storybook/react-vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  framework: '@storybook/react-vite',
  viteFinal(viteConfig) {
    return {
      ...viteConfig,
      plugins: [
        ...(viteConfig.plugins ?? []),
        svgr({
          svgrOptions: { exportType: 'default' },
          include: '**/*.svg',
        }),
      ],
      resolve: {
        ...viteConfig.resolve,
        alias: {
          '@assets': resolve(__dirname, '../src/assets'),
          '@components': resolve(__dirname, '../src/components'),
          '@context': resolve(__dirname, '../src/context'),
          '@hooks': resolve(__dirname, '../src/hooks'),
          '@styles': resolve(__dirname, '../src/styles'),
        },
      },
    };
  },
};

export default config;
