// src/components/ProjectDetail/ProjectView.js
import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Box, Tabs, Tab, Typography, CircularProgress, Alert, Chip, Badge } from '@mui/material';
import TaskBoard from './TaskBoard/TaskBoard'; 
import DocumentationTab from './Documentation/DocumentationTab';
import ManageUsersTab from './Admin/ManageUsersTab';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DescriptionIcon from '@mui/icons-material/Description';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import AuthContext from '../../contexts/AuthContext';
import api from '../../services/api';
import TeamChat from './TeamChat/TeamChat'; 

function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel" hidden={value !== index} id={`project-tabpanel-${index}`} aria-labelledby={`project-tab-${index}`} {...other}>
            {value === index && (<Box sx={{ p: 3 }}>{children}</Box>)}
        </div>
    );
}

const ProjectView = () => {
    const { projectId } = useParams();
    const { user } = useContext(AuthContext);
    const [tabIndex, setTabIndex] = useState(0);
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [pingedChannels, setPingedChannels] = useState(new Set());

    const handlePing = (channelId) => {
        setPingedChannels(prev => new Set(prev).add(channelId));
    };

    useEffect(() => {
        const fetchProjectDetails = async () => {
            try {
                const res = await api.get('/projects');
                const currentProject = res.data.find(p => p.id === parseInt(projectId));
                if (currentProject) setProject(currentProject);
                else setError('Project not found or you do not have access.');
            } catch (err) {
                setError('Failed to fetch project details.');
            } finally {
                setLoading(false);
            }
        };
        fetchProjectDetails();
    }, [projectId]);

    const handleTabChange = (event, newValue) => {
        setTabIndex(newValue);
        if (newValue === 2) { // Chat tab index
            setPingedChannels(new Set());
        }
    };
    
    if (loading) return <Box display="flex" justifyContent="center" mt={5}><CircularProgress /></Box>;
    if (error) return <Container><Alert severity="error" sx={{ mt: 3 }}>{error}</Alert></Container>;

    const chatTabLabel = (
        <Badge color="error" variant="dot" invisible={pingedChannels.size === 0}>
            Team Chat
        </Badge>
    );

    return (
        <Container maxWidth={false} sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>{project.title}</Typography>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabIndex} onChange={handleTabChange} aria-label="Project detail tabs">
                    <Tab icon={<AssignmentIcon />} iconPosition="start" label="Task Tracking" />
                    <Tab icon={<DescriptionIcon />} iconPosition="start" label="Documentation" />
                    <Tab icon={<ChatBubbleOutlineIcon />} iconPosition="start" label={chatTabLabel} />
                    {user?.role === 'admin' && (
                        <Tab icon={<GroupAddIcon />} iconPosition="start" label="Manage Users" />
                    )}
                </Tabs>
            </Box>

            <TabPanel value={tabIndex} index={0}><TaskBoard projectId={projectId} /></TabPanel>
            <TabPanel value={tabIndex} index={1}><DocumentationTab projectId={projectId} /></TabPanel>
            <TabPanel value={tabIndex} index={2}><TeamChat projectId={projectId} onPing={handlePing} /></TabPanel>
            {user?.role === 'admin' && (<TabPanel value={tabIndex} index={3}><ManageUsersTab projectId={projectId} /></TabPanel>)}
        </Container>
    );
};

export default ProjectView;