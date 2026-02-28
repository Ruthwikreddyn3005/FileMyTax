import { ReactElement, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
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
import { authService } from '../../services/authService'
import Urls from 'ustaxes/data/urls'

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
    logo: {
      fontFamily: "'Roboto Slab', serif",
      fontWeight: 700,
      fontSize: '1.5rem',
      color: theme.palette.primary.main,
      marginBottom: theme.spacing(0.25)
    },
    tagline: {
      fontSize: '0.82rem',
      color: theme.palette.text.secondary,
      marginBottom: theme.spacing(3)
    },
    heading: {
      fontFamily: "'Roboto Slab', serif",
      fontWeight: 700,
      fontSize: '1.25rem',
      color: theme.palette.text.primary,
      marginBottom: theme.spacing(2.5)
    },
    field: {
      marginBottom: theme.spacing(1.5)
    },
    hint: {
      fontSize: '0.75rem',
      color: theme.palette.text.secondary,
      marginTop: theme.spacing(0.5),
      marginBottom: theme.spacing(1.5)
    },
    error: {
      color: theme.palette.error.main,
      fontSize: '0.82rem',
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(0.5)
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
    invalidBox: {
      textAlign: 'center' as const,
      padding: theme.spacing(2, 0)
    },
    footer: {
      marginTop: theme.spacing(3),
      textAlign: 'center' as const,
      fontSize: '0.82rem',
      color: theme.palette.text.secondary
    },
    link: {
      color: theme.palette.primary.main,
      fontWeight: 600,
      textDecoration: 'none'
    }
  })
)

export default function ResetPasswordPage(): ReactElement {
  const classes = useStyles()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    if (!token) return
    setLoading(true)
    try {
      await authService.resetPassword(token, password)
      setDone(true)
      setTimeout(() => navigate(Urls.login), 2500)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Reset failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box className={classes.root}>
      <Helmet>
        <title>Set New Password | FileMyTax</title>
      </Helmet>
      <Box className={classes.card}>
        <Typography className={classes.logo}>FileMyTax</Typography>
        <Typography className={classes.tagline}>
          Free · Accurate · Secure
        </Typography>

        {!token ? (
          <Box className={classes.invalidBox}>
            <Typography className={classes.heading}>Invalid link</Typography>
            <Typography style={{ fontSize: '0.85rem', marginBottom: 16 }}>
              This reset link is missing or invalid.
            </Typography>
            <Link to={Urls.forgotPassword} className={classes.link}>
              Request a new reset link
            </Link>
          </Box>
        ) : done ? (
          <>
            <Typography className={classes.success}>
              Password updated! Redirecting you to login…
            </Typography>
            <Typography className={classes.footer}>
              <Link to={Urls.login} className={classes.link}>
                Go to login
              </Link>
            </Typography>
          </>
        ) : (
          <>
            <Typography className={classes.heading}>
              Set a new password
            </Typography>
            <form onSubmit={(e) => void handleSubmit(e)}>
              <TextField
                className={classes.field}
                label="New password"
                type="password"
                variant="outlined"
                fullWidth
                size="small"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                autoFocus
              />
              <Typography className={classes.hint}>
                Minimum 8 characters
              </Typography>
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
              {error && (
                <Typography className={classes.error}>{error}</Typography>
              )}
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
                ) : (
                  'Set New Password'
                )}
              </Button>
            </form>
          </>
        )}

        <Typography className={classes.footer}>
          <Link to={Urls.login} className={classes.link}>
            Back to login
          </Link>
        </Typography>
      </Box>
    </Box>
  )
}
