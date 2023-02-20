import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material'
import {appWindow} from '@tauri-apps/api/window'
const dialog=(props: { open: boolean,errorMessage:String; })=>{
    const closeWindow=()=>{appWindow.close();};
    return(
        <Dialog
        open={props.open}
        scroll="paper"
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">错误</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{overflowWrap:'break-word'}} id="alert-dialog-description">{props.errorMessage}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={closeWindow}>确定</Button>
        </DialogActions>
      </Dialog>
    );
}

export default dialog;