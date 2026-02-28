import { ReactElement, useMemo } from 'react'
import Main from './components/Main'
import './App.css'
import { createTheme, ThemeProvider, useMediaQuery } from '@material-ui/core'

const App = (): ReactElement => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          type: prefersDarkMode ? 'dark' : 'light',
          primary: {
            light: '#E05C6A',
            main: '#DA4453',
            dark: '#B5303E',
            contrastText: '#ffffff'
          },
          secondary: {
            light: '#525252',
            main: '#363636',
            dark: '#1F1F1F',
            contrastText: '#ffffff'
          },
          background: {
            default: prefersDarkMode ? '#1a1a1a' : '#F2F2F2',
            paper: prefersDarkMode ? '#2d2d2d' : '#ffffff'
          },
          text: {
            primary: prefersDarkMode ? '#f0f0f0' : '#363636',
            secondary: prefersDarkMode ? '#aaaaaa' : '#6B6B6B'
          }
        },
        shape: {
          borderRadius: 4
        },
        typography: {
          fontFamily: "'Open Sans', sans-serif",
          h1: { fontFamily: "'Roboto Slab', serif", fontWeight: 700 },
          h2: { fontFamily: "'Roboto Slab', serif", fontWeight: 700 },
          h3: { fontFamily: "'Roboto Slab', serif", fontWeight: 700 },
          h4: { fontFamily: "'Roboto Slab', serif", fontWeight: 700 },
          h5: { fontFamily: "'Roboto Slab', serif", fontWeight: 700 },
          h6: { fontFamily: "'Roboto Slab', serif", fontWeight: 700 },
          button: {
            textTransform: 'none' as const,
            fontWeight: 600,
            letterSpacing: '0.02em'
          }
        },
        overrides: {
          MuiButton: {
            root: {
              borderRadius: 4,
              padding: '8px 20px',
              fontSize: '0.875rem'
            },
            contained: {
              boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
              '&:hover': {
                backgroundColor: '#363636',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
              }
            },
            containedPrimary: {
              '&:hover': {
                backgroundColor: '#363636'
              }
            }
          },
          MuiOutlinedInput: {
            root: {
              borderRadius: 4
            }
          },
          MuiListItem: {
            button: {
              borderRadius: 3,
              margin: '1px 8px',
              width: 'calc(100% - 16px)'
            },
            selected: {
              backgroundColor: 'rgba(218, 68, 83, 0.1) !important'
            }
          },
          MuiListSubheader: {
            root: {
              fontSize: '0.68rem',
              fontWeight: 700,
              textTransform: 'uppercase' as const,
              letterSpacing: '0.08em',
              lineHeight: '2.2rem'
            }
          },
          MuiListItemText: {
            primary: {
              fontSize: '0.875rem',
              fontWeight: 500
            }
          },
          MuiDrawer: {
            paper: {
              borderRight: 'none',
              boxShadow: '2px 0 16px rgba(0,0,0,0.08)'
            }
          },
          MuiAppBar: {
            root: {
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
            }
          },
          MuiDivider: {
            root: {
              margin: '4px 0'
            }
          },
          MuiPaper: {
            rounded: {
              borderRadius: 4
            }
          }
        }
      }),
    [prefersDarkMode]
  )

  return (
    <div className="App">
      <ThemeProvider theme={theme}>
        <Main />
      </ThemeProvider>
    </div>
  )
}

export default App
