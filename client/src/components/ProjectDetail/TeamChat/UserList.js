// client/src/components/ProjectDetail/TeamChat/UserList.js
import React from 'react';
import { Box, Typography, List, ListItem, ListItemText, ListItemIcon, Avatar, Badge, Divider, Tooltip } from '@mui/material';
import CircleIcon from '@mui/icons-material/Circle';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

const UserListItem = ({ user }) => {
    const statusColor = {
        online: 'success.main',
        away: 'warning.main',
        offline: 'grey.500',
    };

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
    };

    const stringAvatar = (name) => ({
        sx: {
            bgcolor: user.primary_color || stringToColor(name || 'User'),
            width: 32,
            height: 32,
            fontSize: '0.875rem'
        },
        children: `${(name || 'U').charAt(0).toUpperCase()}`,
    });

    return (
         <ListItem disablePadding sx={{mb: 1}}>
             <ListItemIcon sx={{ minWidth: 40 }}>
                 <Badge
                     overlap="circular"
                     anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                     variant="dot"
                     sx={{
                        '& .MuiBadge-badge': {
                          backgroundColor: statusColor[user.status] || statusColor.offline,
                          color: statusColor[user.status] || statusColor.offline,
                          boxShadow: `0 0 0 2px white`,
                          '&::after': {
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            borderRadius: '50%',
                            animation: user.status === 'online' ? 'ripple 1.2s infinite ease-in-out' : 'none',
                            border: '1px solid currentColor',
                            content: '""',
                          },
                        },
                        '@keyframes ripple': {
                          '0%': { transform: 'scale(.8)', opacity: 1 },
                          '100%': { transform: 'scale(2.4)', opacity: 0 },
                        },
                      }}
                 >
                    <Avatar src={user.profile_image_url || ''} {...stringAvatar(user.username)} />
                 </Badge>
             </ListItemIcon>
            <ListItemText 
                primary={
                    <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                        {user.username}
                        {user.role === 'admin' && (
                            <Tooltip title="Admin">
                                <AdminPanelSettingsIcon color="primary" sx={{ ml: 0.5, fontSize: '1rem' }} />
                            </Tooltip>
                        )}
                    </Box>
                } 
                secondary={user.status || 'offline'}
            />
        </ListItem>
    );
};

const UserList = ({ users }) => {
    const admins = users.filter(u => u.role === 'admin');
    const members = users.filter(u => u.role !== 'admin');

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2, bgcolor: 'background.paper' }}>
            {admins.length > 0 && (
                <>
                    <Box sx={{ px: 1, pt: 1 }}>
                        <Typography variant="overline" color="text.secondary">Admins — {admins.length}</Typography>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <List sx={{ overflowY: 'auto', p: 1, pt: 0 }}>
                        {admins.map(user => <UserListItem key={user.id} user={user} />)}
                    </List>
                </>
            )}

            {members.length > 0 && (
                <>
                    <Box sx={{ px: 1, pt: 1 }}>
                        <Typography variant="overline" color="text.secondary">Members — {members.length}</Typography>
                    </Box>
                     <Divider sx={{ my: 1 }} />
                     <List sx={{ flexGrow: 1, overflowY: 'auto', p: 1, pt: 0 }}>
                        {members.map(user => <UserListItem key={user.id} user={user} />)}
                    </List>
                </>
            )}
        </Box>
    );
};

export default UserList;