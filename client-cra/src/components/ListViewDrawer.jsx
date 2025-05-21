// src/components/ListViewDrawer.jsx
import React, { useMemo } from 'react';
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
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useMapContext } from '../context/MapContext';
import ListViewItem from './ListViewItem';
import { useMap } from 'react-map-gl';
import { flyToWithOffset } from '../utils/mapUtils';

const ListViewDrawer = () => {
    const {
        locations,
        selectedLocation,
        setSelectedLocation,
        setHighlightedLocation,
        searchCoords,
        isFallback,
        setSortBy,
        sortBy,
        setSortOrder,
        listViewOpen,
        setListViewOpen,
        sortOrder,
    } = useMapContext();

    const { mainMap } = useMap();
    const map = mainMap?.getMap();

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const toggleOpen = () => setListViewOpen(prev => !prev);

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
        setSelectedLocation(null);
        setHighlightedLocation(location);
        flyToWithOffset(map, location.longitude, location.latitude, listViewOpen, isMobile);
    };

    return (
        <>
            <Drawer
                anchor={isMobile ? 'bottom' : 'left'}
                open={listViewOpen}
                onClose={() => {
                    setListViewOpen(false);
                    setHighlightedLocation(null);
                }}
                variant="persistent"
                PaperProps={{
                    sx: {
                        width: isMobile ? '100%' : '45vw',
                        height: isMobile ? '50vh' : 'calc(100% - 64px)',
                        top: isMobile ? 'auto' : '64px',
                        zIndex: 1200,
                        backgroundColor: '#f8f8f8',
                        overflow: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
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
                            {isMobile ? <ExpandMoreIcon /> : <ChevronLeftIcon />}
                        </IconButton>
                    </Box>
                </Box>

                {searchCoords && isFallback && (
                    <Box px={2} pb={1}>
                        <Typography variant="body2" color="text.secondary">
                            No rooms for rent near this location, try searching for a different location.
                        </Typography>
                    </Box>
                )}

                <Box
                    px={2}
                    pb={2}
                    overflow="auto"
                    flex={1}
                    sx={{
                        maxHeight: '100%',
                        '&::-webkit-scrollbar': {
                            width: '8px',
                        },
                        '&::-webkit-scrollbar-thumb': {
                            backgroundColor: '#ccc',
                            borderRadius: '4px',
                        },
                        '&::-webkit-scrollbar-thumb:hover': {
                            backgroundColor: '#aaa',
                        },
                        '&::-webkit-scrollbar-track': {
                            backgroundColor: '#f2f2f2',
                        },
                        scrollbarWidth: 'thin', // Firefox
                        scrollbarColor: '#ccc #f2f2f2', // Firefox
                    }}
                >
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

            {!listViewOpen && (
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
                    {isMobile ? <ExpandMoreIcon style={{ transform: 'rotate(180deg)' }} /> : <ChevronRightIcon />}
                </IconButton>
            )}
        </>
    );
};

export default ListViewDrawer;
