import { Button, CircularProgress, Typography } from '@mui/material'
import { FlexCol, FlexRow } from '../../common/Layout'
import { sendMessageToBackground } from '../../../utils'
import { useEffect, useState } from 'react'
import { clone, merge } from 'lodash'
import { DEFAULT_OPTIONS } from '../../../../constants'
import { StyledIcon } from '../../common/Icon'
import { FaRegSave } from 'react-icons/fa'
import { IoArrowBack } from 'react-icons/io5'
import { FormTextField } from '../../common/Forms/FormInputs'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

export default function Options() {
  const navigate = useNavigate()
  return (
    <FlexCol fp>
      <FlexCol w='80rem'>
        <FlexRow fw jc='start'>
          <Button>
            <FlexRow onClick={() => navigate('/')}>
              <StyledIcon icon={IoArrowBack} />
              <Typography>Back to main</Typography>
            </FlexRow>
          </Button>
        </FlexRow>
        <FlexRow fw jc='start'>
          <Typography variant='h3'>Options</Typography>
        </FlexRow>
        <OptionsForm />
      </FlexCol>
    </FlexCol>
  )
}

const OptionsForm = () => {
  const [isLoading, setIsLoading] = useState(true)
  const methods = useForm()
  const { reset, handleSubmit } = methods

  useEffect(() => {
    ;(async () => {
      const { options: fetchedOptions } =
        (await sendMessageToBackground({
          action: 'getOptions',
          type: 'DATABASE',
        })) || {}

      reset(merge(clone(DEFAULT_OPTIONS), clone(fetchedOptions)))
      setIsLoading(false)
    })()
  }, [])

  const onSubmit = (options) => {
    sendMessageToBackground({
      action: 'updateOptions',
      type: 'DATABASE',
      data: [options],
    })
  }
  return (
    <FlexCol fp p={7}>
      {isLoading ? (
        <CircularProgress />
      ) : (
        <FormProvider {...methods}>
          <FlexCol component='form' fp onSubmit={handleSubmit(onSubmit)}>
            <FlexCol fp ai='start' g={1}>
              <FlexRow fw jc='space-between'>
                <Typography variant='h4'>Prompt</Typography>
                <FlexRow fw jc='end' g={0.8}>
                  <Button
                    variant='outlined'
                    size='large'
                    sx={{
                      //   bgcolor: "primary.main",
                      borderRadius: 2,
                    }}
                    onClick={() => reset(DEFAULT_OPTIONS)}
                  >
                    <FlexRow px={0.5} g={0.5} jc='space-around'>
                      <Typography>Use Default</Typography>
                    </FlexRow>
                  </Button>
                  <Button
                    type='submit'
                    variant='outlined'
                    size='large'
                    sx={{
                      //   bgcolor: "primary.main",
                      borderRadius: 2,
                    }}
                  >
                    <FlexRow px={0.5} g={0.5} jc='space-around'>
                      <Typography
                        sx={
                          {
                            // color: "primary.contrastText",
                          }
                        }
                      >
                        Save
                      </Typography>
                      <StyledIcon icon={FaRegSave} />
                    </FlexRow>
                  </Button>
                </FlexRow>
              </FlexRow>
              <FlexCol fp ai='start' g={1} b={1} br={2} p={3}>
                <FormTextField
                  name='summaryPrompt'
                  label='Summary Prompt'
                  placeholder='Summary Prompt...'
                  variant='outlined'
                  fullWidth
                  multiline
                  minRows={4}
                  InputLabelProps={{ shrink: true }}
                />
                <Typography>Your output should use the following template:</Typography>
                <Typography>### Summary</Typography>
                <FormTextField
                  name='summaryTemplate'
                  label='Summary Template'
                  placeholder='Summary Template...'
                  fullWidth
                  variant='outlined'
                  multiline
                  minRows={4}
                  InputLabelProps={{ shrink: true }}
                />
                <Typography>{'<Title>'}</Typography>
                <Typography>{'<Text>'}</Typography>
              </FlexCol>
            </FlexCol>
          </FlexCol>
        </FormProvider>
      )}
    </FlexCol>
  )
}
