import { Select } from '@mui/material'
import { styled } from '@mui/material/styles'

const NeuSelect = styled(Select)(({ props }) => ({
  borderRadius: '16px',
  background: '#cbc3db',
  boxShadow: 'inset 4px 4px 8px #a89fb8, inset -4px -4px 8px rgb(218, 212, 228)',
  '.MuiOutlinedInput-notchedOutline': { border: 0 },
  '.MuiSelect-icon': { color: 'rgba(51, 27, 95, 0.80)'},
  ...props,
}))

export default NeuSelect