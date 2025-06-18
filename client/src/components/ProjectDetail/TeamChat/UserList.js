// src/components/ProjectDetail/TeamChat/UserList.js
import React from 'react';
import { Box, Typography, List, ListItem, ListItemText, ListItemIcon } from '@mui/material';
import CircleIcon from '@mui/icons-material/Circle';

const UserList = ({ users }) => {
    return (
        <Box sx={{ p: 2, height: '100%', borderLeft: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6">Online ({users.length})</Typography>
            <List>
                {users.map(user => (
                    <ListItem key={user.userId} disablePadding>
                        <ListItemIcon sx={{ minWidth: '30px' }}>
                            <CircleIcon sx={{ color: 'green', fontSize: '12px' }} />
                        </ListItemIcon>
                        <ListItemText primary={user.username} />
                    </ListItem>
                ))}
            </List>
        </Box>
    );
};

export default UserList;