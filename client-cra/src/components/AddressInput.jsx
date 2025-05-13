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

    const handleAddressSelect = (feature) => {
        if (!feature || !feature.features || feature.features.length === 0) return;
        const selected = feature.features[0];
        console.log('Selected address:', selected);
        if (!selected.geometry || !selected.geometry.coordinates) return;
        if (!selected.properties || !selected.properties.context) return;
        if (
            !selected.properties.context.street ||
            !selected.properties.context.address ||
            !selected.properties.context.place
        )
            return;

        const [lng, lat] = selected.geometry.coordinates;
        onAddressSelect({
            address: `${selected.properties.context.street.name}, nr. ${selected.properties.context.address.address_number}, ${selected.properties.context.place.name}`,
            latitude: lat,
            longitude: lng,
        });
        setIsSearchActive(false);
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
