// src/components/ProjectDetail/TeamChat/UserList.js
import React, { useContext } from 'react';
import { Box, Typography, List, ListItem, ListItemText, ListItemIcon, Avatar, Badge, Divider } from '@mui/material';
import CircleIcon from '@mui/icons-material/Circle';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AuthContext from '../../../contexts/AuthContext';

const UserList = ({ users }) => {
    const { user: currentUser } = useContext(AuthContext);
    
    const stringToColor = (string) => {
        let hash = 0;
        let i;
        for (i = 0; i < string.length; i += 1) {
            hash = string.charCodeAt(i) + ((hash << 5) - hash);
        }
        let color = '#';
        for (i = 0; i < 3; i += 1) {
            const value = (hash >> (i * 8)) & 0xff;
            color += `00${value.toString(16)}`.slice(-2);
        }
        return color;
    }

    const stringAvatar = (name) => {
        return {
            sx: {
                bgcolor: stringToColor(name || 'User'),
                width: 32,
                height: 32,
                fontSize: '0.875rem'
            },
            children: `${(name || 'U').charAt(0).toUpperCase()}`,
        };
    }

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{p: 2}}>
                <Typography variant="h6">Members ({users.length})</Typography>
            </Box>
            <Divider />
            <List sx={{ flexGrow: 1, overflowY: 'auto', p: 1 }}>
                {users.map(user => (
                    <ListItem key={user.userId} disablePadding sx={{mb: 1}}>
                         <ListItemIcon sx={{ minWidth: 40 }}>
                             <Badge
                                 overlap="circular"
                                 anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                 badgeContent={
                                    <CircleIcon sx={{ 
                                        color: user.role === 'admin' ? 'secondary.main' : 'success.main', 
                                        fontSize: 12, 
                                        border: '2px solid white', 
                                        borderRadius: '50%' 
                                    }} />
                                 }
                             >
                                <Avatar {...stringAvatar(user.username)} />
                             </Badge>
                         </ListItemIcon>
                        <ListItemText 
                            primary={user.username} 
                            secondary={user.userId === currentUser.id ? "You" : user.role}
                        />
                    </ListItem>
                ))}
            </List>
        </Box>
    );
};

export default UserList;