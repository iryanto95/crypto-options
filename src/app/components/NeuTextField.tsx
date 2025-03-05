import { TextField } from '@mui/material'
import { styled } from '@mui/material/styles'

const NeuTextField = styled(TextField)(() => ({
  borderRadius: '16px',
  background: '#cbc3db',
  boxShadow: 'inset 4px 4px 8px #a89fb8, inset -4px -4px 8px rgb(218, 212, 228)',
  '.MuiOutlinedInput-notchedOutline': { border: 0 },
  input: { color: 'rgba(51, 27, 95, 0.80)', fontFamily: '"Nunito Sans", sans-serif' }
}))

export default NeuTextField