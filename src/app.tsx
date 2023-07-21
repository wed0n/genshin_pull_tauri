import { Paper, ThemeProvider, createTheme } from '@mui/material'
import { invoke } from '@tauri-apps/api'
import { appWindow } from '@tauri-apps/api/window'
import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Chart from './chart'
import Count from './count'
import Dialog from './dialog'
import {
  GenshinCount,
  GenshinResult,
  GenshinStatistic,
  GenshinTimeLine,
  GroupData,
} from './interfaces'
import PrepareProgress from './prepareprogress'
import SideBar from './sideBar'
import Statistic from './statistic'

const theme = createTheme({
  palette: {
    mode: 'light',
  },
})

class App extends React.Component<
  {},
  {
    isPrepared: boolean
    uid?: string
    isError: boolean
    wishMessage: String
    errorMessage: String
    groupData?: GenshinResult<GroupData>
    countData?: GenshinResult<GenshinCount>
    statisticData?: GenshinResult<Array<GenshinStatistic>>
    timeline?: GenshinTimeLine
  }
> {
  constructor(props: any) {
    super(props)
    this.state = {
      isPrepared: false,
      isError: false,
      wishMessage: '正在获取祈愿链接中',
      errorMessage: '',
    }
  }
  async chanel() {
    await appWindow.listen('wish', (event) => {
      this.setState({ ...this.state, wishMessage: event.payload as String })
    })
  }
  async componentDidMount() {
    try {
      let uid = (await invoke('prepare')) as string
      this.setState({ ...this.state, uid: uid })
      this.chanel()
      await invoke('get_wishes')
      let group_count_data = (await invoke(
        'group_count'
      )) as GenshinResult<GroupData>
      let count_result = (await invoke(
        'count_wishes'
      )) as GenshinResult<GenshinCount>
      let statistic_result = (await invoke(
        'statistic_wishes'
      )) as GenshinResult<Array<GenshinStatistic>>
      let timeline_result = (await invoke('time_line')) as GenshinTimeLine
      this.setState({
        ...this.state,
        isPrepared: true,
        groupData: group_count_data,
        countData: count_result,
        statisticData: statistic_result,
        timeline: timeline_result,
      })
    } catch (error) {
      console.log(error)
      this.setState({
        ...this.state,
        isError: true,
        errorMessage: error as String,
      })
    }
  }
  render() {
    const overRidedKeyFrame = `@keyframes materialize {
    0% {
      -webkit-filter: saturate(20%) contrast(50%) brightness(120%);
      filter: contrast(50%) brightness(120%);
    }
    50% {
      -webkit-filter: saturate(85%) contrast(100%) brightness(100%);
      filter: saturate(85%) contrast(100%) brightness(100%);
    }
    100% {
      -webkit-filter: saturate(100%) contrast(100%) brightness(100%);
      filter: saturate(100%) contrast(100%) brightness(100%);
    }
  }`
    return (
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <Paper
            square
            elevation={0}
            sx={{ width: 1, height: 1, display: 'flex' }}>
            <Dialog
              open={this.state.isError}
              errorMessage={this.state.errorMessage}
            />
            <style>{overRidedKeyFrame}</style>
            {this.state.uid != undefined && this.state.isPrepared == true ? (
              <>
                <SideBar uid={this.state.uid} />
                <Routes>
                  <Route
                    path="/"
                    element={
                      <Count
                        genshinCounts={
                          this.state.countData as GenshinResult<GenshinCount>
                        }
                      />
                    }
                  />
                  <Route
                    path="pie"
                    element={
                      <Chart
                        data={this.state.groupData as GenshinResult<GroupData>}
                        timelineData={this.state.timeline as GenshinTimeLine}
                      />
                    }
                  />
                  <Route
                    path="count"
                    element={
                      <Statistic
                        genshinStatistics={
                          this.state.statisticData as GenshinResult<
                            Array<GenshinStatistic>
                          >
                        }
                      />
                    }
                  />
                </Routes>
              </>
            ) : (
              <PrepareProgress message={this.state.wishMessage} />
            )}
          </Paper>
        </ThemeProvider>
      </BrowserRouter>
    )
  }
}

export default App
