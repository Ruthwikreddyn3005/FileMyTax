import { ReactElement, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  makeStyles,
  TextField,
  Theme,
  Typography,
  createStyles
} from '@material-ui/core'
import { useAuth } from '../../contexts/AuthContext'
import { authService, ProfileUpdate } from '../../services/authService'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      backgroundColor: theme.palette.background.default,
      padding: theme.spacing(4, 2)
    },
    card: {
      width: '100%',
      maxWidth: 640,
      backgroundColor: theme.palette.background.paper,
      borderRadius: theme.shape.borderRadius * 2,
      padding: theme.spacing(4, 4, 3),
      boxShadow: '0 4px 32px rgba(0,0,0,0.10)'
    },
    pageTitle: {
      fontFamily: "'Roboto Slab', serif",
      fontWeight: 700,
      fontSize: '1.35rem',
      color: theme.palette.text.primary,
      marginBottom: theme.spacing(0.5)
    },
    pageSubtitle: {
      fontSize: '0.85rem',
      color: theme.palette.text.secondary,
      marginBottom: theme.spacing(3)
    },
    sectionLabel: {
      fontSize: '0.7rem',
      fontWeight: 700,
      letterSpacing: '0.08em',
      textTransform: 'uppercase' as const,
      color: theme.palette.text.secondary,
      marginBottom: theme.spacing(1.5)
    },
    divider: {
      margin: theme.spacing(3, 0)
    },
    emailRow: {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(1.5),
      padding: theme.spacing(1.25, 1.75),
      borderRadius: theme.shape.borderRadius,
      backgroundColor:
        theme.palette.type === 'dark'
          ? 'rgba(255,255,255,0.05)'
          : 'rgba(0,0,0,0.04)',
      marginBottom: theme.spacing(0.5)
    },
    emailLabel: {
      fontSize: '0.72rem',
      fontWeight: 600,
      letterSpacing: '0.06em',
      textTransform: 'uppercase' as const,
      color: theme.palette.text.secondary,
      marginBottom: 2
    },
    emailValue: {
      fontSize: '0.9rem',
      color: theme.palette.text.primary,
      fontWeight: 500,
      wordBreak: 'break-all' as const
    },
    error: {
      color: theme.palette.error.main,
      fontSize: '0.82rem',
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
    actions: {
      display: 'flex',
      gap: theme.spacing(1.5),
      marginTop: theme.spacing(2)
    },
    saveBtn: {
      height: 42,
      fontWeight: 700,
      fontSize: '0.9rem',
      flex: 1
    },
    cancelBtn: {
      height: 42,
      fontSize: '0.9rem'
    }
  })
)

export default function ProfilePage(): ReactElement {
  const classes = useStyles()
  const { user, refreshUser } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState<ProfileUpdate>({
    firstName: '',
    middleName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zip: '',
    country: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName ?? '',
        middleName: user.middleName ?? '',
        lastName: user.lastName ?? '',
        phone: user.phone ?? '',
        dateOfBirth: user.dateOfBirth ?? '',
        addressLine1: user.addressLine1 ?? '',
        addressLine2: user.addressLine2 ?? '',
        city: user.city ?? '',
        state: user.state ?? '',
        zip: user.zip ?? '',
        country: user.country ?? ''
      })
    }
  }, [user])

  const set =
    (field: keyof ProfileUpdate) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
      setSaved(false)
      setError('')
    }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authService.updateProfile(form)
      await refreshUser()
      setSaved(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box className={classes.root}>
      <Helmet>
        <title>Edit Profile | FileMyTax</title>
      </Helmet>
      <Box className={classes.card}>
        <Typography className={classes.pageTitle}>Edit Profile</Typography>
        <Typography className={classes.pageSubtitle}>
          Update your personal information
        </Typography>

        {/* Email — read only */}
        <Typography className={classes.sectionLabel}>Account</Typography>
        <Box className={classes.emailRow}>
          <Box>
            <div className={classes.emailLabel}>Email address</div>
            <div className={classes.emailValue}>{user?.email ?? ''}</div>
          </Box>
        </Box>

        <Divider className={classes.divider} />

        <form onSubmit={(e) => void handleSubmit(e)}>
          {/* Personal Info */}
          <Typography className={classes.sectionLabel}>
            Personal Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                label="First Name"
                variant="outlined"
                fullWidth
                size="small"
                value={form.firstName}
                onChange={set('firstName')}
                autoComplete="given-name"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Middle Name"
                variant="outlined"
                fullWidth
                size="small"
                value={form.middleName}
                onChange={set('middleName')}
                autoComplete="additional-name"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Last Name"
                variant="outlined"
                fullWidth
                size="small"
                value={form.lastName}
                onChange={set('lastName')}
                autoComplete="family-name"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Phone Number"
                variant="outlined"
                fullWidth
                size="small"
                value={form.phone}
                onChange={set('phone')}
                autoComplete="tel"
                inputProps={{ type: 'tel' }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Date of Birth"
                variant="outlined"
                fullWidth
                size="small"
                value={form.dateOfBirth}
                onChange={set('dateOfBirth')}
                placeholder="YYYY-MM-DD"
                inputProps={{ type: 'date' }}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>

          <Divider className={classes.divider} />

          {/* Address */}
          <Typography className={classes.sectionLabel}>Address</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Address Line 1"
                variant="outlined"
                fullWidth
                size="small"
                value={form.addressLine1}
                onChange={set('addressLine1')}
                autoComplete="address-line1"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Address Line 2"
                variant="outlined"
                fullWidth
                size="small"
                value={form.addressLine2}
                onChange={set('addressLine2')}
                autoComplete="address-line2"
              />
            </Grid>
            <Grid item xs={12} sm={5}>
              <TextField
                label="City"
                variant="outlined"
                fullWidth
                size="small"
                value={form.city}
                onChange={set('city')}
                autoComplete="address-level2"
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                label="State"
                variant="outlined"
                fullWidth
                size="small"
                value={form.state}
                onChange={set('state')}
                autoComplete="address-level1"
              />
            </Grid>
            <Grid item xs={6} sm={4}>
              <TextField
                label="ZIP Code"
                variant="outlined"
                fullWidth
                size="small"
                value={form.zip}
                onChange={set('zip')}
                autoComplete="postal-code"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Country"
                variant="outlined"
                fullWidth
                size="small"
                value={form.country}
                onChange={set('country')}
                autoComplete="country-name"
              />
            </Grid>
          </Grid>

          {error && (
            <Typography className={classes.error} style={{ marginTop: 16 }}>
              {error}
            </Typography>
          )}
          {saved && (
            <Typography className={classes.success} style={{ marginTop: 16 }}>
              Profile saved successfully.
            </Typography>
          )}

          <Box className={classes.actions}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              className={classes.saveBtn}
            >
              {loading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                'Save Changes'
              )}
            </Button>
            <Button
              variant="text"
              className={classes.cancelBtn}
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
          </Box>
        </form>
      </Box>
    </Box>
  )
}
