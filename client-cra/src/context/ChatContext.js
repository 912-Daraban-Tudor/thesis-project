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
import { jwtDecode } from 'jwt-decode';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [hasUnread, setHasUnread] = useState(false);
    const token = localStorage.getItem('token');
    const me = token ? jwtDecode(token).id : null;
    // Connect to socket and listen for new messages
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            socket.auth = { token };
            socket.connect();

            socket.on('new_message', (message) => {
                console.log('📥 Received message via socket:', message);
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
        const tempMessage = {
            id: `temp-${Date.now()}`,
            conversation_id: activeConversation?.id,
            sender_id: me,
            content,
            created_at: new Date().toISOString(),
        };

        if (activeConversation?.id) {
            setMessages((prev) => [...prev, tempMessage]);
        }

        try {
            const res = await axios.post(`/api/chats/conversations/${recipientId}/messages`, {
                content,
            });

            const msg = res.data;

            // Replace temp message? (optional)
            setMessages((prev) => [
                ...prev.filter((m) => m.id !== tempMessage.id),
                msg,
            ]);

            // Optional: forward via WebSocket too
            socket.emit('new_message', msg);
        } catch (err) {
            console.error('Failed to send message:', err);
            // Optionally: remove temp message or show error
        }
    }, [activeConversation, me]);



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
