import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from '../../api/axiosInstance';
import {
    TextField,
    Checkbox,
    Button,
    Typography,
    Divider,
    Box,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    IconButton,
    Snackbar,
    Alert,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import AddressInput from '../../components/AddressInput';

function EditPostPage() {
    const { state } = useLocation();
    const { id } = useParams();
    const navigate = useNavigate();

    const [apartment, setApartment] = useState(state?.apartment || null);
    const [rooms, setRooms] = useState(state?.rooms || []);
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

    const handleApartmentChange = (e) => {
        const { name, value, type, checked } = e.target;
        setApartment((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleRoomChange = (index, e) => {
        const { name, value, type, checked } = e.target;
        const updatedRooms = [...rooms];
        updatedRooms[index][name] = type === 'checkbox' ? checked : value;
        setRooms(updatedRooms);
    };

    const addRoom = () => {
        setRooms((prev) => [...prev, { price: '', description: '', balcony: false, sex_preference: '' }]);
    };

    const deleteRoom = (index) => {
        if (rooms.length > 1) {
            setRooms((prev) => prev.filter((_, i) => i !== index));
        } else {
            setNotification({ open: true, message: 'At least one room is required', severity: 'warning' });
        }
    };

    const handleCloseNotification = () => setNotification({ ...notification, open: false });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`/api/locations/${id}`, { ...apartment, rooms });
            setNotification({ open: true, message: 'Apartment updated!', severity: 'success' });
            setTimeout(() => navigate('/main'), 1500);
        } catch (err) {
            console.error('Error updating post:', err);
            setNotification({ open: true, message: 'Failed to update. Please try again.', severity: 'error' });
        }
    };

    if (!apartment) return <Typography>Post data missing. Please go back and retry.</Typography>;

    return (
        <div style={{ backgroundColor: '#fff7ee', minHeight: '100vh', padding: '2rem', display: 'flex', justifyContent: 'center' }}>
            <Box sx={{ width: '100%', maxWidth: '900px', backgroundColor: '#f7fbff', p: 3, borderRadius: 2, boxShadow: 3 }}>
                <Button
                    variant="outlined"
                    color="secondary"
                    sx={{
                        position: 'relative',
                        top: '0.5rem',
                        left: '0.5rem',
                        borderColor: '#4a7ebb',
                        color: '#4a7ebb',
                    }}
                    onClick={() => navigate(-1)}
                >
                    Back
                </Button>
                <Typography variant="h4" sx={{ color: '#4a7ebb', textAlign: 'center' }}>
                    Edit Apartment
                </Typography>

                <form onSubmit={handleSubmit}>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                        Apartment Details
                    </Typography>
                    <Divider sx={{ mb: 2 }} />

                    <TextField
                        label="Name"
                        name="name"
                        variant="outlined"
                        value={apartment.name}
                        onChange={handleApartmentChange}
                        fullWidth
                        required
                        sx={{ mb: 2 }}
                        InputLabelProps={{ shrink: true }}
                    />

                    <AddressInput
                        value={apartment.address}
                        editable={true}
                        onAddressSelect={(data) =>
                            setApartment((prev) => ({
                                ...prev,
                                address: data.address,
                                latitude: data.latitude,
                                longitude: data.longitude,
                            }))
                        }
                    />


                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                        <TextField
                            label="Floor"
                            name="floor"
                            type="text"
                            slotProps={{ input: { inputMode: 'numeric', pattern: '[0-9]*' } }}
                            value={apartment.floor}
                            onChange={handleApartmentChange}
                            required
                            sx={{ flex: 1, minWidth: '120px' }}
                            InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                            label="Number of Rooms"
                            name="number_of_rooms"
                            type="text"
                            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                            value={apartment.number_of_rooms}
                            onChange={handleApartmentChange}
                            required
                            sx={{ flex: 1, minWidth: '120px' }}
                            InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                            label="Year Built"
                            name="year_built"
                            type="text"
                            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                            value={apartment.year_built}
                            onChange={handleApartmentChange}
                            sx={{ flex: 1, minWidth: '120px' }}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Box>

                    <TextField
                        label="Description"
                        name="description"
                        value={apartment.description}
                        onChange={handleApartmentChange}
                        multiline
                        rows={3}
                        fullWidth
                        sx={{ mb: 2 }}
                        InputLabelProps={{ shrink: true }}
                    />

                    <Box sx={{ display: 'flex', gap: 4, mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                            <Checkbox checked={apartment.has_centrala} onChange={handleApartmentChange} name="has_centrala" />
                            <Typography variant="body1" color='black'>Has heating</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                            <Checkbox checked={apartment.has_parking} onChange={handleApartmentChange} name="has_parking" />
                            <Typography variant="body1" color='black'>Has parking</Typography>
                        </Box>
                    </Box>

                    <Typography variant="h6" sx={{ mb: 1 }}>
                        Rooms
                    </Typography>
                    <Divider sx={{ mb: 2 }} />

                    {rooms.map((room, index) => (
                        <Box key={room.id || index} sx={{ p: 2, backgroundColor: '#fffbe6', borderRadius: 2, mb: 2, boxShadow: 1, position: 'relative' }}>
                            <IconButton
                                onClick={() => deleteRoom(index)}
                                size="small"
                                sx={{ position: 'absolute', top: 8, right: 8, color: 'error.main' }}
                            >
                                <DeleteIcon />
                            </IconButton>

                            <Typography variant="subtitle1" sx={{ mb: 2, color: '#4a7ebb' }}>
                                Room {index + 1}
                            </Typography>

                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                                <TextField
                                    label="Price (€)"
                                    name="price"
                                    type="text"
                                    inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                                    value={room.price}
                                    onChange={(e) => handleRoomChange(index, e)}
                                    required
                                    sx={{ flex: 1, minWidth: '120px' }}
                                    InputLabelProps={{ shrink: true }}
                                />

                                <FormControl variant="outlined" sx={{ flex: 1, minWidth: '150px' }}>
                                    <InputLabel id={`gender-preference-label-${index}`} htmlFor={`gender-preference-select-${index}`}>
                                        Gender preference
                                    </InputLabel>
                                    <Select
                                        labelId={`gender-preference-label-${index}`}
                                        id={`gender-preference-select-${index}`}
                                        name="sex_preference"
                                        value={room.sex_preference || 'not specified'}
                                        label="Gender preference"
                                        onChange={(e) =>
                                            handleRoomChange(index, {
                                                ...e,
                                                target: { ...e.target, value: e.target.value || 'not specified' },
                                            })
                                        }
                                    >
                                        <MenuItem value="not specified">
                                            <em>Not specified</em>
                                        </MenuItem>
                                        <MenuItem value="M">Male</MenuItem>
                                        <MenuItem value="F">Female</MenuItem>
                                    </Select>
                                </FormControl>


                            </Box>

                            <TextField
                                label="Description"
                                name="description"
                                value={room.description}
                                onChange={(e) => handleRoomChange(index, e)}
                                fullWidth
                                multiline
                                rows={2}
                                sx={{ mb: 2 }}
                                InputLabelProps={{ shrink: true }}
                            />

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                                <Checkbox checked={room.balcony} onChange={(e) => handleRoomChange(index, e)} name="balcony" />
                                <Typography variant="body1" color='black'>Has balcony</Typography>
                            </Box>
                        </Box>
                    ))}

                    <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={addRoom}
                        sx={{ mb: 3, color: '#4a7ebb', borderColor: '#4a7ebb', '&:hover': { backgroundColor: '#cfe6f5' } }}
                    >
                        Add Another Room
                    </Button>

                    <Button
                        variant="contained"
                        color="primary"
                        type="submit"
                        size="large"
                        sx={{ backgroundColor: '#4a7ebb', borderRadius: 2, fontWeight: 500, '&:hover': { backgroundColor: '#3a6ca8' } }}
                        fullWidth
                    >
                        Save Changes
                    </Button>
                </form>

                <Snackbar
                    open={notification.open}
                    autoHideDuration={6000}
                    onClose={handleCloseNotification}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                    <Alert onClose={handleCloseNotification} severity={notification.severity} variant="filled">
                        {notification.message}
                    </Alert>
                </Snackbar>
            </Box>
        </div>
    );
}

export default EditPostPage;
