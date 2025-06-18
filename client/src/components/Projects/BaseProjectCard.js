// src/components/Projects/BaseProjectCard.js
import React from 'react';
import { Paper } from '@mui/material';

const BaseProjectCard = ({ children, onClick, sx = {} }) => {
    return (
        <Paper
            onClick={onClick}
            sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                minHeight: 340,
                borderRadius: 4,
                border: '2px solid transparent',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: 1,
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '4px',
                    bgcolor: 'primary.main',
                    transform: 'translateX(-100%)',
                    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    zIndex: 2
                },
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                    borderColor: 'primary.light',
                    '&::before': {
                        transform: 'translateX(0)',
                    },
                },
                ...sx
            }}
        >
            {children}
        </Paper>
    );
};

export default BaseProjectCard;