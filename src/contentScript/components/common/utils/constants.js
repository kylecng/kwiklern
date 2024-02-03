import { IoDocumentTextOutline, IoVideocam, IoVolumeHigh } from 'react-icons/io5'
import theme from '../theme'

export const CONTENT_TYPE_ENUM = {
  TEXT: {
    name: 'Text',
    icon: IoDocumentTextOutline,
    color: theme.palette.success.main,
  },
  VIDEO: {
    name: 'Video',
    icon: IoVideocam,
    color: theme.palette.warning.main,
  },
  AUDIO: {
    name: 'Audio',
    icon: IoVolumeHigh,
    color: theme.palette.warning.main,
  },
}
