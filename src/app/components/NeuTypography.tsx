import { Typography } from '@mui/material'
import { styled } from '@mui/material/styles'

const NeuTypography = styled(Typography)(({ props }) => ({
  ...props,
  color: 'rgba(51, 27, 95, 0.8)',
  fontFamily: props?.fontFamily || '"Nunito Sans", sans-serif'
}))

export default NeuTypography