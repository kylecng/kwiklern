import { useEffect, useRef, useState } from 'react'
import Browser from 'webextension-polyfill'
import Paper from '@mui/material/Paper'
import {
  Autocomplete,
  Button,
  Checkbox,
  Chip,
  FormControlLabel,
  TextField,
  ThemeProvider,
  Typography,
} from '@mui/material'
import theme from '../common/theme'
import { sendMessageToBackground } from '../../utils'
import { extractContentData } from '../../extractor/extractContentData'
import { isEmpty, isString } from 'bellajs'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import { FaStop, FaTimes } from 'react-icons/fa'
import { StyledIcon } from '../common/Icon'
import { useExtendedState, usePortal } from '../common/utils/hooks'
import { devErr, getErrStr, trySilent } from '../../../utils'
import { FlexBox, FlexCol, FlexRow } from '../common/Layout'
// import dayjs from 'dayjs';

export default function YoutubePlaylist({ initialVideosData }) {
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
            width: 1,
            height: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 1.25,
            marginBottom: 1.25,
            // bgcolor: "black",
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 2,
            boxSizing: 'border-box',
            '*': {
              boxSizing: 'border-box',
            },
          }}
        >
          <FlexCol
            fp
            sx={{
              // bgcolor: (theme) => theme.palette.primary.main,
              p: 1.25,
              br: 1.25,
              g: 1,
            }}
          >
            <FlexBox jc="end">
              <Typography>kwiklern</Typography>
            </FlexBox>
            <SummarizeOptions
              {...{
                startPlaylistSummarizing,
                isPlaylistSummarizing,
                isUseAutoTags,
                setIsUseAutoTags,
                isOnlySummarizeNew,
                setIsOnlySummarizeNew,
                setTriggerPlaylistCleanup,
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
          </FlexCol>
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
  setTriggerPlaylistCleanup,
}) => {
  return (
    <FlexCol
      component="form"
      fp
      sx={{
        jc: 'center',
        // bgcolor: (theme) => theme.palette.primary.main,
        p: 1.25,
        br: 2,
        g: 1,
      }}
    >
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'stretch',
          width: 1,
          height: 1,
          gap: 1,
        }}
      >
        {!isPlaylistSummarizing && (
          <Button
            variant="contained"
            size="large"
            onClick={() => startPlaylistSummarizing()}
            sx={{
              width: 1,
              // height: 1,
              borderRadius: 2,
            }}
          >
            Summarize
          </Button>
        )}

        {isPlaylistSummarizing && (
          <Button
            size="large"
            onClick={() => setTriggerPlaylistCleanup(true)}
            sx={{ display: 'inline-flex', gap: 0.5 }}
            endIcon={<StyledIcon icon={FaStop} />}
          >
            Stop Summarizing
          </Button>
        )}
      </Box>
      {!isPlaylistSummarizing && (
        <FlexCol g={0.5}>
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
        </FlexCol>
      )}
    </FlexCol>
  )
}

const CustomTags = ({ customTags = [], setCustomTags, isPlaylistSummarizing }) => {
  return (
    <FlexBox>
      <Typography variant="h4">Custom Tags</Typography>
      <Autocomplete
        freeSolo
        multiple
        value={customTags}
        onChange={(_, tags) => {
          setCustomTags(tags)
        }}
        options={['abc', 'def']}
        renderInput={(params) => (
          <TextField {...params} size="small" placeholder="Add Custom Tags..." />
        )}
        sx={{
          width: 1,
          marginTop: 1,
          // "& .MuiInputBase-root": {
          //   border: 1,
          //   borderColor: "#303030",
          //   borderRadius: 4,
          //   bgcolor: "#121212",
          // },
        }}
        renderTags={() => {}}
      />
      <FlexRow ai="center" g={1} flexWrap="wrap">
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
      </FlexRow>
      {!isPlaylistSummarizing && !isEmpty(customTags) && (
        <Button sx={{ display: 'inline-flex', gap: 0.5 }} onClick={() => setCustomTags([])}>
          <StyledIcon icon={FaTimes} />
          Clear all
        </Button>
      )}
    </FlexBox>
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
      // const dateCreated = dayjs().toISOString();
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
      <FlexRow
        direction="row"
        jc="start"
        i="center"
        g={1}
        sx={{
          p: 1.25,
          maxw: '50%',
          h: 1,
        }}
      >
        {errorText ? (
          <Typography variant="body2">{JSON.stringify(errorText)}</Typography>
        ) : isLoadingStoredSummaries ? (
          <Box sx={{ display: 'inline-flex', gap: 0.5 }}>
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
              sx={
                {
                  // fontSize: "12px",
                }
              }
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
              // gap: 0.5,
              // justifyContent: 'center',
              // alignItems: 'center',
              // fontSize: '12px',
              transition: (theme) =>
                theme.transitions.create(['color', 'transform'], {
                  duration: theme.transitions.duration.standard,
                }),
              '&:hover': { bgcolor: 'transparent', color: 'red' },
            }}
            onClick={cleanup}
          >
            <StyledIcon icon={FaStop} />
          </Button>
        )}
      </FlexRow>
    </Portal>
  )
}
