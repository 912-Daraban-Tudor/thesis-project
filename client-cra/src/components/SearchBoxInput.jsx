import React, { useRef, useState } from 'react';
import {
    InputBase,
    Button,
    IconButton,
    Paper,
    useTheme,
    InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { useMap } from 'react-map-gl';
import { useMapContext } from '../context/MapContext';

const SearchBoxInput = () => {
    const [query, setQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const inputRef = useRef(null);
    const { setSearchCoords } = useMapContext();
    const theme = useTheme();

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
        if (!query || !token || !map) return;

        try {
            const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${token}&proximity=23.6,46.76667&country=ro&limit=1`;
            const geocode = await fetch(geocodeUrl);
            if (!geocode.ok) throw new Error(`Geocoding failed: ${geocode.status}`);
            const data = await geocode.json();

            const feature = data.features?.[0];
            if (!feature) throw new Error('No results found for query.');
            const [lng, lat] = feature.center;

            setQuery(feature.place_name);
            setIsSearching(true);
            setSearchCoords({ lat, lng });
            map.flyTo({ center: [lng, lat], zoom: 14, essential: true });

            // ✅ Blur input to close keyboard on mobile
            inputRef.current?.blur();
        } catch (err) {
            console.error('❌ Search error:', err.message);
        }
    };

    const handleClearSearch = () => {
        setQuery('');
        setIsSearching(false);
        setSearchCoords(null);
        inputRef.current?.focus();
    };

    return (
        <Paper
            component="form"
            onSubmit={handleSubmit}
            elevation={2}
            sx={{
                display: 'flex',
                alignItems: 'center',
                borderRadius: theme.shape.borderRadius,
                backgroundColor: theme.palette.background.paper,
                px: 1,
                height: 40,
                width: { xs: '60%', sm: '300px' },
            }}
        >
            <InputBase
                inputRef={inputRef}
                placeholder="Search for address or area…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                sx={{
                    flex: 1,
                    color: 'inherit',
                    pl: 1,
                }}
                endAdornment={
                    query && (
                        <InputAdornment position="end">
                            <IconButton size="small" onClick={handleClearSearch}>
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </InputAdornment>
                    )
                }
            />

            <Button
                onClick={isSearching ? handleClearSearch : handleSubmit}
                type={isSearching ? 'button' : 'submit'}
                sx={{
                    minWidth: 40,
                    color: theme.palette.primary.contrastText,
                    backgroundColor: theme.palette.primary.main,
                    borderRadius: theme.shape.borderRadius,
                    ml: 1,
                    '&:hover': {
                        backgroundColor: theme.palette.primary.dark,
                    },
                }}
            >
                <SearchIcon fontSize="small" />
            </Button>
        </Paper>
    );
};

export default SearchBoxInput;
