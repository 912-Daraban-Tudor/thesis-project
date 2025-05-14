import React, { useEffect } from 'react';
import ReactMapGL, { AttributionControl, useMap } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import axios from '../../api/axiosInstance';
import { useMapContext } from '../../context/MapContext';
import LocationMarker from '../../components/LocationMarker';
import MapLegend from '../../components/MapLegend';

const MapView = () => {
  const {
    viewState,
    setViewState,
    locations,
    setLocations,
    selectedLocation,
    setSelectedLocation,
    filters,
  } = useMapContext();

  const { mainMap } = useMap();
  const map = mainMap?.getMap();

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await axios.get('/api/locations');
        console.log('Locations:', response.data);
        console.log('Sample location:', response.data[0]);
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

  const filteredLocations = locations.filter((loc) => {
    const {
      price,
      floor,
      year_built,
      has_parking,
      has_centrala,
      room_count,
      number_of_rooms,
    } = filters;

    const roomPrices = Array.isArray(loc.rooms) ? loc.rooms.map(r => Number(r.price)).filter(p => !isNaN(p)) : [];
    const fallbackPrice = Number(loc.price);
    const allPrices = [...roomPrices, ...(!isNaN(fallbackPrice) ? [fallbackPrice] : [])];

    const hasValidPrice = allPrices.some(p => p >= price[0] && p <= price[1]);
    if (!hasValidPrice) return false;

    if (loc.floor < floor[0] || loc.floor > floor[1]) return false;
    if (loc.year_built < year_built[0] || loc.year_built > year_built[1]) return false;
    if (has_parking && !loc.has_parking) return false;
    if (has_centrala && !loc.has_centrala) return false;
    if (room_count.length && !room_count.includes(Number(loc.rooms?.length))) return false;
    if (number_of_rooms.length && !number_of_rooms.includes(Number(loc.number_of_rooms))) return false;

    return true;
  });

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
        {filteredLocations.map((location) => (
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