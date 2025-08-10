import { definePreset } from '@primeng/themes';
import Aura from '@primeng/themes/aura';

export const MyPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#effaf4',
      100: '#d8f3e2',
      200: '#b3e7ca',
      300: '#68cb9a',
      400: '#4dba87',
      500: '#2b9e6d',
      600: '#1c7f56',
      700: '#166647',
      800: '#14513a',
      900: '#114331',
      950: '#09251b',
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
