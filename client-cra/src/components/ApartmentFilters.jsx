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

const ApartmentFilters = () => {
    const { filters, setFilters } = useMapContext();

    const handleMultiToggle = (value, listName) => {
        setFilters(prev => {
            const updatedList = prev[listName].includes(value)
                ? prev[listName].filter(v => v !== value)
                : [...prev[listName], value];
            return { ...prev, [listName]: updatedList };
        });
    };

    const handleClear = () => {
        setFilters({
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
        });
    };

    return (
        <Box display="flex" flexDirection="column" gap={2} px={2} pb={2}>
            <Typography variant="subtitle1">Price Range: {rangeText(filters.price)} €</Typography>
            <Slider
                value={filters.price}
                onChange={(e, val) => setFilters(prev => ({ ...prev, price: val }))}
                min={0}
                max={2000}
                valueLabelDisplay="auto"
            />

            <Typography variant="subtitle1">Floor: {rangeText(filters.floor)}</Typography>
            <Slider
                value={filters.floor}
                onChange={(e, val) => setFilters(prev => ({ ...prev, floor: val }))}
                min={0}
                max={10}
                valueLabelDisplay="auto"
            />

            <Typography variant="subtitle1">Year Built: {rangeText(filters.year_built)}</Typography>
            <Slider
                value={filters.year_built}
                onChange={(e, val) => setFilters(prev => ({ ...prev, year_built: val }))}
                min={1900}
                max={currentYear}
                valueLabelDisplay="auto"
            />

            <FormGroup>
                <FormControlLabel
                    control={
                        <Switch
                            checked={filters.has_parking}
                            onChange={() =>
                                setFilters(prev => ({ ...prev, has_parking: !prev.has_parking }))
                            }
                        />
                    }
                    label="Has Parking"
                />
                <FormControlLabel
                    control={
                        <Switch
                            checked={filters.has_centrala}
                            onChange={() =>
                                setFilters(prev => ({ ...prev, has_centrala: !prev.has_centrala }))
                            }
                        />
                    }
                    label="Has Heating"
                />
            </FormGroup>

            <FormControl component="fieldset">
                <FormLabel>Rooms for Rent</FormLabel>
                <FormGroup row>
                    {[1, 2, 3, 4, 5].map(n => (
                        <FormControlLabel
                            key={`room-${n}`}
                            control={
                                <Checkbox
                                    checked={filters.room_count.includes(n)}
                                    onChange={() => handleMultiToggle(n, 'room_count')}
                                />
                            }
                            label={n}
                        />
                    ))}
                </FormGroup>
            </FormControl>

            <FormControl component="fieldset">
                <FormLabel>Total Rooms in Apartment</FormLabel>
                <FormGroup row>
                    {[1, 2, 3, 4, 5].map(n => (
                        <FormControlLabel
                            key={`total-${n}`}
                            control={
                                <Checkbox
                                    checked={filters.number_of_rooms.includes(n)}
                                    onChange={() => handleMultiToggle(n, 'number_of_rooms')}
                                />
                            }
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
                    onChange={e =>
                        setFilters(prev => ({
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

            <Box display="flex" justifyContent="center" mt={2}>
                <Button variant="outlined" color="secondary" onClick={handleClear}>
                    Clear Filters
                </Button>
            </Box>
        </Box>
    );
};

export default ApartmentFilters;
