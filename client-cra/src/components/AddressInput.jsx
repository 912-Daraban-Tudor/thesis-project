import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, TextField } from '@mui/material';
import { SearchBox } from '@mapbox/search-js-react';

function AddressInput({ value, onAddressSelect }) {
    const [isSearchActive, setIsSearchActive] = useState(false);
    const hasAddress = Boolean(value);

    const handleBlur = () => {
        setTimeout(() => setIsSearchActive(false), 150); // give time for selection to register
    };

    const handleAddressSelect = async (feature) => {
        if (!feature || !feature.features || feature.features.length === 0) return;

        const selected = feature.features[0];
        const { geometry, properties } = selected;

        if (!geometry || !geometry.coordinates) return;
        if (!properties || !properties.context) return;

        const context = properties.context;
        const street = context.street?.name;
        const addressNumber = context.address?.address_number;
        const place = context.place?.name;

        if (!street || !addressNumber || !place) return;


        // Construct the structured address
        const address = `${street}, nr. ${addressNumber}, ${place}`;

        // Prepare structured input parameters
        const structuredParams = new URLSearchParams({
            address_number: addressNumber,
            street: street,
            place: place,
            country: 'RO',
            autocomplete: 'false',
            access_token: process.env.REACT_APP_MAPBOX_TOKEN,
        });

        // Optional: Add bounding box and proximity for Cluj-Napoca
        structuredParams.append('bbox', '23.36,46.7,23.77,46.81'); // Cluj-Napoca bounding box
        structuredParams.append('proximity', '23.6,46.76667'); // Cluj-Napoca center

        try {
            const response = await fetch(`https://api.mapbox.com/search/geocode/v6/forward?${structuredParams.toString()}`);
            const data = await response.json();

            if (!data.features || data.features.length === 0) {
                console.warn('No geocoding results found.');
                return;
            }

            const result = data.features[0];
            const [resultLng, resultLat] = result.geometry.coordinates;

            onAddressSelect({
                address,
                latitude: resultLat,
                longitude: resultLng,
            });

            setIsSearchActive(false);
        } catch (error) {
            console.error('Geocoding error:', error);
        }
    };


    return (
        <Box sx={{ mb: 2, width: '100%' }}>
            <Typography variant="body1" sx={{ mb: 1, color: 'black' }}>
                Search Address
            </Typography>

            {isSearchActive ? (
                <Box sx={{ width: '100%' }}>
                    <SearchBox
                        accessToken={process.env.REACT_APP_MAPBOX_TOKEN}
                        options={{
                            country: 'ro',
                            types: 'address',
                            limit: 5,
                            autocomplete: true,
                            language: 'ro',
                            boundingBox: [23.36, 46.7, 23.77, 46.81], // Cluj-Napoca
                            proximity: '23.6,46.76667',
                        }}
                        onRetrieve={handleAddressSelect}
                        onSelect={handleAddressSelect}
                        onFocus={() => setIsSearchActive(true)}
                        onBlur={handleBlur}
                    />
                </Box>
            ) : (
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        gap: 1,
                        width: '100%',
                    }}
                >
                    {/* Compact search box when not active */}
                    <Box sx={{ width: '30%', flexShrink: 0 }}>
                        <SearchBox
                            accessToken={process.env.REACT_APP_MAPBOX_TOKEN}
                            options={{
                                country: 'ro',
                                types: 'address',
                                limit: 5,
                                autocomplete: true,
                                language: 'ro',
                                boundingBox: [23.36, 46.7, 23.77, 46.81],
                                proximity: '23.6,46.76667',
                            }}
                            onRetrieve={handleAddressSelect}
                            onSelect={handleAddressSelect}
                            onFocus={() => setIsSearchActive(true)}
                            onBlur={handleBlur}
                        />
                    </Box>

                    {/* Selected address field */}
                    {hasAddress && (
                        <Box sx={{ flexGrow: 1 }}>
                            <TextField
                                label="Selected Address"
                                variant="outlined"
                                value={value}
                                fullWidth
                                InputProps={{
                                    readOnly: true,
                                    style: {
                                        color: 'black',
                                        whiteSpace: 'normal',
                                        wordBreak: 'break-word',
                                    },
                                }}
                                sx={{
                                    backgroundColor: '#f9f9f9',
                                }}
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
