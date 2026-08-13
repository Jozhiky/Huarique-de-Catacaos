/**
 * Tokens de color institucionales oficiales — El Huarique de Catacaos
 * Especificación V1.2
 */
export const BRAND_COLORS = {
  navy: '#0B3156',
  gold: '#C3A55F',
  coastal: '#1677A6',
  cream: '#F6F0E4',
  sand: '#D9C79D'
} as const;

export const SEMANTIC_COLORS = {
  surface: '#FFFFFF',
  neutral900: '#1F2933',
  neutral600: '#5B6872',
  neutral200: '#DCE2E6',
  success: '#287A4B',
  warning: '#C98316',
  danger: '#B83838'
} as const;

export const TOKENS = {
  colors: {
    brand: BRAND_COLORS,
    semantic: SEMANTIC_COLORS
  },
  typography: {
    display: '"Barlow Condensed", sans-serif',
    sans: 'Inter, system-ui, -apple-system, sans-serif'
  },
  dimensions: {
    minTouchTargetPx: 48,
    borderRadiusCardPx: 14,
    borderRadiusTouchPx: 10
  }
} as const;
