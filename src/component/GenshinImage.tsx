import { Box } from '@mui/material'
import { Image } from 'mui-image'
export default function GenshinImage({
  name,
  rank,
}: {
  name: string
  rank: number
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        justyContent: 'center',
        alignItems: 'center',
      }}>
      <Image
        src={`https://wed0n-mihoyo-static.pages.dev/genshin/${name}.png`}
        wrapperStyle={{ marginRight: 6 }}
        duration={1200}
        style={{
          backgroundImage: `url(/genshin${rank}Background.png)`,
          borderRadius: '3px 3px 5px 3px',
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
        }}
        width={38}
      />
      <div>{name}</div>
    </Box>
  )
}
