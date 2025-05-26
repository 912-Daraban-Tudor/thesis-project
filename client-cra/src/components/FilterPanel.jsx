import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Slider, FormControlLabel, Switch,
    Checkbox, FormGroup, FormControl, FormLabel, Button,
    MenuItem, Select, InputLabel
} from '@mui/material';
import axios from '../api/axiosInstance';
import { useMapContext } from '../context/MapContext';
import UniversitySearchInput from './SearchUniversity';

const currentYear = new Date().getFullYear();
const rangeText = ([min, max]) => `${min} - ${max}`;

const FilterPanel = () => {
    const { filters, setFilters } = useMapContext();

    const [priceRange, setPriceRange] = useState(filters.price);
    const [floorRange, setFloorRange] = useState(filters.floor);
    const [yearBuiltRange, setYearBuiltRange] = useState(filters.year_built);
    const [hasParking, setHasParking] = useState(filters.has_parking);
    const [hasCentrala, setHasCentrala] = useState(filters.has_centrala);
    const [roomCount, setRoomCount] = useState(filters.room_count);
    const [totalRooms, setTotalRooms] = useState(filters.number_of_rooms);
    const [busLines, setBusLines] = useState([]);

    useEffect(() => {
        setPriceRange(filters.price);
        setFloorRange(filters.floor);
        setYearBuiltRange(filters.year_built);
        setHasParking(filters.has_parking);
        setHasCentrala(filters.has_centrala);
        setRoomCount(filters.room_count);
        setTotalRooms(filters.number_of_rooms);
    }, [filters]);

    useEffect(() => {
        axios.get('/api/transport/lines').then(res => setBusLines(res.data || []));
    }, []);

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
        <Box display="flex" flexDirection="column" gap={1} px={2} pb={1} width="90%">
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


            <FormControl fullWidth>
                <InputLabel id="bus-line-label">Near Bus Line</InputLabel>
                <Select
                    labelId="bus-line-label"
                    value={filters.bus_line || ''}
                    onChange={(e) => setFilters((prev) => ({ ...prev, bus_line: e.target.value || null }))}
                    label="Near Bus Line"
                >
                    <MenuItem value="">
                        <em>None</em>
                    </MenuItem>
                    {busLines.map((line) => (
                        <MenuItem key={line.linia} value={line.linia}>
                            {line.linia}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <UniversitySearchInput />

            <Button variant="contained" color="primary" onClick={handleApply}>
                Apply Filters
            </Button>
            <Button variant="outlined" color="secondary" onClick={handleClear}>
                Clear Filters
            </Button>
        </Box>
    );
};

export default FilterPanel;
