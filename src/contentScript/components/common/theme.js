import { createTheme } from '@mui/material/styles'
import { merge, fromPairs, clone } from 'lodash'
import 'typeface-inter'

// define color palette
let theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#25EBE6',
      contrastText: '#000000',
    },
    secondary: {
      main: '#625BF6',
      contrastText: '#ffffff',
    },
    text: {
      // primary: "#EAEAEA",
      // primary: "#B0ADA9",
      primary: '#FFFFFF',
      secondary: '#7C7A7B',
    },
    background: {
      // default: "#191919",
      default: '#1C232B',
      paper: '#2F2F2F',
    },
    warning: {
      // main: "#3F3600",
      // main: "#E0BF6A",
      main: '#9E810B',
      dark: '#3F3600',
      // dark: "#9E810B",
    },
  },
})

const fontDefault = { fontFamily: 'Inter, sans-serif', color: theme.palette.text.primary }

// define default styles
theme = createTheme(theme, {
  spacing: (factor) => `${factor * 0.5}rem`,
  shape: {
    borderRadius: 5,
  },
  typography: merge(
    {
      ...clone(fontDefault),
      ...fromPairs(
        [
          'root',
          'allVariants',
          'body1',
          'body2',
          'button',
          'caption',
          'h1',
          'h2',
          'h3',
          'h4',
          'h5',
          'h6',
          'inherit',
          'overline',
          'subtitle1',
          'subtitle2',
        ].map((variant) => [variant, clone(fontDefault)]),
      ),
    },
    {
      fontSize: '1.25rem',
      root: {
        fontSize: '1.25rem',
      },
      allVariants: {
        textTransform: 'none',
      },
      button: {
        textTransform: 'none',
      },
      body1: {
        fontSize: '1.5rem',
      },
      body2: {
        fontSize: '1rem',
      },
    },
  ),
  components: {
    MuiCssBaseline: {
      // styleOverrides: () => `* {
      //   font-family: Inter, sans-serif;
      // }`,
      // styleOverrides: {
      //   body: {
      //     boxSizing: "border-box",
      //     // scrollbarColor: "#6b6b6b #2b2b2b",
      //     "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
      //       backgroundColor: theme.palette.background.paper,
      //       borderRadius: 10,
      //       width: "0.7em",
      //     },
      //     "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
      //       borderRadius: 10,
      //       backgroundColor: theme.palette.primary.main,
      //       minHeight: 24,
      //       border: `0.2em solid ${theme.palette.background.paper}`,
      //     },
      //     "& *::-webkit-scrollbar-corner": {
      //       backgroundColor: "transparent",
      //     },
      //   },
      // },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          fontSize: '1.5rem',
          padding: '0.25rem',
          color: theme.palette.text.primary,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          minWidth: 0,
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          minWidth: 30,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: { color: theme.palette.text.primary },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontSize: '0.75rem',
        },
        label: {
          overflow: 'hidden',
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          paddingTop: 0,
          paddingBottom: 0,
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          padding: '0.25rem 0.5rem',
        },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          padding: 0,
        },
        content: {
          marginTop: '0.25rem',
          marginBottom: '0.25rem',
        },
      },
    },
    MuiAccordionDetails: {
      styleOverrides: {
        root: {
          padding: 0,
        },
      },
    },
  },
  MuiInputBase: {
    styleOverrides: {
      border: 1,
      borderColor: '#303030',
      borderRadius: 10,
      bgcolor: '#121212',
    },
  },
})

export default theme
