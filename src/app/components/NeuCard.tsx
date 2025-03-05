import { Card } from '@mui/material'
import { styled } from '@mui/material/styles'

const NeuCard = styled(Card)(() => ({
  borderRadius: '16px',
  background: 'linear-gradient(145deg, #cbc3db, #c0bace)',
  boxShadow: '16px 16px 32px rgb(177, 167, 194), -8px -8px 16px #dbd1ec'
}))

export default NeuCard