import React, { useEffect, useState } from 'react';
import axios from '../../api/axiosInstance';
import { Card, CardContent, Typography, Button } from '@mui/material';

function RoomList({ locationId }) {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await axios.get(`/api/rooms?location_id=${locationId}`);
        setRooms(res.data);
      } catch (err) {
        console.error('Error fetching rooms:', err);
      }
    };

    fetchRooms();
  }, [locationId]);

  const handleDelete = async (roomId) => {
    try {
      await axios.delete(`/api/rooms/${roomId}`);
      setRooms(prev => prev.filter(room => room.id !== roomId));
    } catch (err) {
      console.error('Error deleting room:', err);
    }
  };

  return (
    <div>
      <Typography variant="h5">Rooms in this apartment</Typography>
      {rooms.map(room => (
        <Card key={room.id} sx={{ my: 2 }}>
          <CardContent>
            <Typography><strong>Price:</strong> {room.price}€</Typography>
            <Typography><strong>Balcony:</strong> {room.balcony ? 'Yes' : 'No'}</Typography>
            <Typography><strong>Sex preference:</strong> {room.sex_preference || 'None'}</Typography>
            <Typography><strong>Available:</strong> {room.available ? 'Yes' : 'No'}</Typography>
            <Typography><strong>Description:</strong> {room.description}</Typography>
            <Button onClick={() => handleDelete(room.id)} color="error">Delete</Button>
            {/* Add edit button here later */}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default RoomList;
