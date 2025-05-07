import React, { useState } from 'react';
import axios from '../../api/axiosInstance';
import { TextField, Checkbox, FormControlLabel, Button } from '@mui/material';

function RoomForm({ locationId, onRoomAdded }) {
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [balcony, setBalcony] = useState(false);
  const [sexPreference, setSexPreference] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/rooms', {
        location_id: locationId,
        description,
        price,
        balcony,
        sex_preference: sexPreference
      });
      onRoomAdded(res.data);
      setDescription('');
      setPrice('');
      setBalcony(false);
      setSexPreference('');
    } catch (err) {
      console.error('Error adding room:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ margin: '1rem 0' }}>
      <TextField
        label="Price (€)"
        type="number"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        required
        fullWidth
        margin="normal"
      />
      <TextField
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        multiline
        rows={3}
        fullWidth
        margin="normal"
      />
      <FormControlLabel
        control={<Checkbox checked={balcony} onChange={(e) => setBalcony(e.target.checked)} />}
        label="Has balcony"
      />
      <TextField
        label="Sex preference (optional)"
        value={sexPreference}
        onChange={(e) => setSexPreference(e.target.value)}
        fullWidth
        margin="normal"
      />
      <Button variant="contained" color="primary" type="submit">Add Room</Button>
    </form>
  );
}

export default RoomForm;
