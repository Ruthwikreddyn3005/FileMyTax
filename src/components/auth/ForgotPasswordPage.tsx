import { ReactElement, useState } from 'react'
import { Link } from 'react-router-dom'
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
      marginBottom: theme.spacing(1)
    },
    description: {
      fontSize: '0.85rem',
      color: theme.palette.text.secondary,
      marginBottom: theme.spacing(2.5)
    },
    field: {
      marginBottom: theme.spacing(1.5)
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

export default function ForgotPasswordPage(): ReactElement {
  const classes = useStyles()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await authService.forgotPassword(email).catch(() => undefined)
    setLoading(false)
    setSent(true)
  }

  return (
    <Box className={classes.root}>
      <Helmet>
        <title>Forgot Password | FileMyTax</title>
      </Helmet>
      <Box className={classes.card}>
        <Typography className={classes.logo}>FileMyTax</Typography>
        <Typography className={classes.tagline}>
          Free · Accurate · Secure
        </Typography>
        <Typography className={classes.heading}>Reset your password</Typography>
        <Typography className={classes.description}>
          Enter your email and we will send you a link to set a new password.
        </Typography>

        {sent ? (
          <Typography className={classes.success}>
            If that email is registered, a reset link has been sent. Check your
            inbox (and spam folder).
          </Typography>
        ) : (
          <form onSubmit={(e) => void handleSubmit(e)}>
            <TextField
              className={classes.field}
              label="Email"
              type="email"
              variant="outlined"
              fullWidth
              size="small"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              autoFocus
            />
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
                'Send Reset Link'
              )}
            </Button>
          </form>
        )}

        <Typography className={classes.footer}>
          Remember your password?{' '}
          <Link to={Urls.login} className={classes.link}>
            Log in
          </Link>
        </Typography>
      </Box>
    </Box>
  )
}
