import TableRow from '@mui/material/TableRow'

export default function EnhancedTableRow(props) {
  const { children } = props
  return <TableRow {...props}>{children}</TableRow>
}
