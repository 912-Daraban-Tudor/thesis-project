import React, { useEffect, useState, useRef } from 'react';
import {
    Box,
    IconButton,
    Typography,
    TextField,
    Divider,
    List,
    ListItemButton,
    ListItemText,
    Paper,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import { useChat } from '../context/ChatContext';
import { jwtDecode } from 'jwt-decode';
import axios from '../api/axiosInstance';
import PropTypes from 'prop-types';

const ChatWindow = ({ open, onClose, autoStartUserId = null }) => {
    const {
        conversations,
        activeConversation,
        setActiveConversation,
        messages,
        loadConversations,
        loadMessages,
        sendMessage,
    } = useChat();

    const [view, setView] = useState('list');
    const [input, setInput] = useState('');
    const [searchUsername, setSearchUsername] = useState('');
    const scrollRef = useRef();
    const token = localStorage.getItem('token');
    const currentUser = token ? jwtDecode(token) : null;
    const me = currentUser?.id;

    const getOtherUser = (conv) =>
        me === conv.user1_id ? conv.user2_username : conv.user1_username;

    const handleSelectConversation = (conv) => {
        setActiveConversation(conv);
        setView('chat');
    };

    const handleSend = () => {
        if (!input.trim() || !activeConversation?.id) return;

        const recipientId =
            activeConversation.user1_id === me
                ? activeConversation.user2_id
                : activeConversation.user1_id;

        sendMessage({ recipientId, content: input });
        setInput('');
    };

    const handleStartNewChatByUsername = async (username) => {
        if (!username.trim()) return;
        try {
            const res = await axios.get(`/api/auth/user-by-username/${username}`);
            const recipient = res.data;
            if (recipient.id === me) return;

            const existing = conversations.find(
                (c) => c.user1_id === recipient.id || c.user2_id === recipient.id
            );

            if (existing) {
                handleSelectConversation(existing);
            } else {
                await sendMessage({ recipientId: recipient.id, content: '👋' });
                await loadConversations();
                const updated = await axios.get('/api/chats/conversations'); // force fresh
                const newConv = updated.data.find(
                    (c) =>
                        (c.user1_id === recipient.id && c.user2_id === me) ||
                        (c.user2_id === recipient.id && c.user1_id === me)
                );
                if (newConv) {
                    setActiveConversation(newConv);
                    setView('chat');
                }
            }
        } catch {
            console.error('User not found');
            alert('No user with that username was found.');
        }
    };

    useEffect(() => {
        if (!open || !autoStartUserId) return;
        (async () => {
            try {
                const res = await axios.get(`/api/auth/user-by-id/${autoStartUserId}`);
                const username = res.data?.username;
                if (username) await handleStartNewChatByUsername(username);
            } catch (err) {
                console.error('Failed to auto-start chat:', err.response?.data || err.message);
            }
        })();
    }, [open, autoStartUserId]);

    useEffect(() => {
        if (activeConversation?.id) {
            loadMessages(activeConversation.id);
        }
    }, [activeConversation, loadMessages]);

    useEffect(() => {
        if (open) loadConversations();
    }, [open, loadConversations]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    if (!open) return null;

    return (
        <Paper
            elevation={5}
            sx={{
                position: 'fixed',
                bottom: 16,
                right: 16,
                width: 360,
                height: 500,
                display: 'flex',
                flexDirection: 'column',
                zIndex: 1300,
                borderRadius: 2,
                overflow: 'hidden',
            }}
        >
            {/* HEADER */}
            <Box
                p={1.5}
                bgcolor="#f5efe6"
                borderBottom="1px solid #ccc"
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                sx={{ position: 'sticky', top: 0, zIndex: 2 }}
            >
                <Box display="flex" alignItems="center" gap={1}>
                    {view === 'chat' && (
                        <IconButton onClick={() => setView('list')} size="small">
                            <ArrowBackIcon />
                        </IconButton>
                    )}
                    <Typography variant="subtitle1" fontWeight={600}>
                        {view === 'chat'
                            ? `Chat with ${getOtherUser(activeConversation)}`
                            : 'Messages'}
                    </Typography>
                </Box>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </Box>

            {/* BODY */}
            {view === 'list' ? (
                <Box display="flex" flexDirection="column" flexGrow={1} height="100%">
                    <Box p={1} borderBottom="1px solid #ddd">
                        <TextField
                            fullWidth
                            size="small"
                            variant="outlined"
                            placeholder="Search by username"
                            value={searchUsername}
                            onChange={(e) => setSearchUsername(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleStartNewChatByUsername(searchUsername);
                            }}
                        />
                    </Box>
                    <Box flexGrow={1} overflow="auto" px={1}>
                        <List dense>
                            {conversations.map((conv) => (
                                <ListItemButton key={conv.id} onClick={() => handleSelectConversation(conv)}>
                                    <ListItemText
                                        primary={getOtherUser(conv)}
                                        secondary={new Date(conv.last_message_at).toLocaleTimeString()}
                                    />
                                </ListItemButton>
                            ))}
                        </List>
                    </Box>
                </Box>
            ) : (
                <Box display="flex" flexDirection="column" flexGrow={1} height="100%">
                    {/* Scrollable message area */}
                    <Box
                        flexGrow={1}
                        overflow="auto"
                        px={1.5}
                        py={3}
                        pt={8}
                        bgcolor="#fcfbf7"
                    >
                        <Box display="flex" flexDirection="column">
                            {messages.map((msg) => (
                                <Box
                                    key={msg.id}
                                    alignSelf={msg.sender_id === me ? 'flex-end' : 'flex-start'}
                                    bgcolor={msg.sender_id === me ? '#d2e3c8' : '#ffffff'}
                                    color="black"
                                    borderRadius={2}
                                    px={2}
                                    py={1}
                                    mb={1}
                                    maxWidth="80%"
                                >
                                    <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                                        {renderMessageContent(msg.content || '')}
                                    </Typography>
                                    <Typography variant="caption" display="block" align="right">
                                        {new Date(msg.created_at).toLocaleTimeString()}
                                    </Typography>
                                </Box>
                            ))}
                            <div ref={scrollRef} />
                        </Box>
                    </Box>

                    {/* Input bar */}
                    <Divider />
                    <Box p={1.5} display="flex" bgcolor="#fff" borderTop="1px solid #ccc">
                        <TextField
                            fullWidth
                            size="small"
                            variant="outlined"
                            placeholder="Type a message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSend();
                            }}
                        />
                        <IconButton onClick={handleSend}>
                            <SendIcon />
                        </IconButton>
                    </Box>
                </Box>
            )}
        </Paper>
    );
};

// ✅ Helper: Only allow Google Maps links (including maps.app.goo.gl)
const renderMessageContent = (text) => {
    if (typeof text !== 'string') return null;

    const urlRegex = /\b(https?:\/\/[^\s]+|www\.[^\s]+)/gi;

    return text.split(urlRegex).map((part, i) => {
        if (!part) return null;

        const isUrl = urlRegex.test(part);
        const normalized = part.startsWith('http') ? part : 'https://' + part;

        const isAllowedMapLink =
            normalized.startsWith('https://www.google.com/maps') ||
            normalized.startsWith('http://www.google.com/maps') ||
            normalized.startsWith('https://maps.app.goo.gl') ||
            normalized.startsWith('http://maps.app.goo.gl');

        if (isUrl) {
            return isAllowedMapLink ? (
                <a
                    key={i}
                    href={normalized}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#1976d2', textDecoration: 'underline' }}
                >
                    {part}
                </a>
            ) : (
                <i key={i} style={{ color: 'red' }}>[Link not allowed]</i>
            );
        }

        return <span key={i}>{part}</span>;
    });
};


ChatWindow.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    autoStartUserId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default ChatWindow;
