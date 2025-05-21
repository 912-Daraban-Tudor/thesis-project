import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../../api/axiosInstance';
import {
  TextField,
  Button,
  Avatar,
  Typography,
  MenuItem,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Box
} from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AccountPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const tokenPayload = JSON.parse(atob(localStorage.getItem('token')?.split('.')[1] || '{}'));
  const loggedInUserId = tokenPayload?.id;
  const isMe = !id || String(id) === String(loggedInUserId);


  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    gender: '',
    profilePictureUrl: '',
  });
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = isMe
          ? await axios.get('/api/auth/me')
          : await axios.get(`/api/auth/${id}`);

        setUserData(response.data);

        if (isMe) {
          setFormData({
            username: response.data.username,
            gender: response.data.gender || '',
            profilePictureUrl: response.data.profile_picture_url || '',
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [id, isMe]);

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
      toast.success('Account updated successfully.');
    } catch (error) {
      console.error('Error updating user data:', error);
      toast.error('Failed to update account.');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await axios.delete('/api/auth/me');
      localStorage.removeItem('token');
      toast.success('Account deleted successfully.');
      setTimeout(() => navigate('/login'), 1000);
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account.');
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
      <ToastContainer />
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
          position: 'relative',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 3,
            width: '100%',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
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
            Back
          </Button>

          <Typography
            variant="h4"
            sx={{
              color: '#4a7ebb',
              flexGrow: 1,
              textAlign: { xs: 'center', sm: 'left' },
            }}
          >
            {isMe ? 'My Account' : `${userData.username}'s Profile`}
          </Typography>
        </Box>

        <Avatar
          src={isMe && editMode ? formData.profilePictureUrl : userData.profile_picture_url}
          alt={userData.username}
          sx={{ width: 100, height: 100, margin: '1rem auto' }}
        />

        {isMe && editMode ? (
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
            <Button
              variant="outlined"
              color="error"
              sx={{ mt: 2, borderColor: '#d32f2f', color: '#d32f2f' }}
              fullWidth
              onClick={() => setShowDeleteDialog(true)}
            >
              Delete Account
            </Button>
          </form>
        ) : (
          <div>
            <p><strong>Username:</strong> {userData.username}</p>
            <p><strong>Gender:</strong> {userData.gender || 'Not specified'}</p>
            {isMe && <p><strong>Email:</strong> {userData.email}</p>}
            <p><strong>Joined:</strong> {formattedDate}</p>
            {isMe && (
              <>
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ mt: 2, backgroundColor: '#4a7ebb' }}
                  fullWidth
                  onClick={() => setEditMode(true)}
                >
                  Edit Account
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  sx={{ mt: 1, borderColor: '#d32f2f', color: '#d32f2f' }}
                  fullWidth
                  onClick={() => setShowDeleteDialog(true)}
                >
                  Delete Account
                </Button>
              </>
            )}
          </div>
        )}

        <Dialog
          open={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
        >
          <DialogTitle>Confirm Account Deletion</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete your account? This action is <strong>irreversible</strong>.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowDeleteDialog(false)} sx={{ color: '#4a7ebb' }}>
              Cancel
            </Button>
            <Button
              onClick={handleDeleteAccount}
              color="error"
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </div>
  );
}

export default AccountPage;
