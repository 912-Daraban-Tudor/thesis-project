import React, { useState } from 'react';
import axios from '../../api/axiosInstance';
import {
  TextField,
  Checkbox,
  FormControlLabel,
  Button,
  Typography,
  Card,
  CardContent,
  IconButton,
  Divider,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Snackbar,
  Alert
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import AddressInput from '../../components/AddressInput';

function PostRoomPage() {
  const [apartment, setApartment] = useState({
    name: '',
    address: '',
    latitude: null,
    longitude: null,
    floor: '',
    has_centrala: false,
    has_parking: false,
    year_built: '',
    number_of_rooms: '',
    description: '',
  });

  const [rooms, setRooms] = useState([
    { price: '', description: '', balcony: false, sex_preference: '' }
  ]);

  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  const navigate = useNavigate();

  const handleApartmentChange = (e) => {
    const { name, value, type, checked } = e.target;
    setApartment(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleRoomChange = (index, e) => {
    const { name, value, type, checked } = e.target;
    const updatedRooms = [...rooms];
    updatedRooms[index][name] = type === 'checkbox' ? checked : value;
    setRooms(updatedRooms);
  };

  const addRoom = () => {
    setRooms(prev => [...prev, { price: '', description: '', balcony: false, sex_preference: '' }]);
  };

  const deleteRoom = (index) => {
    if (rooms.length > 1) {
      setRooms(prev => prev.filter((_, i) => i !== index));
    } else {
      setNotification({
        open: true,
        message: 'At least one room is required',
        severity: 'warning'
      });
    }
  };


  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!apartment.address || !apartment.latitude || !apartment.longitude) {
      setNotification({
        open: true,
        message: 'Please search and select an address',
        severity: 'error'
      });
      return;
    }

    try {
      await axios.post('/api/locations/with-rooms', { apartment, rooms });
      setNotification({
        open: true,
        message: 'Apartment successfully posted!',
        severity: 'success'
      });
      setTimeout(() => navigate('/main'), 1500);
    } catch (err) {
      console.error('Error posting apartment & rooms:', err);
      setNotification({
        open: true,
        message: 'Failed to post apartment. Please try again.',
        severity: 'error'
      });
    }
  };

  return (
    <div style={{ backgroundColor: '#fff7ee', minHeight: '100vh', padding: '2rem', display: 'flex', justifyContent: 'center' }}>
      <Card style={{ width: '100%', maxWidth: '1300px', padding: '2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <Button
          variant="outlined"
          color="secondary"
          sx={{
            position: 'relative',
            top: '0rem',
            left: '0rem',
            borderColor: '#4a7ebb',
            color: '#4a7ebb',
          }}
          onClick={() => navigate(-1)}
        >
          Back
        </Button>
        <Typography variant="h4" gutterBottom style={{ color: '#333' }}>Post an Apartment</Typography>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <Typography variant="h6">Apartment Details</Typography>
            <Divider />

            <div style={{ marginTop: '1rem' }}>
              <TextField
                label="Name"
                name="name"
                variant="standard"
                value={apartment.name}
                onChange={handleApartmentChange}
                required
                fullWidth
                style={{ marginBottom: '1rem' }}
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


              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <TextField
                  label="Floor"
                  name="floor"
                  variant="standard"
                  type="text"
                  inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                  value={apartment.floor}
                  onChange={handleApartmentChange}
                  required
                  style={{ flex: 1, minWidth: '120px' }}
                />
                <TextField
                  label="Number of Rooms"
                  name="number_of_rooms"
                  variant="standard"
                  type="text"
                  inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                  value={apartment.number_of_rooms}
                  onChange={handleApartmentChange}
                  required
                  style={{ flex: 1, minWidth: '120px' }}
                />
                <TextField
                  label="Year Built"
                  name="year_built"
                  variant="standard"
                  type="text"
                  inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                  value={apartment.year_built}
                  onChange={handleApartmentChange}
                  style={{ flex: 1, minWidth: '120px' }}
                />
              </div>

              <TextField
                label="Description"
                name="description"
                variant="standard"
                value={apartment.description}
                onChange={handleApartmentChange}
                multiline
                rows={3}
                fullWidth
                style={{ marginBottom: '1rem' }}
              />

              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                <FormControlLabel
                  control={<Checkbox checked={apartment.has_centrala} onChange={handleApartmentChange} name="has_centrala" />}
                  label="Has heating"
                />
                <FormControlLabel
                  control={<Checkbox checked={apartment.has_parking} onChange={handleApartmentChange} name="has_parking" />}
                  label="Has parking"
                />
              </div>
            </div>
          </div>

          <div>
            <Typography variant="h6" style={{ marginTop: '1rem' }}>Rooms</Typography>
            <Divider style={{ marginBottom: '1rem' }} />

            {rooms.map((room, index) => (
              <Card key={index} style={{
                backgroundColor: '#fffbe6',
                marginBottom: '1.5rem',
                borderLeft: '4px solid #f0c040'
              }}>
                <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle1" style={{ fontWeight: 500 }}>Room {index + 1}</Typography>
                    <IconButton
                      onClick={() => deleteRoom(index)}
                      color="error"
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <TextField
                      label="Price (€)"
                      name="price"
                      variant="standard"
                      type="text"
                      inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                      value={room.price}
                      onChange={(e) => handleRoomChange(index, e)}
                      required
                      style={{ flex: 1, minWidth: '120px' }}
                    />

                    <FormControl variant="standard" style={{ flex: 1, minWidth: '150px' }}>
                      <InputLabel id={`sex-preference-label-${index}`}>Sex preference</InputLabel>
                      <Select
                        labelId={`sex-preference-label-${index}`}
                        name="sex_preference"
                        value={room.sex_preference}
                        onChange={(e) => handleRoomChange(index, e)}
                      >
                        <MenuItem value="">No preference</MenuItem>
                        <MenuItem value="M">Male</MenuItem>
                        <MenuItem value="F">Female</MenuItem>
                      </Select>
                    </FormControl>
                  </div>

                  <TextField
                    label="Description"
                    name="description"
                    variant="standard"
                    value={room.description}
                    onChange={(e) => handleRoomChange(index, e)}
                    fullWidth
                    multiline
                    rows={2}
                  />

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={room.balcony}
                        onChange={(e) => handleRoomChange(index, e)}
                        name="balcony"
                      />
                    }
                    label="Has balcony"
                  />
                </CardContent>
              </Card>
            ))}

            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={addRoom}
              style={{ marginBottom: '1.5rem' }}
            >
              Add Another Room
            </Button>
          </div>

          <Button
            variant="contained"
            color="primary"
            type="submit"
            size="large"
            style={{ padding: '0.75rem' }}
          >
            Post Apartment & Rooms
          </Button>
        </form>
      </Card>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          variant="filled"
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default PostRoomPage;