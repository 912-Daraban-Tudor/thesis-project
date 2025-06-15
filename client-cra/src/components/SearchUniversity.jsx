import { useState } from 'react';
import {
    TextField, IconButton, Box, Typography
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import { useMapContext } from '../context/MapContext';
import axios from '../api/axiosInstance';
const SearchUniversity = () => {
    const [connectedLines, setConnectedLines] = useState([]);
    const { setFilters } = useMapContext();
    const [query, setQuery] = useState('');
    const [resolvedLabel, setResolvedLabel] = useState('');

    const searchLocation = async () => {
        if (!query) return;

        try {
            const res = await axios.get('/api/geocode', { params: { query } });
            const data = res.data;

            if (!data || !data.location || !data.formatted_address) {
                alert('No results found.');
                return;
            }

            const { formatted_address, location, connectedLines } = data;

            setResolvedLabel(formatted_address);
            setConnectedLines(connectedLines || []);
            setQuery(formatted_address);

            setFilters(prev => ({
                ...prev,
                connected_to_university: {
                    latitude: location.lat,
                    longitude: location.lng,
                }
            }));

        } catch (err) {
            console.error('Error fetching coordinates:', err);
            alert('Something went wrong while searching.');
        }
    };

    const clearLocation = () => {
        setConnectedLines([]);
        setQuery('');
        setResolvedLabel('');
        setFilters(prev => ({ ...prev, connected_to_university: null }));
    };

    return (
        <Box mt={1} mb={2}>
            <Typography variant="body1" mb={0.5}>Connected By Direct Bus</Typography>

            <Box display="flex" gap={1}>
                <TextField
                    fullWidth
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && searchLocation()}
                    placeholder="Search University Location"
                />
                <IconButton onClick={searchLocation}>
                    <SearchIcon />
                </IconButton>
                {resolvedLabel && (
                    <IconButton onClick={clearLocation}>
                        <CloseIcon />
                    </IconButton>
                )}
            </Box>

            {connectedLines.length > 0 && (
                <Typography variant="body2" mt={1}>
                    Connected to: <strong>{connectedLines.join(', ')}</strong>
                </Typography>
            )}

        </Box>
    );
};

export default SearchUniversity;
