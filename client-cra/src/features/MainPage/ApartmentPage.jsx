import React, { useEffect, useState } from 'react';
import axios from '../../api/axiosInstance';
import { useParams } from 'react-router-dom';
import { Typography, Card, CardContent } from '@mui/material';

function ApartmentPage() {
  const { id } = useParams();
  const [apartment, setApartment] = useState(null);
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    const fetchApartment = async () => {
      try {
        const res = await axios.get(`/api/locations/${id}`);
        setApartment(res.data.location);
        setRooms(res.data.rooms);
      } catch (err) {
        console.error('Error fetching apartment:', err);
      }
    };

    fetchApartment();
  }, [id]);

  if (!apartment) return <div>Loading...</div>;

  return (
    <div style={{ padding: '1rem' }}>
      <Typography variant="h4" gutterBottom>{apartment.name}</Typography>
      <Typography variant="body1">{apartment.description}</Typography>
      <Typography variant="body2">Floor: {apartment.floor}</Typography>
      <Typography variant="body2">Has heating: {apartment.has_centrala ? 'Yes' : 'No'}</Typography>
      <Typography variant="body2">Has parking: {apartment.has_parking ? 'Yes' : 'No'}</Typography>

      <Typography variant="h5" sx={{ mt: 2 }}>Rooms</Typography>

      {rooms.map(room => (
        <Card key={room.id} sx={{ my: 1 }}>
          <CardContent>
            <Typography><strong>Price:</strong> {room.price}€</Typography>
            <Typography><strong>Balcony:</strong> {room.balcony ? 'Yes' : 'No'}</Typography>
            <Typography><strong>Sex preference:</strong> {room.sex_preference || 'None'}</Typography>
            <Typography><strong>Available:</strong> {room.available ? 'Yes' : 'No'}</Typography>
            <Typography><strong>Description:</strong> {room.description}</Typography>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default ApartmentPage;
