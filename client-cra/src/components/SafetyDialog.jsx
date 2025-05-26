import React from 'react';
import PropTypes from 'prop-types';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    List,
    ListItem,
    ListItemText
} from '@mui/material';

const tips = [
    'Avoid fraud: always verify the user’s identity.',
    'Never send money without visiting the place.',
    'Always ask to see the rental contract.',
    'Beware of suspicious links.',
    'Be cautious about sharing personal information.'
];

const SafetyDialog = ({ open, onClose }) => {
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>⚠️ Stay Safe When Using the Platform</DialogTitle>
            <DialogContent dividers>
                <List dense>
                    {tips.map((tip, index) => (
                        <ListItem key={index}>
                            <ListItemText primary={tip} />
                        </ListItem>
                    ))}
                </List>
            </DialogContent>
            <DialogActions>
                <Button variant="contained" color="primary" onClick={onClose}>
                    I Understand
                </Button>
            </DialogActions>
        </Dialog>
    );
};
SafetyDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default SafetyDialog;
