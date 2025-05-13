// src/features/MainPage/MapView.jsx
import React, { useEffect } from 'react';
import ReactMapGL, { Marker, Popup, useMap } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import axios from '../../api/axiosInstance';
import { Avatar, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useMapContext } from '../../context/MapContext';

const MapView = () => {
  const {
    viewState,
    setViewState,
    locations,
    setLocations,
    selectedLocation,
    setSelectedLocation,
  } = useMapContext();

  const { mainMap } = useMap(); // <-- from react-map-gl
  const map = mainMap?.getMap(); // <-- actual mapbox-gl instance
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await axios.get('/api/locations');
        console.log('Locations:', response.data);
        setLocations(response.data);
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };
    fetchLocations();
  }, [setLocations]);

  const handleMarkerClick = (location) => {
    setSelectedLocation(location);
    if (map) {
      map.flyTo({
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
        id="mainMap" // MUST match useMap().mainMap
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        mapboxAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
        mapStyle="mapbox://styles/mapbox/streets-v11"
        getCursor={({ isDragging }) => (isDragging ? 'grabbing' : 'grab')}
        style={{ width: '100%', height: '100%' }}
      >
        {locations.map((location) => (
          <Marker
            key={location.id}
            latitude={location.latitude}
            longitude={location.longitude}
            anchor="bottom"
          >
            <Avatar
              sx={{ bgcolor: 'red', width: 24, height: 24, border: '2px solid white', cursor: 'pointer' }}
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
            <div style={{ background: '#fff', borderRadius: '8px', padding: '0.75rem', maxWidth: '200px' }}>
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
