import { Dispatch, Fragment, ReactElement, SetStateAction } from 'react'
import { NavLink } from 'react-router-dom'
import { isMobileOnly as isMobile } from 'react-device-detect'
import {
  createStyles,
  makeStyles,
  useTheme,
  Divider,
  SwipeableDrawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListSubheader,
  Theme,
  Typography
} from '@material-ui/core'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'

const drawerWidth = 240

const useStyles = makeStyles<Theme, { isMobile: boolean }>((theme) =>
  createStyles({
    drawer: {
      flexShrink: 0,
      transition: 'width 0.22s ease',
      [theme.breakpoints.up('sm')]: {
        width: drawerWidth
      }
    },
    drawerClosed: {
      [theme.breakpoints.up('sm')]: {
        width: 0,
        overflow: 'hidden'
      }
    },
    drawerBackdrop: ({ isMobile }) => ({
      top: isMobile ? '56px !important' : undefined,
      height: isMobile ? 'calc(100% - 56px)' : undefined
    }),
    drawerContainer: ({ isMobile }) => ({
      top: isMobile ? '56px !important' : 0
    }),
    drawerPaper: ({ isMobile }) => ({
      top: isMobile ? '56px !important' : undefined,
      width: isMobile ? '100%' : drawerWidth,
      height: isMobile ? 'calc(100% - 56px)' : undefined
    }),
    brandHeader: {
      backgroundColor: theme.palette.secondary.main,
      padding: theme.spacing(2, 1, 2, 2.5),
      minHeight: 64,
      display: 'flex',
      alignItems: 'center'
    },
    brandInfo: {
      flex: 1
    },
    brandTitle: {
      color: theme.palette.secondary.contrastText,
      fontWeight: 700,
      fontSize: '1.1rem',
      letterSpacing: '-0.01em',
      lineHeight: 1.2,
      fontFamily: "'Roboto Slab', serif"
    },
    brandSubtitle: {
      color: theme.palette.secondary.contrastText,
      opacity: 0.55,
      fontSize: '0.68rem',
      letterSpacing: '0.05em',
      textTransform: 'uppercase' as const,
      marginTop: 2
    },
    collapseBtn: {
      color: 'rgba(255,255,255,0.65)',
      padding: 6,
      flexShrink: 0,
      '&:hover': {
        backgroundColor: 'rgba(255,255,255,0.1)',
        color: '#fff'
      }
    },
    list: {
      marginLeft: theme.spacing(0),
      paddingLeft: theme.spacing(0)
    }
  })
)

export interface Section {
  title: string
  items: SectionItem[]
}

export interface SectionItem {
  title: string
  url: string
  element: ReactElement
}

export const item = (
  title: string,
  url: string,
  element: ReactElement
): SectionItem => ({
  title,
  url,
  element
})

export interface DrawerItemsProps {
  sections: Section[]
  isOpen: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
}

function ResponsiveDrawer(props: DrawerItemsProps): ReactElement {
  const classes = useStyles({ isMobile })
  const theme = useTheme()

  const { sections, isOpen, setOpen } = props

  const drawer = (
    <>
      {!isMobile && (
        <div className={classes.brandHeader}>
          <div className={classes.brandInfo}>
            <Typography className={classes.brandTitle}>FileMyTax</Typography>
            <Typography className={classes.brandSubtitle}>
              Free Tax Filing
            </Typography>
          </div>
          <IconButton
            size="small"
            className={classes.collapseBtn}
            onClick={() => setOpen(false)}
            aria-label="collapse sidebar"
          >
            <ChevronLeftIcon />
          </IconButton>
        </div>
      )}
      {sections.map(({ title, items }) => (
        <Fragment key={`section ${title}`}>
          <List
            subheader={<ListSubheader disableSticky>{title}</ListSubheader>}
            className={classes.list}
          >
            {items.map((item) => (
              <ListItem
                button
                classes={{}}
                key={item.title}
                component={NavLink}
                selected={location.pathname === item.url}
                to={item.url}
              >
                <ListItemText primary={`${item.title}`} />
              </ListItem>
            ))}
          </List>
          <Divider />
        </Fragment>
      ))}
    </>
  )

  const navClass = [
    classes.drawer,
    !isMobile && !isOpen ? classes.drawerClosed : ''
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <nav className={navClass} aria-label="primary">
      <SwipeableDrawer
        variant={!isMobile ? 'persistent' : undefined}
        anchor={theme.direction === 'rtl' ? 'right' : 'left'}
        open={isOpen}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        classes={{
          root: classes.drawerContainer,
          paper: classes.drawerPaper
        }}
        ModalProps={{
          BackdropProps: {
            classes: { root: classes.drawerBackdrop }
          }
        }}
      >
        {drawer}
      </SwipeableDrawer>
    </nav>
  )
}

export default ResponsiveDrawer
