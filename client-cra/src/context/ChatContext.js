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

    // 🔁 Load all conversations
    const loadConversations = useCallback(async () => {
        const res = await axios.get('/api/chats/conversations');
        setConversations(res.data);
    }, []);

    // 💬 Load messages for a specific conversation
    const loadMessages = useCallback(async (conversationId) => {
        const res = await axios.get(`/api/chats/conversations/${conversationId}/messages`);
        setMessages(res.data);
    }, []);

    // 📤 Send message logic
    const sendMessage = useCallback(
        async ({ recipientId, content }) => {
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

                setMessages((prev) => [
                    ...prev.filter((m) => m.id !== tempMessage.id),
                    msg,
                ]);

                socket.emit('new_message', msg); // 📡 notify the server
            } catch (err) {
                console.error('Failed to send message:', err);
            }
        },
        [activeConversation, me]
    );

    // 🔌 Socket connection and listener (attached only once)
    useEffect(() => {
        if (!token) return;

        socket.auth = { token };
        socket.connect();

        const handleNewMessage = async (message) => {
            console.log('📥 Received message via socket:', message);

            await loadConversations();

            setMessages((prev) => {
                // Append only if message is for the open conversation
                if (message.conversation_id === activeConversation?.id) {
                    return [...prev, message];
                }
                return prev;
            });

            setHasUnread(true);
        };

        socket.on('new_message', handleNewMessage);

        return () => {
            socket.off('new_message', handleNewMessage);
            socket.disconnect();
        };
    }, [token, activeConversation?.id, loadConversations]);

    // ✅ Memoized context value
    const contextValue = useMemo(
        () => ({
            conversations,
            activeConversation,
            messages,
            hasUnread,
            setHasUnread,
            setActiveConversation,
            loadConversations,
            loadMessages,
            sendMessage,
        }),
        [
            conversations,
            activeConversation,
            messages,
            hasUnread,
            loadConversations,
            loadMessages,
            sendMessage,
        ]
    );

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
