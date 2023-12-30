import { Autocomplete, TextField } from '@mui/material'

const FilterAutocomplete = (props) => {
  const {
    sx,
    options,
    getOptionLabel,
    renderOption,
    renderTags,
    selectedOptions,
    onChange,
    label,
    placeholder,
  } = props

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
      multiple
      disableCloseOnSelect
      options={options}
      getOptionLabel={getOptionLabel}
      renderOption={renderOption}
      renderInput={(params) => (
        <TextField {...params} size="small" label={label} placeholder={placeholder} />
      )}
      renderTags={renderTags}
      value={selectedOptions}
      onChange={(event, value) => {
        if (value) return onChange(value)
      }}
    />
  )
}

export default FilterAutocomplete
