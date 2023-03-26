import React from 'react';
import { ThemeProvider, createTheme, Paper } from '@mui/material';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { invoke } from '@tauri-apps/api'
import { GenshinCount, GenshinResult, GenshinStatistic, GroupData, GenshinTimeLine } from './interfaces'
import Dialog from './dialog'
import SideBar from './sideBar';
import Count from './count';
import Statistic from "./statistic";
import Pie from './pie';
import PrepareProgress from './prepareprogress';
import { appWindow } from '@tauri-apps/api/window';

const theme = createTheme({
    palette: {
        mode: 'light',
    },
});

class App extends React.Component<{},
    {
        isPrepared: boolean,
        uid?: string,
        isError: boolean,
        wishMessage: String,
        errorMessage: String,
        groupData?: GenshinResult<GroupData>,
        countData?: GenshinResult<GenshinCount>,
        statisticData?: GenshinResult<Array<GenshinStatistic>>,
        timeline?: GenshinTimeLine
    }>{
    constructor(props: any) {
        super(props);
        this.state = { isPrepared: false, isError: false, wishMessage: '正在获取祈愿链接中', errorMessage: '' };
    }
    async chanel() {
        await appWindow.listen("wish", (event) => { this.setState({ ...this.state, wishMessage: event.payload as String }); });
    }
    async componentDidMount() {
        try {
            let uid = await invoke('prepare') as string;
            this.setState({ ...this.state, uid: uid });
            this.chanel();
            await invoke('get_wishes');
            let group_count_data = await invoke('group_count') as GenshinResult<GroupData>;
            let count_result = await invoke('count_wishes') as GenshinResult<GenshinCount>;
            let statistic_result = await invoke('statistic_wishes') as GenshinResult<Array<GenshinStatistic>>;
            let timeline_result = await invoke('time_line') as GenshinTimeLine;
            this.setState({
                ...this.state,
                isPrepared: true,
                groupData: group_count_data,
                countData: count_result,
                statisticData: statistic_result,
                timeline: timeline_result
            });
        } catch (error) {
            console.log(error);
            this.setState({ ...this.state, isError: true, errorMessage: error as String });
        }
    }
    render() {
        let target;
        if (this.state.uid != undefined && this.state.isPrepared == true) {
            target =
                <>
                    <SideBar uid={this.state.uid} />
                    <Routes>
                        <Route path="/" element={<Count genshinCounts={this.state.countData as GenshinResult<GenshinCount>} />} />
                        <Route path="pie" element={<Pie data={this.state.groupData as GenshinResult<GroupData>} timelineData={this.state.timeline as GenshinTimeLine} />} />
                        <Route path="count" element={<Statistic genshinStatistics={this.state.statisticData as GenshinResult<Array<GenshinStatistic>>} />} />
                    </Routes>
                </>;
        }
        else {
            target = <PrepareProgress message={this.state.wishMessage} />
        }
        return (
            <BrowserRouter>
                <ThemeProvider theme={theme}>
                    <Paper square elevation={0} sx={{ width: 1, height: 1, display: "flex" }}>
                        <Dialog open={this.state.isError} errorMessage={this.state.errorMessage} />
                        {target}
                    </Paper>
                </ThemeProvider>
            </BrowserRouter>
        );
    }
}

export default App;