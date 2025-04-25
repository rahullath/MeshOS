/**
 * MeshOS Theme Configuration
 * 
 * This file contains styling fixes for contrast issues and defines
 * a consistent theme across the application
 */

export const theme = {
  // Color palette with improved contrast
  colors: {
    // Primary colors
    primary: {
      50: '#e6f7ff',
      100: '#bae3ff',
      200: '#7cc4fa',
      300: '#4aa3f9',
      400: '#2186f4',
      500: '#0069ed', // Primary brand color
      600: '#0054c4',
      700: '#00419b',
      800: '#002f72',
      900: '#001c4d',
    },
    
    // Background colors - ensure sufficient contrast for text
    background: {
      light: '#f8f9fc', // Light mode background
      dark: '#111827',  // Dark mode background
    },
    
    // Text colors
    text: {
      light: {
        primary: '#1E293B',   // Dark enough for good contrast in light mode
        secondary: '#475569', // Medium contrast for secondary text
        muted: '#64748B',     // Light but still readable
      },
      dark: {
        primary: '#F8FAFC',   // Almost white for primary text in dark mode
        secondary: '#CBD5E1', // Light gray for secondary text
        muted: '#94A3B8',     // Muted but still readable
      }
    },
    
    // UI elements
    ui: {
      card: {
        light: '#FFFFFF',
        dark: '#1E293B',
      },
      border: {
        light: '#E2E8F0',
        dark: '#334155',
      },
      input: {
        light: {
          bg: '#FFFFFF',
          border: '#CBD5E1',
          text: '#0F172A',
          placeholder: '#94A3B8',
        },
        dark: {
          bg: '#1E293B',
          border: '#475569',
          text: '#F1F5F9',
          placeholder: '#94A3B8',
        }
      }
    },
    
    // Status colors with good contrast
    status: {
      success: {
        bg: '#ECFDF5',
        text: '#047857',
        border: '#A7F3D0',
        dark: {
          bg: '#064E3B',
          text: '#6EE7B7',
          border: '#047857',
        }
      },
      error: {
        bg: '#FEF2F2',
        text: '#B91C1C',
        border: '#FECACA',
        dark: {
          bg: '#7F1D1D',
          text: '#FCA5A5',
          border: '#B91C1C',
        }
      },
      warning: {
        bg: '#FFFBEB',
        text: '#B45309',
        border: '#FDE68A',
        dark: {
          bg: '#78350F',
          text: '#FCD34D',
          border: '#B45309',
        }
      },
      info: {
        bg: '#EFF6FF',
        text: '#1D4ED8',
        border: '#BFDBFE',
        dark: {
          bg: '#1E3A8A',
          text: '#93C5FD',
          border: '#1D4ED8',
        }
      }
    }
  },
  
  // Typography with improved readability
  typography: {
    fontFamily: {
      sans: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
      mono: 'Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      none: 1,
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2,
    }
  },
  
  // Spacing system
  spacing: {
    px: '1px',
    0: '0',
    0.5: '0.125rem',
    1: '0.25rem',
    1.5: '0.375rem',
    2: '0.5rem',
    2.5: '0.625rem',
    3: '0.75rem',
    3.5: '0.875rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    7: '1.75rem',
    8: '2rem',
    9: '2.25rem',
    10: '2.5rem',
    11: '2.75rem',
    12: '3rem',
    14: '3.5rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    28: '7rem',
    32: '8rem',
    36: '9rem',
    40: '10rem',
    44: '11rem',
    48: '12rem',
    52: '13rem',
    56: '14rem',
    60: '15rem',
    64: '16rem',
    72: '18rem',
    80: '20rem',
    96: '24rem',
  },
  
  // Border radius
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    DEFAULT: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px',
  },
  
  // Shadows
  boxShadow: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    none: 'none',
  },
};

