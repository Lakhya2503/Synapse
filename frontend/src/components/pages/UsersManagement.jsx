// import { Calendar, ChevronLeft, ChevronRight, Edit2, Mail, Search, Shield, Trash2, Users } from 'lucide-react'
// import { useEffect, useState } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { deleteUserByAdmin, getAllUsersApi } from '../../api'
// import { requestHandler } from '../../utils'

// function UsersManagement() {
//   const navigate = useNavigate()

//   const [users, setUsers] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [searchQuery, setSearchQuery] = useState('')
//   const [currentPage, setCurrentPage] = useState(1)
//   const [totalPages, setTotalPages] = useState(1)
//   const [totalUsers, setTotalUsers] = useState(0)
//   const limit = 20

//   const fetchUsers = async () => {
//     setLoading(true)
//     await requestHandler(
//       async () => getAllUsersApi({ page: currentPage, limit, search: searchQuery }),
//       null,
//       (res) => {
//         const data = res?.data?.data || res?.data || {}
//         setUsers(data.users || [])
//         setTotalPages(data.totalPages || 1)
//         setTotalUsers(data.totalUsers || 0)
//         setLoading(false)
//       },
//       () => setLoading(false)
//     )
//   }

//   useEffect(() => {
//     fetchUsers()
//   }, [currentPage, searchQuery])

//   const handleSearch = (e) => {
//     e.preventDefault()
//     setCurrentPage(1)
//     fetchUsers()
//   }

//   const handleDeleteUser = async (userId, username) => {
//     if (!window.confirm(`Are you sure you want to delete ${username}?`)) return

//     await requestHandler(
//       async () => deleteUserByAdmin(userId),
//       null,
//       () => {
//         setUsers(users.filter(u => u._id !== userId))
//         setTotalUsers(totalUsers - 1)
//       }
//     )
//   }

//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric'
//     })
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-purple-50/20">
//       {/* Header */}
//       <div className="bg-white border-b border-gray-200/50 shadow-sm">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-4">
//               <button
//                 onClick={() => navigate(-1)}
//                 className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
//               >
//                 <ChevronLeft className="w-5 h-5 text-gray-600" />
//               </button>
//               <div>
//                 <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
//                   <Users className="w-7 h-7" />
//                   User Management
//                 </h1>
//                 <p className="text-sm text-gray-600 mt-1">
//                   {totalUsers} total users
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Search Bar */}
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//         <form onSubmit={handleSearch} className="mb-6">
//           <div className="relative">
//             <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
//               <Search className="w-5 h-5 text-gray-400" />
//             </div>
//             <input
//               type="text"
//               placeholder="Search by username or email..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-300/50 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
//             />
//           </div>
//         </form>

