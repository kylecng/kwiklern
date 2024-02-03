import { Box, Chip, Stack } from '@mui/material'
import FilterAutocomplete from './FilterAutocomplete'
import { CONTENT_TYPE_ENUM } from '../../../common/utils/constants'
import { StyledIcon } from '../../../common/Icon'
import SearchAutocomplete from './SearchAutocomplete'
import { FlexCol, FlexRow } from '../../../common/Layout'

export default function EnhancedTableFilter({
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
}) {
  return (
    <FlexCol fw sx={{ g: 2, ...sx }}>
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
                  label={<AuthorOption author={authorsOptions[option]} />}
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
        selectedOptions={selectedAuthors}
        onChange={onAuthorsChange}
        label="by author/channel"
      />
      <FilterAutocomplete
        options={Object.keys(CONTENT_TYPE_ENUM)}
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
        selectedOptions={selectedTypes}
        onChange={onTypesChange}
        label="by file type"
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

const FileTypeOption = ({ props, contentType }) => {
  return (
    <Stack {...props} direction="row" alignItems="center" gap={1}>
      {contentType.icon && <StyledIcon icon={contentType.icon} />}
      {contentType.name}
    </Stack>
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
