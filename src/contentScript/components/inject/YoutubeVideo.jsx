import { useEffect, useRef, useState } from 'react'
import Browser from 'webextension-polyfill'
import Paper from '@mui/material/Paper'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Autocomplete,
  Button,
  Chip,
  IconButton,
  Stack,
  TextField,
  ThemeProvider,
  Typography,
} from '@mui/material'
import theme from '../common/theme'
import { sendMessageToBackground } from '../../utils'
import { extractContentData } from '../../extractor/extractContentData'
import { isArray, isEmpty, isString } from 'bellajs'
import dayjs from 'dayjs'
import Box from '@mui/material/Box'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import CircularProgress from '@mui/material/CircularProgress'
import { FaStop, FaEdit, FaSave, FaTimes } from 'react-icons/fa'
import { StyledIcon } from '../common/Icon'
import { useExtendedState } from '../common/utils/hooks'
import { formatText } from '../common/utils/format'
import { devErr, getErrStr } from '../../../utils'

const SummarizeButtons = ({ summaryData, startSummarizing, isSummarizing, cleanup }) => {
  return (
    <Box
      component="form"
      sx={{
        display: 'flex',
        alignItems: 'stretch',
        width: '100%',
        height: '100%',
        gap: '5px',
      }}
    >
      {!isSummarizing && (
        <Button
          variant="contained"
          size="large"
          onClick={() => startSummarizing({ isUseAutoTags: false })}
          sx={{
            width: '100%',
            // height: '100%',
            borderRadius: '10px',
          }}
        >
          Summarize
        </Button>
      )}
      {!isSummarizing && (
        <Button
          variant="contained"
          size="large"
          onClick={() => startSummarizing({ isUseAutoTags: true })}
          sx={{
            width: '100%',
            // height: '100%',
            borderRadius: '10px',
          }}
        >
          Summarize w/ Auto-Tags
        </Button>
      )}
      {isSummarizing && (
        <Button sx={{ display: 'inline-flex', gap: '5px' }} onClick={cleanup}>
          <StyledIcon icon={FaStop} />
          Stop Summarizing
        </Button>
      )}
    </Box>
  )
}

const Tags = ({ tagsType, summaryData, setSummaryData, isSummarizing }) => {
  return (
    !isEmpty(summaryData?.[tagsType]) && (
      <Box>
        <Stack
          direction="row"
          alignItems="center"
          sx={{ rowGap: '0px', columnGap: '2px', flexWrap: 'wrap' }}
        >
          {summaryData?.[tagsType].map((tag, index) => (
            <Chip
              key={`${tag}${index}`}
              label={tag}
              sx={{ '&:hover': { color: (theme) => theme.palette.primary.main } }}
              onDelete={
                isSummarizing
                  ? null
                  : () =>
                      setSummaryData(({ [tagsType]: prevTags, ...restFields }) => {
                        return {
                          ...restFields,
                          [tagsType]: prevTags.filter((t) => t !== tag),
                        }
                      })
              }
            />
          ))}
        </Stack>
        {!isSummarizing && (
          <Button
            sx={{ display: 'inline-flex', gap: '5px' }}
            onClick={() =>
              setSummaryData(({ ...restFields }) => {
                return {
                  ...restFields,
                  [tagsType]: [],
                }
              })
            }
          >
            <StyledIcon icon={FaTimes} />
            Clear all
          </Button>
        )}
      </Box>
    )
  )
}

