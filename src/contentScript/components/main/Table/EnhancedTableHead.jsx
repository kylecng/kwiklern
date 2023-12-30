import * as React from 'react'
import PropTypes from 'prop-types'
import Box from '@mui/material/Box'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableSortLabel from '@mui/material/TableSortLabel'
import Checkbox from '@mui/material/Checkbox'
import { visuallyHidden } from '@mui/utils'
import { useTheme } from '@mui/material/styles'
import EnhancedTableRow from './EnhancedTableRow'
import { TablePagination } from '@mui/material'

const EnhancedTableHead = (props) => {
  const theme = useTheme()
  const {
    sx,
    columns,
    onSelectAllClick,
    order,
    orderBy,
    numSelected,
    rowCount,
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
        backgroundColor: (theme) => theme.palette.background.default,
        ...sx,
      }}
    >
      <EnhancedTableRow>
        <TableCell colSpan={columns().length} sx={{ border: '0px' }}>
          <TablePagination
            component="div"
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
        {/* <TableCell padding="checkbox">
          <Checkbox
            color="primary"
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{}}
          />
        </TableCell> */}
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
                  <Box component="span" sx={visuallyHidden}>
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

EnhancedTableHead.propTypes = {
  columns: PropTypes.func.isRequired,
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
  count: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  page: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onRowsPerPageChange: PropTypes.func.isRequired,
}

export default EnhancedTableHead
