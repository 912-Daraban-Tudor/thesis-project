import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useMemo,
    useCallback,
} from 'react';
import socket from '../api/socket';
import axios from '../api/axiosInstance';
import PropTypes from 'prop-types';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [hasUnread, setHasUnread] = useState(false);

    // Connect to socket and listen for new messages
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            socket.auth = { token };
            socket.connect();

            socket.on('new_message', (message) => {
                if (message.conversation_id === activeConversation?.id) {
                    setMessages((prev) => [...prev, message]);
                } else {
                    setHasUnread(true);
                }
            });
        }

        return () => {
            socket.disconnect();
            socket.off('new_message');
        };
    }, [activeConversation]);

    // Memoized functions to prevent unnecessary rerenders
    const loadConversations = useCallback(async () => {
        const res = await axios.get('/api/chats/conversations');
        setConversations(res.data);
    }, []);

    const loadMessages = useCallback(async (conversationId) => {
        const res = await axios.get(`/api/chats/conversations/${conversationId}/messages`);
        setMessages(res.data);
    }, []);

    const sendMessage = useCallback(async ({ recipientId, content }) => {
        try {
            const res = await axios.post(`/api/chats/conversations/${recipientId}/messages`, {
                content,
            });

            // Optional: emit new message over WebSocket if you want real-time delivery
            socket.emit('new_message', res.data); // Your backend must listen to this event if needed
        } catch (err) {
            console.error('Failed to send message:', err);
        }
    }, []);


    // Memoize context value
    const contextValue = useMemo(() => ({
        conversations,
        activeConversation,
        messages,
        hasUnread,
        setHasUnread,
        setActiveConversation,
        loadConversations,
        loadMessages,
        sendMessage,
    }), [
        conversations,
        activeConversation,
        messages,
        hasUnread,
        loadConversations,
        loadMessages,
        sendMessage,
    ]);

    return (
        <ChatContext.Provider value={contextValue}>
            {children}
        </ChatContext.Provider>
    );
};
export const useChat = () => useContext(ChatContext);

ChatProvider.propTypes = {
    children: PropTypes.node.isRequired,
};
