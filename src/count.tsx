import { Box, Paper, Typography, Table, TableBody, TableContainer, TableCell, TableHead, TableRow, CircularProgress } from '@mui/material';
import React from 'react';
import { invoke } from '@tauri-apps/api'
/*
import { mockIPC, clearMocks } from "@tauri-apps/api/mocks"
const wed0n_timer = (ms: number) => new Promise(res => setTimeout(res, ms));
mockIPC((cmd, args) => {
  switch (cmd) {
    case "prepare":
      return new Promise((resolve, reject) => {
        resolve("1145141919810");
      });
    case "get_wishes":
      return new Promise((resolve, reject) => {
        resolve("统计中");
      });
    case "count_wishes":
      return new Promise((resolve, reject) => {
        resolve({ "character": { "current": 34, "items": [{ "count": 23, "name": "莫娜", "time": "2022-08-24 11:06:08" }, { "count": 75, "name": "钟离", "time": "2022-08-24 11:09:02" }, { "count": 40, "name": "珊瑚宫心海", "time": "2022-09-16 21:15:07" }, { "count": 2, "name": "迪卢克", "time": "2022-09-16 21:15:07" }, { "count": 80, "name": "纳西妲", "time": "2022-11-11 11:48:47" }, { "count": 74, "name": "莫娜", "time": "2022-12-27 18:23:18" }, { "count": 76, "name": "雷电将军", "time": "2022-12-27 18:28:36" }] }, "standard": { "current": 64, "items": [{ "count": 18, "name": "风鹰剑", "time": "2022-09-16 21:21:02" }] }, "weapon": { "current": 12, "items": [] } });
      });
    case "static_wishes":
      return new Promise((resolve,reject)=>{
        
      });
  }
});
*/
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
    let result=await invoke('statistic_wishes') as GenshinStatistics;
    this.setState({ str: "", genshinStatistics: result });
  }
  render() {
    let target;
    if (this.state.genshinStatistics != undefined) {
      console.log(JSON.stringify(this.state.genshinStatistics));
      target = <Box sx={{
        paddingTop: 1,
        flexGrow:1,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        overflowX:'hidden'//摆烂了
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
      <TableContainer sx={{maxHeight:372,minWidth: 400}}>
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