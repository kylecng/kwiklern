import { useState, useEffect, useMemo } from 'react'
import Box from '@mui/material/Box'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import Checkbox from '@mui/material/Checkbox'
import { BsFillTrash3Fill } from 'react-icons/bs'
import { linearGradient } from '../../common/utils/color'
import { CONTENT_TYPE_ENUM } from '../../common/utils/constants'
import { AiFillCalendar } from 'react-icons/ai'
import { StyledIcon } from '../../common/Icon'
import { Button, Link, MenuItem } from '@mui/material'
import { PiListBulletsBold } from 'react-icons/pi'
import EnhancedTableHead from './EnhancedTableHead'
import EnhancedTableRow from './EnhancedTableRow'
import EnhancedTableFilter from './Filter/EnhancedTableFilter'
import CircularProgress from '@mui/material/CircularProgress'
import { devErr } from '../../../../utils'
import { sendMessageToBackground } from '../../../utils'
import { FlexBox, FlexCol, FlexRow } from '../../common/Layout'
import { RiSettings3Fill } from 'react-icons/ri'
import { useNavigate } from 'react-router-dom'
import { useDidMount } from '../../common/utils/hooks'
import { processTokenizedData } from './Filter/SearchHandler'
import { entries, fromPairs, values, zip } from 'lodash'
import Markdown from 'react-markdown'
import Mark from 'mark.js'

// const selectedTableId = 0;
// import { useDidMount } from '../../common/utils/hooks';

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

