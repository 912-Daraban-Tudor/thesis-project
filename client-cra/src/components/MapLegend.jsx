import React, { useState } from 'react';
import { Box, Typography, IconButton, useTheme, Fade } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const circleStyle = {
    display: 'inline-block',
    width: 14,
    height: 14,
    borderRadius: '50%',
    marginRight: 8,
    border: '2px solid white',
};

const MapLegend = () => {
    const [visible, setVisible] = useState(true);
    const theme = useTheme();

    return (
        <Box
            sx={{
                position: 'absolute',
                bottom: 8,
                left: 8,
                zIndex: 10,
            }}
        >
            {visible ? (
                <Fade in>
                    <Box
                        sx={{
                            backgroundColor: theme.palette.background.paper,
                            color: theme.palette.text.primary,
                            padding: 2,
                            borderRadius: 2,
                            boxShadow: 3,
                            minWidth: 180,
                        }}
                    >
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                            <Typography variant="subtitle2" fontWeight="bold">
                                Map Legend
                            </Typography>
                            <IconButton
                                size="small"
                                sx={{ color: theme.palette.text.primary, p: 0.5 }}
                                onClick={() => setVisible(false)}
                            >
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </Box>

                        <Box display="flex" alignItems="center" mb={1}>
                            <span style={{ ...circleStyle, backgroundColor: '#d32f2f' }} />
                            <Typography variant="body2">One room for rent</Typography>
                        </Box>

                        <Box display="flex" alignItems="center">
                            <span style={{ ...circleStyle, backgroundColor: '#1976d2' }} />
                            <Typography variant="body2">Multiple rooms for rent</Typography>
                        </Box>
                    </Box>
                </Fade>
            ) : (
                <IconButton
                    onClick={() => setVisible(true)}
                    size="small"
                    sx={{
                        backgroundColor: theme.palette.background.paper,
                        color: theme.palette.text.primary,
                        boxShadow: 2,
                        p: 1,
                        borderRadius: 2,
                    }}
                >
                    <InfoOutlinedIcon fontSize="small" />
                </IconButton>
            )}
        </Box>
    );
};

export default MapLegend;
