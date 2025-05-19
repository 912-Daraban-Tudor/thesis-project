import React from 'react';
import { Card, CardContent, Typography, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useMapContext } from '../context/MapContext';


const ListViewItem = ({ location, isSelected, onClick }) => {
    const navigate = useNavigate();
    const { searchCoords } = useMapContext();

    const prices = Array.isArray(location.rooms)
        ? location.rooms.map((r) => `€${r.price}`).join(', ')
        : 'Not specified';

    return (
        <Card
            onClick={onClick}
            sx={{
                mb: 2,
                cursor: 'pointer',
                backgroundColor: isSelected ? '#f0f0f0' : '#fff',
                transition: 'background-color 0.2s',
                '&:hover': {
                    backgroundColor: '#f9f9f9',
                },
            }}
        >
            <CardContent>
                <Typography variant="h6">{location.name}</Typography>
                <Typography variant="subtitle2" color="text.secondary">
                    {location.address}
                </Typography>

                {searchCoords && typeof location.distance_km === 'number' && (
                    <Typography variant="body2" color="text.secondary" mt={0.5}>
                        {Math.round(location.distance_km * 1000)} m away
                    </Typography>
                )}

                <Box mt={1}>
                    <Typography variant="body2">
                        Prices: {prices}
                    </Typography>
                </Box>

                <Box mt={2} display="flex" justifyContent="flex-end">
                    <Button
                        size="small"
                        variant="outlined"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/apartment/${location.id}`);
                        }}
                    >
                        View
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
};

ListViewItem.propTypes = {
    location: PropTypes.object.isRequired,
    isSelected: PropTypes.bool,
    onClick: PropTypes.func,
};

export default ListViewItem;