export default function EnhancedTable() {
  // const { selectedTableId } = props;
  const isFirstRender = useDidMount()
  const [rows, setRows] = useState([])
  const [
    includedColumns,
    // setIncludedColumns
  ] = useState(['checkbox', 'metadata', 'summaryText', 'actions'])
  const [isLoading, setIsLoading] = useState(true)
  const filters = { search: '', customTags: [], autoTags: [], authors: [], contentTypes: [] }
  const filterStates = fromPairs(
    entries(filters).map(([key, initialValue]) => [
      key,
      fromPairs(zip(['value', 'set'], useState(initialValue))),
    ]),
  )
  const [filterOptions, setFilterOptions] = useState({})
  const [filterFns, setFilterFns] = useState({})
  const [order, setOrder] = useState('asc')
  const [orderBy, setOrderBy] = useState('product')
  const [selectedRows, setSelectedRows] = useState([])
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [filteredRows, setFilteredRows] = useState([])
  const navigate = useNavigate()
  const markInstance = new Mark(document.querySelector('#table-body'))

  useEffect(() => {
    const newFilteredRows = rows.filter((row) => {
      for (const filterFn of values(filterFns)) {
        if (!filterFn(row)) return false
      }
      return true
    })
    setFilteredRows(newFilteredRows)
  }, [rows, filterFns])

  const visibleRows = useMemo(
    () =>
      stableSort(filteredRows, getComparator(order, orderBy)).slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage,
      ),
    [filteredRows, order, orderBy, page, rowsPerPage],
  )

  useEffect(() => document?.querySelector('#table-container')?.scrollTo(0, 0), [visibleRows])

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
          const newRows = summaries.map((row = {}) => {
            const {
              id,
              contents: content = {},
              title: summaryTitle,
              text: summaryText,
              customTags = [],
              autoTags = [],
              dateCreated,
              dateModified,
            } = row
            const {
              // id: contentId,
              url,
              domain,
              type: contentType,
              title: contentTitle,
              authors: author = {},
              authorName,
              text: contentText,
            } = content
            const { id: authorId, url: authorUrl, domain: authorDomain, name, imageUrl } = author

            customTags.forEach((customTag) => newCustomTagsOptions.add(customTag))
            autoTags.forEach((autoTag) => newAutoTagsOptions.add(autoTag))
            newAuthorsOptions[authorId] = author

            return {
              id,
              url,
              domain,
              contentType,
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
          setFilterOptions({
            customTags: [...newCustomTagsOptions],
            autoTags: [...newAutoTagsOptions],
            authors: newAuthorsOptions,
          })

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

  useEffect(() => {
    if (isFirstRender) return
    processTokenizedData(rows)
  }, [rows])

  const getDefaultHeaderCell = (value, icon) => (
    <FlexRow g={1}>
      {icon && <StyledIcon icon={icon} />}
      <FlexBox>{value}</FlexBox>
    </FlexRow>
  )

  // const getDefaultDataCell = (value) => (
  //   <FlexBox jc="start" g={0.8}>
  //     <FlexBox
  //     >
  //       {value}
  //     </FlexBox>
  //   </FlexBox>
  // );

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
        headerCellProps: { sx: { width: 0.3 } },
        getHeaderCell: () => getDefaultHeaderCell('Source'),
        getDataCell: ({ contentType, title, url, author, customTags, autoTags }) => {
          const renderTags = (tags = [], selectedTags, setSelectedTags) => (
            <FlexRow sx={{ rowGap: 0.5, columnGap: 1, flexWrap: 'wrap' }}>
              {[...tags].map((tag, index) => (
                <FlexRow
                  key={`${tag}${index}`}
                  // label={tag}
                  sx={{
                    '&:hover': { color: (theme) => theme.palette.primary.main },
                    p: 1,
                    b: 1,
                    br: 3,
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    addTag(tag, selectedTags, setSelectedTags)
                  }}
                >
                  {tag}
                </FlexRow>
              ))}
            </FlexRow>
          )

          return (
            <FlexCol
              g={1.25}
              sx={
                {
                  // fontSize: '20px',
                }
              }
            >
              {contentType && (
                <StyledIcon
                  icon={CONTENT_TYPE_ENUM[contentType].icon}
                  onClick={(e) => {
                    e.stopPropagation()
                    url && window?.open(url)
                  }}
                />
              )}
              <FlexBox>
                <Link
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    // whiteSpace: "nowrap"
                    fontSize: '1.5rem',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {title}
                </Link>
              </FlexBox>
              <FlexBox>
                <Box
                  component="img"
                  referrerPolicy="no-referrer"
                  sx={{
                    objectFit: 'cover',
                    width: '1.5rem',
                    borderRadius: '50% 50%',
                    marginRight: 0.25,
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
                  sx={
                    {
                      // whiteSpace: "nowrap"
                      // fontSize: '14px',
                    }
                  }
                  onClick={(e) => e.stopPropagation()}
                >
                  {author?.name}
                </Link>
              </FlexBox>
              {renderTags(
                customTags,
                filterStates['customTags'].value,
                filterStates['customTags'].set,
              )}
              {renderTags(autoTags, filterStates['autoTags'].value, filterStates['autoTags'].set)}
            </FlexCol>
          )
        },
      },
      {
        id: 'summaryText',
        headerCellProps: { sx: { width: 0.6 } },
        getHeaderCell: () => getDefaultHeaderCell('Summary', PiListBulletsBold),
        getDataCell: ({ summaryText }) => (
          // <Typography sx={{ whiteSpace: "pre-line" }}>{summaryText}</Typography>
          <Markdown>{summaryText}</Markdown>
        ),
      },
      {
        id: 'dateCreated',
        getHeaderCell: () => getDefaultHeaderCell('Date Created', AiFillCalendar),
        getDataCell: ({ dateCreated }) => (
          <FlexBox>
            {new Date(dateCreated).toLocaleDateString('en-US', {
              year: '2-digit',
              month: '2-digit',
              day: '2-digit',
            })}
          </FlexBox>
        ),
      },
      {
        id: 'actions',
        getHeaderCell: () => {},
        getDataCell: () => (
          <FlexBox sx={{ g: 0.25 }}>
            <Button onClick={(e) => e.stopPropagation()}>
              <StyledIcon
                icon={BsFillTrash3Fill}
                sx={{ color: (theme) => theme.palette.error.main }}
              />
            </Button>
          </FlexBox>
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

  useEffect(() => {
    markInstance.unmark({
      done: () => {
        markInstance.mark(filterStates.search.value)
      },
    })
  }, [filteredRows, filterStates.search])

  return (
    <FlexCol fp g={2.5} p={3} sx={{ overflow: 'hidden' }}>
      <FlexRow fw jc="end" sx={{ flexShrink: 0 }}>
        <Button onClick={() => navigate('/options')}>
          <StyledIcon icon={RiSettings3Fill} size="3rem" />
        </Button>
      </FlexRow>
      {isLoading ? (
        <FlexBox fw f={1}>
          <CircularProgress />
        </FlexBox>
      ) : (
        <FlexRow fw f={1} minh={0} pos="relative" g={3}>
          <FlexCol w={0.2} jc="start" fh pos="relative">
            <EnhancedTableFilter
              filterStates={filterStates}
              filterOptions={filterOptions}
              setFilterFns={setFilterFns}
            />
          </FlexCol>
          <FlexBox fh f={1} jc="start" pos="relative">
            <FlexCol fh g={0.5}>
              <TableContainer id="table-container">
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
                  <TableBody id="table-body">
                    {visibleRows.map((row) => {
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
                              bgcolor: 'transparent',
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
            </FlexCol>
          </FlexBox>
        </FlexRow>
      )}
    </FlexCol>
  )
}
