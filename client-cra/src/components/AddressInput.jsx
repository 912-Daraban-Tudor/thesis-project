import React, { useState } from 'react';
import { Box, Typography, TextField } from '@mui/material';
import { SearchBox } from '@mapbox/search-js-react';

function AddressInput({ value, onAddressSelect }) {
    const [isSearchActive, setIsSearchActive] = useState(false);
    const hasAddress = Boolean(value);

    const handleClick = () => setIsSearchActive(true);
    const handleBlur = () => {
        setTimeout(() => setIsSearchActive(false), 200);
    };

    const handleAddressSelect = (feature) => {
        if (!feature || !feature.features || feature.features.length === 0) return;
        const selected = feature.features[0];
        if (!selected.geometry || !selected.geometry.coordinates) return;
        if (!selected.properties || !selected.properties.context) return;
        if (!selected.properties.context.street || !selected.properties.context.address || !selected.properties.context.place) return;

        const [lng, lat] = selected.geometry.coordinates;
        onAddressSelect({
            address: `${selected.properties.context.street.name}, nr. ${selected.properties.context.address.address_number}, ${selected.properties.context.place.name}`,
            latitude: lat,
            longitude: lng,
        });
        setIsSearchActive(false);
    };

    return (
        <Box sx={{ mb: 2 }}>
            <Typography variant="body1" sx={{ mb: 1 }}>
                Search Address
            </Typography>

            <Box
                sx={{
                    display: 'flex',
                    flexDirection: isSearchActive ? 'column' : 'row',
                    gap: 1,
                    width: '100%',
                }}
            >
                <Box
                    sx={{
                        flexGrow: 1,
                        flexBasis: isSearchActive ? '100%' : hasAddress ? '50%' : '50%',
                        transition: 'flex-basis 0.4s ease',
                    }}
                    onClick={handleClick}
                    onBlur={handleBlur}
                    tabIndex={0}
                >
                    <SearchBox
                        accessToken={process.env.REACT_APP_MAPBOX_TOKEN}
                        options={{
                            country: 'ro',
                            types: 'address',
                            limit: 5,
                            autocomplete: true,
                            language: 'ro',
                            boundingBox: [23.36, 46.7, 23.77, 46.81], // Cluj-Napoca bounding box
                            proximity: '23.6,46.76667',
                        }}
                        onRetrieve={handleAddressSelect}
                    />
                </Box>

                {(!isSearchActive || !hasAddress) && (
                    <Box
                        sx={{
                            flexGrow: 0,
                            flexShrink: 1,
                            flexBasis: hasAddress ? 'auto' : '50%',
                            maxWidth: '600px', // limit max width to prevent overflow
                            transition: 'flex-basis 0.4s ease',
                        }}
                    >
                        <TextField
                            label="Selected Address"
                            variant="outlined"
                            value={value}
                            fullWidth={false}
                            InputProps={{
                                readOnly: true,
                                style: {
                                    color: 'black',
                                    whiteSpace: 'normal',
                                    wordBreak: 'break-word',
                                },
                            }}
                            sx={{
                                backgroundColor: value ? '#f9f9f9' : 'transparent',
                            }}
                        />
                    </Box>
                )}
            </Box>

            {isSearchActive && hasAddress && (
                <Box sx={{ mt: 1 }}>
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
                            backgroundColor: value ? '#f9f9f9' : 'transparent',
                        }}
                    />
                </Box>
            )}
        </Box>
    );
}

export default AddressInput;
