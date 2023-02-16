import { Link as RouterLink } from 'react-router-dom';
import { Drawer,Typography,List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import MailIcon from '@mui/icons-material/Mail';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import React from 'react';
const drawerWidth = 240;
let SideBar = (props:{uid:number}) => {
    const [selectedIndex, setSelectedIndex] = React.useState(0);
    const handleListItemClick = (
        event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
        index: number,
    ) => {
        setSelectedIndex(index);
    };
    return (
        <Drawer sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
                width: drawerWidth,
                boxSizing: 'border-box',
            },
        }} variant="permanent">
            <List>
                <ListItem key="抽卡分析" disablePadding>
                    <ListItemButton component={RouterLink}
                        to="/"
                        selected={selectedIndex === 0}
                        onClick={(event) => handleListItemClick(event, 0)}>
                        <ListItemIcon>
                            <MailIcon />
                        </ListItemIcon>
                        <ListItemText primary="抽卡分析" />
                    </ListItemButton>
                </ListItem>
                <ListItem key="抽卡统计" disablePadding>
                    <ListItemButton component={RouterLink}
                        to="/count"
                        selected={selectedIndex === 1}
                        onClick={(event) => handleListItemClick(event, 1)}>
                        <ListItemIcon>
                            <InboxIcon />
                        </ListItemIcon>
                        <ListItemText primary="抽卡统计" />
                    </ListItemButton>
                </ListItem>
            </List>
            <Typography variant='subtitle1' sx={{marginTop:'auto',marginBottom:1,marginX:3,textAlign:'center'}}>UID: {props.uid}</Typography>
        </Drawer>
    )
}
export default SideBar;