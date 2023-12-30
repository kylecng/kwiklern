import { useEffect, useRef, useState } from 'react'
import Browser from 'webextension-polyfill'
import Paper from '@mui/material/Paper'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Autocomplete,
  Button,
  Checkbox,
  Chip,
  FormControlLabel,
  Stack,
  TextField,
  ThemeProvider,
  Tooltip,
  Typography,
} from '@mui/material'
import theme from '../common/theme'
import { sendMessageToBackground } from '../../utils'
import { extractContentData } from '../../extractor/extractContentData'
import { isArray, isEmpty, isString } from 'bellajs'
import dayjs from 'dayjs'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import { FaStop, FaTimes } from 'react-icons/fa'
import { StyledIcon } from '../common/Icon'
import { FaTimesCircle } from 'react-icons/fa'
import { useExtendedState, usePortal } from '../common/utils/hooks'
import { devErr, devLog, getErrStr, trySilent } from '../../../utils'

export default ({ initialVideosData }) => {
  const [videosData, setVideosData] = useState(initialVideosData)
  const [customTags, setCustomTags, getCustomTags] = useExtendedState([])
  const [isPlaylistSummarizing, setIsPlaylistSummarizing] = useState(false)
  const [triggerPlaylistSummarize, setTriggerPlaylistSummarize] = useState(false)
  const [triggerPlaylistCleanup, setTriggerPlaylistCleanup] = useState(false)
  const [isUseAutoTags, setIsUseAutoTags, getIsUseAutoTags] = useExtendedState(false)
  const [isOnlySummarizeNew, setIsOnlySummarizeNew, getIsOnlySummarizeNew] = useExtendedState(false)
  const [hasStoredSummaries, setHasStoredSummaries] = useState(false)
  const [isLoadingStoredSummaries, setIsLoadingStoredSummaries] = useState(true)
  const [errorText, setErrorText] = useState('')

  useEffect(() => {
    if (triggerPlaylistSummarize) {
      setTriggerPlaylistSummarize(false)
    }
  }, [triggerPlaylistSummarize])

  useEffect(() => {
    if (triggerPlaylistCleanup) {
      setTriggerPlaylistCleanup(false)
    }
  }, [triggerPlaylistCleanup])

  useEffect(() => {
    checkHasStoredSummaries()
  }, [])

  const startPlaylistSummarizing = async () => {
    setTriggerPlaylistSummarize({
      isUseAutoTags: await getIsUseAutoTags(),
      customTags: await getCustomTags(),
      isOnlySummarizeNew: await getIsOnlySummarizeNew(),
    })
  }

  const checkHasStoredSummaries = async () => {
    try {
      const contentDatas = []
      setVideosData(
        await Promise.all(
          videosData.map(async (videoData) => {
            const contentData = await extractContentData(videoData.videoUrl)
            contentDatas.push(contentData)
            return { ...videoData, contentData }
          }),
        ),
      )

      const { hasSummaries } = await sendMessageToBackground({
        action: 'checkHasSummaryBulk',
        type: 'DATABASE',
        data: [contentDatas],
      })
      setHasStoredSummaries(hasSummaries)
    } catch (err) {
      devErr(err)
      setErrorText(getErrStr(err))
    } finally {
      setIsLoadingStoredSummaries(false)
    }
  }

  return (
    <ThemeProvider theme={theme}>
      {errorText ? (
        <Typography>{errorText}</Typography>
      ) : (
        <Paper
          sx={{
            width: '100%',
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '10px',
            marginBottom: '10px',
            backgroundColor: 'black',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '10px',
            boxSizing: 'border-box',
            '*': {
              boxSizing: 'border-box',
            },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              // backgroundColor: (theme) => theme.palette.primary.main,
              padding: '10px',
              borderRadius: '10px',
              width: '100%',
              height: '100%',
              gap: '5px',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'end' }}>
              <Typography>kwiklern</Typography>
            </Box>
            <SummarizeOptions
              {...{
                startPlaylistSummarizing,
                isPlaylistSummarizing,
                isUseAutoTags,
                setIsUseAutoTags,
                isOnlySummarizeNew,
                setIsOnlySummarizeNew,
              }}
            />
            <CustomTags
              {...{ customTags, setCustomTags, isPlaylistSummarizing, setIsPlaylistSummarizing }}
            />
            {videosData.map(({ videoId, videoElementId, contentData }) => {
              return (
                <PlaylistVideo
                  key={videoId}
                  {...{
                    videoElementId,
                    contentData,
                    triggerPlaylistSummarize,
                    triggerPlaylistCleanup,
                    isLoadingStoredSummaries,
                    hasStoredSummaries,
                  }}
                />
              )
            })}
          </Box>
        </Paper>
      )}
    </ThemeProvider>
  )
}

