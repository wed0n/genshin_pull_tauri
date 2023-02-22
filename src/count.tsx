import { Box, Paper, Typography, Table, TableBody, TableContainer, TableCell, TableHead, TableRow, CircularProgress } from '@mui/material';
import React from 'react';
import { invoke } from '@tauri-apps/api'

interface GenshinStatistic {
  name: string,
  count: number,
}
interface GenshinStatistics {
  character: GenshinStatistic,
  weapon: GenshinStatistic,
  standard: GenshinStatistic
}

class Statistic extends React.Component<{},
  {
    str: string,
    genshinStatistics?: GenshinStatistics
  }>{
  constructor(props: any) {
    super(props);
    this.state = { str: "", genshinStatistics: undefined };
  }
  async componentDidMount() {
    let result = await invoke('statistic_wishes') as GenshinStatistics;
    this.setState({ str: "", genshinStatistics: result });
  }
  render() {
    let target;
    if (this.state.genshinStatistics != undefined) {
      console.log(JSON.stringify(this.state.genshinStatistics));
      target = <Box sx={{
        paddingTop: 1,
        flexGrow: 1,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        overflowX: 'hidden'//摆烂了
      }}>
        <PullTable name='角色活动祈愿' genshinCount={this.state.genshinStatistics.character} />
        <PullTable name='武器活动祈愿' genshinCount={this.state.genshinStatistics.weapon} />
        <PullTable name='常驻祈愿' genshinCount={this.state.genshinStatistics.standard} />
      </Box>
    } else {
      target = <Box>
        <CircularProgress></CircularProgress>
        {this.state.str}
      </Box>
    }
    return (
      <>
        {target}
      </>
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