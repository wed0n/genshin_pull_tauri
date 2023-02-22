import { Link as RouterLink } from 'react-router-dom';
import { Drawer, Typography, List, ListItem, ListItemButton, ListItemIcon, ListItemText, SvgIcon } from '@mui/material';
import MailIcon from '@mui/icons-material/Mail';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import React from 'react';
const drawerWidth = 240;
let SideBar = (props: { uid: string }) => {
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
                            <SvgIcon viewBox="0 0 1024 1024" fontSize='large'>
                            <path d="M436.667 611.334c27.604 60.544-60.667 62-60.667 62 1.333 33.333 38.667 34.667 38.667 34.667 56-8 50.667-66.667 50.667-66.667-2-93.334-142-90.667-142-90.667-115.333 10.667-196-132-196-132-31.333 109.998 22 167.334 22 167.334 81.132 92 208 13.333 208 13.333 59.999-34.667 79.333 12 79.333 12zM471 512c-205-186-91-361-91-361-7-9-145.5 57-122 190 24.384 138.002 213 171 213 171z" />
                            <path d="M615.965 718.018l-21.334 13.334s-80-15.346-76.334-79.346c0 0-3.332-106.669 184.334-125.336 0 0 218.334-28.67 100.334-264.67 0 0-1 185.523-213 259.262 0 0-71.965 37.738-84.483 88.738C492.964 559 421 521.262 421 521.262 209 447.523 208 262 208 262 90 498 308.333 526.67 308.333 526.67c187.665 18.667 184.333 125.336 184.333 125.336 3.667 64-76.333 79.346-76.333 79.346L395 718.018c-21-3-31.333 5.329-31.333 5.329 108 95.343 141.815 196.334 141.815 196.334s33.815-100.991 141.815-196.334c0 0-10.332-8.329-31.332-5.329zM505.482 848.343c-3.518-12.666-34.148-56.676-34.148-56.676 19.667-7.666 34.148-23 34.148-23s14.481 15.334 34.149 23c0 0-30.631 44.01-34.149 56.676z m0-107.01c-23.851 31-61.148 16.667-61.148 16.667 43.333-7.667 61.148-51.667 61.148-51.667s17.815 44 61.149 51.667c0 0-37.297 14.333-61.149-16.667z" />
                            <path d="M752.965 341c23.5-133-115-199-122-190 0 0 114 175-91 361 0 0 188.615-32.998 213-171zM883.631 418.667s-80.666 142.667-196 132c0 0-140-2.667-142 90.667 0 0-5.334 58.667 50.666 66.667 0 0 37.334-1.334 38.668-34.667 0 0-88.271-1.456-60.668-62 0 0 19.334-46.667 79.334-12 0 0 126.867 78.667 208-13.333 0 0 53.334-57.337 22-167.334z" />
                            </SvgIcon>
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
                            <SvgIcon viewBox="0 0 1024 1024" fontSize='large'>
                                <path d="M512 123S364 228 255 362c0 0 31 109 65 164 0 0 126.999-138 192-153 0 0 65 52 79 103 0 0-83 77-91 84 0 0 14 21 31 38 0 0 109-77 135-114 0 0-56.001-111-154-205 0 0-137 113-165 140 0 0 6.999-92 165-253 0 0 196 207 284 457 0 0 52-62.334 80-111 0 0-123-224-364-389z" />
                                <path d="M512 651s-65-52-79-103c0 0 83-77 91-84 0 0-14-21-31-38 0 0-109 77-135 114 0 0 56.001 111 154 205 0 0 137-113 165-140 0 0-6.999 92-165 253 0 0-196-207-284-457 0 0-52 62.334-80 111 0 0 123 224 364 389 0 0 148-105 257-239 0 0-31-109-65-164 0 0-126.999 138-192 153z" />
                            </SvgIcon>
                        </ListItemIcon>
                        <ListItemText primary="抽卡统计" />
                    </ListItemButton>
                </ListItem>
            </List>
            <Typography variant='h6' sx={{ marginTop: 'auto', marginBottom: 2, marginX: 3, textAlign: 'center' }}>UID: {props.uid}</Typography>
        </Drawer>
    )
}
export default SideBar;