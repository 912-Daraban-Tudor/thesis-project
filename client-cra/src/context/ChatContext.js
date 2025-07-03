import {
    createContext,
    useContext,
    useState,
    useEffect,
    useMemo,
    useCallback,
    useRef,
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

    const activeConvIdRef = useRef(activeConversation?.id);

    useEffect(() => {
        activeConvIdRef.current = activeConversation?.id;
    }, [activeConversation?.id]);

    const loadConversations = useCallback(async () => {
        const res = await axios.get('/api/chats/conversations');
        setConversations(res.data);
    }, []);

    const loadMessages = useCallback(async (conversationId) => {
        const res = await axios.get(`/api/chats/conversations/${conversationId}/messages`);
        setMessages(res.data);
    }, []);

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
                // Send only via socket
                socket.emit('send_message', { recipientId, content });
            } catch (err) {
                console.error('Failed to send message:', err);
            }
        },
        [activeConversation, me]
    );

    useEffect(() => {
        if (!token) return;

        socket.auth = { token };
        socket.connect();

        const handleNewMessage = async (message) => {
            await loadConversations();

            setMessages((prev) => {
                if (message.conversation_id === activeConvIdRef.current) {
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
    }, [token, loadConversations]);

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
