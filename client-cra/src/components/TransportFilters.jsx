// client-cra/src/components/TransportFilters.jsx
import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import axios from '../api/axiosInstance';
import UniversitySearchInput from './SearchUniversity';
import { useMapContext } from '../context/MapContext';

const TransportFilters = () => {
    const { filters, setFilters } = useMapContext();
    const [busLines, setBusLines] = useState([]);

    useEffect(() => {
        axios.get('/api/transport/lines').then((res) => setBusLines(res.data || []));
    }, []);

    return (
        <Box display="flex" flexDirection="column" gap={2} px={2} pb={2}>
            <Typography variant="h6">Transport Filters</Typography>

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

            <UniversitySearchInput />
        </Box>
    );
};

export default TransportFilters;
