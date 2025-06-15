import {
    Card,
    CardContent,
    Typography,
    Box,
    Button,
    useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useMapContext } from '../context/MapContext';
import { useChatUI } from '../context/ChatUIContext';
import { jwtDecode } from 'jwt-decode';

const ListViewItem = ({ location, isSelected, onClick }) => {
    const navigate = useNavigate();
    const { searchCoords, isFallback } = useMapContext();
    const { openChat } = useChatUI();
    const theme = useTheme();

    const token = localStorage.getItem('token');
    const decodedToken = token ? jwtDecode(token) : null;
    const posterId = parseInt(location.created_by);
    const isMe = decodedToken?.id === posterId;

    const prices = Array.isArray(location.rooms)
        ? location.rooms.map((r) => `€${r.price}`).join(', ')
        : 'Not specified';

    const showDistance =
        searchCoords && typeof location.distance_km === 'number' && !isFallback;

    return (
        <Card
            onClick={onClick}
            elevation={1}
            sx={{
                mb: 2,
                cursor: 'pointer',
                bgcolor: isSelected ? theme.palette.action.selected : theme.palette.background.paper,
                transition: 'background-color 0.2s',
                '&:hover': {
                    bgcolor: theme.palette.action.hover,
                },
            }}
        >
            <CardContent>
                <Typography variant="h6" noWrap>
                    {location.name}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary" noWrap>
                    {location.address}
                </Typography>

                {showDistance && (
                    <Typography variant="body2" color="text.secondary" mt={0.5}>
                        {Math.round(location.distance_km)} m away
                    </Typography>
                )}

                <Box mt={theme.spacing(1)}>
                    <Typography variant="body2">
                        Prices: {prices}
                    </Typography>
                </Box>

                <Box mt={theme.spacing(2)} display="flex" justifyContent="flex-end" gap={1} flexWrap="wrap">
                    {isMe ? (
                        <Button
                            size="small"
                            variant="contained"
                            color="secondary"
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/edit-post/${location.id}`, {
                                    state: { apartment: location, rooms: location.rooms || [] },
                                });
                            }}
                        >
                            Edit Post
                        </Button>
                    ) : (
                        <Button
                            size="small"
                            variant="outlined"
                            color="primary"
                            onClick={(e) => {
                                e.stopPropagation();
                                openChat(location.created_by);
                            }}
                        >
                            Send Message
                        </Button>
                    )}

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
