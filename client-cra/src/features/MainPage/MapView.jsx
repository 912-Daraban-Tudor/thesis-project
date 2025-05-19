import React from 'react';
import ReactMapGL, { AttributionControl, useMap } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useMapContext } from '../../context/MapContext';
import LocationMarker from '../../components/LocationMarker';
import MapLegend from '../../components/MapLegend';

const MapView = () => {
  const {
    viewState,
    setViewState,
    locations,
    selectedLocation,
    setSelectedLocation,
  } = useMapContext();

  const { mainMap } = useMap();
  const map = mainMap?.getMap();

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
        id="mainMap"
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