const SummarizeOptions = ({
  startPlaylistSummarizing,
  isPlaylistSummarizing,
  isUseAutoTags,
  setIsUseAutoTags,
  isOnlySummarizeNew,
  setIsOnlySummarizeNew,
}) => {
  return (
    <Box
      component="form"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        // backgroundColor: (theme) => theme.palette.primary.main,
        padding: '10px',
        borderRadius: '10px',
        width: '100%',
        height: '100%',
        gap: '5px',
      }}
    >
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'stretch',
          width: '100%',
          height: '100%',
          gap: '5px',
        }}
      >
        {!isPlaylistSummarizing && (
          <Button
            variant="contained"
            size="large"
            onClick={() => startPlaylistSummarizing()}
            sx={{
              width: '100%',
              // height: '100%',
              borderRadius: '10px',
            }}
          >
            Summarize
          </Button>
        )}

        {isPlaylistSummarizing && (
          <Button
            size="large"
            onClick={() => setTriggerPlaylistCleanup(true)}
            sx={{ display: 'inline-flex', gap: '5px' }}
            endIcon={<StyledIcon icon={FaStop} />}
          >
            Stop Summarizing
          </Button>
        )}
      </Box>
      {!isPlaylistSummarizing && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            // justifyContent: 'center',
            // alignItems: 'center',
            gap: '5px',
          }}
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={isUseAutoTags}
                onChange={(event) => setIsUseAutoTags(event.target.checked)}
              />
            }
            label={<Typography variant="body2">Automatically generate tags</Typography>}
          ></FormControlLabel>
          <FormControlLabel
            control={
              <Checkbox
                checked={isOnlySummarizeNew}
                onChange={(event) => setIsOnlySummarizeNew(event.target.checked)}
              />
            }
            label={<Typography variant="body2">Only summarize missing videos</Typography>}
          ></FormControlLabel>
        </Box>
      )}
    </Box>
  )
}

const CustomTags = ({ customTags, setCustomTags, isPlaylistSummarizing }) => {
  return (
    <Box>
      <Typography variant="h4">Custom Tags</Typography>
      <Autocomplete
        freeSolo
        multiple
        value={customTags || []}
        onChange={(_, tags) => {
          setCustomTags(tags)
        }}
        options={['abc', 'def']}
        renderInput={(params) => (
          <TextField {...params} size="small" placeholder="Add Custom Tags..." />
        )}
        sx={{
          width: '100%',
          marginTop: '5px',
          // '& .MuiInputBase-root': {
          //   border: '1px solid #303030',
          //   borderRadius: '20px',
          //   backgroundColor: '#121212',
          // },
        }}
        renderTags={() => {}}
      />
      <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
        {customTags.map((tag, index) => (
          <Chip
            key={`${tag}${index}`}
            label={tag}
            sx={{ '&:hover': { color: (theme) => theme.palette.primary.main } }}
            onDelete={
              isPlaylistSummarizing
                ? null
                : () => setCustomTags((prevTags) => prevTags.filter((t) => t !== tag))
            }
          />
        ))}
      </Stack>
      {!isPlaylistSummarizing && !isEmpty(customTags) && (
        <Button sx={{ display: 'inline-flex', gap: '5px' }} onClick={() => setCustomTags([])}>
          <StyledIcon icon={FaTimes} />
          Clear all
        </Button>
      )}
    </Box>
  )
}

