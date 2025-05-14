import React, { useState } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

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

    return (
        <Box
            sx={{
                position: 'absolute',
                bottom: 7,
                left: 7,
                backgroundColor: 'rgba(195, 195, 195, 0.90)', // light grey with transparency
                color: 'black',
                padding: 2,
                borderRadius: 2,
                boxShadow: 1,
                zIndex: 10,
                minWidth: visible ? 180 : 'auto',
                cursor: 'pointer',
            }}
            onClick={() => setVisible(!visible)}
        >
            {visible ? (
                <>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="subtitle2" fontWeight="bold">
                            Map Legend
                        </Typography>
                        <IconButton
                            size="small"
                            sx={{ color: 'black', p: 0.5 }}
                            onClick={(e) => {
                                e.stopPropagation(); // prevent toggle from Box
                                setVisible(false);
                            }}
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
                </>
            ) : (
                <Typography variant="body2" fontWeight='600'>
                    See Legend
                </Typography>
            )}
        </Box>
    );
};

export default MapLegend;
