import { Box, Checkbox, Typography } from '@mui/material'
import { invoke } from '@tauri-apps/api'
import { GenshinCloudData } from 'interfaces'
import { useEffect, useState } from 'react'
import GenshinCloud from './GenshinCloud'

export default function CharacterCloud(props: {
  openTable: (name: string) => void
}) {
  const [star4, setStar4] = useState(true)
  const [star5, setStar5] = useState(true)
  const [data, setData] = useState<GenshinCloudData[]>([])
  useEffect(() => {
    let rankCondition: number = star4 ? 1 : 0
    rankCondition = rankCondition << 1
    if (star5) {
      rankCondition = rankCondition | 1
    }
    ;(async () => {
      let result: GenshinCloudData[] = await invoke('type_wishes', {
        itemType: 1,
        rankCondition: rankCondition,
      })
      setData(result)
    })()
  }, [star4, star5])
  return (
    <Box style={{ width: 850, marginTop: 2 }}>
      <Box
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
        }}>
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#f0f0f0',
            padding: 5,
            borderRadius: 10,
          }}>
          <Checkbox
            defaultChecked
            onChange={(_, checked) => {
              setStar4(checked)
            }}
          />
          <Typography variant="body2">4星</Typography>
          <Checkbox
            defaultChecked
            onChange={(_, checked) => {
              setStar5(checked)
            }}
          />
          <Typography variant="body2">5星</Typography>
        </Box>
      </Box>
      <GenshinCloud
        rawData={data}
        width={850}
        height={600}
        openTable={props.openTable}
      />
    </Box>
  )
}
