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
  TextField,
  ThemeProvider,
  Typography,
} from '@mui/material'
import theme from '../common/theme'
import { sendMessageToBackground } from '../../utils'
import { extractContentData } from '../../extractor/extractContentData'
import { isEmpty, isString } from 'bellajs'
import dayjs from 'dayjs'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import CircularProgress from '@mui/material/CircularProgress'
import { FaStop, FaTimes } from 'react-icons/fa'
import { StyledIcon } from '../common/Icon'
import { useExtendedState } from '../common/utils/hooks'
import { formatText } from '../common/utils/format'
import { devErr, getErrStr, trySilent } from '../../../utils'
import { FlexBox, FlexCol, FlexRow, FlexDivider } from '../common/Layout'
// import { radialGradient } from '../common/utils/color'

const SummarizeButton = ({ buttonText, onClick }) => (
  <Button
    variant="contained"
    size="large"
    onClick={onClick}
    sx={{
      bgcolor: 'primary.main',
      width: 1,
      // height: 1,
      borderRadius: 2,
    }}
  >
    <Typography
      variant="h6"
      sx={{
        color: 'primary.contrastText',
        // background: radialGradient(`white 50%`, `${theme.palette.primary.main}`),
        // backgroundClip: 'text',
        // textFillColor: 'transparent',
      }}
    >
      {buttonText}
    </Typography>
  </Button>
)

const SummarizeButtons = ({ startSummarizing, isSummarizing, cleanup }) => {
  return (
    <FlexBox
      component="form"
      fp
      sx={{
        ai: 'stretch',
        g: 0.5,
      }}
    >
      {!isSummarizing && (
        <SummarizeButton
          buttonText="Summarize"
          onClick={() => startSummarizing({ isUseAutoTags: false })}
        />
      )}
      {!isSummarizing && (
        <SummarizeButton
          buttonText="Summarize w/ Auto-Tags"
          onClick={() => startSummarizing({ isUseAutoTags: true })}
        />
      )}
      {isSummarizing && (
        <Button sx={{ display: 'inline-flex', gap: 0.5 }} onClick={cleanup}>
          <StyledIcon icon={FaStop} />
          Stop Summarizing
        </Button>
      )}
    </FlexBox>
  )
}

const Tags = ({ tagsType, summaryData, setSummaryData, isSummarizing }) => {
  return (
    !isEmpty(summaryData?.[tagsType]) && (
      <FlexRow fw jc="start" sx={{ rowGap: 0, columnGap: 0.25, flexWrap: 'wrap' }}>
        {summaryData?.[tagsType].map((tag, index) => (
          <Chip
            key={`${tag}${index}`}
            label={tag}
            sx={{ '&:hover': { color: 'primary.main' } }}
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
      </FlexRow>
    )
  )
}

const CustomTagSection = ({ summaryData, setSummaryData, isSummarizing, getUpdatedTags }) => {
  return (
    <FlexCol fw g={0.5}>
      <FlexBox fw jc="space-between">
        <Typography variant="h4" display="inline-flex" sx={{ display: 'inline' }}>
          Custom Tags
        </Typography>
        {!isSummarizing && (
          <Button
            onClick={() =>
              setSummaryData(({ ...restFields }) => {
                return {
                  ...restFields,
                  customTags: [],
                }
              })
            }
          >
            <FlexRow>
              <StyledIcon icon={FaTimes} />
              <Typography variant="body1">Clear all</Typography>
            </FlexRow>
          </Button>
        )}
      </FlexBox>
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

      <Tags {...{ tagsType: 'customTags', summaryData, setSummaryData, isSummarizing }} />
    </FlexCol>
  )
}

const AutoTagSection = ({ summaryData, setSummaryData, isSummarizing }) => {
  return (
    !isEmpty(summaryData?.autoTags) && (
      <FlexBox>
        <Typography variant="h4">Auto-Generated Tags</Typography>
        <Tags {...{ tagsType: 'autoTags', summaryData, setSummaryData, isSummarizing }} />
      </FlexBox>
    )
  )
}

const SectionAccordion = ({ isLoading, title, content, ...restProps }) => {
  return isLoading ? (
    <FlexBox>
      <CircularProgress />
    </FlexBox>
  ) : (
    <FlexBox fw br={2} overflow="hidden">
      <Accordion
        disableGutters
        square={false}
        sx={{
          width: 1,
          bgcolor: 'transparent',
        }}
        {...restProps}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h4">{title}</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ width: 1 }}>
          <FlexCol fw ai="start">
            <FlexDivider />
            {content}
          </FlexCol>
        </AccordionDetails>
      </Accordion>
    </FlexBox>
  )
}

const SummarySection = ({
  summaryData,
  isLoadingStoredSummary,
  isSummarySectionExpanded,
  setIsSummarySectionExpanded,
}) => {
  return (
    <SectionAccordion
      title="Summary"
      content={
        <FlexCol fw ai="start">
          {/* <FlexRow fw jc="end">
            <Button>Edit</Button>
          </FlexRow> */}
          <Typography variant="body1" component="div" sx={{ whiteSpace: 'pre-line' }}>
            {formatText(summaryData?.text)}
          </Typography>
        </FlexCol>
      }
      expanded={isSummarySectionExpanded}
      onChange={() => setIsSummarySectionExpanded((prevIsExpanded) => !prevIsExpanded)}
      defaultExpanded
      isLoading={isLoadingStoredSummary}
    />
  )
}

const ContentSection = ({ contentData, isLoadingContent }) => {
  return (
    <SectionAccordion
      title="Transcript"
      content={
        <FlexCol fw ai="start">
          <Typography variant="body1" component="div" sx={{ whiteSpace: 'pre-line' }}>
            {contentData?.text || `No transcript available`}
          </Typography>
        </FlexCol>
      }
      isLoading={isLoadingContent}
    />
  )
}

export default function YoutubeVideo() {
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

  const compareDates = (prevDateCreated = null, dateCreated = null) => {
    const prevDate = dayjs(prevDateCreated)
    const date = dayjs(dateCreated)
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

  const getUpdatedTags = (prevTags = [], tags = [], dateComp = 0) => {
    if (dateComp === -1) return prevTags
    else if (dateComp === 1) return tags
    else return [...new Set([...prevTags, ...tags])]
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
          width: 1,
          height: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 1.25,
          marginBottom: 1.25,
          bgcolor: 'black',
          // backgroundImage: (theme) => radialGradient(`black 50%`, `${theme.palette.primary.main}`),
          border: 2,
          borderColor: 'primary.main',
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
          '*': {
            boxSizing: 'border-box',
            fontFamily: 'Inter, sans-serif',
          },
        }}
      >
        {errorText ? (
          <Typography variant="body2">{errorText}</Typography>
        ) : (
          <FlexCol
            fp
            sx={{
              // bgcolor: (theme) => theme.palette.primary.main,
              p: 1.25,
              br: 2,
              g: 1.5,
            }}
          >
            <FlexBox fw jc="end">
              <Typography
                onClick={() =>
                  sendMessageToBackground({
                    action: 'OPEN_MAIN_PAGE',
                  })
                }
              >
                kwiklern
              </Typography>
            </FlexBox>
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
          </FlexCol>
        )}
      </Paper>
    </ThemeProvider>
  )
}
