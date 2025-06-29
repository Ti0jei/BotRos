// theme.ts
import { MantineThemeOverride } from '@mantine/core';

export const theme: MantineThemeOverride = {
  fontFamily: 'Inter, sans-serif',
  primaryColor: 'pink',
  colors: {
    pink: [
      '#fff0f6', '#ffdeeb', '#fcc2d7', '#faa2c1',
      '#f783ac', '#f06595', '#e64980', '#d6336c',
      '#c2255c', '#a61e4d',
    ],
  },
  components: {
    Button: {
      defaultProps: {
        radius: 'xl',
        size: 'md',
      },
    },
    Card: {
      defaultProps: {
        radius: 'xl',
        padding: 'lg',
        shadow: 'sm',
      },
    },
    Paper: {
      defaultProps: {
        radius: 'xl',
        p: 'lg',
        shadow: 'xs',
      },
      styles: {
        root: {
          backgroundColor: '#fff0f6',
        },
      },
    },
    Input: {
      defaultProps: {
        radius: 'md',
        size: 'md',
      },
    },
    TextInput: {
      defaultProps: {
        radius: 'md',
        size: 'md',
      },
    },
  },
};
