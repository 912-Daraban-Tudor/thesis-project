import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from '../../api/axiosInstance';
import {
    TextField, Checkbox, Button, Typography, Divider, Box, MenuItem,
    FormControl, FormControlLabel, InputLabel, Select, IconButton, Snackbar, Alert, CircularProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import AddressInput from '../../components/AddressInput';
import { useDropzone } from 'react-dropzone';

function EditPostPage() {
    const { state } = useLocation();
    const { id } = useParams();
    const navigate = useNavigate();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [apartment, setApartment] = useState(state?.apartment || null);
    const [rooms, setRooms] = useState(state?.rooms || []);
    const [existingImageUrls, setExistingImageUrls] = useState([]);
    const [newFiles, setNewFiles] = useState([]);
    const [newUploadedUrls, setNewUploadedUrls] = useState([]);
    const [loading, setLoading] = useState(!state?.apartment);
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

    const [formErrors, setFormErrors] = useState({
        name: '',
        address: '',
        floor: '',
        number_of_rooms: '',
        year_built: '',
        rooms: []
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(`/api/locations/${id}`);
                const fetched = res.data.location;

                if (fetched.latitude == null || fetched.longitude == null) {
                    setNotification({
                        open: true,
                        message: 'Warning: location coordinates missing. Please re-select address.',
                        severity: 'warning'
                    });
                }

                setApartment(fetched);
                setRooms(res.data.rooms || []);
                setExistingImageUrls(res.data.images || []);
                setLoading(false);
            } catch (err) {
                console.error('Failed to fetch post:', err);
                setNotification({ open: true, message: 'Failed to load post data', severity: 'error' });
                setLoading(false);
            }
        };

        if (!state?.apartment) fetchData();
    }, [id, state]);

    const handleApartmentChange = (e) => {
        const { name, value, type, checked } = e.target;
        setApartment((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value.trim() }));
    };

    const handleRoomChange = (index, e) => {
        const { name, value, type, checked } = e.target;
        const updatedRooms = [...rooms];
        updatedRooms[index][name] = type === 'checkbox' ? checked : value.trim();
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

    const onDrop = (acceptedFiles) => {
        setNewFiles((prev) => [...prev, ...acceptedFiles]);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
    });

    const handleUploadImages = async () => {
        const formData = new FormData();
        newFiles.forEach((file) => formData.append('images', file));
        try {
            const res = await axios.post('/api/images', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setNewUploadedUrls(res.data.images);
            setNotification({ open: true, message: 'New images uploaded', severity: 'success' });
        } catch (err) {
            console.error('Image upload error:', err);
            setNotification({ open: true, message: 'Image upload failed', severity: 'error' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const errors = {
            name: !apartment.name ? 'Required' : '',
            address: (!apartment.address || apartment.latitude == null || apartment.longitude == null) ? 'Please select a valid address' : '',
            floor: !apartment.floor ? 'Required' : '',
            number_of_rooms: !apartment.number_of_rooms ? 'Required' : '',
            year_built: apartment.year_built && isNaN(apartment.year_built) ? 'Must be a number' : '',
            rooms: rooms.map((room) => ({
                price: !room.price ? 'Required' : '',
                sex_preference: !room.sex_preference ? 'Required' : ''
            }))
        };

        setFormErrors(errors);

        const hasApartmentErrors = Object.values(errors).some((v) => typeof v === 'string' && v);
        const hasRoomErrors = errors.rooms.some((r) => Object.values(r).some(Boolean));

        if (hasApartmentErrors || hasRoomErrors) {
            setNotification({ open: true, message: 'Please fix validation errors', severity: 'error' });
            setIsSubmitting(false);
            return;
        }

        if (newFiles.length > 0 && newUploadedUrls.length === 0) {
            setNotification({ open: true, message: 'Please upload the selected images first.', severity: 'warning' });
            setIsSubmitting(false);
            return;
        }

        const finalImages = [...existingImageUrls, ...newUploadedUrls];

        try {
            await axios.put(`/api/locations/${id}`, {
                ...apartment,
                rooms,
                images: finalImages,
            });

            setNotification({ open: true, message: 'Apartment updated!', severity: 'success' });
            setTimeout(() => navigate('/main'), 1500);
        } catch (err) {
            console.error('Update error:', err.response?.data || err.message);
            setNotification({ open: true, message: 'Failed to update. Try again.', severity: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <Typography sx={{ mt: 5, textAlign: 'center' }}>Loading post details...</Typography>;
    }

    return (
        <div style={{ backgroundColor: '#fff7ee', minHeight: '100vh', width: '100vw', padding: '2rem', display: 'flex', justifyContent: 'center' }}>
            <Box sx={{ width: '100%', maxWidth: '900px', backgroundColor: '#f7fbff', p: 3, borderRadius: 2, boxShadow: 3 }}>
                <Button variant="outlined" color="secondary" sx={{ mb: 2, borderColor: '#4a7ebb', color: '#4a7ebb' }} onClick={() => navigate(-1)}>
                    Back
                </Button>

                <Typography variant="h4" sx={{ color: '#4a7ebb', textAlign: 'center' }}>Edit Apartment</Typography>

                <form onSubmit={handleSubmit}>
                    <Typography variant="h6" sx={{ mb: 1 }}>Apartment Details</Typography>
                    <Divider sx={{ mb: 2 }} />

                    <TextField
                        label="Name"
                        name="name"
                        variant="outlined"
                        value={apartment.name}
                        onChange={handleApartmentChange}
                        fullWidth
                        required
                        error={!!formErrors.name}
                        helperText={formErrors.name}
                        sx={{ mb: 2 }}
                        slotProps={{ inputLabel: { shrink: true } }}
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
                    {formErrors.address && (
                        <Typography color="error" variant="body2" sx={{ mt: -1.5, mb: 2 }}>
                            {formErrors.address}
                        </Typography>
                    )}

                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                        <TextField label="Floor" name="floor" type="text" inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }} value={apartment.floor} onChange={handleApartmentChange} required sx={{ flex: 1, minWidth: '120px' }} error={!!formErrors.floor} helperText={formErrors.floor} slotProps={{ inputLabel: { shrink: true } }} />
                        <TextField label="Number of Rooms" name="number_of_rooms" type="text" inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }} value={apartment.number_of_rooms} onChange={handleApartmentChange} required sx={{ flex: 1, minWidth: '120px' }} error={!!formErrors.number_of_rooms} helperText={formErrors.number_of_rooms} slotProps={{ inputLabel: { shrink: true } }} />
                        <TextField label="Year Built" name="year_built" type="text" inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }} value={apartment.year_built} onChange={handleApartmentChange} sx={{ flex: 1, minWidth: '120px' }} error={!!formErrors.year_built} helperText={formErrors.year_built} slotProps={{ inputLabel: { shrink: true } }} />
                    </Box>

                    <TextField label="Description" name="description" value={apartment.description} onChange={handleApartmentChange} multiline rows={3} fullWidth sx={{ mb: 2 }} slotProps={{ inputLabel: { shrink: true } }} />

                    <Box sx={{ display: 'flex', gap: 4, mb: 3 }}>
                        <FormControlLabel
                            control={<Checkbox checked={apartment.has_centrala} onChange={handleApartmentChange} name="has_centrala" />}
                            label={<Typography color="black">Has heating</Typography>}
                        />

                        <FormControlLabel
                            control={<Checkbox checked={apartment.has_parking} onChange={handleApartmentChange} name="has_parking" />}
                            label={<Typography color="black">Has parking</Typography>}
                        />
                    </Box>

                    <Typography variant="h6" sx={{ mb: 1 }}>Images</Typography>
                    <Divider sx={{ mb: 2 }} />

                    <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
                        {existingImageUrls.map((url, idx) => (
                            <Box key={url} sx={{ position: 'relative' }}>
                                <img src={url} alt={`existing-${idx}`} style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 8 }} />
                                <IconButton
                                    size="small"
                                    onClick={() => setExistingImageUrls((prev) => prev.filter((_, i) => i !== idx))}
                                    sx={{ position: 'absolute', top: -8, right: -8, backgroundColor: 'white', boxShadow: 1 }}
                                >
                                    ✕
                                </IconButton>
                            </Box>
                        ))}
                    </Box>

                    <Box
                        {...getRootProps()}
                        sx={{
                            border: '2px dashed #4a7ebb',
                            padding: 2,
                            textAlign: 'center',
                            backgroundColor: isDragActive ? '#e3f2fd' : '#fafafa',
                            cursor: 'pointer',
                            mb: 2,
                            color: '#4a7ebb'
                        }}
                    >
                        <input {...getInputProps()} />
                        <Typography fontWeight="medium">Drag & drop images here, or click to select</Typography>
                    </Box>

                    {newFiles.length > 0 && (
                        <>
                            <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
                                {newFiles.map((file, idx) => (
                                    <Box key={idx} sx={{ position: 'relative' }}>
                                        <img src={URL.createObjectURL(file)} alt={`new-${idx}`} style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 8 }} />
                                        <IconButton
                                            size="small"
                                            onClick={() => setNewFiles((prev) => prev.filter((_, i) => i !== idx))}
                                            sx={{ position: 'absolute', top: -8, right: -8, backgroundColor: 'white', boxShadow: 1 }}
                                        >
                                            ✕
                                        </IconButton>
                                    </Box>
                                ))}
                            </Box>
                            <Button onClick={handleUploadImages} variant="outlined" sx={{ mb: 2 }}>Upload Selected Images</Button>
                        </>
                    )}

                    <Typography variant="h6" sx={{ mb: 1 }}>Rooms</Typography>
                    <Divider sx={{ mb: 2 }} />

                    {rooms.map((room, index) => (
                        <Box key={room.id || index} sx={{ p: 2, backgroundColor: '#fffbe6', borderRadius: 2, mb: 2, boxShadow: 1, position: 'relative' }}>
                            <IconButton onClick={() => deleteRoom(index)} size="small" sx={{ position: 'absolute', top: 8, right: 8, color: 'error.main' }}>
                                <DeleteIcon />
                            </IconButton>

                            <Typography variant="subtitle1" sx={{ mb: 2, color: '#4a7ebb' }}>Room {index + 1}</Typography>

                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                                <TextField label="Price (€)" name="price" type="text" inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }} value={room.price} onChange={(e) => handleRoomChange(index, e)} required sx={{ flex: 1, minWidth: '120px' }} error={!!(formErrors.rooms?.[index]?.price)} helperText={formErrors.rooms?.[index]?.price} InputLabelProps={{ shrink: true }} />
                                <FormControl variant="outlined" sx={{ flex: 1, minWidth: '150px' }} error={!!(formErrors.rooms?.[index]?.sex_preference)} >
                                    <InputLabel id={`gender-preference-label-${index}`}>Gender preference</InputLabel>
                                    <Select labelId={`gender-preference-label-${index}`} name="sex_preference" value={room.sex_preference || 'not specified'} label="Gender preference" onChange={(e) => handleRoomChange(index, { ...e, target: { ...e.target, value: e.target.value || 'not specified' } })}>
                                        <MenuItem value="not specified"><em>Not specified</em></MenuItem>
                                        <MenuItem value="M">Male</MenuItem>
                                        <MenuItem value="F">Female</MenuItem>
                                    </Select>
                                    {formErrors.rooms?.[index]?.sex_preference && (
                                        <Typography variant="caption" color="error">{formErrors.rooms[index].sex_preference}</Typography>
                                    )}
                                </FormControl>
                            </Box>

                            <TextField label="Description" name="description" value={room.description} onChange={(e) => handleRoomChange(index, e)} fullWidth multiline rows={2} sx={{ mb: 2 }} InputLabelProps={{ shrink: true }} />
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                                <Checkbox checked={room.balcony} onChange={(e) => handleRoomChange(index, e)} name="balcony" />
                                <Typography variant="body1" color='black'>Has balcony</Typography>
                            </Box>
                        </Box>
                    ))}

                    <Button variant="outlined" startIcon={<AddIcon />} onClick={addRoom} sx={{ mb: 3, color: '#4a7ebb', borderColor: '#4a7ebb', '&:hover': { backgroundColor: '#cfe6f5' } }}>
                        Add Another Room
                    </Button>

                    <Button
                        variant="contained"
                        color="primary"
                        type="submit"
                        size="large"
                        disabled={isSubmitting}
                        sx={{
                            backgroundColor: '#4a7ebb',
                            borderRadius: 2,
                            fontWeight: 500,
                            '&:hover': { backgroundColor: '#3a6ca8' },
                        }}
                        fullWidth
                    >
                        {isSubmitting ? (
                            <CircularProgress size={24} color="inherit" />
                        ) : (
                            'Save Changes'
                        )}
                    </Button>
                </form>

                <Snackbar open={notification.open} autoHideDuration={3000} onClose={handleCloseNotification} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                    <Alert onClose={handleCloseNotification} severity={notification.severity} variant="filled">
                        {notification.message}
                    </Alert>
                </Snackbar>
            </Box>
        </div>
    );
}

export default EditPostPage;




