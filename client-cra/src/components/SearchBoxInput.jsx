// src/components/SearchBoxInput.jsx
import React, { useState } from 'react';
import { InputBase, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { useMap } from 'react-map-gl';
import { useMapContext } from '../context/MapContext';
import axios from '../api/axiosInstance';

const SearchBoxInput = () => {
    const [query, setQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false); // whether search was successful
    const { setLocations } = useMapContext();

    const { mainMap } = useMap();
    let map;

    try {
        map = mainMap?.getMap();
    } catch (e) {
        console.warn('⚠️ Failed to get map instance:', e);
        map = null;
    }

    const token = process.env.REACT_APP_MAPBOX_TOKEN;

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('🔍 Submitted search:', query);

        if (!query) return;
        if (!map) return;
        if (!token) return;

        try {
            const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${token}&proximity=23.6,46.76667&country=ro&limit=1`;
            const geocode = await fetch(geocodeUrl);
            if (!geocode.ok) throw new Error(`Geocoding failed: ${geocode.status}`);

            const data = await geocode.json();
            console.log('📦 Geocode response:', data);

            const feature = data.features?.[0];
            if (!feature) throw new Error('No results found for query.');

            const [lng, lat] = feature.center;
            setQuery(feature.place_name); // ✅ update input to full matched address
            setIsSearching(true);         // ✅ show close icon

            const response = await axios.get(`/api/locations/filter?lat=${lat}&lng=${lng}`);
            console.log('🏘 Filtered locations:', response.data);
            setLocations(response.data);

            map.flyTo({ center: [lng, lat], zoom: 14, essential: true });
        } catch (err) {
            console.error('❌ Search error:', err.message, err);
        }
    };

    const handleClearSearch = async () => {
        try {
            const response = await axios.get('/api/locations');
            setLocations(response.data);
        } catch (err) {
            console.error('❌ Error loading all locations:', err.message, err);
        }

        setQuery('');
        setIsSearching(false);
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'center' }}>
            <InputBase
                placeholder="Search for address or area…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                sx={{
                    color: 'inherit',
                    backgroundColor: '#555',
                    px: 1,
                    borderRadius: '4px 0 0 4px',
                    height: '36px',
                    width: { xs: '50%', sm: '300px' }
                }}
            />
            <Button
                onClick={isSearching ? handleClearSearch : handleSubmit}
                type={isSearching ? 'button' : 'submit'}
                sx={{
                    backgroundColor: '#777',
                    color: 'white',
                    borderRadius: '0 4px 4px 0',
                    height: '36px',
                    minWidth: '40px'
                }}
            >
                {isSearching ? <CloseIcon /> : <SearchIcon />}
            </Button>
        </form>
    );
};

export default SearchBoxInput;
