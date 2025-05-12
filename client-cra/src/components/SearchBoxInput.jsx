// SearchBoxInput.jsx
import React, { useState } from 'react';
import { InputBase, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useMap } from 'react-map-gl';
import { useMapContext } from '../context/MapContext';
import axios from '../api/axiosInstance';

const SearchBoxInput = () => {
    const [query, setQuery] = useState('');
    const { current: map } = useMap().mainMap || {};
    const { setLocations } = useMapContext();

    const handleSubmit = async (e) => {
        //console.log(query);
        e.preventDefault();
        if (!query || !map) return;

        try {
            const geocode = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${process.env.REACT_APP_MAPBOX_TOKEN}&proximity=23.6,46.76667&country=ro&limit=1`);
            console.log(geocode);
            const data = await geocode.json();
            console.log(data);
            if (!data.features?.[0]) return;

            const [lng, lat] = data.features[0].center;

            const response = await axios.get('/api/locations');
            console.log(response.data);
            const all = response.data;

            const filtered = all.filter(loc => {
                const dx = 111.32 * (loc.latitude - lat);
                const dy = 40075 * Math.cos((lat * Math.PI) / 180) * (loc.longitude - lng) / 360;
                const distance = Math.sqrt(dx * dx + dy * dy);
                return distance <= 1;
            });

            const result = filtered.length >= 2 ? filtered : all;
            console.log(result);
            setLocations(result);

            map.getMap().flyTo({ center: [lng, lat], zoom: 14, essential: true });
        } catch (err) {
            console.error('Search error:', err);
        }
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
                type="submit"
                sx={{
                    backgroundColor: '#777',
                    color: 'white',
                    borderRadius: '0 4px 4px 0',
                    height: '36px',
                    minWidth: '40px'
                }}
            >
                <SearchIcon />
            </Button>
        </form>
    );
};

export default SearchBoxInput;