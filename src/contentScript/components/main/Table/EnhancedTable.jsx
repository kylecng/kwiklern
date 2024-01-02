import { useState, useEffect, useMemo } from 'react'
import Box from '@mui/material/Box'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import Checkbox from '@mui/material/Checkbox'
import Typography from '@mui/material/Typography'
import { FaTrash } from 'react-icons/fa'
import { linearGradient } from '../../common/utils/color'
import { CONTENT_TYPE_ENUM } from '../../common/utils/constants'
import { AiFillCalendar } from 'react-icons/ai'
import { StyledIcon } from '../../common/Icon'
import { Button, Chip, Divider, Grid, Link, Stack } from '@mui/material'
import { PiListBulletsBold } from 'react-icons/pi'
import EnhancedTableHead from './EnhancedTableHead'
import EnhancedTableRow from './EnhancedTableRow'
import EnhancedTableFilter from './Filter/EnhancedTableFilter'
import { processTokenizedDataRow, searchCache } from './Filter/SearchHandler'
import CircularProgress from '@mui/material/CircularProgress'
import { useDidMount } from '../../common/utils/hooks'
import { devErr, devLog } from '../../../../utils'
import { sendMessageToBackground } from '../../../utils'
const selectedTableId = 0

const descendingComparator = (a, b, orderBy) => {
  if (b[orderBy] < a[orderBy]) {
    return -1
  }
  if (b[orderBy] > a[orderBy]) {
    return 1
  }
  return 0
}

const getComparator = (order, orderBy) => {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy)
}

// Since 2020 all major browsers ensure sort stability with Array.prototype.sort().
// stableSort() brings sort stability to non-modern browsers (notably IE11). If you
// only support modern browsers you can replace stableSort(exampleArray, exampleComparator)
// with exampleArray.slice().sort(exampleComparator)
const stableSort = (array, comparator) => {
  const stabilizedThis = array.map((el, index) => [el, index])
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0])
    if (order !== 0) {
      return order
    }
    return a[1] - b[1]
  })
  return stabilizedThis.map((el) => el[0])
}

