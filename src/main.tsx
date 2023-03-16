import { Box, Paper, Typography, Table, TableBody, TableContainer, TableCell, TableHead, TableRow, CircularProgress } from '@mui/material';
import React from 'react';
import {GenshinCount,GenshinResult} from './interfaces'

class Count extends React.Component<{genshinCounts:GenshinResult<GenshinCount>},{}>{
  constructor(props:any) {
    super(props);
  }
  render() {
    return (
      <Box sx={{
        paddingTop: 1,
        flexGrow: 1,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        overflowX: 'hidden'//摆烂了
      }}>
        <PullTable name='角色活动祈愿' genshinCount={this.props.genshinCounts.character} />
        <PullTable name='武器活动祈愿' genshinCount={this.props.genshinCounts.weapon} />
        <PullTable name='常驻祈愿' genshinCount={this.props.genshinCounts.standard} />
      </Box>
    )
  }
}
const PullTable = (props: any) => {
  return (
    <Paper sx={{ marginY: 2, marginX: 3 }} elevation={3}>
      <Typography variant='h6' sx={{ marginTop: 1, marginLeft: 1 }}>{props.name}</Typography>
      <Typography variant='subtitle2' sx={{ textAlign: 'end', paddingRight: 2 }}>当前已垫 <strong>{props.genshinCount.current}</strong> 抽</Typography>
      <TableContainer sx={{ maxHeight: 372, minWidth: 400 }}>
        <Table stickyHeader aria-label="simple table">
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
                key={row.name}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th">{row.name}</TableCell>
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
export default Count;