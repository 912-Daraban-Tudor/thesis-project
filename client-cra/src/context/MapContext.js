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
    const [highlightedLocation, setHighlightedLocation] = useState(null);

    const [filters, setFilters] = useState({
        price: [0, 2000],
        floor: [0, 10],
        year_built: [1900, new Date().getFullYear()],
        has_parking: false,
        has_centrala: false,
        room_count: [],
        number_of_rooms: [],
        bus_line: null, // e.g. "25" or "M13"
        connected_to_university: null, // { latitude, longitude } or null
    });

    const [searchCoords, setSearchCoords] = useState(null);
    const [sortBy, setSortBy] = useState('price');
    const [sortOrder, setSortOrder] = useState('asc');

    const [isFallback, setIsFallback] = useState(false);
    const [listViewOpen, setListViewOpen] = useState(false);

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
        if (sortOrder) params.order = sortOrder;

        if (filters.bus_line) {
            params.busLineProximity = filters.bus_line;
        }

        if (filters.connected_to_university) {
            params.universityLat = filters.connected_to_university.latitude;
            params.universityLng = filters.connected_to_university.longitude;
        }

        return params;
    };

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const params = buildQueryParams();
                console.log('🔍 Fetching locations with params:', params);
                const response = await axios.get('/api/locations/search', { params });
                setIsFallback(response.data.fallback);
                setLocations(response.data.data || []);
            } catch (error) {
                console.error('❌ Error fetching locations:', error.message);
            }
        };

        fetchLocations();
    }, [filters, searchCoords, sortBy, sortOrder]);

    const contextValue = useMemo(
        () => ({
            viewState,
            setViewState,
            locations,
            setLocations,
            selectedLocation,
            setSelectedLocation,
            highlightedLocation,
            setHighlightedLocation,
            filters,
            setFilters,
            searchCoords,
            setSearchCoords,
            sortBy,
            setSortBy,
            sortOrder,
            setSortOrder,
            isFallback,
            listViewOpen,
            setListViewOpen,
        }),
        [
            viewState,
            locations,
            selectedLocation,
            highlightedLocation,
            filters,
            searchCoords,
            sortBy,
            sortOrder,
            isFallback,
            listViewOpen,
        ]
    );

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
