// GENERATED FILE: do not edit by hand.
// Source: spec/design/brand/tokens.json. Regenerate with `npm run generate:theme`.
// spec: design/tokens.md

export const palette = {
  "nacht": "#0F1412",
  "eis": "#E8EEEA",
  "mint": "#7CF5C0",
  "gletscherblau": "#1D3A3F",
  "nebel": "#9BB0AC",
  "schiefer": "#17201D",
  "linie": "#2A3733",
  "senf": "#F4C542",
  "koralle": "#FF8A80",
  "moos": "#5F6E52",
  "schiefer-blau": "#3C4A5E",
  "nebel-hell": "#56635F",
  "weiss": "#FFFFFF"
} as const;

export const themeColors = {
  "dark": {
    "background": "#0F1412",
    "card": "#17201D",
    "text": "#E8EEEA",
    "textSecondary": "#9BB0AC",
    "surfaceSecondary": "#1D3A3F",
    "accent": "#7CF5C0",
    "onAccent": "#0F1412",
    "input": "#17201D",
    "inputBorder": "#2A3733",
    "divider": "#2A3733",
    "success": "#7CF5C0",
    "warning": "#F4C542",
    "error": "#FF8A80",
    "hint": "#9BB0AC"
  },
  "light": {
    "background": "#E8EEEA",
    "card": "#FFFFFF",
    "text": "#0F1412",
    "textSecondary": "#56635F",
    "surfaceSecondary": "#1D3A3F",
    "accent": "#7CF5C0",
    "onAccent": "#0F1412",
    "success": "#7CF5C0",
    "warning": "#F4C542",
    "error": "#FF8A80",
    "hint": "#56635F"
  }
} as const;

export const fontStacks = {
  "base": [
    "Archivo",
    "Helvetica",
    "Arial",
    "sans-serif"
  ],
  "wordmark": [
    "Fraunces",
    "serif"
  ]
} as const;

export const textStyles = {
  "hero": {
    "fontFamily": "Archivo",
    "fontSize": 56,
    "fontWeight": 700,
    "lineHeightRatio": 1,
    "letterSpacingEm": -0.03
  },
  "h1": {
    "fontFamily": "Archivo",
    "fontSize": 40,
    "fontWeight": 700,
    "lineHeightRatio": 1.02,
    "letterSpacingEm": -0.03
  },
  "h2": {
    "fontFamily": "Archivo",
    "fontSize": 32,
    "fontWeight": 700,
    "lineHeightRatio": 1.05,
    "letterSpacingEm": -0.03
  },
  "h3": {
    "fontFamily": "Archivo",
    "fontSize": 24,
    "fontWeight": 600,
    "lineHeightRatio": 1.1,
    "letterSpacingEm": -0.03
  },
  "cardTitle": {
    "fontFamily": "Archivo",
    "fontSize": 20,
    "fontWeight": 600,
    "lineHeightRatio": 1.1
  },
  "body": {
    "fontFamily": "Archivo",
    "fontSize": 16,
    "fontWeight": 400,
    "lineHeightRatio": 1.5
  },
  "small": {
    "fontFamily": "Archivo",
    "fontSize": 14,
    "fontWeight": 400,
    "lineHeightRatio": 1.45
  },
  "meta": {
    "fontFamily": "Archivo",
    "fontSize": 13,
    "fontWeight": 400
  },
  "button": {
    "fontFamily": "Archivo",
    "fontSize": 18,
    "fontWeight": 700
  },
  "label": {
    "fontFamily": "Archivo",
    "fontSize": 11,
    "fontWeight": 600,
    "letterSpacingEm": 0.08,
    "textTransform": "uppercase"
  }
} as const;

export const space = {
  "1": 4,
  "2": 8,
  "3": 12,
  "4": 16,
  "5": 20,
  "6": 24,
  "7": 32,
  "page": 20
} as const;

export const radius = {
  "button": 999,
  "chip": 999,
  "input": 16,
  "card": 24
} as const;

export const size = {
  "button": 60,
  "buttonSmall": 44,
  "chipMin": 38,
  "chipMax": 40,
  "input": 56,
  "cardImage": 150,
  "touchMin": 44,
  "iconMin": 20,
  "iconMax": 24,
  "iconStroke": 2,
  "logoMinWidth": 90,
  "appIcon": 1024
} as const;
