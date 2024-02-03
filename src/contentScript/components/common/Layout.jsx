import { Box, Paper, Divider } from '@mui/material'
import { omitBy, isUndefined, pick, omit, merge, mapKeys, keys } from 'lodash'

const PROP_SHORTCUTS = {
  fd: 'flexDirection',
  f: 'flex',
  jc: 'justifyContent',
  ai: 'alignItems',
  ta: 'textAlign',
  va: 'verticalAlign',
  g: 'gap',
  w: 'width',
  h: 'height',
  minw: 'minWidth',
  maxw: 'maxWidth',
  minh: 'minHeight',
  maxh: 'maxHeight',
  b: 'border',
  br: 'borderRadius',
  pos: 'position',
}
const PROP_SHORTCUT_KEYS = keys(PROP_SHORTCUTS)

const FlexComponent = ({
  Component,
  sx = {},
  children,
  fullWidth,
  fullHeight,
  fullParent,
  fw,
  fh,
  fp,
  justifyContent = 'center',
  alignItems = 'center',
  textAlign = 'left',
  verticalAlign = 'middle',
  gap,
  ...props
}) => {
  const customProps = merge(
    omitBy(pick(props, PROP_SHORTCUT_KEYS), isUndefined),
    omitBy(pick(sx, PROP_SHORTCUT_KEYS), isUndefined),
  )
  const customToSxProps = mapKeys(customProps, (_, key) => PROP_SHORTCUTS[key])

  const restProps = omit(props, PROP_SHORTCUT_KEYS)
  const restSx = omit(sx, PROP_SHORTCUT_KEYS)

  return (
    <Component
      sx={{
        // minWidth: 0,
        // minHeight: 0,
        display: 'flex',
        ...((fw || fullWidth) && { width: 1 }),
        ...((fh || fullHeight) && { height: 1 }),
        ...((fp || fullParent) && { width: 1, height: 1 }),
        justifyContent,
        alignItems,
        textAlign,
        verticalAlign,
        gap,
        ...customToSxProps,
        ...restSx,
      }}
      {...restProps}
    >
      {children}
    </Component>
  )
}

export const FlexBox = ({ children, ...props }) => {
  return (
    <FlexComponent Component={Box} {...props}>
      {children}
    </FlexComponent>
  )
}

export const FlexRow = ({ children, rev, ...props }) => {
  return (
    <FlexBox flexDirection={!rev ? 'row' : 'row-reverse'} {...props}>
      {children}
    </FlexBox>
  )
}

export const FlexCol = ({ children, rev, ...props }) => {
  return (
    <FlexBox flexDirection={!rev ? 'column' : 'column-reverse'} {...props}>
      {children}
    </FlexBox>
  )
}

export const FlexPaper = ({ children, elevation, e, ...props }) => {
  return (
    <FlexComponent Component={Paper} elevation={e || elevation || undefined} {...props}>
      {children}
    </FlexComponent>
  )
}

export const FlexDivider = ({ children, color, ...restProps }) => {
  return (
    <Divider
      variant="fullWidth"
      flexItem
      {...merge({ sx: { borderBottom: 0.25, color } }, restProps)}
    >
      {children}
    </Divider>
  )
}
