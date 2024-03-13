import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import { invoke } from '@tauri-apps/api'
import { ECharts } from 'echarts'
import { EChartsOption } from 'echarts-for-react'
import ReactEChartsCore from 'echarts-for-react/lib/core'
import { BarChart } from 'echarts/charts'
import {
  DataZoomComponent,
  GridComponent,
  LegendComponent,
  MarkPointComponent,
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
} from 'echarts/components'
import * as echarts from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import React, {
  Dispatch,
  MutableRefObject,
  SetStateAction,
  createRef,
  useEffect,
  useRef,
} from 'react'
import { TableVirtuoso } from 'react-virtuoso'
import GenshinImage from './component/GenshinImage'
import { GenshinPullsTableItem, GenshinTimeLine } from './interfaces'

echarts.use([
  BarChart,
  TooltipComponent,
  TitleComponent,
  LegendComponent,
  CanvasRenderer,
  GridComponent,
  DataZoomComponent,
  ToolboxComponent,
  MarkPointComponent,
])

const TimeLine = React.memo(function TimeLine(props: {
  data: GenshinTimeLine
  tableData: MutableRefObject<GenshinPullsTableItem[]>
  setOpened: Dispatch<SetStateAction<boolean>>
}) {
  let xAxis: string[] = []
  let star5 = []
  let star4 = []
  let star3 = []
  for (let item of props.data.items) {
    xAxis.push(item.time)
    star5.push(item.star5)
    star4.push(item.star4)
    star3.push(item.star3)
  }
  let option: EChartsOption = {
    color: ['#6ABCE6', '#CC99FF', '#FFD173'],
    legend: { top: 25 },
    title: {
      left: 'center',
      text: `${props.data.begin_time} - ${props.data.end_time} (共${props.data.total}抽)`,
    },
    xAxis: {
      data: xAxis,
    },
    yAxis: {
      type: 'value',
      boundaryGap: false,
    },
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100,
      },
      {
        start: 100,
        end: 0,
      },
    ],
    tooltip: {
      trigger: 'axis',
      formatter(series: any[]) {
        if (series.length === 0) return ''
        const day = series[0].axisValue
        let total = 0
        let target = ''
        series.reverse().map((data) => {
          total += data.data
          target += `<div>
                                ${data.marker}
                                <span style="margin-left:2px">${data.seriesName}</span>
                                <span style="float:right;margin-left:20px;font-weight:900;color=${data.color}">${data.value}</span>
                            </div>`
        })
        return `<div style="font-size:14px;color:#666;font-weight:400;line-height:1.5;">
                <div>${day}</div>
                <div>当日抽卡次数: <span style="font-weight:900">${total}<span></div>
                ${target}
                </div>`
      },
    },
    series: [
      {
        name: '三星',
        data: star3,
        type: 'bar',
        stack: 'x',
      },
      {
        name: '四星',
        data: star4,
        type: 'bar',
        stack: 'x',
      },
      {
        name: '五星',
        data: star5,
        type: 'bar',
        stack: 'x',
      },
    ],
  }
  const echartRef = useRef(createRef() as any)
  useEffect(() => {
    let echart: ECharts = echartRef.current.getEchartsInstance()
    echart.getZr().on('click', function (params) {
      const pointInPixel = [params.offsetX, params.offsetY]
      if (echart.containPixel('grid', pointInPixel)) {
        let xIndex = echart.convertFromPixel({ seriesIndex: 0 }, [
          params.offsetX,
          params.offsetY,
        ])[0]
        let day = xAxis[xIndex]
        let date = new Date(day)
        date.setDate(date.getDate() + 1)
        let nextDay = date.toISOString().split('T')[0]
        ;(async () => {
          let result: GenshinPullsTableItem[] = await invoke(
            'time_line_day_pulls',
            { startDay: day, endDay: nextDay }
          )
          props.tableData.current = result
          props.setOpened(true)
        })()
      }
    })
  })
  return (
    <Box sx={{ width: 900, marginX: 'auto', marginY: 2 }}>
      <ReactEChartsCore ref={echartRef} echarts={echarts} option={option} />
    </Box>
  )
})
export default TimeLine
export function DayPullsTable(props: { data: GenshinPullsTableItem[] }) {
  const fixWdith = 200
  return (
    <TableVirtuoso
      components={{
        Scroller: React.forwardRef((props, ref) => (
          <TableContainer component={Paper} {...props} ref={ref} />
        )),
        Table: (props) => (
          <Table {...props} style={{ borderCollapse: 'separate' }} />
        ),
        TableHead: TableHead,
        TableRow: TableRow,
        TableBody: React.forwardRef((props, ref) => (
          <TableBody {...props} ref={ref} />
        )),
      }}
      data={props.data}
      fixedHeaderContent={() => (
        <TableRow sx={{ backgroundColor: '#fff' }}>
          <TableCell width={fixWdith}>名称</TableCell>
          <TableCell align="center">类别</TableCell>
          <TableCell align="center">星级</TableCell>
          <TableCell align="center">来源</TableCell>
          <TableCell align="center">时间</TableCell>
        </TableRow>
      )}
      itemContent={(_, item: GenshinPullsTableItem) => {
        let item_type = '武器'
        let gacha_type = ''
        let style = {}
        if (item.item_type === 1) {
          item_type = '角色'
        }
        switch (item.gacha_type) {
          case 301:
            gacha_type = '角色活动祈愿'
            break
          case 302:
            gacha_type = '武器活动祈愿'
            break
          case 500:
            gacha_type = '集录祈愿'
            break
          default:
            gacha_type = '常驻祈愿'
        }
        switch (item.rank) {
          case 4:
            style = { color: '#9c49fe', fontWeight: 'bold' }
            break
          case 5:
            style = { color: '#c0713d', fontWeight: 'bold' }
            break
        }
        return (
          <>
            <TableCell width={fixWdith} height={71} sx={style}>
              <GenshinImage name={item.name} rank={item.rank} />
            </TableCell>
            <TableCell align="center" sx={style}>
              {item_type}
            </TableCell>
            <TableCell align="center" sx={style}>
              {item.rank}
            </TableCell>
            <TableCell align="center" sx={style}>
              {gacha_type}
            </TableCell>
            <TableCell align="center" sx={style}>
              {item.time}
            </TableCell>
          </>
        )
      }}
    />
  )
}
