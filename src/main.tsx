import { Box, Paper, Typography, Table, TableBody, TableContainer, TableCell, TableHead, TableRow, CircularProgress } from '@mui/material';
import React from 'react';
import { invoke } from '@tauri-apps/api'

interface GenshinCount {
  name: string,
  count: number,
  time: string
}
interface GenshinCounts {
  character: GenshinCount,
  weapon: GenshinCount,
  standard: GenshinCount
}

class Test extends React.Component<{},
  {
    str: string,
    genshinCounts?: GenshinCounts
  }>{
  constructor(props: any) {
    super(props);
    this.state = { str: "", genshinCounts: undefined };
  }
  async componentDidMount() {
    let result = await invoke('count_wishes') as GenshinCounts;
    this.setState({ str: 'ok', genshinCounts: result });
    console.log(result);
  }
  render() {
    let target;
    if (this.state.genshinCounts != undefined) {
      console.log(JSON.stringify(this.state.genshinCounts));
      target = <>
        <PullTable name='角色活动祈愿' genshinCount={this.state.genshinCounts.character} />
        <PullTable name='武器活动祈愿' genshinCount={this.state.genshinCounts.weapon} />
        <PullTable name='常驻祈愿' genshinCount={this.state.genshinCounts.standard} />
      </>
    } else {
      target = <CircularProgress></CircularProgress>
    }
    return (
      <Box sx={{
        paddingTop: 1,
        flexGrow: 1,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        overflowX: 'hidden'//摆烂了
      }}>
        {target}
      </Box>
    )
  }
}
const PullTable = (props: any) => {
  console.log(props.genshinCount.current);
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
export default Test;