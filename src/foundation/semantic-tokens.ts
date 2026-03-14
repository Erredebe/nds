export const semanticTokens = {
  color: {
    text: {
      light: '{colors.slate.900}',
      dark: '{colors.slate.50}'
    },
    textMuted: {
      light: '{colors.slate.600}',
      dark: '{colors.slate.300}'
    },
    border: {
      light: '{colors.slate.200}',
      dark: '{colors.slate.700}'
    },
    surface: {
      light: '{colors.white}',
      dark: '{colors.slate.900}'
    },
    surfaceMuted: {
      light: '{colors.slate.50}',
      dark: '{colors.slate.800}'
    },
    accent: {
      light: '{colors.blue.600}',
      dark: '{colors.blue.400}'
    },
    accentContrast: {
      light: '{colors.white}',
      dark: '{colors.slate.950}'
    },
    success: {
      light: '{colors.emerald.600}',
      dark: '{colors.emerald.400}'
    },
    warning: {
      light: '{colors.amber.600}',
      dark: '{colors.amber.400}'
    },
    focus: {
      light: '{colors.blue.300}',
      dark: '{colors.blue.500}'
    }
  },
  component: {
    button: {
      solidBackground: {
        light: '{colors.blue.600}',
        dark: '{colors.blue.500}'
      },
      solidForeground: {
        light: '{colors.white}',
        dark: '{colors.slate.950}'
      },
      outlineForeground: {
        light: '{colors.slate.900}',
        dark: '{colors.slate.50}'
      },
      ghostHoverBackground: {
        light: '{colors.slate.100}',
        dark: '{colors.slate.800}'
      }
    },
    input: {
      background: {
        light: '{colors.white}',
        dark: '{colors.slate.900}'
      },
      border: {
        light: '{colors.slate.300}',
        dark: '{colors.slate.700}'
      }
    },
    card: {
      background: {
        light: '{colors.white}',
        dark: '{colors.slate.900}'
      },
      border: {
        light: '{colors.slate.200}',
        dark: '{colors.slate.700}'
      }
    },
    box: {
      subtleBackground: {
        light: '{colors.slate.50}',
        dark: '{colors.slate.800}'
      },
      accentBackground: {
        light: '{colors.blue.50}',
        dark: '{colors.blue.900}'
      }
    }
  }
} as const;

export type SemanticTokens = typeof semanticTokens;
