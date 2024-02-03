import { Box } from '@mui/material'
import { merge } from 'lodash'

export const StyledIcon = ({ icon, children, size, color, ...restProps }) => {
  return (
    <Box component={icon} {...merge({ sx: { fontSize: size, color } }, restProps)}>
      {children}
    </Box>
  )
}
