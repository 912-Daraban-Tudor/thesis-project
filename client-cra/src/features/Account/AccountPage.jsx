import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axiosInstance';
import { TextField, Button, Avatar, Typography, MenuItem, Paper } from '@mui/material';

function AccountPage() {
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    gender: '',
    profilePictureUrl: '',
  });
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('/api/auth/me');

        setUserData(response.data);
        console.log('User data:', response.data, response.data.profile_picture_url);
        setFormData({
          username: response.data.username,
          gender: response.data.gender || '',
          profilePictureUrl: response.data.profile_picture_url || '',
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put('/api/auth/me', {
        username: formData.username,
        gender: formData.gender,
        profilePictureUrl: formData.profilePictureUrl
      });
      setUserData((prev) => ({
        ...prev,
        username: formData.username,
        gender: formData.gender,
        profile_picture_url: formData.profilePictureUrl,
      }));
      setEditMode(false);
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  };

  if (loading) return <div>Loading account info...</div>;
  if (!userData) return <div>Failed to load account data.</div>;

  const formattedDate = new Date(userData.created_at).toLocaleDateString('en-GB');

  return (
    <div
      style={{
        backgroundColor: '#fefaf1',
        height: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        padding: '1rem',
        boxSizing: 'border-box',
      }}
    >

      <Paper
        elevation={3}
        style={{
          padding: '2rem',
          maxWidth: '400px',
          width: '100%',
          backgroundColor: '#f7fbff',
          textAlign: 'left',
          boxSizing: 'border-box',
          overflowWrap: 'break-word',
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
        <Typography variant="h4" gutterBottom sx={{ color: '#4a7ebB' }}>
          My Account
        </Typography>

        <Avatar
          src={editMode ? formData.profilePictureUrl : userData.profile_picture_url}
          alt={formData.username}
          sx={{ width: 100, height: 100, margin: '1rem auto' }}
        />

        {editMode ? (
          <form onSubmit={handleSubmit}>
            <TextField
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
              sx={{ backgroundColor: 'white' }}
            />
            <TextField
              label="Gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              fullWidth
              margin="normal"
              select
              sx={{ backgroundColor: 'white' }}
            >
              <MenuItem value="">Not specified</MenuItem>
              <MenuItem value="male">Male</MenuItem>
              <MenuItem value="female">Female</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </TextField>
            <TextField
              label="Profile Picture URL"
              name="profilePictureUrl"
              value={formData.profilePictureUrl}
              onChange={handleChange}
              fullWidth
              margin="normal"
              sx={{ backgroundColor: 'white' }}
            />

            <Button type="submit" variant="contained" color="primary" sx={{ mt: 2, backgroundColor: '#4a7ebb' }} fullWidth>
              Save Changes
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              sx={{ mt: 1, borderColor: '#4a7ebb', color: '#4a7ebb' }}
              fullWidth
              onClick={() => {
                setFormData({
                  username: userData.username,
                  gender: userData.gender || '',
                  profilePictureUrl: userData.profile_picture_url || '',
                });
                setEditMode(false);
              }}
            >
              Cancel
            </Button>
          </form>
        ) : (
          <div>
            <p><strong>Username:</strong> {userData.username}</p>
            <p><strong>Gender:</strong> {userData.gender || 'Not specified'}</p>
            <p><strong>Email:</strong> {userData.email}</p>
            <p><strong>Joined:</strong> {formattedDate}</p>
            <Button
              variant="contained"
              color="primary"
              sx={{ mt: 2, backgroundColor: '#4a7ebb' }}
              fullWidth
              onClick={() => setEditMode(true)}
            >
              Edit Account
            </Button>
          </div>
        )}
      </Paper>
    </div>
  );
}

export default AccountPage;
