import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import React from 'react'
import GenshinImage from './component/GenshinImage'
import { GenshinCount, GenshinResult } from './interfaces'

export default class Count extends React.Component<
  { genshinCounts: GenshinResult<GenshinCount> },
  {}
> {
  constructor(props: any) {
    super(props)
  }
  render() {
    return (
      <Box
        sx={{
          paddingTop: 1,
          flexGrow: 1,
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          overflowX: 'hidden', //摆烂了
        }}>
        <PullTable
          name="角色活动祈愿"
          genshinCount={this.props.genshinCounts.character}
        />
        <PullTable
          name="武器活动祈愿"
          genshinCount={this.props.genshinCounts.weapon}
        />
        <PullTable
          name="集录祈愿"
          genshinCount={this.props.genshinCounts.chronicle}
        />
        <PullTable
          name="常驻祈愿"
          genshinCount={this.props.genshinCounts.standard}
        />
      </Box>
    )
  }
}
const PullTable = (props: any) => {
  return (
    <Paper
      sx={{ marginY: 2, marginX: 3, height: 435, width: 410 }}
      elevation={3}>
      <Typography variant="h6" sx={{ marginTop: 1, marginLeft: 1 }}>
        {props.name}
      </Typography>
      <Typography
        variant="subtitle2"
        sx={{ textAlign: 'end', paddingRight: 2 }}>
        当前已垫 <strong>{props.genshinCount.current}</strong> 抽
      </Typography>
      <TableContainer sx={{ maxHeight: 372, minWidth: 400 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>名称</TableCell>
              <TableCell align="center">抽取数</TableCell>
              <TableCell align="center">时间</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {props.genshinCount.items.map((row: GenshinCount) => (
              <TableRow
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell component="th">
                  <GenshinImage name={row.name} rank={5} />
                </TableCell>
                <TableCell align="center">{row.count}</TableCell>
                <TableCell align="center">{row.time}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  )
}
