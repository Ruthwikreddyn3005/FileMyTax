import { MouseEvent, ReactElement, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Avatar,
  createStyles,
  Divider,
  ListItemIcon,
  makeStyles,
  Menu,
  MenuItem,
  Theme,
  Typography
} from '@material-ui/core'
import {
  ExitToApp,
  HelpOutlineRounded,
  LockOpen,
  VpnKey,
  Settings,
  PersonOutlined
} from '@material-ui/icons'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import { useAuth } from '../../contexts/AuthContext'
import Urls from 'ustaxes/data/urls'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    trigger: {
      position: 'fixed' as const,
      top: 12,
      right: 16,
      zIndex: 1300,
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      background: theme.palette.background.paper,
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: 20,
      padding: '4px 10px 4px 4px',
      cursor: 'pointer',
      boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
      transition: 'box-shadow 0.15s',
      '&:hover': {
        boxShadow: '0 3px 14px rgba(0,0,0,0.15)'
      }
    },
    avatar: {
      width: 28,
      height: 28,
      fontSize: '0.72rem',
      fontWeight: 700,
      backgroundColor: theme.palette.primary.main,
      color: '#fff'
    },
    displayName: {
      fontSize: '0.78rem',
      fontWeight: 600,
      color: theme.palette.text.primary,
      maxWidth: 120,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap' as const
    },
    chevron: {
      fontSize: '0.9rem',
      color: theme.palette.text.secondary
    },
    menuHeader: {
      padding: theme.spacing(1.5, 2, 1),
      outline: 'none',
      textAlign: 'center' as const
    },
    menuAvatar: {
      width: 44,
      height: 44,
      fontSize: '1.1rem',
      fontWeight: 700,
      backgroundColor: theme.palette.primary.main,
      color: '#fff',
      margin: '0 auto',
      marginBottom: theme.spacing(0.75)
    },
    menuName: {
      fontSize: '0.875rem',
      fontWeight: 600,
      color: theme.palette.text.primary
    },
    menuEmail: {
      fontSize: '0.75rem',
      color: theme.palette.text.secondary,
      wordBreak: 'break-all' as const
    },
    menuItem: {
      gap: theme.spacing(1.5),
      fontSize: '0.875rem'
    },
    menuItemIcon: {
      minWidth: 'unset',
      color: theme.palette.text.secondary
    },
    logoutItem: {
      color: theme.palette.error.main,
      gap: theme.spacing(1.5),
      fontSize: '0.875rem'
    }
  })
)

function getInitials(name: string | null, email: string): string {
  if (name) {
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }
  return email[0].toUpperCase()
}

export default function UserMenu(): ReactElement | null {
  const classes = useStyles()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)

  if (!user) return null

  const open = (e: MouseEvent<HTMLButtonElement>) => setAnchor(e.currentTarget)
  const close = () => setAnchor(null)

  const handleNav = (url: string) => {
    close()
    navigate(url)
  }

  const handleLogout = () => {
    close()
    logout()
      .then(() => navigate(Urls.login))
      .catch(() => navigate(Urls.login))
  }

  const initials = getInitials(user.name, user.email)
  const displayLabel = user.name ?? user.email.split('@')[0]

  return (
    <>
      <button
        className={classes.trigger}
        onClick={open}
        aria-haspopup="true"
        aria-expanded={Boolean(anchor)}
        aria-label="account menu"
      >
        <Avatar className={classes.avatar}>{initials}</Avatar>
        <span className={classes.displayName}>{displayLabel}</span>
        <ExpandMoreIcon className={classes.chevron} />
      </button>

      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={close}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ style: { width: 230, marginTop: 6 } }}
        getContentAnchorEl={null}
      >
        {/* Profile header */}
        <div className={classes.menuHeader}>
          <Avatar className={classes.menuAvatar}>{initials}</Avatar>
          {user.name && (
            <Typography className={classes.menuName}>{user.name}</Typography>
          )}
          <Typography className={classes.menuEmail}>{user.email}</Typography>
        </div>

        <Divider />

        <MenuItem
          className={classes.menuItem}
          onClick={() => handleNav(Urls.profile)}
        >
          <ListItemIcon className={classes.menuItemIcon}>
            <PersonOutlined fontSize="small" />
          </ListItemIcon>
          Edit Profile
        </MenuItem>

        <MenuItem
          className={classes.menuItem}
          onClick={() => handleNav(Urls.setPassword)}
        >
          <ListItemIcon className={classes.menuItemIcon}>
            {user.hasPassword ? (
              <VpnKey fontSize="small" />
            ) : (
              <LockOpen fontSize="small" />
            )}
          </ListItemIcon>
          {user.hasPassword ? 'Change password' : 'Set up password login'}
        </MenuItem>

        <MenuItem
          className={classes.menuItem}
          onClick={() => handleNav(Urls.settings)}
        >
          <ListItemIcon className={classes.menuItemIcon}>
            <Settings fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>

        <MenuItem
          className={classes.menuItem}
          onClick={() => handleNav(Urls.help)}
        >
          <ListItemIcon className={classes.menuItemIcon}>
            <HelpOutlineRounded fontSize="small" />
          </ListItemIcon>
          Help &amp; Feedback
        </MenuItem>

        <Divider />

        <MenuItem className={classes.logoutItem} onClick={handleLogout}>
          <ListItemIcon className={classes.menuItemIcon}>
            <ExitToApp fontSize="small" style={{ color: 'inherit' }} />
          </ListItemIcon>
          Log out
        </MenuItem>
      </Menu>
    </>
  )
}
