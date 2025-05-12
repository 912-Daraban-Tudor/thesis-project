// src/context/MapContext.js
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

    const contextValue = useMemo(() => ({
        viewState, setViewState,
        locations, setLocations,
        selectedLocation, setSelectedLocation,
    }), [viewState, locations, selectedLocation]);

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
