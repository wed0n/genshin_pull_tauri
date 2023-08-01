import { Box, Dialog, DialogContent } from '@mui/material'
import { invoke } from '@tauri-apps/api'
import CharacterCloud from 'component/GenshinCloud/CharacterCloud'
import WeaponCloud from 'component/GenshinCloud/WeaponCloud'
import { GenshinPullsTableItem } from 'interfaces'
import { useRef, useState } from 'react'
import { DayPullsTable } from 'timeline'

export default function Statistic() {
  const [opened, setOpened] = useState(false)
  const tableData = useRef([] as GenshinPullsTableItem[])
  const openTable = async (name: string) => {
    const result: GenshinPullsTableItem[] = await invoke('item_wishes', {
      name,
    })
    tableData.current = result
    setOpened(true)
  }
  return (
    <Box
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        overflowX: 'hidden',
        flexDirection: 'column',
      }}>
      <Dialog
        fullWidth={true}
        maxWidth="md"
        open={opened}
        onClose={() => {
          setOpened(false)
        }}>
        <DialogContent id="dialogTable">
          <DayPullsTable data={tableData.current} />
        </DialogContent>
      </Dialog>
      <CharacterCloud openTable={openTable} />
      <WeaponCloud openTable={openTable} />
    </Box>
  )
}
