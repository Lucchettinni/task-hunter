import React from 'react';
import { Box, Typography, List, ListItem, ListItemText, ListItemIcon, Avatar, Badge, Divider, Tooltip } from '@mui/material';
import CircleIcon from '@mui/icons-material/Circle';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

const UserListItem = ({ user }) => {
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
    };

    const stringAvatar = (name) => {
        return {
            sx: {
                bgcolor: user.primary_color || stringToColor(name || 'User'),
                width: 32,
                height: 32,
                fontSize: '0.875rem'
            },
            children: `${(name || 'U').charAt(0).toUpperCase()}`,
        };
    };

    return (
         <ListItem disablePadding sx={{mb: 1}}>
             <ListItemIcon sx={{ minWidth: 40 }}>
                 <Badge
                     overlap="circular"
                     anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                     badgeContent={
                        <CircleIcon sx={{ 
                            color: 'success.main', 
                            fontSize: 12, 
                            border: '2px solid white', 
                            borderRadius: '50%' 
                        }} />
                     }
                 >
                    {/* MODIFICATION: 
                        The Avatar now uses the profile_image_url directly, as it's a full link.
                    */}
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
                        {admins.map(user => (
                           <UserListItem key={user.id} user={user} />
                        ))}
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
                        {members.map(user => (
                            <UserListItem key={user.id} user={user} />
                        ))}
                    </List>
                </>
            )}
        </Box>
    );
};

export default UserList;