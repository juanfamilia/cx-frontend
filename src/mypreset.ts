import { definePreset } from '@primeng/themes';
import Aura from '@primeng/themes/aura';

// TODO: change primary color
export const MyPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#faf6fe',
      100: '#f3eafd',
      200: '#e9d8fc',
      300: '#d9baf8',
      400: '#c18ef2',
      500: '#aa62ea',
      600: '#9442db',
      700: '#7f30c0',
      800: '#6c2c9d',
      900: '#58257e',
      950: '#3b0f5c',
    },
    colorScheme: {
      dark: {
        surface: {
          950: '#1f2128',
        },
      },
    },
  },
});
