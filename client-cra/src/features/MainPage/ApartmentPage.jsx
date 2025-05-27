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
  Button,
} from '@mui/material';
import ReactMapGL, { Marker } from 'react-map-gl';
import { useChatUI } from '../../context/ChatUIContext';
import { jwtDecode } from 'jwt-decode';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';

function ApartmentPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [apartment, setApartment] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [images, setImages] = useState([]);
  const [postedBy, setPostedBy] = useState(null);
  const { openChat } = useChatUI();

  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const token = localStorage.getItem('token');
  const decodedToken = token ? jwtDecode(token) : null;
  const isMe = decodedToken?.id === apartment?.created_by;

  useEffect(() => {
    const fetchApartment = async () => {
      try {
        const res = await axios.get(`/api/locations/${id}`);
        setApartment(res.data.location);
        setRooms(res.data.rooms);
        setImages(res.data.images || []);

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
      <Button
        variant="outlined"
        color="secondary"
        sx={{
          borderColor: '#4a7ebb',
          color: '#4a7ebb',
          textTransform: 'none',
          fontWeight: 500,
        }}
        onClick={() => navigate(-1)}
      >
        BACK
      </Button>
      <Box sx={{ width: '80vw', minWidth: '400px', maxWidth: '1200px', mx: 'auto', display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        <Box
          sx={{
            flex: 1,
            minWidth: 300,
            backgroundColor: '#ffffff',
            p: 3,
            borderRadius: 2,
            boxShadow: 1,
            color: 'black',
            display: 'flex',
            flexDirection: 'row',
            gap: 2,
          }}
        >
          <Box sx={{ flex: 1 }}>
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

            <Typography variant="body2" sx={{ mb: 2 }}>
              <strong>Description:</strong> {apartment.description}
            </Typography>

            {isMe ? (
              <Button
                variant="contained"
                size="small"
                onClick={() =>
                  navigate(`/edit-post/${apartment.id}`, {
                    state: { apartment, rooms },
                  })
                }
                sx={{
                  backgroundColor: '#795548',
                  color: 'white',
                  '&:hover': { backgroundColor: '#5d4037' },
                }}
              >
                Edit Post
              </Button>
            ) : (
              <Button
                variant="outlined"
                size="small"
                onClick={() => openChat(apartment.created_by)}
                sx={{
                  borderColor: '#1976d2',
                  color: '#1976d2',
                  fontWeight: 500,
                  '&:hover': {
                    backgroundColor: '#e3f2fd',
                    borderColor: '#1976d2',
                  },
                }}
              >
                Send a Message
              </Button>
            )}
          </Box>

          <Box
            sx={{
              width: 180,
              height: 180,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 0,
              backgroundColor: 'grey.400',
              borderRadius: 2,
              overflow: 'hidden',
              boxShadow: 2,
            }}
          >
            {images.slice(0, 4).map((url, index) => (
              <Box
                key={index}
                component="img"
                src={url.replace('/upload/', '/upload/w_300,h_300,c_fill,q_auto,f_auto/')}
                onClick={() => {
                  setLightboxIndex(index);
                  setIsLightboxOpen(true);
                }}
                alt={`thumb-${index}`}
                sx={{
                  width: '50%',
                  height: '50%',
                  objectFit: 'cover',
                  cursor: 'pointer',
                }}
              />
            ))}
          </Box>
        </Box>

        <Box
          sx={{
            width: 400,
            height: 300,
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: 3,
            flexShrink: 0,
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
                  <Typography variant="subtitle1" sx={{ color: '#4a7ebb', fontWeight: 500 }}>
                    Price: {room.price}€
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Balcony:</strong> {room.balcony ? 'Yes' : 'No'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Gender Preference:</strong> {room.sex_preference || 'None'}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Description:</strong> {room.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* ✅ Updated Lightbox */}
      {isLightboxOpen && images.length > 0 && (
        <Lightbox
          open={isLightboxOpen}
          close={() => setIsLightboxOpen(false)}
          index={lightboxIndex}
          slides={images.map((url) => ({ src: url }))}
          carousel={{ finite: true }}
        />
      )}
    </Box>
  );
}

export default ApartmentPage;
