import { Slider } from '@mui/material'
import { styled } from '@mui/material/styles'

const NeuCard = styled(Slider)(({ props }) => ({
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
    opacity: '0.2'
  },
  '.MuiSlider-track': {
    opacity: '0.5'
  },
  ...props
}))

export default NeuCard