import { ReactElement } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Box, CircularProgress } from '@material-ui/core'
import { useAuth } from '../../contexts/AuthContext'
import Urls from 'ustaxes/data/urls'

export default function AuthGuard({
  children
}: {
  children: ReactElement
}): ReactElement {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <Box
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <CircularProgress color="primary" />
      </Box>
    )
  }

  if (!user) {
    return <Navigate to={Urls.login} state={{ from: location }} replace />
  }

  return children
}
