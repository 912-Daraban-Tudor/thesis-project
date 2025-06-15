import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, TextField, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

function AddressInput({ value, onAddressSelect }) {
    const [query, setQuery] = useState('');
    const [isSearchActive, setIsSearchActive] = useState(false);
    const hasAddress = Boolean(value);

    const handleBlur = () => {
        setTimeout(() => setIsSearchActive(false), 150);
    };

    const handleSearch = async () => {
        if (!query.trim()) return;

        try {
            const apiKey = process.env.REACT_APP_GOOGLE_API_KEY;
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
                    query
                )}&region=ro&key=${apiKey}`
            );

            const data = await response.json();

            if (data.status === 'OK' && data.results.length > 0) {
                const result = data.results[0];
                const { formatted_address, geometry } = result;
                const { lat, lng } = geometry.location;

                onAddressSelect({
                    address: formatted_address,
                    latitude: lat,
                    longitude: lng,
                });

                setQuery(formatted_address);
                setIsSearchActive(false);
            } else {
                alert('No results found.');
            }
        } catch (err) {
            console.error('Geocoding error:', err);
            alert('Error searching for location.');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSearch();
    };

    return (
        <Box sx={{ mb: 2, width: '100%' }}>
            <Typography variant="body1" sx={{ mb: 1, color: 'black' }}>
                Search Address
            </Typography>

            {isSearchActive ? (
                <Box sx={{ width: '100%', display: 'flex', gap: 1 }}>
                    <TextField
                        fullWidth
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onBlur={handleBlur}
                        autoFocus
                        placeholder="e.g. Aleea Detunata 11, Cluj"
                    />
                    <IconButton onClick={handleSearch}>
                        <SearchIcon />
                    </IconButton>
                </Box>
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, width: '100%' }}>
                    <Box sx={{ width: '30%', flexShrink: 0 }}>
                        <TextField
                            fullWidth
                            placeholder="Search"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onFocus={() => setIsSearchActive(true)}
                        />
                    </Box>

                    {hasAddress && (
                        <Box sx={{ flexGrow: 1 }}>
                            <TextField
                                label="Selected Address"
                                variant="outlined"
                                value={value}
                                fullWidth
                                slotProps={{
                                    input: {
                                        readOnly: true,
                                        style: {
                                            color: 'black',
                                            whiteSpace: 'normal',
                                            wordBreak: 'break-word',
                                        },
                                    },
                                }}
                                sx={{ backgroundColor: '#f9f9f9' }}
                            />
                        </Box>
                    )}
                </Box>
            )}
        </Box>
    );
}

AddressInput.propTypes = {
    value: PropTypes.string.isRequired,
    onAddressSelect: PropTypes.func.isRequired,
};

export default AddressInput;
