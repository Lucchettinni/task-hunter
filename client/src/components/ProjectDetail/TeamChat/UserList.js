// src/components/ProjectDetail/TeamChat/UserList.js
import React, { useContext } from 'react';
import { Box, Typography, List, ListItem, ListItemText, ListItemIcon, Avatar, Badge } from '@mui/material';
import CircleIcon from '@mui/icons-material/Circle';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AuthContext from '../../../contexts/AuthContext';


const UserList = ({ users }) => {
    const { user: currentUser } = useContext(AuthContext);
    
    // Function to create a simple avatar with initials
    const stringToColor = (string) => {
        let hash = 0;
        for (let i = 0; i < string.length; i += 1) {
            hash = string.charCodeAt(i) + ((hash << 5) - hash);
        }
        let color = '#';
        for (let i = 0; i < 3; i += 1) {
            const value = (hash >> (i * 8)) & 0xff;
            color += `00${value.toString(16)}`.slice(-2);
        }
        return color;
    }

    const stringAvatar = (name) => {
        return {
            sx: {
                bgcolor: stringToColor(name),
                width: 32,
                height: 32,
                fontSize: '0.875rem'
            },
            children: `${name.split(' ')[0][0]}`,
        };
    }

    return (
        <Box sx={{ p: 2, height: '100%', overflowY: 'auto' }}>
            <Typography variant="h6">Online ({users.length})</Typography>
            <List>
                {users.map(user => (
                    <ListItem key={user.userId} disablePadding sx={{mb: 1}}>
                         <ListItemIcon sx={{ minWidth: 40 }}>
                             <Badge
                                 overlap="circular"
                                 anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                 badgeContent={
                                     user.role === 'admin' ? 
                                     <AdminPanelSettingsIcon sx={{ fontSize: 16, color: 'secondary.main', backgroundColor: 'background.paper', borderRadius: '50%' }}/> : 
                                     <CircleIcon sx={{ color: 'green', fontSize: 12, border: '2px solid white', borderRadius: '50%' }} />
                                 }
                             >
                                <Avatar {...stringAvatar(user.username)} />
                             </Badge>
                         </ListItemIcon>
                        <ListItemText 
                            primary={user.username} 
                            secondary={user.userId === currentUser.id ? "You" : ""}
                        />
                    </ListItem>
                ))}
            </List>
        </Box>
    );
};

export default UserList;