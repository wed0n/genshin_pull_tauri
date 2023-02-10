import { Link as RouterLink } from 'react-router-dom';
import { Drawer, Toolbar, Divider, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import MailIcon from '@mui/icons-material/Mail';
import InboxIcon from '@mui/icons-material/MoveToInbox';
const drawerWidth = 240;
const drawer = (
    <List>
        <ListItem key="抽卡分析" disablePadding>
            <ListItemButton component={RouterLink} to="/">
                <ListItemIcon>
                    <MailIcon />
                </ListItemIcon>
                <ListItemText primary="抽卡分析" />
            </ListItemButton>
        </ListItem>
        <ListItem key="抽卡统计" disablePadding>
            <ListItemButton component={RouterLink} to="/count">
                <ListItemIcon>
                    <InboxIcon />
                </ListItemIcon>
                <ListItemText primary="抽卡统计" />
            </ListItemButton>
        </ListItem>
    </List>
);
let SideBar = () => {
    return (
        <Drawer sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
                width: drawerWidth,
                boxSizing: 'border-box',
            },
        }} variant="permanent">
            {drawer}
        </Drawer>
    )
}
export default SideBar;