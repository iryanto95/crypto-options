import { Slider } from '@mui/material'
import { styled } from '@mui/material/styles'

const NeuSlider = styled(Slider)(() => ({
  marginTop: '32px',
  color: '#331b5f',
  '.MuiSlider-valueLabel': {
    borderRadius: '4px',
    color: '#331b5f',
    background: '#cbc3db',
    boxShadow: 'inset 2px 2px 4px #a89fb8, inset -2px -2px 4px #dbd1ec',
    marginTop: '4px',
    fontSize: '10pt',
    padding: '8px'
  },
  '.MuiSlider-valueLabel::before': {
    display: 'none'
  },
  '.MuiSlider-thumb': {
    background: 'rgb(91, 76, 121)',
    borderRadius: '8px',
    width: '16px',
    height: '16px',
  },
  '.MuiSlider-rail': {
    background: '#cbc3db',
    boxShadow: 'inset 2px 2px 4px rgb(114, 106, 129), inset -2px -2px 4px rgb(218, 212, 228)',
  },
  '.MuiSlider-track': {
    opacity: '0.5'
  }
}))

export default NeuSlider