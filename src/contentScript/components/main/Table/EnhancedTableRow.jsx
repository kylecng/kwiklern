import TableRow from '@mui/material/TableRow'

const EnhancedTableRow = (props) => {
  const { children } = props
  return <TableRow {...props}>{children}</TableRow>
}

export default EnhancedTableRow
