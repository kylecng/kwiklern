import { Autocomplete, TextField } from '@mui/material'

export default function FilterAutocomplete(props) {
  const {
    sx,
    options,
    getOptionLabel,
    renderOption,
    renderTags,
    value,
    onChange,
    label,
    placeholder,
  } = props

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
      multiple
      disableCloseOnSelect
      options={options}
      getOptionLabel={getOptionLabel}
      renderOption={renderOption}
      renderInput={(params) => (
        <TextField {...params} size='small' label={label} placeholder={placeholder} />
      )}
      renderTags={renderTags}
      value={value}
      onChange={(event, val) => {
        return onChange(val)
      }}
    />
  )
}
