import { ReactElement } from 'react'
import { Helmet } from 'react-helmet'
import { StartButtons, SingleButtons } from './pager'
import { isWeb } from 'ustaxes/core/util'
import Urls from 'ustaxes/data/urls'
import {
  Box,
  Chip,
  createStyles,
  Grid,
  makeStyles,
  Theme,
  Typography
} from '@material-ui/core'
import { CheckCircleOutline, Security, MoneyOff } from '@material-ui/icons'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    hero: {
      background: theme.palette.secondary.main,
      borderRadius: theme.shape.borderRadius,
      padding: theme.spacing(3.5, 3.5, 3),
      marginBottom: theme.spacing(2.5),
      color: '#fff',
      position: 'relative' as const,
      overflow: 'hidden'
    },
    heroCircle: {
      position: 'absolute' as const,
      top: -60,
      right: -60,
      width: 220,
      height: 220,
      borderRadius: '50%',
      background: 'rgba(255,255,255,0.04)',
      pointerEvents: 'none' as const
    },
    heroCircle2: {
      position: 'absolute' as const,
      bottom: -40,
      left: '40%',
      width: 140,
      height: 140,
      borderRadius: '50%',
      background: 'rgba(255,255,255,0.03)',
      pointerEvents: 'none' as const
    },
    heroBadge: {
      display: 'inline-block',
      background: theme.palette.primary.main,
      color: '#fff',
      fontSize: '0.62rem',
      fontWeight: 700,
      letterSpacing: '0.1em',
      textTransform: 'uppercase' as const,
      padding: '3px 10px',
      borderRadius: 3,
      marginBottom: theme.spacing(1.5)
    },
    heroTitle: {
      fontFamily: "'Roboto Slab', serif",
      fontWeight: 700,
      fontSize: '1.8rem',
      lineHeight: 1.2,
      color: '#fff',
      marginBottom: theme.spacing(1.25)
    },
    heroSub: {
      fontSize: '0.875rem',
      lineHeight: 1.65,
      color: 'rgba(255,255,255,0.78)',
      marginBottom: theme.spacing(2.5),
      maxWidth: 420
    },
    heroPills: {
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: theme.spacing(1),
      marginBottom: theme.spacing(2.5)
    },
    heroPill: {
      background: 'rgba(255,255,255,0.1)',
      color: '#fff',
      border: '1px solid rgba(255,255,255,0.2)',
      height: 26,
      '& .MuiChip-label': {
        fontWeight: 600,
        fontSize: '0.72rem'
      }
    },
    featureCard: {
      padding: theme.spacing(2),
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: theme.shape.borderRadius,
      height: '100%'
    },
    featureIcon: {
      color: theme.palette.primary.main,
      display: 'block',
      marginBottom: theme.spacing(0.75),
      fontSize: '1.6rem'
    },
    featureTitle: {
      fontFamily: "'Roboto Slab', serif",
      fontWeight: 700,
      fontSize: '0.875rem',
      color: theme.palette.text.primary,
      marginBottom: theme.spacing(0.5)
    },
    featureDesc: {
      fontSize: '0.78rem',
      color: theme.palette.text.secondary,
      lineHeight: 1.55
    },
    sectionLabel: {
      fontSize: '0.67rem',
      fontWeight: 700,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.1em',
      color: theme.palette.text.secondary,
      marginBottom: theme.spacing(1),
      marginTop: theme.spacing(2.5)
    },
    chipRow: {
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: theme.spacing(0.75)
    },
    chip: {
      height: 26,
      background:
        theme.palette.type === 'dark'
          ? 'rgba(255,255,255,0.06)'
          : 'rgba(218,68,83,0.07)',
      color: theme.palette.primary.main,
      border: `1px solid rgba(218,68,83,0.22)`,
      borderRadius: 4,
      '& .MuiChip-label': {
        fontSize: '0.75rem',
        fontWeight: 600
      }
    },
    statRow: {
      display: 'flex',
      gap: theme.spacing(2),
      flexWrap: 'wrap' as const,
      marginTop: theme.spacing(2.5)
    },
    statBox: {
      flex: 1,
      minWidth: 80,
      padding: theme.spacing(1.5, 2),
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: theme.shape.borderRadius,
      textAlign: 'center' as const,
      background:
        theme.palette.type === 'dark'
          ? 'rgba(255,255,255,0.03)'
          : theme.palette.background.paper
    },
    statNumber: {
      fontFamily: "'Roboto Slab', serif",
      fontWeight: 700,
      fontSize: '1.5rem',
      color: theme.palette.primary.main,
      lineHeight: 1.1
    },
    statLabel: {
      fontSize: '0.72rem',
      color: theme.palette.text.secondary,
      marginTop: 2
    },
    contactBox: {
      marginTop: theme.spacing(2.5),
      padding: theme.spacing(2),
      background:
        theme.palette.type === 'dark'
          ? 'rgba(255,255,255,0.04)'
          : 'rgba(54,54,54,0.03)',
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: theme.shape.borderRadius
    }
  })
)

