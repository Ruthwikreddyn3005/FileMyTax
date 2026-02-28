import { ReactElement, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  makeStyles,
  TextField,
  Theme,
  Typography,
  createStyles
} from '@material-ui/core'
import { useAuth } from '../../contexts/AuthContext'
import Urls from 'ustaxes/data/urls'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (cfg: {
            client_id: string
            callback: (r: { credential: string }) => void
          }) => void
          renderButton: (el: HTMLElement | null, cfg: object) => void
          prompt: () => void
        }
      }
    }
  }
}

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
    submitBtn: {
      marginTop: theme.spacing(1.5),
      height: 42,
      fontWeight: 700,
      fontSize: '0.9rem'
    },
    divider: {
      margin: theme.spacing(2.5, 0)
    },
    googleWrap: {
      display: 'flex',
      justifyContent: 'center'
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
    },
    forgotLink: {
      fontSize: '0.78rem',
      color: theme.palette.text.secondary,
      textDecoration: 'none',
      display: 'block',
      textAlign: 'right' as const,
      marginTop: theme.spacing(0.25),
      marginBottom: theme.spacing(0.5),
      '&:hover': { color: theme.palette.primary.main }
    }
  })
)

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || ''

export default function LoginPage(): ReactElement {
  const classes = useStyles()
  const { login, googleLogin } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isGoogleAccount, setIsGoogleAccount] = useState(false)
  const [loading, setLoading] = useState(false)
  const googleBtnContainer = useRef<HTMLDivElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsGoogleAccount(false)
    setLoading(true)
    try {
      await login(email, password)
      navigate(Urls.usTaxes.start)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed'
      if (msg.includes('Google Sign-In')) {
        setIsGoogleAccount(true)
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  // Wait for the Google script (loaded in index.html) then render the button
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return

    let attempts = 0
    const maxAttempts = 40 // poll up to 4 seconds

    const tryInit = () => {
      if (!window.google || !googleBtnContainer.current) {
        if (++attempts < maxAttempts) setTimeout(tryInit, 100)
        return
      }
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: ({ credential }: { credential: string }) => {
          setError('')
          setLoading(true)
          googleLogin(credential)
            .then(() => navigate(Urls.usTaxes.start))
            .catch((err: unknown) => {
              setError(
                err instanceof Error ? err.message : 'Google sign-in failed'
              )
            })
            .finally(() => setLoading(false))
        }
      })
      window.google.accounts.id.renderButton(googleBtnContainer.current, {
        theme: 'outline',
        size: 'large',
        width: 352,
        text: 'signin_with'
      })
    }

    tryInit()
  }, [googleLogin, navigate])

  return (
    <Box className={classes.root}>
      <Helmet>
        <title>Log In | FileMyTax</title>
      </Helmet>
      <Box className={classes.card}>
        <Typography className={classes.logo}>FileMyTax</Typography>
        <Typography className={classes.tagline}>
          Free · Accurate · Secure
        </Typography>
        <Typography className={classes.heading}>
          Log in to your account
        </Typography>

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
          />
          <TextField
            className={classes.field}
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            size="small"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <Link to={Urls.forgotPassword} className={classes.forgotLink}>
            Forgot password?
          </Link>
          {isGoogleAccount ? (
            <Typography className={classes.error}>
              This account uses Google Sign-In. Use the Google button below to
              log in, or{' '}
              <Link to={Urls.forgotPassword} className={classes.link}>
                set a password
              </Link>{' '}
              to enable email login.
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
              'Log In'
            )}
          </Button>
        </form>

        {GOOGLE_CLIENT_ID && (
          <>
            <Divider className={classes.divider} />
            <Box className={classes.googleWrap}>
              <div ref={googleBtnContainer} />
            </Box>
          </>
        )}

        <Typography className={classes.footer}>
          {"Don't"} have an account?{' '}
          <Link to={Urls.signup} className={classes.link}>
            Sign up free
          </Link>
        </Typography>
      </Box>
    </Box>
  )
}
