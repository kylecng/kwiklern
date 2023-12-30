import { createTheme } from '@mui/material/styles'

// define color palette
const themePalette = createTheme({
  palette: {
    type: 'dark',
    primary: {
      main: '#cc0000',
    },
    secondary: {
      main: '#f50057',
    },
    text: {
      primary: '#ffffff',
      secondary: '#ffffff',
    },
    background: {
      default: '#0b0c0d',
      paper: '#2c2c2c',
    },
  },
})

// define default styles
const theme = createTheme(themePalette, {
  typography: {
    fontFamily: 'Cabin',
    fontSize: '14px',
    button: {
      textTransform: 'none',
    },
    body1: {
      fontSize: '14px',
      color: themePalette.palette.text.primary,
    },
    body2: {
      fontSize: '12px',
      color: themePalette.palette.text.primary,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          boxSizing: 'border-box',
          scrollbarColor: '#6b6b6b #2b2b2b',
          '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
            backgroundColor: '#2b2b2b',
          },
          '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
            borderRadius: 8,
            backgroundColor: '#6b6b6b',
            minHeight: 24,
            border: '3px solid #2b2b2b',
          },
          '&::-webkit-scrollbar-thumb:focus, & *::-webkit-scrollbar-thumb:focus': {
            backgroundColor: '#959595',
          },
          '&::-webkit-scrollbar-thumb:active, & *::-webkit-scrollbar-thumb:active': {
            backgroundColor: '#959595',
          },
          '&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover': {
            backgroundColor: '#959595',
          },
          '&::-webkit-scrollbar-corner, & *::-webkit-scrollbar-corner': {
            backgroundColor: '#2b2b2b',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          fontSize: '14px',
          padding: '5px',
          color: themePalette.palette.text.primary,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          minWidth: '0px',
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
        root: { color: themePalette.palette.text.primary },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontSize: '12px',
        },
        label: {
          overflow: 'hidden',
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          paddingTop: '0px',
          paddingBottom: '0px',
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          padding: '5px 10px',
        },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          padding: '0px',
        },
        content: {
          marginTop: '5px',
          marginBottom: '5px',
        },
      },
    },
    MuiAccordionDetails: {
      styleOverrides: {
        root: {
          padding: '0px',
        },
      },
    },
  },
})

export default theme
