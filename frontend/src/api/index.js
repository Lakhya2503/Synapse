import axios from 'axios'
import { LocalStorage } from '../utils'
import { globalLoading } from '../utils/globalLoading'

/* =======================
   AXIOS INSTANCE
======================= */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URI,
  withCredentials: true,
  timeout: 120000
})

/* =======================
   REQUEST INTERCEPTOR
======================= */
apiClient.interceptors.request.use(
  (config) => {
    globalLoading.start()

    const token = LocalStorage.get('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    globalLoading.stop()
    return Promise.reject(error)
  }
)

/* =======================
   RESPONSE INTERCEPTOR
======================= */
apiClient.interceptors.response.use(
  (response) => {
    globalLoading.stop()
    return response
  },
  (error) => {
    globalLoading.stop()
    return Promise.reject(error)
  }
)

/* =======================
   AUTH APIs
======================= */
export const userRegister = (data) =>
  apiClient.post('/register', data)

export const userLogin = (data) =>
  apiClient.post('/user/login-user', data)

export const userLogout = () =>
  apiClient.post('/user/logged-out')

export const verificationOTPGenerate = () =>
  apiClient.post('/genrate-otp')

export const verifyEmailWithOTP = (otp) =>
  apiClient.patch('/verify-email-otp', { otp })

/* =======================
   CHAT APIs
======================= */
export const getAllUser = () =>
  apiClient.get('/chats/users')

export const createUserChat = (receiverId) =>
  apiClient.post(`/chats/c/${receiverId}`)

export const getAllChats = () =>
  apiClient.get('/chats')

export const getChatMessages = () =>
  apiClient.get('/chats')

export const createGroup = (data) =>
  apiClient.post('/chats/create-group', data)

export const getGroupChatDetails = (chatId) =>
  apiClient.get(`/chats/group/${chatId}`)

export const renameGroupChat = (chatId, name) =>
  apiClient.patch(`/chats/group/${chatId}`, { name })

export const deleteGroupChat = (chatId) =>
  apiClient.delete(`/chats/group/${chatId}`)

export const removeParticipantFromGroup = (chatId, participantId) =>
  apiClient.post(`/chats/group/${chatId}/${participantId}`)

export const leaveGroupChat = (chatId) =>
  apiClient.delete(`/chats/leave/group/${chatId}`)

export const deleteOneOnOneChat = (chatId) =>
  apiClient.delete(`/chats/remove/${chatId}`)

/* =======================
   MESSAGE APIs
======================= */
export const getAllMessages = (chatId) =>
  apiClient.get(`/messages/${chatId}`)

export const sendMessage = (chatId, content) =>
  apiClient.post(`/messages/${chatId}`, { content })

export const deleteMessage = (chatId, messageId) =>
  apiClient.delete(`/messages/${chatId}/${messageId}`)

export const getUsersWithMessage = () =>
  apiClient.get('/messages/get/users-with-message')

/* =======================
   GROUP HELPERS
======================= */
export const addUsersToGroup = (chatId, participantId) =>
  apiClient.patch(`/chats/add-participant/${chatId}/${participantId}`)

export const removeUserFromGroup = (chatId, participantId) =>
  apiClient.delete(`/chats/group/remove-participant/${chatId}/${participantId}`)

export const updateGroupName = (chatId, groupName) =>
  apiClient.patch(`/chats/rename-group-chat/${chatId}`, { groupName })

/* =======================
   SEARCH
======================= */
export const searchAvailableUsers = (query = '') =>
  apiClient.get(`/chats/users?search=${query}`)
