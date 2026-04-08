import axios from 'axios';
import { LocalStorage } from '../utils';
import { globalLoading } from '../utils/globalLoading';

/* =======================
   AXIOS INSTANCE
======================= */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URI || 'http://localhost:5002',
  withCredentials: true,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/* =======================
   REQUEST INTERCEPTOR
======================= */
apiClient.interceptors.request.use(
  (config) => {
    globalLoading.start();

    const token = LocalStorage.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Remove Content-Type for FormData to let browser set it
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => {
    globalLoading.stop();
    return Promise.reject(error);
  }
);

/* =======================
   RESPONSE INTERCEPTOR
======================= */
// apiClient.interceptors.response.use(
//   (response) => {
//     globalLoading.stop();
//     return response;
//   },
//   async (error) => {
//     globalLoading.stop();

//     const originalRequest = error.config;

//     // Handle 401 Unauthorized - try to refresh token
//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;

//       try {
//         const refreshResponse = await refreshToken();
//         const { accessToken } = refreshResponse.data.data;

//         if (accessToken) {
//           LocalStorage.set('token', accessToken);
//           apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
//           originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;

//           return apiClient(originalRequest);
//         }
//       } catch (refreshError) {
//         console.error('Token refresh failed:', refreshError);
//         LocalStorage.remove('user');
//         LocalStorage.remove('token');
//         window.location.href = '/login';
//         return Promise.reject(refreshError);
//       }
//     }

//     // For other 401 errors or refresh failed
//     if (error.response?.status === 401) {
//       LocalStorage.remove('user');
//       LocalStorage.remove('token');
//       window.location.href = '/login';
//     }

//     return Promise.reject(error);
//   }
// );

/* =======================
   AUTH APIs
======================= */
export const userRegister = (formData) => {
  return apiClient.post('/user/register-user', formData);
};

export const userLogin = (data) => {
  return apiClient.post('/user/login-user', data);
};

export const userLogout = () => {
  return apiClient.post('/user/logged-out');
};

export const checkAuthStatus = () => {
  return apiClient.get('/status');
}


export const getCurrentUser = () => {
  return apiClient.get('/current-user');
};

export const updateUsername = (username) => {
  return apiClient.patch('/username', { username });
};

export const updateUserFullName = (fullName) => {
  return apiClient.patch('/fullname', { fullName });
};

export const updateUserAvatar = (avatarFile) => {
  const formData = new FormData();
  formData.append('avatar', avatarFile);

  return apiClient.patch('/avatar', formData);
};

export const refreshToken = () => {
  return apiClient.post('/refresh-token');
};

export const forgetPassword = (email) => {
  return apiClient.post('/forget-password', { email });
};

export const resetPassword = (token, newPassword) => {
  return apiClient.post('/reset-password', { token, newPassword });
};

/* =======================
   CHAT APIs
======================= */
export const getAllUser = () => {
  return apiClient.get('/chats/users');
};

export const createUserChat = (receiverId) => {
  return apiClient.post(`/chats/c/${receiverId}`);
};

export const getAllChats = () => {
  return apiClient.get('/chats');
};

export const createGroup = (data) => {
  return apiClient.post('/chats/create-group', data);
};

export const getGroupChatDetails = (chatId) => {
  return apiClient.get(`/chats/group/${chatId}`);
};

export const renameGroupChat = (chatId, name) => {
  return apiClient.patch(`/chats/group/${chatId}`, { name });
};

export const deleteGroupChat = (chatId) => {
  return apiClient.delete(`/chats/delete-group/${chatId}`);
};

export const removeParticipantFromGroup = (chatId, participantId) => {
  return apiClient.post(`/chats/group/${chatId}/${participantId}`);
};

export const leaveGroupChat = (chatId) => {
  return apiClient.delete(`/chats/group/leave/${chatId}`);
};

export const deleteOneOnOneChat = (chatId) => {
  return apiClient.delete(`/chats/remove/${chatId}`);
};

export const blockOneOnOneChat = (chatId) => {
  return apiClient.patch(`/chats/block-chat/${chatId}`)
}

export const unBlockOneOnOneChat = (chatId) => {
  return apiClient.patch(`/chats/un-block-chat/${chatId}`)
}

export const archivedOneOnOneChat = (chatId) => {
  return apiClient.patch(`/chats/archived-chat/${chatId}`)
}

export const unArchivedOneOnOneChat = (chatId) => {
  return apiClient.patch(`/chats/un-archived-chat/${chatId}`)
}



/* =======================
   MESSAGE APIs
======================= */
export const getAllMessages = (chatId) => {
  return apiClient.get(`/messages/${chatId}`);
};

export const sendMessage = (chatId, content) => {
  return apiClient.post(`/messages/${chatId}`, { content });
};

export const deleteMessage = (chatId, messageId) => {
  return apiClient.delete(`/messages/${chatId}/${messageId}`);
};

export const getUsersWithMessage = () => {
  return apiClient.get('/messages/get/users-with-message');
};

/* =======================
   GROUP MANAGEMENT
======================= */
export const addUsersToGroup = (chatId, participantId) => {
  return apiClient.patch(`/chats/add-participant/${chatId}/${participantId}`);
};

export const removeUserFromGroup = (chatId, participantId) => {
  return apiClient.delete(`/chats/group/remove-participant/${chatId}/${participantId}`);
};

export const updateGroupName = (chatId, groupName) => {
  return apiClient.patch(`/chats/rename-group-chat/${chatId}`, { groupName });
};

/* =======================
   SEARCH
======================= */
export const searchAvailableUsers = (query = '') => {
  return apiClient.get(`/chats/users?search=${encodeURIComponent(query)}`);
};

/* =======================
   FILE UPLOAD
======================= */
export const uploadFile = (chatId, file) => {
  const formData = new FormData();
  formData.append('file', file);

  return apiClient.post(`/messages/${chatId}/file`, formData);
};

/* =======================
   USER STATUS
======================= */
export const updateUserStatus = (status) => {
  return apiClient.patch('/user/status', { status });
};

export const getUserStatus = (userId) => {
  return apiClient.get(`/user/status/${userId}`);
};

export const deleteUser = () => {
  return apiClient.delete("/delete-user")
}

export const updateUser = () => {
  return apiClient.patch("/user-update")
}

export const forgetPasswordRequest = (email) => {
  return apiClient.post("/forgot-password", {email})
}

export const resetForgottenPassword = (resetToken,newPassword) => {
   return apiClient.post(`/reset-password/${resetToken}`, {newPassword : newPassword})
}

export const updateUserProfile = (username) => {
  return apiClient.post('/update-username', username)
}