// Helper function to apply theme to components
export const applyTheme = (isDarkMode = false) => {
  const mode = isDarkMode ? 'dark' : 'light';
  
  return {
    // Background colors
    background: isDarkMode ? theme.colors.background.dark : theme.colors.background.light,
    
    // Text colors
    textPrimary: isDarkMode ? theme.colors.text.dark.primary : theme.colors.text.light.primary,
    textSecondary: isDarkMode ? theme.colors.text.dark.secondary : theme.colors.text.light.secondary,
    textMuted: isDarkMode ? theme.colors.text.dark.muted : theme.colors.text.light.muted,
    
    // UI elements
    cardBg: isDarkMode ? theme.colors.ui.card.dark : theme.colors.ui.card.light,
    borderColor: isDarkMode ? theme.colors.ui.border.dark : theme.colors.ui.border.light,
    
    // Input fields
    input: {
      bg: isDarkMode ? theme.colors.ui.input.dark.bg : theme.colors.ui.input.light.bg,
      border: isDarkMode ? theme.colors.ui.input.dark.border : theme.colors.ui.input.light.border,
      text: isDarkMode ? theme.colors.ui.input.dark.text : theme.colors.ui.input.light.text,
      placeholder: isDarkMode ? theme.colors.ui.input.dark.placeholder : theme.colors.ui.input.light.placeholder,
    },
    
    // Status colors
    status: {
      success: {
        bg: isDarkMode ? theme.colors.status.success.dark.bg : theme.colors.status.success.bg,
        text: isDarkMode ? theme.colors.status.success.dark.text : theme.colors.status.success.text,
        border: isDarkMode ? theme.colors.status.success.dark.border : theme.colors.status.success.border,
      },
      error: {
        bg: isDarkMode ? theme.colors.status.error.dark.bg : theme.colors.status.error.bg,
        text: isDarkMode ? theme.colors.status.error.dark.text : theme.colors.status.error.text,
        border: isDarkMode ? theme.colors.status.error.dark.border : theme.colors.status.error.border,
      },
      warning: {
        bg: isDarkMode ? theme.colors.status.warning.dark.bg : theme.colors.status.warning.bg,
        text: isDarkMode ? theme.colors.status.warning.dark.text : theme.colors.status.warning.text,
        border: isDarkMode ? theme.colors.status.warning.dark.border : theme.colors.status.warning.border,
      },
      info: {
        bg: isDarkMode ? theme.colors.status.info.dark.bg : theme.colors.status.info.bg,
        text: isDarkMode ? theme.colors.status.info.dark.text : theme.colors.status.info.text,
        border: isDarkMode ? theme.colors.status.info.dark.border : theme.colors.status.info.border,
      },
    },
  };
};

// Export CSS variables for use in global styles
export const generateCssVariables = (isDarkMode = false) => {
  const themeValues = applyTheme(isDarkMode);
  
  return `
    :root {
      --background: ${themeValues.background};
      --text-primary: ${themeValues.textPrimary};
      --text-secondary: ${themeValues.textSecondary};
      --text-muted: ${themeValues.textMuted};
      --card-bg: ${themeValues.cardBg};
      --border-color: ${themeValues.borderColor};
      --input-bg: ${themeValues.input.bg};
      --input-border: ${themeValues.input.border};
      --input-text: ${themeValues.input.text};
      --input-placeholder: ${themeValues.input.placeholder};
      --success-bg: ${themeValues.status.success.bg};
      --success-text: ${themeValues.status.success.text};
      --success-border: ${themeValues.status.success.border};
      --error-bg: ${themeValues.status.error.bg};
      --error-text: ${themeValues.status.error.text};
      --error-border: ${themeValues.status.error.border};
      --warning-bg: ${themeValues.status.warning.bg};
      --warning-text: ${themeValues.status.warning.text};
      --warning-border: ${themeValues.status.warning.border};
      --info-bg: ${themeValues.status.info.bg};
      --info-text: ${themeValues.status.info.text};
      --info-border: ${themeValues.status.info.border};
    }
  `;
};
