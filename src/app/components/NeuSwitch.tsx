import { Switch } from '@mui/material'
import { styled } from '@mui/material/styles'

const NeuSwitch = styled(Switch)(() => ({
  '.MuiSwitch-thumb': {
    background: 'rgb(91, 76, 121)',
    width: '18px',
    height: '18px'
  },
  '.MuiSwitch-track': {
    background: '#cbc3db',
    boxShadow: 'inset 2px 2px 4px rgb(114, 106, 129), inset -2px -2px 4px rgb(218, 212, 228)'
  },
  '& .MuiSwitch-switchBase': {
    transitionDuration: '350ms',
    '&.Mui-checked': {
      color: '#fff',
      '& + .MuiSwitch-track': {
        background: '#cbc3db',
        boxShadow: 'inset 2px 2px 4px rgb(114, 106, 129), inset -2px -2px 4px rgb(218, 212, 228)'
      },
    },
  }
}))

export default NeuSwitch