const CustomTagSection = ({ summaryData, setSummaryData, isSummarizing, getUpdatedTags }) => {
  return (
    <Box>
      <Typography variant="h4">Custom Tags</Typography>
      <Autocomplete
        freeSolo
        multiple
        value={summaryData?.customTags || []}
        onChange={(_, customTags) => {
          setSummaryData(({ customTags: prevCustomTags, ...restFields }) => {
            return {
              ...restFields,
              customTags: getUpdatedTags(prevCustomTags, customTags),
            }
          })
        }}
        options={['abc', 'def']}
        renderInput={(params) => (
          <TextField {...params} size="small" placeholder="Add Custom Tags..." />
        )}
        sx={{
          width: '100%',
          marginTop: '5px',
          '& .MuiInputBase-root': {
            border: '1px solid #303030',
            borderRadius: '20px',
            backgroundColor: '#121212',
          },
        }}
        renderTags={() => {}}
      />
      <Tags {...{ tagsType: 'customTags', summaryData, setSummaryData, isSummarizing }} />
    </Box>
  )
}

const AutoTagSection = ({ summaryData, setSummaryData, isSummarizing }) => {
  return (
    !isEmpty(summaryData?.autoTags) && (
      <Box>
        <Typography variant="h4">Auto-Generated Tags</Typography>
        <Tags {...{ tagsType: 'autoTags', summaryData, setSummaryData, isSummarizing }} />
      </Box>
    )
  )
}
const SummarySection = ({
  summaryData,
  isLoadingStoredSummary,
  isSummarySectionExpanded,
  setIsSummarySectionExpanded,
}) => {
  return isLoadingStoredSummary ? (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <CircularProgress />
    </Box>
  ) : (
    isString(summaryData?.text) && (
      <Accordion
        expanded={isSummarySectionExpanded}
        onChange={() => setIsSummarySectionExpanded((prevIsExpanded) => !prevIsExpanded)}
        disableGutters
        defaultExpanded
        square={false}
        sx={{
          borderRadius: '10px',
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h4">Summary</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body" component="div" sx={{ whiteSpace: 'pre-line' }}>
            {formatText(summaryData?.text)}
          </Typography>
        </AccordionDetails>
      </Accordion>
    )
  )
}

const ContentSection = ({ contentData, isLoadingContent }) => {
  return isLoadingContent ? (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <CircularProgress />
    </Box>
  ) : (
    isString(contentData?.text) && (
      <Accordion
        disableGutters
        square={false}
        sx={{
          borderRadius: '10px',
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h4">Transcript</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body" component="div" sx={{ whiteSpace: 'pre-line' }}>
            {contentData?.text || `No transcript available`}
          </Typography>
        </AccordionDetails>
      </Accordion>
    )
  )
}

export default () => {
  const [summaryData, setSummaryData, getSummaryData] = useExtendedState({})
  const [contentData, setContentData, getContentData] = useExtendedState({})
  const [isLoadingStoredSummary, setIsLoadingStoredSummary] = useState(true)
  const [isLoadingContent, setIsLoadingContent] = useState(true)
  const [isSummarizing, setIsSummarizing] = useState(false)
  const [isSummarySectionExpanded, setIsSummarySectionExpanded] = useState(true)
  const [errorText, setErrorText] = useState('')
  const portRef = useRef(null)
  const listenerRef = useRef(null)

  useEffect(() => {
    fetchStoredSummary()
  }, [])

  const fetchContentData = async () => {
    let contentDataCurr = await getContentData()
    if (isEmpty(contentDataCurr)) {
      const pageHtml = document.documentElement.outerHTML
      contentDataCurr = await extractContentData(pageHtml)
      setContentData(contentDataCurr)
      setIsLoadingContent(false)
    }
    return contentDataCurr
  }

  const fetchStoredSummary = async () => {
    try {
      const { summary } = await sendMessageToBackground({
        action: 'getSummary',
        type: 'DATABASE',
        data: [await fetchContentData()],
      })
      if (!isEmpty(summary)) {
        const { text, customTags, autoTags, dateCreated } = summary
        setSummaryData(
          ({
            text: prevText,
            customTags: prevCustomTags,
            autoTags: prevAutoTags,
            dateCreated: prevDateCreated,
            ...restFields
          }) => {
            const dateComp = compareDates(prevDateCreated, dateCreated)
            return {
              ...restFields,
              text: getUpdatedText(prevText, text, dateComp),
              customTags: getUpdatedTags(prevCustomTags, customTags, dateComp),
              autoTags: getUpdatedTags(prevAutoTags, autoTags, dateComp),
              dateCreated: dateComp === 1 ? dateCreated : prevDateCreated,
            }
          },
        )
      }
    } catch (err) {
      devErr(err)
      setErrorText(getErrStr(err))
    } finally {
      setIsLoadingStoredSummary(false)
    }
  }

  const compareDates = (prevDateCreated, dateCreated) => {
    const prevDate = dayjs(prevDateCreated || null)
    const date = dayjs(dateCreated || null)
    if (prevDate.isValid() && date.isValid()) {
      if (prevDate.isBefore(date)) return 1
      else if (date.isBefore(prevDate)) return -1
      else return 0
    } else if (prevDate.isValid()) return -1
    else if (date.isValid()) return 1
    return 0
  }

  const getUpdatedText = (prevText, text, dateComp = 0) => {
    if (dateComp === -1) return prevText
    else if (dateComp === 1) return text
    else
      return (isString(prevText) ? prevText : '').length > (isString(text) ? text : '').length
        ? prevText
        : text
  }

  const getUpdatedTags = (prevTags, tags, dateComp = 0) => {
    if (dateComp === -1) return prevTags
    else if (dateComp === 1) return tags
    else return [...new Set([...(prevTags || []), ...(tags || [])])]
  }

  const cleanup = () => {
    setIsSummarizing(false)
    const listener = listenerRef.current
    const port = portRef.current
    listener && port?.onMessage?.removeListener(listener)
    port?.disconnect()
  }

  const startSummarizing = async ({ isUseAutoTags }) => {
    try {
      const { prompt } = await sendMessageToBackground({
        action: 'GET_PROMPT',
        data: {
          contentData: await fetchContentData(),
          isUseAutoTags,
        },
      })
      const port = Browser.runtime.connect()
      portRef.current = port
      const dateCreated = dayjs().toISOString()
      const listener = (msg) => {
        if (msg?.data?.text) {
          const { text, autoTags } = msg.data
          setSummaryData(
            ({
              text: prevText,
              autoTags: prevAutoTags,
              dateCreated: prevDateCreated,
              ...restFields
            }) => {
              const dateComp = compareDates(prevDateCreated, dateCreated)
              return {
                ...restFields,
                text: getUpdatedText(prevText, text, dateComp),
                autoTags: isUseAutoTags
                  ? getUpdatedTags(prevAutoTags, autoTags, dateComp)
                  : prevAutoTags,
                dateCreated: dateComp === 1 ? dateCreated : prevDateCreated,
              }
            },
          )
        } else if (msg.status === 'DONE' || msg.status === 'DISCONNECT') {
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
      setIsSummarizing(true)
      setIsSummarySectionExpanded(true)
      port.onMessage.addListener(listener)
      port.postMessage({
        prompt,
        isUseAutoTags,
        contentData: await getContentData(),
        summaryData: await getSummaryData(),
      })
    } catch (err) {
      devErr(err)
      setErrorText(getErrStr(err))
    }
  }

  return (
    <ThemeProvider theme={theme}>
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
        {errorText ? (
          <Typography variant="body2">{errorText}</Typography>
        ) : (
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
            <SummarizeButtons {...{ summaryData, startSummarizing, isSummarizing, cleanup }} />
            <CustomTagSection {...{ summaryData, setSummaryData, isSummarizing, getUpdatedTags }} />
            <AutoTagSection {...{ summaryData, setSummaryData, isSummarizing }} />
            <SummarySection
              {...{
                summaryData,
                isLoadingStoredSummary,
                isSummarySectionExpanded,
                setIsSummarySectionExpanded,
              }}
            />
            <ContentSection {...{ contentData, isLoadingContent }} />
          </Box>
        )}
      </Paper>
    </ThemeProvider>
  )
}
