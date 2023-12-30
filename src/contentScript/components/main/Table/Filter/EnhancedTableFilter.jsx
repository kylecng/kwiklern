import { Box, Chip, Stack } from '@mui/material'
import FilterAutocomplete from './FilterAutocomplete'
import { CONTENT_TYPE_ENUM } from '../../../common/utils/constants'
import { StyledIcon } from '../../../common/Icon'
import SearchAutocomplete from './SearchAutocomplete'

const EnhancedTableFilter = (props) => {
  const {
    sx,
    customTagsOptions,
    selectedCustomTags,
    onCustomTagsChange,
    autoTagsOptions,
    selectedAutoTags,
    onAutoTagsChange,
    authorsOptions,
    selectedAuthors,
    onAuthorsChange,
    selectedTypes,
    onTypesChange,
  } = props

  return (
    <Stack sx={{ gap: '15px', ...sx }}>
      <SearchAutocomplete />
      <FilterAutocomplete
        options={customTagsOptions}
        selectedOptions={selectedCustomTags}
        onChange={onCustomTagsChange}
        label="by custom tag"
      />
      <FilterAutocomplete
        options={autoTagsOptions}
        selectedOptions={selectedAutoTags}
        onChange={onAutoTagsChange}
        label="by auto-tag"
      />
      <FilterAutocomplete
        options={Object.keys(authorsOptions)}
        renderOption={(props) => {
          return <AuthorOption props={props} author={authorsOptions[props.key]} />
        }}
        renderTags={(value, getTagProps) => {
          return (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'wrap',
                alignItems: 'start',
                gap: '5px',
                maxWidth: '100%',
              }}
            >
              {value.map((option, index) => (
                <Chip
                  key={`${option}${index}`}
                  {...getTagProps({ index })}
                  label={<AuthorOption author={authorsOptions[option]} />}
                  sx={{
                    '& .MuiStack-root': {
                      overflow: 'hidden',
                    },
                  }}
                />
              ))}
            </Box>
          )
        }}
        selectedOptions={selectedAuthors}
        onChange={onAuthorsChange}
        label="by author/channel"
      />
      <FilterAutocomplete
        options={Object.keys(CONTENT_TYPE_ENUM)}
        renderOption={(props) => {
          return <FileTypeOption props={props} contentType={CONTENT_TYPE_ENUM[props.key]} />
        }}
        renderTags={(value, getTagProps) => {
          return (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'wrap',
                alignItems: 'start',
                gap: '5px',
                maxWidth: '100%',
              }}
            >
              {value.map((option, index) => (
                <Chip
                  key={`${option}${index}`}
                  {...getTagProps({ index })}
                  label={<FileTypeOption contentType={CONTENT_TYPE_ENUM[option]} />}
                  sx={{
                    '& .MuiStack-root': {
                      overflow: 'hidden',
                    },
                  }}
                />
              ))}
            </Box>
          )
        }}
        selectedOptions={selectedTypes}
        onChange={onTypesChange}
        label="by file type"
      />
    </Stack>
  )
}

const AuthorOption = ({ props, author }) => {
  return (
    <Stack direction="row" alignItems="center" gap={1} {...props}>
      {author?.imageUrl && (
        <Box
          component="img"
          referrerPolicy="no-referrer"
          sx={{
            objectFit: 'cover',
            width: '25px',
            borderRadius: '50% 50%',
          }}
          src={author?.imageUrl}
        />
      )}
      {author?.name}
    </Stack>
  )
}

const FileTypeOption = ({ props, contentType }) => {
  return (
    <Stack {...props} direction="row" alignItems="center" gap={1}>
      {contentType.icon && <StyledIcon icon={contentType.icon} />}
      {contentType.name}
    </Stack>
  )
}

export default EnhancedTableFilter
