import { ReactElement, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import {
  Box,
  Button,
  CircularProgress,
  makeStyles,
  TextField,
  Theme,
  Typography,
  createStyles
} from '@material-ui/core'
import { useAuth } from '../../contexts/AuthContext'
import { authService } from '../../services/authService'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.palette.background.default,
      padding: theme.spacing(2)
    },
    card: {
      width: '100%',
      maxWidth: 420,
      backgroundColor: theme.palette.background.paper,
      borderRadius: theme.shape.borderRadius * 2,
      padding: theme.spacing(4, 4, 3),
      boxShadow: '0 4px 32px rgba(0,0,0,0.10)'
    },
    heading: {
      fontFamily: "'Roboto Slab', serif",
      fontWeight: 700,
      fontSize: '1.25rem',
      color: theme.palette.text.primary,
      marginBottom: theme.spacing(0.75)
    },
    subtext: {
      fontSize: '0.85rem',
      color: theme.palette.text.secondary,
      marginBottom: theme.spacing(2.5)
    },
    field: {
      marginBottom: theme.spacing(1.5)
    },
    hint: {
      fontSize: '0.75rem',
      color: theme.palette.text.secondary,
      marginTop: theme.spacing(0.25),
      marginBottom: theme.spacing(1.5)
    },
    error: {
      color: theme.palette.error.main,
      fontSize: '0.82rem',
      marginBottom: theme.spacing(1)
    },
    success: {
      backgroundColor: theme.palette.success.main,
      color: '#fff',
      borderRadius: theme.shape.borderRadius,
      padding: theme.spacing(1.5, 2),
      fontSize: '0.85rem',
      marginBottom: theme.spacing(2)
    },
    submitBtn: {
      marginTop: theme.spacing(1),
      height: 42,
      fontWeight: 700,
      fontSize: '0.9rem'
    },
    cancelBtn: {
      marginTop: theme.spacing(1),
      height: 42,
      fontSize: '0.9rem'
    }
  })
)

export default function SetPasswordPage(): ReactElement {
  const classes = useStyles()
  const { user, refreshUser } = useAuth()
  const navigate = useNavigate()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const isSettingNew = !user?.hasPassword

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (newPassword !== confirm) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      await authService.setPassword(
        isSettingNew ? null : currentPassword,
        newPassword
      )
      await refreshUser()
      setDone(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to set password')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <Box className={classes.root}>
        <Box className={classes.card}>
          <Typography className={classes.success}>
            {isSettingNew
              ? 'Password set! You can now log in with your email and password.'
              : 'Password changed successfully.'}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            className={classes.submitBtn}
            onClick={() => navigate(-1)}
          >
            Done
          </Button>
        </Box>
      </Box>
    )
  }

  return (
    <Box className={classes.root}>
      <Helmet>
        <title>
          {isSettingNew ? 'Set Password' : 'Change Password'} | FileMyTax
        </title>
      </Helmet>
      <Box className={classes.card}>
        <Typography className={classes.heading}>
          {isSettingNew ? 'Set up password login' : 'Change password'}
        </Typography>
        <Typography className={classes.subtext}>
          {isSettingNew
            ? `Your account (${
                user?.email ?? ''
              }) currently uses Google Sign-In only. Set a password to also log in with your email.`
            : 'Enter your current password, then choose a new one.'}
        </Typography>

        <form onSubmit={(e) => void handleSubmit(e)}>
          {!isSettingNew && (
            <TextField
              className={classes.field}
              label="Current password"
              type="password"
              variant="outlined"
              fullWidth
              size="small"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              autoComplete="current-password"
              autoFocus
            />
          )}
          <TextField
            className={classes.field}
            label="New password"
            type="password"
            variant="outlined"
            fullWidth
            size="small"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            autoComplete="new-password"
            autoFocus={isSettingNew}
          />
          <Typography className={classes.hint}>Minimum 8 characters</Typography>
          <TextField
            className={classes.field}
            label="Confirm new password"
            type="password"
            variant="outlined"
            fullWidth
            size="small"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            autoComplete="new-password"
          />
          {error && <Typography className={classes.error}>{error}</Typography>}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading}
            className={classes.submitBtn}
          >
            {loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : isSettingNew ? (
              'Set Password'
            ) : (
              'Change Password'
            )}
          </Button>
          <Button
            variant="text"
            fullWidth
            className={classes.cancelBtn}
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>
        </form>
      </Box>
    </Box>
  )
}
