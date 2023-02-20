import React from 'react';
import { ThemeProvider, createTheme, Paper, Box, CircularProgress } from '@mui/material';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { invoke } from '@tauri-apps/api'
import Dialog from './dialog'
import SideBar from './SideBar';
import Main from './main';
import Count from "./count";
import PrepareProgress from './prepareprogress';
import './main.css';
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
        wishMessage:String,
        errorMessage: String
    }>{
    constructor(props: any) {
        super(props);
        this.state = { uid: undefined, isPrepared: false, isError: false,wishMessage:'', errorMessage: '' };
    }
    async chanel(){
        await appWindow.listen("wish",(event)=>{this.setState({...this.state, wishMessage:event.payload as String});});
    }
    async componentDidMount() {
        try {
            debugger;
            let uid = await invoke('prepare') as string;
            this.setState({ ...this.state, uid: uid });
            this.chanel();
            await invoke('get_wishes');
            this.setState({ ...this.state, isPrepared: true });
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
                        <Route path="/" element={<Main />} />
                        <Route path="count" element={<Count />} />
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
                        <Dialog open={this.state.isError} errorMessage={this.state.errorMessage}></Dialog>
                        {target}
                    </Paper>
                </ThemeProvider>
            </BrowserRouter>
        );
    }
}

export default App;