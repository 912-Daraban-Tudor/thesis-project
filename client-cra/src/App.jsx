import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './features/Login/LoginPage';
import RegisterPage from './features/Login/RegisterPage';
import MainPage from './features/MainPage/MainPage';
import ProtectedRoute from './components/ProtectedRoute'; 
import AccountPage from './features/Account/AccountPage';
import PostRoomPage from './features/MainPage/PostRoomPage';
import ApartmentPage from './features/MainPage/ApartmentPage';
import MyPostsPage from './features/Account/MyPostsPage';

function App() {
  return (
    <Router>
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
          path="/my-posts" 
          element={
            <ProtectedRoute>
              <MyPostsPage />
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
    </Router>
  );
}

export default App;
