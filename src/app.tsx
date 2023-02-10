import React from 'react';
import { ThemeProvider, createTheme, Paper, Box, CircularProgress } from '@mui/material';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { invoke } from '@tauri-apps/api'
import SideBar from './SideBar';
import Main from './main';
import Count from "./count";
import './main.css';

const theme = createTheme({
    palette: {
        mode: 'light',
    },
});

class App extends React.Component<{},
    {
        str?: string,
        uid?: number
    }>{
    constructor(props: any) {
        super(props);
        this.state = { str: undefined, uid: undefined };
    }
    async componentDidMount() {
        debugger;
        if (this.state.uid == undefined) {
            let result = await invoke('prepare') as string;
            let uid = parseInt(result);
            if (!Number.isNaN(uid)) {
                this.setState({ str: result});
                await invoke('get_wishes');
                this.setState({ str: 'ok', uid: uid });
            } else {
                this.setState({ str: result });
            }
        }
    }
    render() {
        let target;
        if (this.state.str != undefined) {
            if (this.state.uid != undefined) {
                target =
                    <>
                        <SideBar />
                        <Routes>
                            <Route path="/" element={<Main />} />
                            <Route path="count" element={<Count />} />
                        </Routes>
                    </>;
            }
            else {
                target = <Box>
                    <CircularProgress></CircularProgress>
                    {this.state.str}
                </Box>
            }
        }
        else {
            target =
                <Box>
                    <CircularProgress></CircularProgress>
                </Box>
        }
        return (
            <BrowserRouter>
                <ThemeProvider theme={theme}>
                    <Paper square elevation={0} sx={{ width: 1, height: 1, display: "flex" }}>
                        {target}
                    </Paper>
                </ThemeProvider>
            </BrowserRouter>
        );
    }
}

export default App;