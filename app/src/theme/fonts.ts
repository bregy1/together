// Brand fonts, copied from spec/design/brand/fonts/ (SIL Open Font License 1.1).
// Archivo is the only UI font. It is a variable font, so one file per style
// covers every weight. Fraunces is for the wordmark only and is not loaded yet
// (the wordmark is not part of this task).
// spec: design/direction.md → Typography
import type { FontFamilyDefinition } from 'expo-font';

import { fontStacks } from './tokens.generated';

export const brandFonts: FontFamilyDefinition[] = [
  {
    fontFamily: fontStacks.base[0],
    fontDefinitions: [
      { path: require('../../assets/fonts/Archivo-Variable.ttf'), style: 'normal' },
      { path: require('../../assets/fonts/Archivo-Italic-Variable.ttf'), style: 'italic' },
    ],
  },
];
