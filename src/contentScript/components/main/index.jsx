import { StrictMode, useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import theme from '../common/theme'
import Login from './Login'
import Table from './Table/EnhancedTable'
import { ThemeProvider } from '@mui/material/styles'
import { Box, CircularProgress, Typography } from '@mui/material'
import './index.css'
import { sendMessageToBackground } from '../../utils'

const RequireAuth = ({ children }) => {
  let location = useLocation()

  const [isLoadingAuth, setIsLoadingAuth] = useState(true)
  const [isAuth, setIsAuth] = useState(false)

  useEffect(() => {
    sendMessageToBackground({ action: 'getSession', type: 'DATABASE' })
      .then(({ session, user, error }) => {
        if (error) throw error
        setIsAuth(session?.access_token)
      })
      .catch((error) => setIsAuth(false))
      .finally(() => setIsLoadingAuth(false))
  }, [])

  if (isLoadingAuth) {
    return (
      <Box>
        <CircularProgress />
        <Typography>Loading session</Typography>
      </Box>
    )
  } else if (!isAuth) {
    return <Navigate to="/login" state={{ from: location }} />
  } else {
    return children
  }
}

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'horizontal',
          width: '100vw',
          height: '100vh',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
          backgroundColor: (theme) => theme.palette.background.default,
          '*': {
            boxSizing: 'border-box',
          },
        }}
      >
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <RequireAuth>
                  <Table selectedTableId={0} />
                </RequireAuth>
              }
            />
          </Routes>
        </Router>
      </Box>
    </ThemeProvider>
  )
}

// export default App

ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
