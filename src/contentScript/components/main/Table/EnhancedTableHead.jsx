import Box from '@mui/material/Box'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableSortLabel from '@mui/material/TableSortLabel'
import { visuallyHidden } from '@mui/utils'
import { useTheme } from '@mui/material/styles'
import EnhancedTableRow from './EnhancedTableRow'
import { TablePagination } from '@mui/material'

export default function EnhancedTableHead(props) {
  const theme = useTheme()
  const {
    sx,
    columns,
    order,
    orderBy,
    onRequestSort,
    count,
    rowsPerPage,
    page,
    onPageChange,
    onRowsPerPageChange,
  } = props
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property)
  }

  return (
    <TableHead
      sx={{
        // width: "100%",
        position: 'sticky',
        top: 0,
        zIndex: 100,
        bgcolor: (theme) => theme.palette.background.default,
        ...sx,
      }}
    >
      <EnhancedTableRow>
        <TableCell colSpan={columns().length} sx={{ border: 0 }}>
          <TablePagination
            component='div'
            rowsPerPageOptions={[5, 10, 25]}
            count={count}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={onPageChange}
            onRowsPerPageChange={onRowsPerPageChange}
          />
        </TableCell>
      </EnhancedTableRow>
      <EnhancedTableRow>
        {columns(theme).map(({ id, getHeaderCell, cellProps, headerCellProps, isSortable }) => (
          <TableCell
            key={id}
            sortDirection={isSortable && orderBy === id ? order : false}
            {...cellProps}
            {...headerCellProps}
          >
            {isSortable ? (
              <TableSortLabel
                active={orderBy === id}
                direction={orderBy === id ? order : 'asc'}
                onClick={createSortHandler(id)}
              >
                {getHeaderCell()}
                {orderBy === id ? (
                  <Box component='span' sx={visuallyHidden}>
                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                  </Box>
                ) : null}
              </TableSortLabel>
            ) : (
              getHeaderCell()
            )}
          </TableCell>
        ))}
      </EnhancedTableRow>
    </TableHead>
  )
}
