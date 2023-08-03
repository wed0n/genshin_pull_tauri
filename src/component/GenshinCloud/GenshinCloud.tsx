import { Box } from '@mui/material'
import { GenshinCloudData, GenshinStatistic } from 'interfaces'
import { useEffect, useState } from 'react'
import CloudItem from './CloudItem'

export default function GenshinCloud(props: {
  rawData: GenshinStatistic[]
  width: number
  height: number
  openTable: (name: string) => void
}) {
  const [data, setData] = useState<GenshinCloudData[]>([])
  useEffect(() => {
    const maxSize = 100
    const rawData = props.rawData
    const centerX = props.width / 2
    const centerY = props.height / 2
    let maxCount = 0
    if (rawData.length != 0) {
      maxCount = rawData[0].count
    }
    let result: GenshinCloudData[] = []
    const n = rawData.length
    const b = 0.1
    const ratio = props.width / props.height
    let t1 = 0
    let t2 = 0
    let i = 0
    while (i < n) {
      const flag = Math.random() > 0.5
      const dt = flag ? -1 : 1
      const scale = 0.8 / (1 - Math.log10(rawData[i].count / maxCount))
      let t = flag ? t1 : t2
      while (true) {
        const isIntersect = (
          rect: GenshinCloudData,
          otherRect: GenshinCloudData
        ) => {
          const averageSize = (rect.size + otherRect.size) / 2
          const rectHalfSize = rect.size / 2
          const otherRectHalfSize = otherRect.size / 2
          if (
            Math.abs(
              rect.rx + rectHalfSize - (otherRect.rx + otherRectHalfSize)
            ) < averageSize &&
            Math.abs(
              rect.ry - rectHalfSize - (otherRect.ry - otherRectHalfSize)
            ) < averageSize
          ) {
            return true
          }
          return false
        }
        const tt = t * b
        const tx = ratio * tt * Math.cos(t)
        const ty = tt * Math.sin(t)
        const rx = Math.round(tx + centerX)
        const ry = Math.round(ty + centerY)
        const tryData = {
          ...rawData[i],
          scale: scale,
          x: Math.round(rx - (maxSize * (1 - scale)) / 2),
          y: Math.round(ry + (maxSize * (1 - scale)) / 2),
          rx: rx,
          ry: ry,
          size: Math.round(maxSize * scale) + 1,
        }
        if (result.every((item) => !isIntersect(tryData, item))) {
          result.push(tryData)
          break
        }
        t += dt
      }
      if (flag) {
        t1 = t
      } else {
        t2 = t
      }
      i++
    }
    setData(result)
  }, [props.rawData])
  return (
    <Box
      sx={{
        width: props.width,
        height: props.height,
        overflow: 'visable',
        position: 'relative',
      }}>
      {data.map((value) => (
        <CloudItem data={value} openTable={props.openTable} />
      ))}
    </Box>
  )
}
