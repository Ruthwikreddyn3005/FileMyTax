import { PropsWithChildren, ReactElement } from 'react'
import {
  Box,
  createStyles,
  makeStyles,
  CssBaseline,
  Theme
} from '@material-ui/core'
import { Routes, Route, Navigate } from 'react-router-dom'
import { isMobileOnly as isMobile } from 'react-device-detect'
import { PagerProvider } from './pager'
import NoMatchPage from './NoMatchPage'
import SkipToLinks from './SkipToLinks'
import ScrollTop from './ScrollTop'
import Menu, { backPages, drawerSectionsForYear } from './Menu'
import { Section, SectionItem } from './ResponsiveDrawer'

import Urls from 'ustaxes/data/urls'
import DataPropagator from './DataPropagator'
import YearStatusBar from './YearStatusBar'
import { useSelector } from 'react-redux'
import { TaxYear } from 'ustaxes/core/data'
import { YearsTaxesState } from 'ustaxes/redux'
import AuthGuard from './auth/AuthGuard'
import LoginPage from './auth/LoginPage'
import SignupPage from './auth/SignupPage'
import ForgotPasswordPage from './auth/ForgotPasswordPage'
import ResetPasswordPage from './auth/ResetPasswordPage'
import SetPasswordPage from './auth/SetPasswordPage'
import ProfilePage from './auth/ProfilePage'
import UserMenu from './auth/UserMenu'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      display: 'flex',
      minHeight: '100vh'
    },
    mainArea: {
      flex: 1,
      minWidth: 0,
      overflow: 'auto',
      backgroundColor: theme.palette.background.paper
    },
    content: {
      padding: theme.spacing(3),
      [theme.breakpoints.up('sm')]: {
        padding: theme.spacing(4, 5)
      }
    },
    // necessary for content to be below app bar on mobile
    toolbar: {
      ...theme.mixins.toolbar,
      [theme.breakpoints.up('sm')]: {
        display: 'none'
      }
    }
  })
)

export default function Main(): ReactElement {
  const activeYear: TaxYear = useSelector(
    (state: YearsTaxesState) => state.activeYear
  )

  const classes = useStyles()

  const steps: SectionItem[] = drawerSectionsForYear(activeYear).flatMap(
    (section: Section) => section.items
  )

  const allItems: SectionItem[] = [...steps, ...backPages]

  const Layout = ({
    showMenu = true,
    children
  }: PropsWithChildren<{ showMenu?: boolean }>) => (
    <>
      {showMenu ? <Menu /> : undefined}
      <UserMenu />
      <Box component="main" tabIndex={-1} className={classes.mainArea}>
        <Box className={`${classes.content} tax-content`}>
          {isMobile && showMenu ? (
            <div className={classes.toolbar} />
          ) : undefined}
          {showMenu ? <YearStatusBar /> : undefined}
          {children}
        </Box>
      </Box>
    </>
  )

  return (
    <>
      <CssBaseline />
      <SkipToLinks />
      <div className={classes.container}>
        <PagerProvider pages={steps}>
          <Routes>
            {/* Public auth routes */}
            <Route path={Urls.login} element={<LoginPage />} />
            <Route path={Urls.signup} element={<SignupPage />} />
            <Route
              path={Urls.forgotPassword}
              element={<ForgotPasswordPage />}
            />
            <Route path={Urls.resetPassword} element={<ResetPasswordPage />} />

            {/* Protected account routes */}
            <Route
              path={Urls.setPassword}
              element={
                <AuthGuard>
                  <SetPasswordPage />
                </AuthGuard>
              }
            />
            <Route
              path={Urls.profile}
              element={
                <AuthGuard>
                  <ProfilePage />
                </AuthGuard>
              }
            />

            {/* Root redirect */}
            <Route path="/" element={<Navigate to={Urls.default} />} />

            {/* Protected app routes */}
            {allItems.map((item) => (
              <Route
                key={item.title}
                path={item.url}
                element={
                  <AuthGuard>
                    <Layout showMenu={!item.url.includes('start')}>
                      <DataPropagator />
                      {item.element}
                    </Layout>
                  </AuthGuard>
                }
              />
            ))}
            <Route
              path="*"
              element={
                <AuthGuard>
                  <Layout>
                    <NoMatchPage />
                  </Layout>
                </AuthGuard>
              }
            />
          </Routes>
        </PagerProvider>
        {!isMobile && <ScrollTop />}
      </div>
    </>
  )
}
