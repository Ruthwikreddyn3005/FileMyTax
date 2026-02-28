import { ReactElement, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
    error: {
      color: theme.palette.error.main,
      fontSize: '0.82rem',
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(0.5)
    },
    hint: {
      fontSize: '0.75rem',
      color: theme.palette.text.secondary,
      marginTop: theme.spacing(0.5),
      marginBottom: theme.spacing(1.5)
    },
    submitBtn: {
      marginTop: theme.spacing(1.5),
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

export default function SignupPage(): ReactElement {
  const classes = useStyles()
  const { register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isGoogleAccount, setIsGoogleAccount] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    setError('')
    setIsGoogleAccount(false)
    setLoading(true)
    try {
      await register(email, password, name || undefined)
      navigate(Urls.usTaxes.start)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign up failed'
      if (msg.includes('Google account')) {
        setIsGoogleAccount(true)
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box className={classes.root}>
      <Helmet>
        <title>Create Account | FileMyTax</title>
      </Helmet>
      <Box className={classes.card}>
        <Typography className={classes.logo}>FileMyTax</Typography>
        <Typography className={classes.tagline}>
          Free · Accurate · Secure
        </Typography>
        <Typography className={classes.heading}>
          Create your free account
        </Typography>

        <form onSubmit={(e) => void handleSubmit(e)}>
          <TextField
            className={classes.field}
            label="Name (optional)"
            type="text"
            variant="outlined"
            fullWidth
            size="small"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
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
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            size="small"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
          <Typography className={classes.hint}>Minimum 8 characters</Typography>
          {isGoogleAccount ? (
            <Typography className={classes.error}>
              This email is already linked to a Google account.{' '}
              <Link to={Urls.forgotPassword} className={classes.link}>
                Set a password here
              </Link>{' '}
              to also enable email login, then{' '}
              <Link to={Urls.login} className={classes.link}>
                log in
              </Link>
              .
            </Typography>
          ) : (
            error && <Typography className={classes.error}>{error}</Typography>
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
              'Create Account'
            )}
          </Button>
        </form>

        <Typography className={classes.footer}>
          Already have an account?{' '}
          <Link to={Urls.login} className={classes.link}>
            Log in
          </Link>
        </Typography>
      </Box>
    </Box>
  )
}
