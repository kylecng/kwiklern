import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import theme from '../common/theme'
import Login from './Login'
import Table from './Table/EnhancedTable'
import { ThemeProvider } from '@mui/material/styles'
import { CircularProgress, Typography } from '@mui/material'
import { sendMessageToBackground } from '../../utils'
import './index.css'
import { FlexBox, FlexRow } from '../common/Layout'

const RequireAuth = ({ children }) => {
  let location = useLocation()

  const [isLoadingAuth, setIsLoadingAuth] = useState(true)
  const [isAuth, setIsAuth] = useState(false)

  useEffect(() => {
    sendMessageToBackground({ action: 'getSession', type: 'DATABASE' })
      .then(({ session, error }) => {
        if (error) throw error
        setIsAuth(session?.access_token)
      })
      .catch(() => setIsAuth(false))
      .finally(() => setIsLoadingAuth(false))
  }, [])

  if (isLoadingAuth) {
    return (
      <FlexBox>
        <CircularProgress />
        <Typography>Loading session</Typography>
      </FlexBox>
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
      <FlexRow
        sx={{
          w: '100vw',
          h: '100vh',
          overflow: 'hidden',
          bgcolor: (theme) => theme.palette.background.default,
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
      </FlexRow>
    </ThemeProvider>
  )
}

// export default App

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
