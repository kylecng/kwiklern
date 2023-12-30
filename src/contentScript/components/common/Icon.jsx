import { Box } from '@mui/material'

export const StyledIcon = ({ icon, children, textShadow, ...restProps }) => {
  return (
    <Box component={icon} {...restProps}>
      {children}
    </Box>
  )
}
