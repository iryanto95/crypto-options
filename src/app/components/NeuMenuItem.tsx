import { MenuItem } from '@mui/material'
import { styled } from '@mui/material/styles'

const NeuMenuItem = styled(MenuItem)(({ props }) => ({
  borderRadius: '8px',
  ...props,
}))

export default NeuMenuItem