import { IconButton } from '@mui/material'
import { styled } from '@mui/material/styles'

const NeuIconButton = styled(IconButton)(() => ({
  borderRadius: '50%',
  background: 'linear-gradient(145deg, #cbc3db, #c0bace)',
  boxShadow: '16px 16px 32px rgb(177, 167, 194), -16px -16px 32px #dbd1ec',
  '&:disabled': {
    opacity: '0.5'}
}))

export default NeuIconButton