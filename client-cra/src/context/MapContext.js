import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import axios from '../api/axiosInstance';

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
        price: [0, 2000],
        floor: [0, 10],
        year_built: [1900, new Date().getFullYear()],
        has_parking: false,
        has_centrala: false,
        room_count: [],
        number_of_rooms: [],
    });

    const [searchCoords, setSearchCoords] = useState(null); // from SearchBoxInput
    const [sortBy, setSortBy] = useState(''); // "price" or "distance"

    // Build query params for backend
    const buildQueryParams = () => {
        const params = {};

        if (searchCoords) {
            params.lat = searchCoords.lat;
            params.lng = searchCoords.lng;
        }

        params.priceMin = filters.price[0];
        params.priceMax = filters.price[1];
        params.floorMin = filters.floor[0];
        params.floorMax = filters.floor[1];
        params.yearBuiltMin = filters.year_built[0];
        params.yearBuiltMax = filters.year_built[1];

        if (filters.has_parking) params.has_parking = true;
        if (filters.has_centrala) params.has_centrala = true;

        if (filters.room_count.length > 0) {
            params.roomCount = filters.room_count.join(',');
        }

        if (filters.number_of_rooms.length > 0) {
            params.numberOfRooms = filters.number_of_rooms.join(',');
        }

        if (sortBy) params.sort = sortBy;

        return params;
    };

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const params = buildQueryParams();
                const response = await axios.get('/api/locations/search', { params });
                setLocations(response.data);
            } catch (err) {
                console.error('❌ Error fetching locations:', err.message);
            }
        };

        fetchLocations();
    }, [filters, searchCoords, sortBy]);


    const contextValue = useMemo(() => ({
        viewState, setViewState,
        locations, setLocations,
        selectedLocation, setSelectedLocation,
        filters, setFilters,
        searchCoords, setSearchCoords,
        sortBy, setSortBy,
    }), [viewState, locations, selectedLocation, filters, searchCoords, sortBy]);

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
