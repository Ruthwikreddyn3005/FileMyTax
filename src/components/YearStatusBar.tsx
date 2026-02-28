import {
  Box,
  createStyles,
  Link,
  makeStyles,
  Theme,
  Typography
} from '@material-ui/core'
import { ReactElement, useState } from 'react'
import { useSelector } from 'react-redux'
import { YearsTaxesState } from 'ustaxes/redux'
import { TaxYears } from 'ustaxes/core/data'
import YearDropDown from './YearDropDown'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'inline-flex',
      alignItems: 'baseline',
      gap: theme.spacing(0.75),
      padding: theme.spacing(0.75, 1.5),
      borderRadius: 8,
      backgroundColor:
        theme.palette.type === 'dark'
          ? 'rgba(255,255,255,0.05)'
          : 'rgba(218, 68, 83, 0.07)',
      marginBottom: theme.spacing(1.5)
    },
    label: {
      fontSize: '0.8rem',
      color: theme.palette.text.secondary,
      fontWeight: 500
    },
    yearLink: {
      fontSize: '0.875rem',
      fontWeight: 700,
      color: theme.palette.primary.main,
      cursor: 'pointer',
      '&:hover': {
        textDecoration: 'underline'
      }
    },
    yearText: {
      fontSize: '0.875rem',
      fontWeight: 700,
      color: theme.palette.primary.main
    }
  })
)

const YearStatusBar = (): ReactElement => {
  const year = useSelector((state: YearsTaxesState) => state.activeYear)
  const [isOpen, setOpen] = useState(false)
  const classes = useStyles()

  const openButton = (
    <Link
      href=""
      data-testid="year-dropdown-button"
      className={classes.yearLink}
      onClick={(e) => {
        e.preventDefault()
        setOpen(true)
      }}
    >
      {TaxYears[year]} ▾
    </Link>
  )

  return (
    <div>
      <Box className={classes.root}>
        <Typography component="span" className={classes.label}>
          Tax Year:
        </Typography>
        {isOpen ? (
          <Typography component="span" className={classes.yearText}>
            {TaxYears[year]}
          </Typography>
        ) : (
          openButton
        )}
      </Box>
      {isOpen ? <YearDropDown onDone={() => setOpen(false)} /> : undefined}
    </div>
  )
}

export default YearStatusBar
