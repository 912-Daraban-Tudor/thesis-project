import React from 'react';
import PropTypes from 'prop-types';
import { Marker, Popup } from 'react-map-gl';
import { Avatar, Typography, Button, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useMapContext } from '../context/MapContext';

const LocationMarker = ({ location, selected, onClick }) => {
    const navigate = useNavigate();
    const { setSelectedLocation } = useMapContext();
    const isSingleRoom = location.rooms?.length === 1;
    const price = isSingleRoom ? Number(location.rooms[0]?.price) : null;
    const roomCount = location.rooms?.length || 0;
    const buttonColor = isSingleRoom ? '#8b0000' : '#0d47a1';
    const chipColor = isSingleRoom ? '#ffcdd2' : '#bbdefb';

    const isFourDigitPrice = price > 999;
    const isThreeDigitPrice = price > 99;

    let avatarWidth;
    if (isSingleRoom) {
        if (isFourDigitPrice) avatarWidth = 39;
        else if (isThreeDigitPrice) avatarWidth = 34;
        else avatarWidth = 30;
    } else {
        avatarWidth = 28;
    }

    const avatarHeight = 28;
    const fontSize = isSingleRoom ? '0.75rem' : '1.3rem';

    return (
        <>
            {!selected && (
                <Marker
                    key={location.id}
                    latitude={location.latitude}
                    longitude={location.longitude}
                    anchor="bottom"
                >
                    <Avatar
                        sx={{
                            bgcolor: isSingleRoom ? '#d32f2f' : '#1976d2',
                            color: 'white',
                            width: avatarWidth,
                            height: avatarHeight,
                            fontSize,
                            fontWeight: 'bold',
                            border: '2px solid white',
                            cursor: 'pointer',
                        }}
                        onClick={(e) => {
                            if (e?.nativeEvent?.stopImmediatePropagation) e.nativeEvent.stopImmediatePropagation();
                            onClick(location);
                        }}
                    >
                        {isSingleRoom ? `${price}€` : roomCount}
                    </Avatar>
                </Marker>
            )}

            {selected && (
                <Popup
                    longitude={location.longitude}
                    latitude={location.latitude}
                    closeOnClick={true}
                    onClose={() => {
                        setSelectedLocation(null);
                    }}
                    anchor="bottom"
                    offset={[0, -10]}
                    className={isSingleRoom ? 'custom-popup-single' : 'custom-popup-multi'}
                >
                    <div>
                        <Typography variant="subtitle1" style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                            {location.name}
                        </Typography>

                        {location.has_centrala && (
                            <Chip label="Heating" size="small" sx={{ bgcolor: chipColor, color: 'black', mr: 1, mb: 1 }} />
                        )}
                        {location.has_parking && (
                            <Chip label="Parking" size="small" sx={{ bgcolor: chipColor, color: 'black', mr: 1, mb: 1 }} />
                        )}

                        <Typography variant="body2" style={{ marginBottom: '0.25rem' }}>
                            <strong>Total Rooms:</strong> {location.number_of_rooms}
                        </Typography>

                        <Typography variant="body2" style={{ marginBottom: '0.75rem' }}>
                            {isSingleRoom
                                ? `Price: ${price}€`
                                : `Available Rooms: ${roomCount}`}
                        </Typography>

                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <Button
                                size="small"
                                variant="contained"
                                onClick={() => navigate(`/apartment/${location.id}`)}
                                sx={{
                                    backgroundColor: buttonColor,
                                    '&:hover': { backgroundColor: isSingleRoom ? '#6a0000' : '#08306b' },
                                    color: 'white',
                                    fontSize: '0.75rem',
                                    padding: '4px 12px',
                                }}
                            >
                                View Details
                            </Button>
                        </div>
                    </div>
                </Popup>
            )}
        </>
    );
};

LocationMarker.propTypes = {
    location: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        latitude: PropTypes.number.isRequired,
        longitude: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        has_centrala: PropTypes.bool,
        has_parking: PropTypes.bool,
        number_of_rooms: PropTypes.number,
        rooms: PropTypes.arrayOf(
            PropTypes.shape({
                price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            })
        ),
    }).isRequired,
    selected: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,
};

export default LocationMarker;