const PlaylistVideo = ({
  videoElementId,
  contentData,
  triggerPlaylistSummarize,
  triggerPlaylistCleanup,
  isLoadingStoredSummaries,
  hasStoredSummaries,
}) => {
  const [isSummarizing, setIsSummarizing] = useState(false)
  const [hasStoredSummary, setHasStoredSummary] = useState(false)
  const [triggerSummarize, setTriggerSummarize] = useState(false)
  const [errorText, setErrorText] = useState('')
  const portRef = useRef(null)
  const listenerRef = useRef(null)

  const Portal = usePortal(document.getElementById(videoElementId))

  useEffect(() => {
    if (triggerPlaylistSummarize) {
      setTriggerSummarize(triggerPlaylistSummarize)
    }
  }, [triggerPlaylistSummarize])

  useEffect(() => {
    checkHasStoredSummary()
  }, [hasStoredSummaries])

  useEffect(() => {
    if (triggerSummarize && !isSummarizing && !isLoadingStoredSummaries) {
      const { isUseAutoTags, customTags, isOnlySummarizeNew } = triggerSummarize
      setTriggerSummarize(false)
      if (isOnlySummarizeNew && hasStoredSummary) return
      setIsSummarizing(true)
      startSummarizing({ isUseAutoTags, customTags })
    }
  }, [triggerSummarize, isSummarizing, isLoadingStoredSummaries, hasStoredSummary])

  useEffect(() => {
    if (triggerPlaylistCleanup) {
      cleanup()
    }
  }, [triggerPlaylistCleanup])

  const cleanup = () => {
    setIsSummarizing(false)
    const listener = listenerRef.current
    const port = portRef.current
    listener && port?.onMessage?.removeListener(listener)
    port?.disconnect()
  }

  const checkHasStoredSummary = async () => {
    try {
      if (!hasStoredSummaries || isEmpty(hasStoredSummaries)) return
      const { id: summaryId } = await sendMessageToBackground({
        action: 'getSummaryId',
        type: 'DATABASE',
        data: [{ content: contentData }],
      })
      setHasStoredSummary(hasStoredSummaries?.[summaryId])
    } catch (err) {
      devErr(err)
      setErrorText(getErrStr(err))
    }
  }

  const startSummarizing = async ({ isUseAutoTags, customTags }) => {
    try {
      const { prompt } = await sendMessageToBackground({
        action: 'GET_PROMPT',
        data: {
          contentData,
          isUseAutoTags,
        },
      })
      const port = Browser.runtime.connect()
      portRef.current = port
      const dateCreated = dayjs().toISOString()
      const listener = (msg) => {
        if (msg.status === 'ANSWER') {
          setIsSummarizing(true)
        } else if (msg.status === 'DONE') {
          cleanup()
          setHasStoredSummary(true)
        } else if (msg.status === 'DISCONNECT') {
          cleanup()
        } else if (msg.error) {
          cleanup()
          let errorMessage = msg.error
          trySilent(() => {
            const err = JSON.parse(msg.error).detail.message
            if (err && isString(err)) errorMessage = err
          })
          devErr(errorMessage)
          setErrorText(errorMessage)
        }
      }
      listenerRef.current = listener

      port.onMessage.addListener(listener)
      port.postMessage({
        prompt,
        isUseAutoTags,
        contentData,
        summaryData: { customTags },
        isSendStatusOnly: true,
      })
    } catch (err) {
      devErr(err)
      setErrorText(getErrStr(err))
    }
  }

  return (
    <Portal>
      <Stack
        direction="row"
        justifyContent="start"
        alignItems="center"
        gap="5px"
        sx={{
          padding: '10px',
          maxWidth: '50%',
          height: '100%',
        }}
      >
        {errorText ? (
          <Typography variant="body2">{JSON.stringify(errorText)}</Typography>
        ) : isLoadingStoredSummaries ? (
          <Box sx={{ display: 'inline-flex', gap: '5px' }}>
            <CircularProgress size="1.5rem" />
            <Typography variant="body2">Loading summary</Typography>
          </Box>
        ) : (
          hasStoredSummary && (
            <Button
              variant="outlined"
              size="small"
              onClick={() =>
                sendMessageToBackground({
                  action: 'OPEN_MAIN_PAGE',
                })
              }
              sx={{
                fontSize: '12px',
              }}
            >
              View Summary
            </Button>
          )
        )}
        {isSummarizing && (
          <Box sx={{ display: 'inline-flex' }}>
            <CircularProgress size="1.5rem" />
          </Box>
        )}
        {isSummarizing && (
          <Button
            // variant="outlined"
            size="large"
            sx={{
              // display: 'inline-flex',
              // gap: '5px',
              // justifyContent: 'center',
              // alignItems: 'center',
              // fontSize: '12px',
              transition: (theme) =>
                theme.transitions.create(['color', 'transform'], {
                  duration: theme.transitions.duration.standard,
                }),
              '&:hover': { backgroundColor: 'transparent', color: 'red' },
            }}
            onClick={cleanup}
          >
            <StyledIcon icon={FaStop} />
          </Button>
        )}
      </Stack>
    </Portal>
  )
}