export default function GettingStarted(): ReactElement {
  const classes = useStyles()

  return (
    <>
      <Helmet>
        <title>Getting Started | FileMyTax</title>
      </Helmet>

      {/* ── Hero ── */}
      <Box className={classes.hero}>
        <Box className={classes.heroCircle} />
        <Box className={classes.heroCircle2} />
        <span className={classes.heroBadge}>Free · Accurate · Secure</span>
        <Typography className={classes.heroTitle}>
          File your US federal
          <br />
          taxes with confidence
        </Typography>
        <Typography className={classes.heroSub}>
          FileMyTax prepares Form 1040 and select state returns entirely in your
          browser. Your personal data never leaves your device.
        </Typography>
        <Box className={classes.heroPills}>
          <Chip size="small" label="Always free" className={classes.heroPill} />
          <Chip size="small" label="Secure" className={classes.heroPill} />
          <Chip size="small" label="Fast filing" className={classes.heroPill} />
        </Box>
        {isWeb() ? (
          <StartButtons
            firstText="Start Return in Browser"
            firstUrl={Urls.taxPayer.info}
            secondText="Download Desktop App"
            secondUrl={Urls.taxPayer.info}
          />
        ) : (
          <SingleButtons text="Start Return" url={Urls.taxPayer.info} />
        )}
      </Box>

      {/* ── Feature cards ── */}
      <Grid container spacing={2} style={{ marginBottom: 4 }}>
        <Grid item xs={12} sm={4}>
          <Box className={classes.featureCard}>
            <CheckCircleOutline className={classes.featureIcon} />
            <Typography className={classes.featureTitle}>Accurate</Typography>
            <Typography className={classes.featureDesc}>
              All federal and state tax math runs in your browser — precise
              results every time.
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Box className={classes.featureCard}>
            <Security className={classes.featureIcon} />
            <Typography className={classes.featureTitle}>Private</Typography>
            <Typography className={classes.featureDesc}>
              No data is sent to any server. Your return stays on your device
              only.
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Box className={classes.featureCard}>
            <MoneyOff className={classes.featureIcon} />
            <Typography className={classes.featureTitle}>Free</Typography>
            <Typography className={classes.featureDesc}>
              No hidden fees, no premium plans, no credit card ever required.
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* ── Stats ── */}
      <Box className={classes.statRow}>
        <Box className={classes.statBox}>
          <Typography className={classes.statNumber}>9</Typography>
          <Typography className={classes.statLabel}>
            States supported
          </Typography>
        </Box>
        <Box className={classes.statBox}>
          <Typography className={classes.statNumber}>1040</Typography>
          <Typography className={classes.statLabel}>Federal form</Typography>
        </Box>
        <Box className={classes.statBox}>
          <Typography className={classes.statNumber}>$0</Typography>
          <Typography className={classes.statLabel}>Cost to file</Typography>
        </Box>
      </Box>

      {/* ── Income Forms ── */}
      <Typography className={classes.sectionLabel}>
        Supported Income Forms
      </Typography>
      <Box className={classes.chipRow}>
        {[
          'W-2',
          '1099-INT',
          '1099-DIV',
          '1099-B',
          '1098-E',
          '1099-R',
          'SSA-1099'
        ].map((f) => (
          <Chip key={f} label={f} size="small" className={classes.chip} />
        ))}
      </Box>

      {/* ── Federal Attachments ── */}
      <Typography className={classes.sectionLabel}>
        Federal Attachments
      </Typography>
      <Box className={classes.chipRow}>
        {[
          'Schedule 1',
          'Schedule 2',
          'Schedule 3',
          'Schedule 8812',
          'Schedule A',
          'Schedule B',
          'Schedule D',
          'Schedule E',
          'Schedule SE',
          'F1040-V',
          'F6251',
          'F8889',
          'F8949',
          'F8959',
          'F8960',
          'F8995'
        ].map((f) => (
          <Chip key={f} label={f} size="small" className={classes.chip} />
        ))}
      </Box>

      {/* ── Tax Credits ── */}
      <Typography className={classes.sectionLabel}>Tax Credits</Typography>
      <Box className={classes.chipRow}>
        {['Child Tax Credit', 'Earned Income Credit'].map((f) => (
          <Chip key={f} label={f} size="small" className={classes.chip} />
        ))}
      </Box>

      {/* ── State support ── */}
      <Typography className={classes.sectionLabel}>State Income Tax</Typography>
      <Typography
        variant="body2"
        style={{ fontSize: '0.875rem', lineHeight: 1.6 }}
      >
        <strong>9 of 50 states</strong> are supported. States with no income tax
        do not require filing.
      </Typography>

      {/* ── Contact ── */}
      <Box className={classes.contactBox}>
        <Typography className={classes.sectionLabel} style={{ marginTop: 0 }}>
          Contact
        </Typography>
        <Typography variant="body2" style={{ fontSize: '0.875rem' }}>
          Have feedback or found an issue? Email{' '}
          <strong>feedback@filemytax.com</strong>
        </Typography>
      </Box>
    </>
  )
}
