import { TextField } from '@mui/material'
import { Controller, useFormContext } from 'react-hook-form'

export const FormInput = ({
  children,
  Input,
  name,
  defaultValue,
  rules,
  disabled,
  ...restProps
}) => {
  const { control } = useFormContext()
  return (
    <Controller
      {...{
        control,
        name,
        defaultValue,
        rules,
        disabled,
        render: ({ field }) => (
          <Input {...field} {...restProps}>
            {children}
          </Input>
        ),
      }}
    />
  )
}

export const FormTextField = ({ children, ...restProps }) => {
  return (
    <FormInput Input={TextField} {...restProps}>
      {children}
    </FormInput>
  )
}
