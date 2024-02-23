import { Box, Chip, InputAdornment, TextField } from '@mui/material'
import FilterAutocomplete from './FilterAutocomplete'
import { CONTENT_TYPE_ENUM } from '../../../common/utils/constants'
import { StyledIcon } from '../../../common/Icon'
// import SearchAutocomplete from './SearchAutocomplete'
import { FlexCol, FlexRow } from '../../../common/Layout'
import { intersection, isEmpty, keys } from 'lodash'
import { FaSearch } from 'react-icons/fa'

export default function EnhancedTableFilter({ sx, filterStates, filterOptions, setFilterFns }) {
  const onChangeBase = (filter, getFilterFn, modifyVal) => (val) => {
    const value = modifyVal ? modifyVal(val) : val
    filterStates?.[filter]?.set?.(value)
    return setFilterFns((prevFilterFns) => ({
      ...prevFilterFns,
      [filter]: getFilterFn(value),
    }))
  }

  const defaultProps = (filter) => ({
    options: filterOptions?.[filter] || [],
    value: filterStates?.[filter]?.value,
  })

  return (
    <FlexCol fw sx={{ g: 2, ...sx }}>
      {/* <SearchAutocomplete /> */}
      <TextField
        size="small"
        sx={{ width: 1 }}
        value={filterStates?.search.value}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <StyledIcon icon={FaSearch} />
            </InputAdornment>
          ),
        }}
        onChange={onChangeBase(
          'search',
          (value) => {
            return (row) => {
              return isEmpty(value) || row?.summaryText?.toLowerCase().includes(value.toLowerCase())
            }
          },
          (value) => value?.target?.value,
        )}
      />
      <FilterAutocomplete
        {...defaultProps('customTags')}
        onChange={onChangeBase(
          'customTags',
          (value) => (row) => isEmpty(value) || !isEmpty(intersection(value, row?.customTags)),
        )}
        label="by custom tag"
      />
      <FilterAutocomplete
        {...defaultProps('autoTags')}
        onChange={onChangeBase(
          'autoTags',
          (value) => (row) => isEmpty(value) || !isEmpty(intersection(value, row?.autoTags)),
        )}
        label="by auto-tag"
      />
      <FilterAutocomplete
        {...defaultProps('authors')}
        options={keys(filterOptions.authors)}
        renderOption={(props) => {
          return <AuthorOption props={props} author={filterOptions.authors[props.key]} />
        }}
        renderTags={(value, getTagProps) => {
          return (
            <FlexRow
              sx={{
                flexWrap: 'wrap',
                ai: 'start',
                g: 0.5,
                maxw: '100%',
              }}
            >
              {value.map((option, index) => (
                <Chip
                  key={`${option}${index}`}
                  {...getTagProps({ index })}
                  label={<AuthorOption author={filterOptions.authors[option]} />}
                  sx={{
                    '& .MuiStack-root': {
                      overflow: 'hidden',
                    },
                  }}
                />
              ))}
            </FlexRow>
          )
        }}
        onChange={onChangeBase('authors', (value) => (row) => {
          return isEmpty(value) || value.includes(row?.author?.id)
        })}
        label="by author/channel"
      />
      <FilterAutocomplete
        {...defaultProps('contentTypes')}
        options={keys(CONTENT_TYPE_ENUM)}
        renderOption={(props) => {
          return <ContentTypeOption props={props} contentType={CONTENT_TYPE_ENUM[props.key]} />
        }}
        renderTags={(value, getTagProps) => {
          return (
            <FlexRow
              sx={{
                flexWrap: 'wrap',
                ai: 'start',
                g: 0.5,
                maxw: '100%',
              }}
            >
              {value.map((option, index) => (
                <Chip
                  key={`${option}${index}`}
                  {...getTagProps({ index })}
                  label={<ContentTypeOption contentType={CONTENT_TYPE_ENUM[option]} />}
                  sx={{
                    '& .MuiStack-root': {
                      overflow: 'hidden',
                    },
                  }}
                />
              ))}
            </FlexRow>
          )
        }}
        onChange={onChangeBase(
          'contentTypes',
          (value) => (row) => isEmpty(value) || value.includes(row?.contentType),
        )}
        label="by content type"
      />
    </FlexCol>
  )
}

const AuthorOption = ({ props, author }) => {
  return (
    <FlexRow g={1} {...props}>
      {author?.imageUrl && (
        <Box
          component="img"
          referrerPolicy="no-referrer"
          sx={{
            objectFit: 'cover',
            width: '1.5rem',
            borderRadius: '50% 50%',
          }}
          src={author?.imageUrl}
        />
      )}
      {author?.name}
    </FlexRow>
  )
}

const ContentTypeOption = ({ props, contentType }) => {
  return (
    <FlexRow {...props} g={1}>
      {contentType.icon && <StyledIcon icon={contentType.icon} />}
      {contentType.name}
    </FlexRow>
  )
}
