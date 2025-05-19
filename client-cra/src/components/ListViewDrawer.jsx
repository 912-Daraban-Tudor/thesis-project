// src/components/ListViewDrawer.jsx
import React, { useState, useMemo } from 'react';
import {
    Drawer,
    IconButton,
    Typography,
    Box,
    useMediaQuery,
    Select,
    MenuItem,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ChevronUpIcon from '@mui/icons-material/ExpandMore';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronDownIcon from '@mui/icons-material/ExpandMore';
import { useNavigate } from 'react-router-dom';
import { useMapContext } from '../context/MapContext';
import ListViewItem from './ListViewItem';
import { useMap } from 'react-map-gl';

const ListViewDrawer = () => {
    const {
        locations,
        selectedLocation,
        setSelectedLocation,
        searchCoords,
        fallbackTriggered,
        setSortBy,
        sortBy,
        setSortOrder,
        sortOrder,
    } = useMapContext();

    const { mainMap } = useMap();
    const map = mainMap?.getMap();

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [open, setOpen] = useState(false);

    const navigate = useNavigate();

    const toggleOpen = () => setOpen((prev) => !prev);

    const sortedLocations = useMemo(() => {
        return [...locations].sort((a, b) => {
            if (sortBy === 'price') {
                const aPrice = Math.min(...(a.rooms?.map(r => Number(r.price)) || [Infinity]));
                const bPrice = Math.min(...(b.rooms?.map(r => Number(r.price)) || [Infinity]));
                return sortOrder === 'asc' ? aPrice - bPrice : bPrice - aPrice;
            } else if (sortBy === 'distance') {
                const aDist = a.distance_km ?? Infinity;
                const bDist = b.distance_km ?? Infinity;
                return sortOrder === 'asc' ? aDist - bDist : bDist - aDist;
            }
            return 0;
        });
    }, [locations, sortBy, sortOrder]);



    const handleItemClick = (location) => {
        setSelectedLocation(location);
        map.flyTo({
            center: [location.longitude, location.latitude],
            zoom: 15,
            speed: 1.2,
            curve: 1.5,
            easing: (t) => t,
        });
    };

    return (
        <>
            <Drawer
                anchor={isMobile ? 'bottom' : 'left'}
                open={open}
                onClose={toggleOpen}
                variant="persistent"
                PaperProps={{
                    sx: {
                        width: isMobile ? '100%' : '45vw',
                        height: isMobile ? '50vh' : '100%',
                        top: isMobile ? 'auto' : '64px',
                        zIndex: 1200,
                        backgroundColor: '#f8f8f8',
                    },
                }}
            >
                <Box display="flex" alignItems="center" justifyContent="space-between" p={2}>
                    <Typography variant="h6">Apartments</Typography>
                    <Box display="flex" gap={1} alignItems="center">
                        <Select
                            value={`${sortBy}_${sortOrder}`}
                            size="small"
                            onChange={(e) => {
                                const [newSortBy, newOrder] = e.target.value.split('_');
                                setSortBy(newSortBy);
                                setSortOrder(newOrder);
                            }}
                            variant="outlined"
                        >
                            <MenuItem value="price_asc">Price ↑</MenuItem>
                            <MenuItem value="price_desc">Price ↓</MenuItem>
                            <MenuItem value="distance_asc">Distance ↑</MenuItem>
                            <MenuItem value="distance_desc">Distance ↓</MenuItem>
                        </Select>

                        <IconButton onClick={toggleOpen}>
                            {isMobile ? <ChevronDownIcon /> : <ChevronLeftIcon />}
                        </IconButton>
                    </Box>
                </Box>

                {searchCoords && fallbackTriggered && (
                    <Box px={2} pb={1}>
                        <Typography variant="body2" color="text.secondary">
                            No rooms for rent near this location, you might consider:
                        </Typography>
                    </Box>
                )}

                <Box px={2} pb={2} overflow="auto" flex={1}>
                    {sortedLocations.map((loc) => (
                        <ListViewItem
                            key={loc.id}
                            location={loc}
                            isSelected={selectedLocation?.id === loc.id}
                            onClick={() => handleItemClick(loc)}
                        />
                    ))}
                </Box>

            </Drawer>

            {!open && (
                <IconButton
                    onClick={toggleOpen}
                    sx={{
                        position: 'absolute',
                        top: 80,
                        left: '10px',
                        zIndex: 1300,
                        backgroundColor: '#fff',
                        border: '1px solid #ccc',
                        '&:hover': { backgroundColor: '#f0f0f0' },
                    }}
                >
                    {isMobile ? <ChevronUpIcon /> : <ChevronRightIcon />}
                </IconButton>
            )}
        </>
    );
};

export default ListViewDrawer;
