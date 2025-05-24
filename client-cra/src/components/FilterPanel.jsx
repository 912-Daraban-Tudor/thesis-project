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
    InputLabel,
    TextField,
    IconButton
} from '@mui/material';
import { useMapContext } from '../context/MapContext';
import { SearchBox } from '@mapbox/search-js-react';
import axios from '../api/axiosInstance';
import CloseIcon from '@mui/icons-material/Close';

const rangeText = ([min, max]) => `${min} - ${max}`;
const currentYear = new Date().getFullYear();

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
    const [universityLocationText, setUniversityLocationText] = useState('');

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
        const fetchBusLines = async () => {
            try {
                const res = await axios.get('/api/transport/lines');
                setBusLines(res.data || []);
            } catch (err) {
                console.error('Error fetching bus lines:', err);
            }
        };
        fetchBusLines();
    }, []);

    const handleMultiToggle = (value, list, setList) => {
        setList((prev) =>
            prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
        );
    };

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
        setUniversityLocationText('');
        setFilters(defaultFilters);
    };

    const handleUniversitySelect = (feature) => {
        if (!feature || !feature.features || feature.features.length === 0) return;

        const selected = feature.features[0];
        const { geometry } = selected;

        if (!geometry || !geometry.coordinates) return;

        const [lng, lat] = geometry.coordinates;

        setFilters((prev) => ({
            ...prev,
            connected_to_university: { latitude: lat, longitude: lng },
        }));

        setUniversityLocationText(selected.place_name || '');
    };

    const handleClearUniversityLocation = () => {
        setFilters((prev) => ({
            ...prev,
            connected_to_university: null
        }));
        setUniversityLocationText('');
    };

    return (
        <Box display="flex" flexDirection="column" gap={1} px={2} pb={1} width="100%">
            <Typography variant="subtitle1">Price Range: {rangeText(priceRange)} €</Typography>
            <Slider value={priceRange} onChange={(e, newVal) => setPriceRange(newVal)} valueLabelDisplay="auto" min={0} max={2000} />

            <Typography variant="subtitle1">Floor: {rangeText(floorRange)}</Typography>
            <Slider value={floorRange} onChange={(e, newVal) => setFloorRange(newVal)} valueLabelDisplay="auto" min={0} max={10} />

            <Typography variant="subtitle1">Year Built: {rangeText(yearBuiltRange)}</Typography>
            <Slider value={yearBuiltRange} onChange={(e, newVal) => setYearBuiltRange(newVal)} valueLabelDisplay="auto" min={1900} max={currentYear} />

            <FormGroup>
                <FormControlLabel control={<Switch checked={hasParking} onChange={() => setHasParking(!hasParking)} />} label="Has Parking" />
                <FormControlLabel control={<Switch checked={hasCentrala} onChange={() => setHasCentrala(!hasCentrala)} />} label="Has Heating (Centrala)" />
            </FormGroup>

            <FormControl component="fieldset">
                <FormLabel>Rooms for Rent</FormLabel>
                <FormGroup row>
                    {[1, 2, 3, 4].map((n) => (
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
                    {[1, 2, 3, 4].map((n) => (
                        <FormControlLabel
                            key={`total-${n}`}
                            control={<Checkbox checked={totalRooms.includes(n)} onChange={() => handleMultiToggle(n, totalRooms, setTotalRooms)} />}
                            label={n}
                        />
                    ))}
                </FormGroup>
            </FormControl>

            <FormControl fullWidth>
                <InputLabel>Near Bus Line</InputLabel>
                <Select
                    value={filters.bus_line || ''}
                    onChange={(e) => setFilters((prev) => ({ ...prev, bus_line: e.target.value || null }))}
                    displayEmpty
                >
                    <MenuItem value="">--None--</MenuItem>
                    {busLines.map((line) => (
                        <MenuItem key={line.linia} value={line.linia}>
                            {line.linia}
                        </MenuItem>
                    ))}


                </Select>
            </FormControl>

            <Box>
                <Typography variant="body1" sx={{ mt: 2, mb: 1 }}>Search University Area</Typography>
                <SearchBox
                    accessToken={process.env.REACT_APP_MAPBOX_TOKEN}
                    options={{
                        country: 'ro',
                        types: 'place',
                        limit: 5,
                        autocomplete: true,
                        language: 'ro',
                        boundingBox: [23.36, 46.7, 23.77, 46.81],
                        proximity: '23.6,46.76667',
                    }}
                    onRetrieve={handleUniversitySelect}
                    onSelect={handleUniversitySelect}
                />
                {universityLocationText && (
                    <Box display="flex" alignItems="center" gap={1} mt={1}>
                        <TextField
                            label="Selected Area"
                            value={universityLocationText}
                            fullWidth
                            InputProps={{ readOnly: true }}
                        />
                        <IconButton onClick={handleClearUniversityLocation}>
                            <CloseIcon />
                        </IconButton>
                    </Box>
                )}
            </Box>

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
