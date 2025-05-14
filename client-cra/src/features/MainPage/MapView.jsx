// src/features/MainPage/MapView.jsx
import React, { useEffect } from 'react';
import ReactMapGL, { useMap } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import axios from '../../api/axiosInstance';
import { useMapContext } from '../../context/MapContext';
import LocationMarker from '../../components/LocationMarker';
import MapLegend from '../../components/MapLegend';
import { AttributionControl } from 'react-map-gl';

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
    if (location && map) {
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
        attributionControl={false}
        onMove={(evt) => setViewState(evt.viewState)}
        onClick={() => setSelectedLocation(null)}
        mapboxAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
        mapStyle="mapbox://styles/mapbox/streets-v11"
        getCursor={({ isDragging }) => (isDragging ? 'grabbing' : 'grab')}
        style={{ width: '100%', height: '100%' }}
      >
        <AttributionControl position="bottom-right" compact={true} />
        {locations.map((location) => (
          <LocationMarker
            key={location.id}
            location={location}
            selected={selectedLocation?.id === location.id}
            onClick={() => handleMarkerClick(location)}
          />
        ))}
      </ReactMapGL>
      <MapLegend />
    </div>
  );
};

export default MapView;
