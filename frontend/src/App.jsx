import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '../src/context/AuthContext'
import ForgetPasswordRequest from './components/auth/ForgetPasswordRequest'
import Login from './components/auth/Login'
import OAuthHandler from './components/auth/OAuthHandler'
import ProtectedRoute from './components/auth/ProtectedRoute'
import PublicRoute from './components/auth/PublicRoute'
import Register from './components/auth/Register'
import ResetForgottenPassword from './components/auth/ResetForgottenPassword'
import Archive from './components/common/Archive'
import Chat from './components/common/Chat'
import Group from './components/common/Group'
import Profile from './components/common/Profile'
import Setting from './components/common/Setting'
import AIAssistanctChat from './components/forms/AIAssistanctChat'
import ChatWithOneOnOne from './components/forms/ChatWithOneOnOne'
import Explore from './components/forms/Explore'
import NewChat from './components/forms/NewChat'
import NewCommunity from './components/forms/NewCommunity'
import NewGroup from './components/forms/NewGroup'
// import UsersManagement from './components/pages/UsersManagement'
import Synapse from './pages/Synapse'

function App() {
  const { token, user } = useAuth()

  return (
    <Routes>

      {/* ROOT */}
      <Route
        path="/"
        element={<Navigate to={token ? '/synapse' : '/login'} replace />}
      />

      {/* PUBLIC */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
           </PublicRoute>
        }
      />

      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
           </PublicRoute>
        }
      />


      {/* <Route path="/oauth/callback" element={<OAuthHandler />} /> */}
      <Route path="/google" element={<OAuthHandler />} />
      <Route path="/github" element={<OAuthHandler />} />


      {/* forget password request */}
      <Route path="/forgot-password-request" element={<ForgetPasswordRequest />} />
      <Route path="/forgot-password/:hashToken" element={<ResetForgottenPassword />} />


      {/* PROTECTED APP */}
      <Route
        path="/synapse"
        element={
          <ProtectedRoute>
            <Synapse />
          </ProtectedRoute>
        }
      >
        {/* Forms */}
        <Route path="new-chat" element={<NewChat />} />
        <Route path="new-group" element={<NewGroup />} />
        <Route path="new-community" element={<NewCommunity />} />
        <Route path="explore" element={<Explore />} />
        <Route path="ai-assistant-chat" element={<AIAssistanctChat />} />

        {/* Chat */}
        <Route path="chat" element={<Chat />}>
          <Route index element={null} />
          <Route path=":receiverId" element={<ChatWithOneOnOne />} />
        </Route>

        {/* Others */}
        <Route path="group" element={<Group />} />
        <Route path="archive" element={<Archive />} />
        <Route path="setting" element={<Setting />} />
        {/* <Route path="users" element={<UsersManagement />} /> */}
        {/* <Route path="users/:userId/edit" element={<UsersManagement />} /> */}
      </Route>

        <Route path="/user/profile" element={<Profile />} />
      {/* 404 */}
      <Route path="*" element={<p>404 NOT FOUND</p>} />

    </Routes>
  )
}

export default App
