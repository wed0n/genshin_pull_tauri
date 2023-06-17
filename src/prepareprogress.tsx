import { Box, CircularProgress, Typography } from '@mui/material'
export default function prepareProgress(props: { message: String }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: 1,
        height: 1,
      }}>
      <CircularProgress size={80} />
      <Typography sx={{ marginTop: 1 }} variant={'subtitle1'}>
        {props.message}
      </Typography>
    </Box>
  )
}
