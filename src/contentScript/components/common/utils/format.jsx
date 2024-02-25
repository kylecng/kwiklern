import Box from '@mui/material/Box'

export const formatText = (text) => {
  if (!text) return ''
  const segments = text.split(/\*\*([^*]+)\*\*/g)
  return segments.map((segment, index) => {
    return index % 2 === 0 ? (
      <Box component='span' key={index}>
        {segment}
      </Box>
    ) : (
      <Box component='strong' key={index}>
        {segment}
      </Box>
    )
  })
}
