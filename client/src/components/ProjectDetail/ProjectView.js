// src/components/ProjectDetail/ProjectView.js
import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Box, Tabs, Tab, Typography, CircularProgress, Alert } from '@mui/material';
import TaskBoard from './TaskBoard/TaskBoard'; // We will create this next
import DocumentationTab from './Documentation/DocumentationTab'; // And this
import ManageUsersTab from './Admin/ManageUsersTab'; // And this
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DescriptionIcon from '@mui/icons-material/Description';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import AuthContext from '../../contexts/AuthContext';
import api from '../../services/api';
import TeamChat from './TeamChat/TeamChat'; // Import the new component

// A helper component for the tab content
function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`project-tabpanel-${index}`}
            aria-labelledby={`project-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
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


    useEffect(() => {
        const fetchProjectDetails = async () => {
            try {
                // In a real app, you might want a specific endpoint to get a single project's details
                // For now, we filter from the list we already fetched in ProjectList.
                // This is less efficient but works for our current API setup. A dedicated
                // GET /api/projects/:id endpoint would be better.
                const res = await api.get('/projects');
                const currentProject = res.data.find(p => p.id === parseInt(projectId));
                if (currentProject) {
                    setProject(currentProject);
                } else {
                    setError('Project not found or you do not have access.');
                }
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
    };

    if (loading) {
        return <Box display="flex" justifyContent="center" mt={5}><CircularProgress /></Box>;
    }

    if (error) {
        return <Container><Alert severity="error" sx={{ mt: 3 }}>{error}</Alert></Container>;
    }


    return (
        <Container maxWidth={false} sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>{project.title}</Typography>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabIndex} onChange={handleTabChange} aria-label="Project detail tabs">
                    <Tab icon={<AssignmentIcon />} iconPosition="start" label="Task Tracking" />
                    <Tab icon={<DescriptionIcon />} iconPosition="start" label="Documentation" />
                    <Tab icon={<ChatBubbleOutlineIcon />} iconPosition="start" label="Team Chat" />
                    {user?.role === 'admin' && (
                        <Tab icon={<GroupAddIcon />} iconPosition="start" label="Manage Users" />
                    )}
                </Tabs>
            </Box>

            <TabPanel value={tabIndex} index={0}>
                <TaskBoard projectId={projectId} />
            </TabPanel>
            <TabPanel value={tabIndex} index={1}>
                <DocumentationTab projectId={projectId} />
            </TabPanel>
            <TabPanel value={tabIndex} index={2}>
                 {/* Replace the placeholder Typography with this */}
                 <TeamChat projectId={projectId} />
			</TabPanel>
            {user?.role === 'admin' && (
                 <TabPanel value={tabIndex} index={3}>
                    <ManageUsersTab projectId={projectId} />
                </TabPanel>
            )}
        </Container>
		
		
    );
};

export default ProjectView;