import React from 'react';
import ReactMapGL, { AttributionControl, useMap } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useMapContext } from '../../context/MapContext';
import LocationMarker from '../../components/LocationMarker';
import MapLegend from '../../components/MapLegend';
import { flyToWithOffset } from '../../utils/mapUtils';
import { useMediaQuery, useTheme, Box } from '@mui/material';

const MapView = () => {
  const {
    viewState,
    setViewState,
    locations,
    selectedLocation,
    listViewOpen,
    highlightedLocation,
    setSelectedLocation,
    setHighlightedLocation
  } = useMapContext();

  const { mainMap } = useMap();
  const map = mainMap?.getMap();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleMarkerClick = (location) => {
    setSelectedLocation(location);
    setHighlightedLocation(null);
    flyToWithOffset(map, location.longitude, location.latitude, listViewOpen, isMobile);
  };

  return (
    <Box
      sx={{
        height: '100vh',
        width: '100vw',
        position: 'relative',
        bgcolor: 'background.default',
      }}
    >
      <ReactMapGL
        id="mainMap"
        {...viewState}
        attributionControl={false}
        onMove={(evt) => setViewState(evt.viewState)}
        onClick={() => { setHighlightedLocation(null); setSelectedLocation(null) }}
        mapboxAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
        mapStyle="mapbox://styles/mapbox/light-v11"
        getCursor={({ isDragging }) => (isDragging ? 'grabbing' : 'grab')}
        style={{ width: '100%', height: '100%' }}
      >
        <AttributionControl position="bottom-right" compact={true} />
        {locations.map((location) => (
          <LocationMarker
            key={location.id}
            location={location}
            selected={selectedLocation?.id === location.id}
            highlighted={highlightedLocation?.id === location.id}
            onClick={() => handleMarkerClick(location)}
          />
        ))}
      </ReactMapGL>
      <MapLegend />
    </Box>
  );
};

export default MapView;
