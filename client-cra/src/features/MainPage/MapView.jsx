import React, { useEffect, useState, useRef } from 'react';
import ReactMapGL, { NavigationControl, Marker, Popup } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import axios from '../../api/axiosInstance';
import { Avatar, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const MapView = () => {
  const [viewState, setViewState] = useState({
    longitude: 23.591423,
    latitude: 46.770439,
    zoom: 12,
  });

  const mapRef = useRef();
  const navigate = useNavigate();

  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await axios.get('/api/locations');
        setLocations(response.data);
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };

    fetchLocations();
  }, []);

  const getCursor = ({ isDragging }) => (isDragging ? 'grabbing' : 'grab');

  const handleMarkerClick = (location) => {
    setSelectedLocation(location);
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [location.longitude, location.latitude],
        zoom: Math.max(viewState.zoom, 14),
        speed: 2.5,
        curve: 1.5,
        essential: true,
      });
    }
  };

  return (
    <div style={{ height: '100vh', width: '100vw', position: 'relative' }}>
      <ReactMapGL
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        mapboxAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
        mapStyle="mapbox://styles/mapbox/streets-v11"
        getCursor={getCursor}
        style={{ width: '100%', height: '100%' }}
        ref={mapRef}
      >
        <NavigationControl position="top-left" style={{ margin: 10 }} />

        {locations.map((location) => (
          <Marker
            key={location.id}
            latitude={location.latitude}
            longitude={location.longitude}
            anchor="bottom"
          >
            <Avatar
              sx={{
                bgcolor: 'red',
                width: 24,
                height: 24,
                border: '2px solid white',
                cursor: 'pointer',
              }}
              onClick={() => handleMarkerClick(location)}
            />
          </Marker>
        ))}

        {selectedLocation && (
          <Popup
            longitude={selectedLocation.longitude}
            latitude={selectedLocation.latitude}
            closeOnClick={false}
            onClose={() => setSelectedLocation(null)}
            anchor="bottom"
            offset={[0, -10]}
          >
            <div
              style={{
                background: '#fff',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                padding: '0.75rem',
                position: 'relative',
                maxWidth: '200px',
              }}
            >

              <div
                style={{
                  position: 'absolute',
                  bottom: '-10px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 0,
                  height: 0,
                  borderLeft: '10px solid transparent',
                  borderRight: '10px solid transparent',
                  borderTop: '10px solid white',
                }}
              />
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                {selectedLocation.name}
              </Typography>
              <Typography variant="body2">
                {selectedLocation.room_count === 1
                  ? `Price: ${selectedLocation.price}€`
                  : `Available Rooms: ${selectedLocation.room_count}`}
              </Typography>
              <Button
                size="small"
                onClick={() => navigate(`/apartment/${selectedLocation.id}`)}
                sx={{ mt: 1 }}
              >
                View Details
              </Button>
            </div>
          </Popup>
        )}
      </ReactMapGL>

    </div>
  );
};

export default MapView;
