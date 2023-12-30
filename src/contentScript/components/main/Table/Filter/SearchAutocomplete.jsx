import { Autocomplete, TextField, Box, Typography, InputAdornment } from '@mui/material'
import { matchSorter } from 'match-sorter'
import { StyledIcon } from '../../../common/Icon'
import { FaSearch } from 'react-icons/fa'
import { devLog } from '../../../../../utils'
import { searchCache } from './SearchHandler'

const SearchAutocomplete = (props) => {
  const { sx, onChange } = props

  const options = Object.keys(searchCache?.searchableTerms?.summary || {})
  const renderOption = (props, option, state, ownerState) => {
    const { id, index } = option
    const [lineId, termId, summaryId] = index
    return (
      <Box key={id}>
        <Typography>
          {searchCache?.summaries?.[summaryId]?.tokenizedSummaryText?.[lineId]?.terms?.map(
            ({ text, pre, post }, termIndex) => (
              <Box
                component="span"
                sx={{ color: (theme) => (termId === termIndex ? 'orange' : 'white') }}
              >{`${pre}${text}${post}`}</Box>
            ),
          )}
        </Typography>
      </Box>
    )
  }
  const filterOptions = (options, { inputValue }) => {
    if (inputValue === '') return []
    const filteredOptions = matchSorter(
      options.map((option) => searchCache?.searchableTerms?.summary?.[option]),
      inputValue,
      { keys: ['text'] },
    )
    return filteredOptions.length > 5 ? filteredOptions.slice(0, 5) : filteredOptions
  }
  return (
    <Autocomplete
      sx={{
        width: '100%',
        '& .MuiInputBase-root': {
          border: '1px solid #303030',
          borderRadius: '20px',
          backgroundColor: '#121212',
        },
        ...sx,
      }}
      freeSolo
      options={options}
      getOptionLabel={(option) => option.id}
      filterOptions={filterOptions}
      renderOption={renderOption}
      renderInput={(params) => (
        <TextField
          {...params}
          size="small"
          label={`Search`}
          placeholder={`search`}
          // InputProps={{
          //   startAdornment: (
          //     <InputAdornment position="start" sx={{ marginLeft: "10px" }}>
          //       <StyledIcon icon={FaSearch} />
          //     </InputAdornment>
          //   ),
          // }}
        />
      )}
      onChange={(event, value) => {
        // if (value) return onChange(value);
        devLog(value)
      }}
    />
  )
}

export default SearchAutocomplete
