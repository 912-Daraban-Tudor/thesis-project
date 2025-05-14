import { createContext, useContext, useState, useMemo } from 'react';
import PropTypes from 'prop-types';

const MapContext = createContext();

export const MapProvider = ({ children }) => {
    const [viewState, setViewState] = useState({
        longitude: 23.591423,
        latitude: 46.770439,
        zoom: 12,
    });
    const [locations, setLocations] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [filters, setFilters] = useState({
        price: [0, 3000],
        floor: [0, 10],
        year_built: [1900, new Date().getFullYear()],
        has_parking: false,
        has_centrala: false,
        room_count: [],
        number_of_rooms: [],
    });

    const contextValue = useMemo(() => ({
        viewState, setViewState,
        locations, setLocations,
        selectedLocation, setSelectedLocation,
        filters, setFilters,
    }), [viewState, locations, selectedLocation, filters]);

    console.log('MapProvider contextValue:', contextValue);
    return (
        <MapContext.Provider value={contextValue}>
            {children}
        </MapContext.Provider>
    );
};

export const useMapContext = () => useContext(MapContext);

MapProvider.propTypes = {
    children: PropTypes.node.isRequired,
};