//         {/* Users Table */}
//         <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
//           {loading ? (
//             <div className="p-12 text-center">
//               <div className="w-16 h-16 mx-auto border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
//               <p className="mt-4 text-gray-600">Loading users...</p>
//             </div>
//           ) : users.length === 0 ? (
//             <div className="p-12 text-center">
//               <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
//               <h3 className="text-lg font-semibold text-gray-700 mb-2">No users found</h3>
//               <p className="text-gray-500">Try adjusting your search criteria</p>
//             </div>
//           ) : (
//             <>
//               {/* Desktop Table */}
//               <div className="hidden md:block overflow-x-auto">
//                 <table className="w-full">
//                   <thead className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
//                     <tr>
//                       <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">User</th>
//                       <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Email</th>
//                       <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
//                       <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Joined</th>
//                       <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-gray-200">
//                     {users.map((user) => (
//                       <tr key={user._id} className="hover:bg-gray-50/50 transition-colors">
//                         <td className="px-6 py-4">
//                           <div className="flex items-center gap-3">
//                             <img
//                               src={user.avatar || '/avatar.jpg'}
//                               alt={user.username}
//                               className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
//                             />
//                             <div>
//                               <p className="font-semibold text-gray-900">{user.username}</p>
//                               {user.isEmailVerified && (
//                                 <span className="inline-flex items-center gap-1 text-xs text-green-600">
//                                   <Shield className="w-3 h-3" />
//                                   Verified
//                                 </span>
//                               )}
//                             </div>
//                           </div>
//                         </td>
//                         <td className="px-6 py-4">
//                           <div className="flex items-center gap-2 text-gray-600">
//                             <Mail className="w-4 h-4" />
//                             {user.email}
//                           </div>
//                         </td>
//                         <td className="px-6 py-4">
//                           <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
//                             user.online
//                               ? 'bg-green-100 text-green-700'
//                               : 'bg-gray-100 text-gray-600'
//                           }`}>
//                             <div className={`w-2 h-2 rounded-full ${user.online ? 'bg-green-500' : 'bg-gray-400'}`} />
//                             {user.online ? 'Online' : 'Offline'}
//                           </span>
//                         </td>
//                         <td className="px-6 py-4 text-gray-600">
//                           <div className="flex items-center gap-2">
//                             <Calendar className="w-4 h-4" />
//                             {formatDate(user.createdAt)}
//                           </div>
//                         </td>
//                         <td className="px-6 py-4">
//                           <div className="flex items-center gap-2">
//                             <button
//                               onClick={() => navigate(`/synapse/users/${user._id}/edit`)}
//                               className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
//                               title="Edit user"
//                             >
//                               <Edit2 className="w-4 h-4" />
//                             </button>
//                             <button
//                               onClick={() => handleDeleteUser(user._id, user.username)}
//                               className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
//                               title="Delete user"
//                             >
//                               <Trash2 className="w-4 h-4" />
//                             </button>
//                           </div>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>

//               {/* Mobile Cards */}
//               <div className="md:hidden divide-y divide-gray-200">
//                 {users.map((user) => (
//                   <div key={user._id} className="p-4 hover:bg-gray-50/50 transition-colors">
//                     <div className="flex items-start justify-between mb-3">
//                       <div className="flex items-center gap-3">
//                         <img
//                           src={user.avatar || '/avatar.jpg'}
//                           alt={user.username}
//                           className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
//                         />
//                         <div>
//                           <p className="font-semibold text-gray-900">{user.username}</p>
//                           <p className="text-sm text-gray-600 flex items-center gap-1">
//                             <Mail className="w-3 h-3" />
//                             {user.email}
//                           </p>
//                         </div>
//                       </div>
//                       <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
//                         user.online
//                           ? 'bg-green-100 text-green-700'
//                           : 'bg-gray-100 text-gray-600'
//                       }`}>
//                         <div className={`w-2 h-2 rounded-full ${user.online ? 'bg-green-500' : 'bg-gray-400'}`} />
//                         {user.online ? 'Online' : 'Offline'}
//                       </span>
//                     </div>
//                     <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
//                       <span className="flex items-center gap-1">
//                         <Calendar className="w-4 h-4" />
//                         {formatDate(user.createdAt)}
//                       </span>
//                       {user.isEmailVerified && (
//                         <span className="text-green-600 flex items-center gap-1">
//                           <Shield className="w-3 h-3" />
//                           Verified
//                         </span>
//                       )}
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <button
//                         onClick={() => navigate(`/synapse/users/${user._id}/edit`)}
//                         className="flex-1 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors font-medium"
//                       >
//                         Edit
//                       </button>
//                       <button
//                         onClick={() => handleDeleteUser(user._id, user.username)}
//                         className="flex-1 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors font-medium"
//                       >
//                         Delete
//                       </button>
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               {/* Pagination */}
//               {totalPages > 1 && (
//                 <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/50">
//                   <div className="flex items-center justify-between">
//                     <p className="text-sm text-gray-600">
//                       Page {currentPage} of {totalPages}
//                     </p>
//                     <div className="flex items-center gap-2">
//                       <button
//                         onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
//                         disabled={currentPage === 1}
//                         className="p-2 hover:bg-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                       >
//                         <ChevronLeft className="w-5 h-5" />
//                       </button>
//                       <button
//                         onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
//                         disabled={currentPage === totalPages}
//                         className="p-2 hover:bg-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                       >
//                         <ChevronRight className="w-5 h-5" />
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }

// export default UsersManagement
