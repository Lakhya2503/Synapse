import { Archive as Arc, Clock, Download, Trash2 } from 'lucide-react';

const Archive = () => {
  const archivedChats = [
    { id: 1, name: 'Franz Kafka', lastMessage: 'Are you interested in insecticides for...', archivedDate: '2 days ago', unread: 2 },
    { id: 2, name: 'Tom Hardy', lastMessage: 'Smells like design spirit...', archivedDate: '1 week ago', unread: 0 },
    { id: 3, name: 'Vivienne Westwood', lastMessage: 'This cat is so funny', archivedDate: '2 weeks ago', unread: 5 },
    { id: 4, name: 'Anthony Paul', lastMessage: 'Check out my page', archivedDate: '1 month ago', unread: 0 },
  ];

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Archived Messages</h1>
            <p className="text-gray-600">Messages you've archived for later</p>
          </div>
          <button className="bg-gradient-to-r from-purple-600 to-blue-500 text-white px-4 py-2 rounded-lg hover:opacity-90">
            <Download size={18} className="inline mr-2" />
            Export Archive
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
            <div className="flex items-center space-x-2 text-purple-600">
              <Arc size={20} />
              <span className="font-semibold">{archivedChats.length} archived conversations</span>
            </div>
          </div>

          {archivedChats.map(chat => (
            <div key={chat.id} className="p-4 border-b border-gray-100 hover:bg-gray-50 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {chat.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{chat.name}</h4>
                  <p className="text-sm text-gray-600 truncate max-w-md">{chat.lastMessage}</p>
                  <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                    <Clock size={12} />
                    <span>Archived {chat.archivedDate}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {chat.unread > 0 && (
                  <span className="bg-gradient-to-r from-purple-600 to-blue-500 text-white text-xs px-2 py-1 rounded-full">
                    {chat.unread} new
                  </span>
                )}
                <button className="text-gray-400 hover:text-red-500 p-2">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Archive;
