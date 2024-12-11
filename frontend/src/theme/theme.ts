import { extendTheme, ThemeConfig } from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';

// Purity UI Theme configurations
const breakpoints = {
  sm: '320px',
  md: '768px',
  lg: '960px',
  xl: '1200px',
  '2xl': '1600px',
};

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};

export const theme = extendTheme({
  config,
  breakpoints,
  fonts: {
    heading: "'Hubot Sans', system-ui, sans-serif",
    body: "'Hubot Sans', system-ui, sans-serif",
  },
  fontWeights: {
    hairline: 100,
    thin: 200,
    light: 300,
    normal: 400,
    medium: 600,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },
  colors: {
    brand: {
      50: '#f5f7fa',
      100: '#edf2f7',
      200: '#e2e8f0',
      300: '#cbd5e0',
      400: '#a0aec0',
      500: '#718096',
      600: '#4a5568',
      700: '#2d3748',
      800: '#1a202c',
      900: '#171923',
    },
    // Purity UI Colors
    gray: {
      50: '#F7FAFC',
      100: '#EDF2F7',
      200: '#E2E8F0',
      300: '#CBD5E0',
      400: '#A0AEC0',
      500: '#718096',
      600: '#4A5568',
      700: '#2D3748',
      800: '#1A202C',
      900: '#171923',
    },
  },
  styles: {
    global: (props: any) => ({
      'html, body': {
        fontFamily: "'Hubot Sans', system-ui, sans-serif",
      },
      '*': {
        fontFamily: "'Hubot Sans', system-ui, sans-serif !important",
      },
      body: {
        bg: mode('gray.50', 'gray.800')(props),
        color: mode('gray.800', 'whiteAlpha.900')(props),
        minHeight: '100vh',
      },
      'h1, h2, h3, h4, h5, h6': {
        fontFamily: "'Hubot Sans', system-ui, sans-serif !important",
      },
      p: {
        fontWeight: 400,
      },
    }),
  },
  components: {
    Text: {
      baseStyle: {
        fontWeight: 400,
      },
      defaultProps: {
        fontWeight: 400
      }
    },
    Heading: {
      baseStyle: {
        fontWeight: 600,
      },
      defaultProps: {
        fontWeight: 600
      }
    },
    Link: {
      baseStyle: {
        fontWeight: 400,
      },
      defaultProps: {
        fontWeight: 400
      }
    },
    Button: {
      baseStyle: {
        fontWeight: 400,
        borderRadius: '12px',
        _focus: {
          boxShadow: 'none',
        },
      },
      defaultProps: {
        fontWeight: 400
      },
      variants: {
        solid: {
          fontWeight: 600
        },
        brand: (props: any) => ({
          bg: mode('brand.500', 'brand.400')(props),
          color: 'white',
          fontWeight: 600,
          _hover: {
            bg: mode('brand.600', 'brand.300')(props),
          },
          _active: {
            bg: mode('brand.700', 'brand.200')(props),
          },
        }),
        ghost: (props: any) => ({
          color: mode('brand.500', 'brand.400')(props),
          fontWeight: 400,
          _hover: {
            bg: mode('gray.100', 'whiteAlpha.100')(props),
          },
        }),
      },
    },
    Card: {
      baseStyle: (props: any) => ({
        p: '22px',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        position: 'relative',
        minWidth: '0px',
        wordWrap: 'break-word',
        backgroundClip: 'border-box',
        bg: mode('white', 'gray.700')(props),
        borderRadius: '15px',
        transition: 'all .2s ease-in-out'
      }),
    },
    Badge: {
      baseStyle: {
        fontWeight: 400,
        textTransform: 'capitalize',
        borderRadius: 'full',
        px: 3,
        transition: 'all 0.2s',
      },
      defaultProps: {
        fontWeight: 400
      },
      variants: {
        brand: (props: any) => ({
          bg: mode('brand.500', 'brand.400')(props),
          color: 'white',
          fontWeight: 600,
          _hover: {
            bg: mode('brand.600', 'brand.300')(props),
          },
        }),
        status: {
          running: {
            bg: 'blue.50',
            color: 'blue.500',
            borderWidth: '1px',
            borderColor: 'blue.200',
            fontWeight: 400,
            _dark: {
              bg: 'blue.900',
              color: 'blue.200',
              borderColor: 'blue.700',
            },
          },
          completed: {
            bg: 'green.50',
            color: 'green.500',
            borderWidth: '1px',
            borderColor: 'green.200',
            fontWeight: 400,
            _dark: {
              bg: 'green.900',
              color: 'green.200',
              borderColor: 'green.700',
            },
          },
          failed: {
            bg: 'red.50',
            color: 'red.500',
            borderWidth: '1px',
            borderColor: 'red.200',
            fontWeight: 400,
            _dark: {
              bg: 'red.900',
              color: 'red.200',
              borderColor: 'red.700',
            },
          },
          pending: {
            bg: 'orange.50',
            color: 'orange.500',
            borderWidth: '1px',
            borderColor: 'orange.200',
            fontWeight: 400,
            _dark: {
              bg: 'orange.900',
              color: 'orange.200',
              borderColor: 'orange.700',
            },
          },
        },
      },
    },
    Container: {
      baseStyle: {
        maxW: ['100%', null, '768px', '1024px', '1280px'],
        px: [4, 6],
      },
    },
    MainPanel: {
      baseStyle: {
        float: 'right',
        maxWidth: '100%',
        overflow: 'auto',
        position: 'relative',
        maxHeight: '100%',
        transition: 'all 0.33s cubic-bezier(0.685, 0.0473, 0.346, 1)',
        transitionDuration: '.2s, .2s, .35s',
        transitionProperty: 'top, bottom, width',
        transitionTimingFunction: 'linear, linear, ease',
      },
      variants: {
        main: (props: any) => ({
          bg: mode('gray.50', 'gray.800')(props),
          p: '30px 15px',
          minHeight: '100vh',
        }),
      },
      defaultProps: {
        variant: 'main',
      },
    },
    Navbar: {
      baseStyle: (props: any) => ({
        bg: mode('white', 'gray.700')(props),
        boxShadow: mode(
          '0px 7px 23px rgba(0, 0, 0, 0.05)',
          'none'
        )(props),
        borderColor: mode(
          'transparent',
          'rgba(255, 255, 255, 0.12)'
        )(props),
        borderWidth: '0px',
        transitionProperty: 'top, bottom, width',
        transitionDuration: '.2s, .2s, .35s',
        transitionTimingFunction: 'ease',
        backdropFilter: 'blur(21px)',
      }),
    },
    // Form Components
    Form: {
      baseStyle: {
        helperText: {
          color: 'gray.500',
          mt: 1,
          fontSize: 'sm',
        },
        errorMessage: {
          color: 'red.500',
          mt: 1,
          fontSize: 'sm',
        },
      },
    },
    FormLabel: {
      baseStyle: {
        fontSize: 'sm',
        fontWeight: 400,
        mb: 2,
      },
    },
    Input: {
      baseStyle: {
        field: {
          borderRadius: '15px',
          fontSize: 'sm',
        },
      },
      variants: {
        main: (props: any) => ({
          field: {
            bg: mode('white', 'navy.800')(props),
            border: '1px solid',
            borderColor: mode('gray.200', 'whiteAlpha.100')(props),
            _placeholder: { color: mode('gray.400', 'whiteAlpha.400')(props) },
            _hover: {
              borderColor: mode('gray.300', 'whiteAlpha.200')(props),
            },
            _focus: {
              borderColor: 'brand.500',
              boxShadow: `0 0 0 1px ${mode('brand.500', 'brand.400')(props)}`,
            },
          },
        }),
      },
      defaultProps: {
        variant: 'main',
      },
    },
    Textarea: {
      baseStyle: {
        borderRadius: '15px',
        fontSize: 'sm',
      },
      variants: {
        main: (props: any) => ({
          bg: mode('white', 'navy.800')(props),
          border: '1px solid',
          borderColor: mode('gray.200', 'whiteAlpha.100')(props),
          _placeholder: { color: mode('gray.400', 'whiteAlpha.400')(props) },
          _hover: {
            borderColor: mode('gray.300', 'whiteAlpha.200')(props),
          },
          _focus: {
            borderColor: 'brand.500',
            boxShadow: `0 0 0 1px ${mode('brand.500', 'brand.400')(props)}`,
          },
        }),
      },
      defaultProps: {
        variant: 'main',
      },
    },
  },
});

export default theme;
