import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MapProvider as MapboxProvider } from 'react-map-gl';
import { useState } from 'react';
import ChatWindow from './components/ChatWindow';
import { ChatUIContext } from './context/ChatUIContext';
import LoginPage from './features/Login/LoginPage';
import RegisterPage from './features/Login/RegisterPage';
import MainPage from './features/MainPage/MainPage';
import AccountPage from './features/Account/AccountPage';
import MyPostsPage from './features/Account/MyPostsPage';
import EditPostPage from './features/Account/EditPostPage';
import PostRoomPage from './features/MainPage/PostRoomPage';
import ApartmentPage from './features/MainPage/ApartmentPage';
import ProtectedRoute from './components/ProtectedRoute';
import { ChatProvider } from './context/ChatContext';
import 'yet-another-react-lightbox/styles.css';

function App() {
  const [chatOpen, setChatOpen] = useState(false);
  const [chatUserId, setChatUserId] = useState(null);

  const openChat = (userId = null) => {
    setChatUserId(userId);
    setChatOpen(true);
  };

  return (
    <Router>
      <MapboxProvider>
        <ChatProvider>
          <ChatUIContext.Provider value={{ openChat, closeChat: () => setChatOpen(false) }}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route
                path="/main"
                element={
                  <ProtectedRoute>
                    <MainPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/account"
                element={
                  <ProtectedRoute>
                    <AccountPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/account/:id"
                element={
                  <ProtectedRoute>
                    <AccountPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-posts"
                element={
                  <ProtectedRoute>
                    <MyPostsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/edit-post/:id"
                element={
                  <ProtectedRoute>
                    <EditPostPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/post"
                element={
                  <ProtectedRoute>
                    <PostRoomPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/apartment/:id"
                element={
                  <ProtectedRoute>
                    <ApartmentPage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
            <ChatWindow
              open={chatOpen}
              onClose={() => setChatOpen(false)}
              autoStartUserId={chatUserId}
            />
          </ChatUIContext.Provider>
        </ChatProvider>
      </MapboxProvider>
    </Router>
  );
}

export default App;
