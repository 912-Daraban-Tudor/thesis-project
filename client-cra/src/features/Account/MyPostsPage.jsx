import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axiosInstance';
import {
  Paper,
  Typography,
  Button,
  List,
  ListItem,
  Divider,
  Box,
} from '@mui/material';

function MyPostsPage() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await axios.get('/api/locations/myrooms');
        setLocations(response.data);
      } catch (error) {
        console.error('Error fetching my posts:', error);
        setError('Failed to load your posts.');
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  const handleDelete = async (locationId) => {
    try {
      await axios.delete(`/api/locations/${locationId}`);
      setLocations((prev) => prev.filter((item) => item.location.id !== locationId));
    } catch (error) {
      console.error('Error deleting location:', error);
    }
  };

  if (loading) return <div>Loading your posts...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div
      style={{
        backgroundColor: '#fefaf1',
        minHeight: '100vh',
        width: '100vw',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        boxSizing: 'border-box',
      }}
    >
      <Paper
        elevation={3}
        style={{
          padding: '2rem',
          maxWidth: '900px',
          width: '100%',
          backgroundColor: '#f7fbff',
          textAlign: 'left',
          position: 'relative',
        }}
      >
        <Button
          variant="outlined"
          color="secondary"
          sx={{
            position: 'absolute',
            top: '1rem',
            left: '1rem',
            borderColor: '#4a7ebb',
            color: '#4a7ebb',
          }}
          onClick={() => navigate(-1)}
        >
          Back
        </Button>

        <Typography variant="h4" gutterBottom sx={{ color: '#4a7ebB', textAlign: 'center' }}>
          My Posts
        </Typography>

        <Button
          variant="contained"
          color="primary"
          sx={{ mb: 2, backgroundColor: '#4a7ebb' }}
          fullWidth
          onClick={() => navigate('/post')}
        >
          Post Room
        </Button>

        {locations.length === 0 ? (
          <Typography>No posts found.</Typography>
        ) : (
          <List>
            {locations.map((item, index) => {
              const { location, rooms } = item;

              return (
                <React.Fragment key={location.id}>
                  <Box sx={{
                    p: 2,
                    backgroundColor: '#fefaf1',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    position: 'relative',
                    '&:hover': { backgroundColor: '#f4f0e8' },
                  }}
                    onClick={() => navigate(`/edit-post/${location.id}`, { state: { apartment: location, rooms } })}
                  >
                    <Button
                      variant="contained"
                      size="medium"
                      sx={{
                        position: 'absolute',
                        boxShadow: 'none',
                        top: 14,
                        right: 6,
                        color: '#4a7ebb',
                        backgroundColor: '#cfe6f5',
                        borderRadius: '6px',
                        textTransform: 'none',
                        fontWeight: 500, //one step above normal
                        '&:hover': { backgroundColor: '#b3d9f0', boxShadow: 'none' },
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(location.id);
                      }}
                    >
                      Delete
                    </Button>
                    <Typography variant="h6" sx={{ color: '#4a7ebb' }}>
                      {location.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#555' }}>
                      Address: {location.address}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#555',
                        mt: 1,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}
                    >
                      {location.description}
                    </Typography>

                    <Divider sx={{ my: 1 }} />

                    <Typography variant="body2" sx={{ color: '#555' }}>
                      Floor: {location.floor} | Year Built: {location.year_built} | Number of Rooms: {location.number_of_rooms}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#555' }}>
                      Centrala: {location.has_centrala ? 'Yes' : 'No'} | Parking: {location.has_parking ? 'Yes' : 'No'}
                    </Typography>

                    <Divider sx={{ my: 1 }} />

                    <Typography variant="subtitle1" sx={{ color: '#4a7ebb', mb: 1 }}>
                      Rooms
                    </Typography>
                    <List dense>
                      {rooms.map((room) => (
                        <ListItem key={room.id} sx={{ display: 'block', mb: 1 }}>
                          <Typography variant="body2" sx={{ color: '#333' }}>
                            Description: {room.description}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#333' }}>
                            Gender Preference: {room.sex_preference}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#333' }}>
                            Balcony: {room.balcony ? 'Yes' : 'No'}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#333' }}>
                            Price: ${room.price}
                          </Typography>
                          <Divider sx={{ my: 1 }} />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                  {index < locations.length - 1 && <Divider sx={{ my: 2 }} />}
                </React.Fragment>
              );
            })}
          </List>
        )}
      </Paper>
    </div>
  );
}

export default MyPostsPage;
