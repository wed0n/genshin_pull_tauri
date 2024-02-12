import { Box } from '@mui/material'
import { backgrounds, imagePath } from 'component/GenshinImage'
import { GenshinCloudData } from 'interfaces'
import { Image } from 'mui-image'

export default function CloudItem(props: {
  data: GenshinCloudData
  openTable: (name: string) => void
}) {
  return (
    <Box
      className="CloudItem"
      style={{
        left: props.data.x,
        bottom: props.data.y,
      }}
      sx={{
        transform: `scale(${props.data.scale})`,
        backgroundImage: `url(${backgrounds[props.data.rank - 3]})`,
      }}
      onClick={props.openTable.bind(null, props.data.name)}>
      <Image src={`${imagePath}/${props.data.name}.webp`} duration={1200} />
      <div className="CloudItemCount">{`×${props.data.count}`}</div>
    </Box>
  )
}
