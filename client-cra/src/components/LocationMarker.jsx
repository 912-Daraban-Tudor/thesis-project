import PropTypes from 'prop-types';
import { Marker, Popup } from 'react-map-gl';
import { Avatar, Typography, Button, Chip, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useMapContext } from '../context/MapContext';
import { useChatUI } from '../context/ChatUIContext';
import { jwtDecode } from 'jwt-decode';
const LocationMarker = ({ location, selected, highlighted, onClick }) => {
    const navigate = useNavigate();
    const { setSelectedLocation } = useMapContext();
    const { openChat } = useChatUI();
    const posterId = parseInt(location.created_by);
    const token = localStorage.getItem('token');
    const decodedToken = token ? jwtDecode(token) : null;
    const isMe = decodedToken?.id === posterId;
    const isSingleRoom = location.rooms?.length === 1;
    const price = isSingleRoom ? Number(location.rooms[0]?.price) : null;
    const roomCount = location.rooms?.length || 0;

    const isFourDigitPrice = price > 999;
    const isThreeDigitPrice = price > 99;

    const baseColor = isSingleRoom ? '#d32f2f' : '#1976d2';
    const chipColor = isSingleRoom ? '#ffcdd2' : '#bbdefb';
    const buttonColor = isSingleRoom ? '#8b0000' : '#0d47a1';

    let avatarWidth;
    if (isSingleRoom) {
        if (isFourDigitPrice) {
            avatarWidth = 39;
        } else if (isThreeDigitPrice) {
            avatarWidth = 34;
        } else {
            avatarWidth = 30;
        }
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
                            bgcolor: baseColor,
                            color: 'white',
                            width: highlighted ? avatarWidth + 6 : avatarWidth,
                            height: highlighted ? avatarHeight + 6 : avatarHeight,
                            fontSize: highlighted ? '0.9rem' : fontSize,
                            fontWeight: 'bold',
                            border: highlighted ? '2px solid #42a5f5' : '2px solid white',
                            boxShadow: highlighted
                                ? '0 0 10px rgba(66, 165, 245, 0.7)'
                                : '0 0 4px rgba(0,0,0,0.3)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                        }}
                        onClick={(e) => {
                            e?.nativeEvent?.stopImmediatePropagation?.();
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
                    onClose={() => setSelectedLocation(null)}
                    anchor="bottom"
                    offset={[0, -10]}
                    className={isSingleRoom ? 'custom-popup-single' : 'custom-popup-multi'}
                >
                    <div>
                        <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                            {location.name}
                        </Typography>

                        {location.has_centrala && (
                            <Chip label="Heating" size="small" sx={{ bgcolor: chipColor, color: 'black', mr: 1, mb: 1 }} />
                        )}
                        {location.has_parking && (
                            <Chip label="Parking" size="small" sx={{ bgcolor: chipColor, color: 'black', mr: 1, mb: 1 }} />
                        )}

                        <Typography variant="body2" mb={0.5}>
                            <strong>Total Rooms:</strong> {location.number_of_rooms}
                        </Typography>

                        <Typography variant="body2" mb={1}>
                            {isSingleRoom
                                ? `Price: ${price}€`
                                : `Available Rooms: ${roomCount}`}
                        </Typography>

                        <Box display="flex" justifyContent="center" flexDirection="column" gap={1} mt={1}>
                            {isMe ? (
                                <Button
                                    size="small"
                                    variant="contained"
                                    onClick={() => navigate(`/edit-post/${location.id}`)}
                                    sx={{
                                        backgroundColor: '#795548',
                                        '&:hover': { backgroundColor: '#5d4037' },
                                        color: 'white',
                                        fontSize: '0.75rem',
                                        px: 2,
                                        py: 0.5,
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                                    }}
                                >
                                    Edit Post
                                </Button>
                            ) : (
                                <Button
                                    size="small"
                                    variant="outlined"
                                    onClick={() => openChat(location.created_by)}
                                    sx={{
                                        fontSize: '0.75rem',
                                        px: 2,
                                        py: 0.5,
                                        border: `2px solid ${buttonColor}`,
                                        color: buttonColor,
                                        fontWeight: 600,
                                        borderRadius: 2,
                                        backgroundColor: '#ffffff',
                                        '&:hover': {
                                            backgroundColor: `${buttonColor}10`,
                                            borderColor: buttonColor,
                                        },
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                    }}
                                >
                                    Send a Message
                                </Button>
                            )}

                            <Button
                                size="small"
                                variant="contained"
                                onClick={() => navigate(`/apartment/${location.id}`)}
                                sx={{
                                    backgroundColor: buttonColor,
                                    '&:hover': { backgroundColor: isSingleRoom ? '#6a0000' : '#08306b' },
                                    color: 'white',
                                    fontSize: '0.75rem',
                                    px: 2,
                                    py: 0.5,
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                                }}
                            >
                                View Details
                            </Button>
                        </Box>


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
    highlighted: PropTypes.bool,
    onClick: PropTypes.func.isRequired,
};

export default LocationMarker;
