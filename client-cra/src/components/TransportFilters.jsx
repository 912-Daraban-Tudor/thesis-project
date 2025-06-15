import { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button
} from '@mui/material';
import axios from '../api/axiosInstance';
import SearchUniversity from './SearchUniversity';
import { useMapContext } from '../context/MapContext';

const TransportFilters = () => {
    const { filters, setFilters } = useMapContext();
    const [busLines, setBusLines] = useState([]);

    useEffect(() => {
        axios.get('/api/transport/lines').then((res) => setBusLines(res.data || []));
    }, []);

    const handleClearTransportFilters = () => {
        setFilters((prev) => ({
            ...prev,
            bus_line: null,
            connected_to_university: null,
        }));
    };

    return (
        <Box display="flex" flexDirection="column" gap={2} px={2} pb={2}>
            <Typography variant="body1">Proximity to Bus Line</Typography>

            <FormControl fullWidth>
                <InputLabel id="bus-line-label">Near Bus Line</InputLabel>
                <Select
                    labelId="bus-line-label"
                    value={filters.bus_line || ''}
                    onChange={(e) =>
                        setFilters((prev) => ({
                            ...prev,
                            bus_line: e.target.value || null,
                        }))
                    }
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

            <SearchUniversity />

            <Box display="flex" justifyContent="center" mt={2}>
                <Button variant="outlined" color="secondary" onClick={handleClearTransportFilters}>
                    Clear Filters
                </Button>
            </Box>
        </Box>
    );
};

export default TransportFilters;