const EnhancedTable = (props) => {
  const { selectedTableId } = props
  const isFirstRender = useDidMount()
  const [rows, setRows] = useState([])
  const [includedColumns, setIncludedColumns] = useState([
    'checkbox',
    'metadata',
    'summaryText',
    'actions',
  ])
  const [isLoading, setIsLoading] = useState(true)
  const [customTagsOptions, setCustomTagsOptions] = useState([])
  const [autoTagsOptions, setAutoTagsOptions] = useState([])
  const [authorsOptions, setAuthorsOptions] = useState({})
  const [selectedCustomTags, setSelectedCustomTags] = useState([])
  const [selectedAutoTags, setSelectedAutoTags] = useState([])
  const [selectedAuthors, setSelectedAuthors] = useState([])
  const [selectedTypes, setSelectedTypes] = useState([])
  const [order, setOrder] = useState('asc')
  const [orderBy, setOrderBy] = useState('product')
  const [selectedRows, setSelectedRows] = useState([])
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [filteredRows, setFilteredRows] = useState([])

  useEffect(() => {
    const newFilteredRows = rows.filter((row) => {
      if (
        selectedCustomTags?.length > 0 &&
        selectedCustomTags.every((customTag) => !row?.customTags?.includes(customTag))
      ) {
        return false
      }

      if (
        selectedAutoTags?.length > 0 &&
        selectedAutoTags.every((autoTag) => !row?.autoTags?.includes(autoTag))
      ) {
        return false
      }

      if (selectedAuthors?.length > 0 && !selectedAuthors.includes(row?.author?.id)) {
        return false
      }

      if (selectedTypes?.length > 0 && !selectedTypes.includes(row?.type)) {
        return false
      }

      return true
    })
    setFilteredRows(newFilteredRows)
  }, [rows, selectedCustomTags, selectedAutoTags, selectedAuthors, selectedTypes])

  const visibleRows = useMemo(
    () =>
      stableSort(filteredRows, getComparator(order, orderBy)).slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage,
      ),
    [filteredRows, order, orderBy, page, rowsPerPage],
  )

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const { summaries } = await sendMessageToBackground({
          action: 'getSummaries',
          type: 'DATABASE',
        })
        if (summaries?.length > 0) {
          const newCustomTagsOptions = new Set()
          const newAutoTagsOptions = new Set()
          const newAuthorsOptions = {}
          const newRows = summaries.map((row) => {
            const {
              id,
              contents: content,
              title: summaryTitle,
              text: summaryText,
              customTags,
              autoTags,
              dateCreated,
              dateModified,
            } = row || {}
            const {
              id: contentId,
              url,
              domain,
              type,
              title: contentTitle,
              authors: author,
              authorName,
              text: contentText,
            } = content || {}
            const {
              id: authorId,
              url: authorUrl,
              domain: authorDomain,
              name,
              imageUrl,
            } = author || {}

            ;(customTags || []).forEach((customTag) => newCustomTagsOptions.add(customTag))
            ;(autoTags || []).forEach((autoTag) => newAutoTagsOptions.add(autoTag))
            newAuthorsOptions[authorId] = author

            return {
              id,
              url,
              domain,
              type,
              title: summaryTitle || contentTitle || '',
              author: {
                id: authorId,
                url: authorUrl,
                domain: authorDomain,
                name: authorName || name || '',
                imageUrl,
              },
              contentText,
              summaryText,
              customTags,
              autoTags,
              dateCreated,
              dateModified,
            }
          })
          setCustomTagsOptions(newCustomTagsOptions)
          setAutoTagsOptions(newAutoTagsOptions)
          setAuthorsOptions(newAuthorsOptions)
          setRows(newRows)
        }
      } catch (err) {
        devErr(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // useEffect(() => {
  //   if (isFirstRender) return
  //   rows.forEach((row) => processTokenizedDataRow(row))
  // }, [rows])

  const getDefaultHeaderCell = (value, icon) => (
    <Stack direction="row" justifyContent="center" alignItems="center" gap={1}>
      {icon && <StyledIcon icon={icon} />}
      <Box
        sx={{
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {value}
      </Box>
    </Stack>
  )

  const getDefaultDataCell = (value) => (
    <Box sx={{ justifyContent: 'start', alignItems: 'center', gap: '0.42rem' }}>
      <Box
        sx={{
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {value}
      </Box>
    </Box>
  )

  const columns = () =>
    [
      {
        id: 'checkbox',
        getHeaderCell: () => (
          <Checkbox
            color="primary"
            indeterminate={selectedRows.length > 0 && selectedRows.length < filteredRows.length}
            checked={filteredRows.length > 0 && selectedRows.length === filteredRows.length}
            onChange={handleSelectAllClick}
            inputProps={{}}
          />
        ),
        getDataCell: ({ id }) => (
          <Checkbox
            color="primary"
            checked={isSelected(id)}
            inputProps={{
              'aria-labelledby': `enhanced-table-checkbox-${id}`,
            }}
          />
        ),
      },
      {
        id: 'metadata',
        cellProps: {
          align: 'center',
        },
        getHeaderCell: () => getDefaultHeaderCell('Source'),
        getDataCell: ({ type, title, url, author, customTags, autoTags, dateCreated }) => (
          <Stack
            sx={{
              fontSize: '20px',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
              verticalAlign: 'middle',
              gap: '10px',
            }}
          >
            {type && (
              <StyledIcon
                icon={CONTENT_TYPE_ENUM[type].icon}
                onClick={(e) => {
                  e.stopPropagation()
                  url && window?.open(url)
                }}
              />
            )}
            <Box>
              <Link
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                sx={
                  {
                    // whiteSpace: "nowrap"
                  }
                }
                onClick={(e) => e.stopPropagation()}
              >
                {title}
              </Link>
            </Box>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                verticalAlign: 'middle',
              }}
            >
              <Box
                component="img"
                referrerPolicy="no-referrer"
                sx={{
                  objectFit: 'cover',
                  width: '25px',
                  borderRadius: '50% 50%',
                  marginRight: '5px',
                }}
                src={author?.imageUrl}
                onClick={(e) => {
                  e.stopPropagation()
                  author?.url && window?.open(author.url)
                }}
              />
              <Link
                href={author?.url}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  // whiteSpace: "nowrap"
                  fontSize: '14px',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {author?.name}
              </Link>
            </Box>
            <Stack
              direction="row"
              justifyContent="center"
              alignItems="center"
              sx={{ rowGap: '0px', columnGap: '2px', flexWrap: 'wrap' }}
            >
              {[...(customTags || [])].map((customTag, index) => (
                <Chip
                  key={`${customTag}${index}`}
                  label={customTag}
                  sx={{ '&:hover': { color: (theme) => theme.palette.primary.main } }}
                  onClick={(e) => {
                    e.stopPropagation()
                    addTag(customTag, selectedCustomTags, setSelectedCustomTags)
                  }}
                ></Chip>
              ))}
            </Stack>
            <Stack
              direction="row"
              justifyContent="center"
              alignItems="center"
              sx={{ rowGap: '0px', columnGap: '2px', flexWrap: 'wrap' }}
            >
              {[...(autoTags || [])].map((autoTag, index) => (
                <Chip
                  key={`${autoTag}${index}`}
                  label={autoTag}
                  sx={{ '&:hover': { color: (theme) => theme.palette.primary.main } }}
                  onClick={(e) => {
                    e.stopPropagation()
                    addTag(autoTag, selectedAutoTags, setSelectedAutoTags)
                  }}
                ></Chip>
              ))}
            </Stack>
          </Stack>
        ),
      },
      {
        id: 'summaryText',
        getHeaderCell: () => getDefaultHeaderCell('Summary', PiListBulletsBold),
        getDataCell: ({ summaryText }) => (
          <Typography sx={{ whiteSpace: 'pre-line' }}>{summaryText}</Typography>
        ),
      },
      {
        id: 'dateCreated',
        getHeaderCell: () => getDefaultHeaderCell('Date Created', AiFillCalendar),
        getDataCell: ({ dateCreated }) => (
          <Box>
            {new Date(dateCreated).toLocaleDateString('en-US', {
              year: '2-digit',
              month: '2-digit',
              day: '2-digit',
            })}
          </Box>
        ),
      },
      {
        id: 'actions',
        getHeaderCell: () => {},
        getDataCell: () => (
          <Box sx={{ gap: '0.174rem' }}>
            <Button onClick={(e) => e.stopPropagation()}>
              <StyledIcon icon={FaTrash} sx={{ color: (theme) => theme.palette.error.main }} />
            </Button>
          </Box>
        ),
      },
    ].filter((col) => includedColumns.includes(col.id))

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  }

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelectedRows = rows.map((n) => n.id)
      setSelectedRows(newSelectedRows)
      return
    }
    setSelectedRows([])
  }

  const handleClick = (event, id) => {
    const selectedIndex = selectedRows.indexOf(id)
    let newSelectedRows = []

    if (selectedIndex === -1) {
      newSelectedRows = newSelectedRows.concat(selectedRows, id)
    } else if (selectedIndex === 0) {
      newSelectedRows = newSelectedRows.concat(selectedRows.slice(1))
    } else if (selectedIndex === selectedRows.length - 1) {
      newSelectedRows = newSelectedRows.concat(selectedRows.slice(0, -1))
    } else if (selectedIndex > 0) {
      newSelectedRows = newSelectedRows.concat(
        selectedRows.slice(0, selectedIndex),
        selectedRows.slice(selectedIndex + 1),
      )
    }

    setSelectedRows(newSelectedRows)
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const isSelected = (id) => selectedRows.indexOf(id) !== -1

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - filteredRows.length) : 0

  const addTag = (tag, selectedTags, setSelectedTags) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag])
    }
  }

  // const removeTag = (tag, selectedTag, setSelectedTag) => {
  //   setSelectedTags(selectedTags.filter((t) => t !== tag));
  // };

  return isLoading ? (
    <CircularProgress />
  ) : (
    <Grid
      container
      spacing={2}
      sx={{
        padding: '15px',
        //  overflow: "hidden",
        height: '100%',
      }}
    >
      <Grid item xs={2}>
        <EnhancedTableFilter
          customTagsOptions={customTagsOptions}
          selectedCustomTags={selectedCustomTags}
          onCustomTagsChange={setSelectedCustomTags}
          autoTagsOptions={autoTagsOptions}
          selectedAutoTags={selectedAutoTags}
          onAutoTagsChange={setSelectedAutoTags}
          authorsOptions={authorsOptions}
          selectedAuthors={selectedAuthors}
          onAuthorsChange={setSelectedAuthors}
          selectedTypes={selectedTypes}
          onTypesChange={setSelectedTypes}
        />
      </Grid>
      <Grid item xs={10} sx={{ height: '100%' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '5px', height: '100%' }}>
          <TableContainer>
            <Table aria-labelledby="tableTitle" size={'small'}>
              <EnhancedTableHead
                columns={columns}
                numSelected={selectedRows.length}
                order={order}
                orderBy={orderBy}
                onSelectAllClick={handleSelectAllClick}
                onRequestSort={handleRequestSort}
                rowCount={filteredRows.length}
                count={filteredRows.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
              <TableBody>
                {visibleRows.map((row, index) => {
                  const isItemSelected = isSelected(row?.id)

                  return (
                    <EnhancedTableRow
                      hover
                      onClick={(event) => handleClick(event, row?.id)}
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={row?.id}
                      selected={isItemSelected}
                      sx={{
                        cursor: 'pointer',
                        '&.Mui-selected': {
                          backgroundColor: 'transparent',
                          backgroundImage: (theme) =>
                            linearGradient(
                              'to right',
                              'transparent 1%',
                              `${theme.palette.secondary.main} 15%`,
                              `${theme.palette.primary.main} 85%`,
                              'transparent 99%',
                            ),
                        },
                      }}
                    >
                      {columns().map(({ id, getDataCell, cellProps, dataCellProps }) => (
                        <TableCell key={id} align="left" {...cellProps} {...dataCellProps}>
                          {getDataCell(row)}
                        </TableCell>
                      ))}
                    </EnhancedTableRow>
                  )
                })}
                {emptyRows > 0 && (
                  <EnhancedTableRow>
                    <TableCell colSpan={6} />
                  </EnhancedTableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Grid>
    </Grid>
  )
}

export default EnhancedTable
