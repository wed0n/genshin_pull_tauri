import { Box, Paper, Typography, Table, TableBody, TableContainer, TableCell, TableHead, TableRow, CircularProgress } from '@mui/material';
import React from 'react';
import { GenshinResult, GenshinStatistic } from './interfaces'

class Statistic extends React.Component<
  { genshinStatistics: GenshinResult<Array<GenshinStatistic>> },
  {}>{
  constructor(props: any) {
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
        <PullTable name='角色活动祈愿' genshinCount={this.props.genshinStatistics.character} />
        <PullTable name='武器活动祈愿' genshinCount={this.props.genshinStatistics.weapon} />
        <PullTable name='常驻祈愿' genshinCount={this.props.genshinStatistics.standard} />
      </Box>
    )
  }
}
const PullTable = (props: any) => {
  console.log(props.genshinCount.current);
  return (
    <Paper sx={{ marginY: 2, marginX: 3 }} elevation={3}>
      <Typography variant='h6' sx={{ marginTop: 1, marginLeft: 1 }}>{props.name}</Typography>
      <TableContainer sx={{ maxHeight: 372, minWidth: 400 }}>
        <Table stickyHeader aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>名称</TableCell>
              <TableCell align="center">数量</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {props.genshinCount.map((row: GenshinStatistic) => (
              <TableRow
                key={row.name}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th">{row.name}</TableCell>
                <TableCell align="center">{row.count}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  )
}
export default Statistic;