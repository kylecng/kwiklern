import { Autocomplete, TextField, Box, Typography } from '@mui/material'
import { matchSorter } from 'match-sorter'
import { searchCache } from './SearchHandler'
import { FlexBox } from '../../../common/Layout'
import { keys } from 'lodash'

export default function SearchAutocomplete(props) {
  const {
    sx,
    // onChange
  } = props

  const textType = 'summaryText'
  const textTypeTokenizedKey = `${textType}Tokenized`

  const options = [...keys(searchCache?.searchableTerms?.[textType] || {})]

  const renderOption = (props, option) => {
    const { id, index } = option
    const [lineId, termId, summaryId, textType] = index
    return (
      <FlexBox key={id} jc='start' px={2} pb={1} sx={{ '&:hover': { bgcolor: '#494949' } }}>
        <Typography>
          {searchCache?.summaries?.[summaryId]?.[textTypeTokenizedKey]?.[lineId]?.terms?.map(
            ({ text, pre, post }, termIndex) => (
              <Box
                key={termIndex}
                component='span'
                sx={{ color: () => (termId === termIndex ? 'orange' : 'white') }}
              >{`${pre}${text}${post}`}</Box>
            ),
          )}
        </Typography>
      </FlexBox>
    )
  }

  const filterOptions = (options, { inputValue }) => {
    if (inputValue === '') return []
    const filteredOptions = matchSorter(
      options.map((option) => searchCache?.searchableTerms?.[textType]?.[option]),
      inputValue,
      { keys: ['text'] },
    )
    return filteredOptions.length > 5 ? filteredOptions.slice(0, 5) : filteredOptions
  }

  return (
    <Autocomplete
      sx={{
        width: 1,
        // "& .MuiInputBase-root": {
        //   border: 1,
        //   borderColor: "#303030",
        //   borderRadius: 4,
        //   bgcolor: "#121212",
        // },
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
          size='small'
          label={`Search`}
          placeholder={`search`}
          // InputProps={{
          //   startAdornment: (
          //     <InputAdornment position="start" sx={{ marginLeft: 1.25 }}>
          //       <StyledIcon icon={FaSearch} />
          //     </InputAdornment>
          //   ),
          // }}
        />
      )}
      // ListboxComponent={(props) => {
      //   return <FlexCol {...props} jc="space-between" g={2} p={2} />;
      // }}
      // open
      // onChange={(event, value) => {
      //   if (value) return onChange(value);
      // }}
    />
  )
}
