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
} from '@mui/material';
import { useMapContext } from '../context/MapContext';
import PropTypes from 'prop-types';

const rangeText = ([min, max]) => `${min} - ${max}`;
const currentYear = new Date().getFullYear();

const FilterPanel = ({ onApply }) => {
    const { filters } = useMapContext();

    const [priceRange, setPriceRange] = useState(filters.price);
    const [floorRange, setFloorRange] = useState(filters.floor);
    const [yearBuiltRange, setYearBuiltRange] = useState(filters.year_built);
    const [hasParking, setHasParking] = useState(filters.has_parking);
    const [hasCentrala, setHasCentrala] = useState(filters.has_centrala);
    const [roomCount, setRoomCount] = useState(filters.room_count);
    const [totalRooms, setTotalRooms] = useState(filters.number_of_rooms);

    // sync with context filters when they change
    useEffect(() => {
        setPriceRange(filters.price);
        setFloorRange(filters.floor);
        setYearBuiltRange(filters.year_built);
        setHasParking(filters.has_parking);
        setHasCentrala(filters.has_centrala);
        setRoomCount(filters.room_count);
        setTotalRooms(filters.number_of_rooms);
    }, [filters]);

    const handleMultiToggle = (value, list, setList) => {
        setList((prev) =>
            prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
        );
    };

    const handleApply = () => {
        onApply({
            price: priceRange,
            floor: floorRange,
            year_built: yearBuiltRange,
            has_parking: hasParking,
            has_centrala: hasCentrala,
            room_count: roomCount,
            number_of_rooms: totalRooms,
        });
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
        };

        // Reset UI state
        setPriceRange(defaultFilters.price);
        setFloorRange(defaultFilters.floor);
        setYearBuiltRange(defaultFilters.year_built);
        setHasParking(false);
        setHasCentrala(false);
        setRoomCount([]);
        setTotalRooms([]);

        // Call context update
        onApply(defaultFilters);
    };

    return (
        <Box display="flex" overflow="hidden" flexDirection="column" gap={2}>
            <Typography variant="subtitle1">
                Price Range: {rangeText(priceRange)} €
            </Typography>
            <Slider
                value={priceRange}
                onChange={(e, newValue) => setPriceRange(newValue)}
                valueLabelDisplay="auto"
                min={0}
                max={2000}
            />

            <Typography variant="subtitle1">
                Floor: {rangeText(floorRange)}
            </Typography>
            <Slider
                value={floorRange}
                onChange={(e, newValue) => setFloorRange(newValue)}
                valueLabelDisplay="auto"
                min={0}
                max={10}
            />

            <Typography variant="subtitle1">
                Year Built: {rangeText(yearBuiltRange)}
            </Typography>
            <Slider
                value={yearBuiltRange}
                onChange={(e, newValue) => setYearBuiltRange(newValue)}
                valueLabelDisplay="auto"
                min={1900}
                max={currentYear}
            />

            <FormGroup>
                <FormControlLabel
                    control={
                        <Switch
                            checked={hasParking}
                            onChange={() => setHasParking(!hasParking)}
                        />
                    }
                    label="Has Parking"
                />
                <FormControlLabel
                    control={
                        <Switch
                            checked={hasCentrala}
                            onChange={() => setHasCentrala(!hasCentrala)}
                        />
                    }
                    label="Has Heating (Centrala)"
                />
            </FormGroup>

            <FormControl component="fieldset">
                <FormLabel>Rooms for Rent</FormLabel>
                <FormGroup row>
                    {[1, 2, 3, 4, 5].map((n) => (
                        <FormControlLabel
                            key={`room-${n}`}
                            control={
                                <Checkbox
                                    checked={roomCount.includes(n)}
                                    onChange={() =>
                                        handleMultiToggle(n, roomCount, setRoomCount)
                                    }
                                />
                            }
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
                            control={
                                <Checkbox
                                    checked={totalRooms.includes(n)}
                                    onChange={() =>
                                        handleMultiToggle(n, totalRooms, setTotalRooms)
                                    }
                                />
                            }
                            label={n}
                        />
                    ))}
                </FormGroup>
            </FormControl>

            <Button variant="contained" color="primary" onClick={handleApply}>
                Apply Filters
            </Button>
            <Button variant="outlined" color="secondary" onClick={handleClear}>
                Clear Filters
            </Button>
        </Box>
    );
};
FilterPanel.propTypes = {
    onApply: PropTypes.func.isRequired,
};

export default FilterPanel;
