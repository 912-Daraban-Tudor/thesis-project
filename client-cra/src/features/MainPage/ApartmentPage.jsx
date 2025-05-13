// Redesigned ApartmentPage with full-width layout, metadata, styled map, and corrected visual layout
import React, { useEffect, useState } from 'react';
import axios from '../../api/axiosInstance';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography,
  Card,
  CardContent,
  Box,
  Divider,
  Chip,
  Grid,
  CircularProgress,
} from '@mui/material';
import ReactMapGL, { Marker } from 'react-map-gl';

function ApartmentPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [apartment, setApartment] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [postedBy, setPostedBy] = useState(null);

  useEffect(() => {
    const fetchApartment = async () => {
      try {
        const res = await axios.get(`/api/locations/${id}`);
        setApartment(res.data.location);
        setRooms(res.data.rooms);

        if (res.data.location.created_by) {
          const userRes = await axios.get(`/api/auth/${res.data.location.created_by}`);
          setPostedBy(userRes.data);
        }

      } catch (err) {
        console.error('Error fetching apartment:', err);
      }
    };

    fetchApartment();
  }, [id]);

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  if (!apartment) {
    return <Box sx={{ mt: 5, textAlign: 'center' }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ p: 4, backgroundColor: '#f7fbff', minHeight: '100vh', width: '100vw', overflowX: 'hidden' }}>
      <Box sx={{ minWidth: '300px', maxWidth: '1200px', mx: 'auto', display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        <Box sx={{ flex: 1, minWidth: 300, backgroundColor: '#ffffff', p: 3, borderRadius: 2, boxShadow: 1, color: 'black' }}>
          <Typography variant="h4" sx={{ color: '#4a7ebb', mb: 1 }}>{apartment.name}</Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>{apartment.address}</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}><strong>Floor:</strong> {apartment.floor}</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}><strong>Number of Rooms:</strong> {apartment.number_of_rooms}</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}><strong>Year Built:</strong> {apartment.year_built}</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Posted by:</strong>{' '}
            {postedBy ? (
              <button
                onClick={() => navigate(`/account/${postedBy.id}`)}
                style={{
                  color: '#1976d2',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  fontSize: 'inherit',
                  textAlign: 'left',
                }}
              >
                {postedBy.username}
              </button>
            ) : 'Unknown'}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}><strong>Posted on:</strong> {formatDate(apartment.created_at)}</Typography>

          <Box sx={{ display: 'flex', gap: 2, my: 2 }}>
            {apartment.has_centrala && <Chip label="Heating" color="primary" />}
            {apartment.has_parking && <Chip label="Parking" color="primary" />}
          </Box>

          <Typography variant="body2" sx={{ mb: 3 }}><strong>Description:</strong> {apartment.description}</Typography>
        </Box>

        <Box
          sx={{
            width: 400,
            height: 300,
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: 3,
            flexShrink: 0
          }}
        >
          <ReactMapGL
            initialViewState={{
              longitude: apartment.longitude,
              latitude: apartment.latitude,
              zoom: 15,
            }}
            mapboxAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
            mapStyle="mapbox://styles/mapbox/streets-v11"
            style={{ width: '100%', height: '100%' }}
            attributionControl={false}
          >
            <Marker
              longitude={apartment.longitude}
              latitude={apartment.latitude}
              anchor="bottom"
              color="red"
            />
          </ReactMapGL>
        </Box>
      </Box>

      <Divider sx={{ my: 4 }} />

      <Box sx={{ maxWidth: '1200px', mx: 'auto' }}>
        <Typography variant="h5" sx={{ color: '#4a7ebb', mb: 2 }}>Rooms Available</Typography>

        <Grid container spacing={3}>
          {rooms.map((room) => (
            <Grid item xs={12} md={6} key={room.id}>
              <Card sx={{ backgroundColor: '#fffbe6', boxShadow: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ color: '#4a7ebb', fontWeight: 500 }}>Price: {room.price}€</Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}><strong>Balcony:</strong> {room.balcony ? 'Yes' : 'No'}</Typography>
                  <Typography variant="body2"><strong>Sex Preference:</strong> {room.sex_preference || 'None'}</Typography>
                  <Typography variant="body2"><strong>Available:</strong> {room.available ? 'Yes' : 'No'}</Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}><strong>Description:</strong> {room.description}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}

export default ApartmentPage;
