// client-cra/src/components/ApartmentFilters.jsx
import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Slider,
    FormControlLabel,
    Switch,
    Checkbox,
    FormGroup,
    FormControl,
    FormLabel,
    Button,
    MenuItem,
    Select,
    InputLabel
} from '@mui/material';
import { useMapContext } from '../context/MapContext';

const currentYear = new Date().getFullYear();
const rangeText = ([min, max]) => `${min} - ${max}`;

// ✅ Accept onApplyComplete from TopNavBar
const ApartmentFilters = ({ onApplyComplete }) => {
    const { filters, setFilters } = useMapContext();

    const [priceRange, setPriceRange] = useState(filters.price);
    const [floorRange, setFloorRange] = useState(filters.floor);
    const [yearBuiltRange, setYearBuiltRange] = useState(filters.year_built);
    const [hasParking, setHasParking] = useState(filters.has_parking);
    const [hasCentrala, setHasCentrala] = useState(filters.has_centrala);
    const [roomCount, setRoomCount] = useState(filters.room_count);
    const [totalRooms, setTotalRooms] = useState(filters.number_of_rooms);

    useEffect(() => {
        setPriceRange(filters.price);
        setFloorRange(filters.floor);
        setYearBuiltRange(filters.year_built);
        setHasParking(filters.has_parking);
        setHasCentrala(filters.has_centrala);
        setRoomCount(filters.room_count);
        setTotalRooms(filters.number_of_rooms);
    }, [filters]);

    const handleApply = () => {
        setFilters((prev) => ({
            ...prev,
            price: [...priceRange],
            floor: [...floorRange],
            year_built: [...yearBuiltRange],
            has_parking: hasParking,
            has_centrala: hasCentrala,
            room_count: [...roomCount],
            number_of_rooms: [...totalRooms],
        }));

        // ✅ Call drawer close callback
        if (onApplyComplete) onApplyComplete();
    };

    const handleClear = () => {
        const defaultFilters = {
            price: [0, 2000],
            floor: [0, 10],
            year_built: [1900, currentYear],
            has_parking: false,
            has_centrala: false,
            room_count: [],
            number_of_rooms: [],
            sex_preference: null,
            bus_line: null,
            connected_to_university: null,
        };
        setPriceRange(defaultFilters.price);
        setFloorRange(defaultFilters.floor);
        setYearBuiltRange(defaultFilters.year_built);
        setHasParking(false);
        setHasCentrala(false);
        setRoomCount([]);
        setTotalRooms([]);
        setFilters(defaultFilters);
    };

    const handleMultiToggle = (value, list, setList) => {
        setList((prev) =>
            prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
        );
    };

    return (
        <Box display="flex" flexDirection="column" gap={2} px={2} pb={2}>
            <Typography variant="subtitle1">Price Range: {rangeText(priceRange)} €</Typography>
            <Slider value={priceRange} onChange={(e, val) => setPriceRange(val)} min={0} max={2000} valueLabelDisplay="auto" />

            <Typography variant="subtitle1">Floor: {rangeText(floorRange)}</Typography>
            <Slider value={floorRange} onChange={(e, val) => setFloorRange(val)} min={0} max={10} valueLabelDisplay="auto" />

            <Typography variant="subtitle1">Year Built: {rangeText(yearBuiltRange)}</Typography>
            <Slider value={yearBuiltRange} onChange={(e, val) => setYearBuiltRange(val)} min={1900} max={currentYear} valueLabelDisplay="auto" />

            <FormGroup>
                <FormControlLabel control={<Switch checked={hasParking} onChange={() => setHasParking(!hasParking)} />} label="Has Parking" />
                <FormControlLabel control={<Switch checked={hasCentrala} onChange={() => setHasCentrala(!hasCentrala)} />} label="Has Heating (Centrala)" />
            </FormGroup>

            <FormControl component="fieldset">
                <FormLabel>Rooms for Rent</FormLabel>
                <FormGroup row>
                    {[1, 2, 3, 4, 5].map((n) => (
                        <FormControlLabel
                            key={`room-${n}`}
                            control={<Checkbox checked={roomCount.includes(n)} onChange={() => handleMultiToggle(n, roomCount, setRoomCount)} />}
                            label={n}
                        />
                    ))}
                </FormGroup>
            </FormControl>

            <FormControl component="fieldset">
                <FormLabel>Total Rooms</FormLabel>
                <FormGroup row>
                    {[1, 2, 3, 4, 5].map((n) => (
                        <FormControlLabel
                            key={`total-${n}`}
                            control={<Checkbox checked={totalRooms.includes(n)} onChange={() => handleMultiToggle(n, totalRooms, setTotalRooms)} />}
                            label={n}
                        />
                    ))}
                </FormGroup>
            </FormControl>

            <FormControl fullWidth>
                <InputLabel id="gender-label">Preferred Gender</InputLabel>
                <Select
                    labelId="gender-label"
                    value={filters.sex_preference || ''}
                    onChange={(e) =>
                        setFilters((prev) => ({
                            ...prev,
                            sex_preference: e.target.value || null,
                        }))
                    }
                    label="Preferred Gender"
                >
                    <MenuItem value="">
                        <em>Not specified</em>
                    </MenuItem>
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                    <MenuItem value="Any">Any</MenuItem>
                </Select>
            </FormControl>

            <Box display="flex" gap={2} mt={2}>
                <Button fullWidth variant="contained" color="primary" onClick={handleApply}>
                    Apply Filters
                </Button>
                <Button fullWidth variant="outlined" color="secondary" onClick={handleClear}>
                    Clear Filters
                </Button>
            </Box>
        </Box>
    );
};

export default ApartmentFilters;
