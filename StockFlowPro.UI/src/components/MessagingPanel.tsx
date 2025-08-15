import React, { useState } from 'react';
import { 
  RotateCcw, 
  MoreHorizontal, 
  Maximize2, 
  X, 
  Bold, 
  Italic, 
  Underline,
  List,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Paperclip,
  Image as ImageIcon,
  Trash2,
  Send
} from 'lucide-react';

interface Message {
  id: string;
  sender: string;
  avatar: string;
  content: string;
  date: string;
  isRead: boolean;
}

const MessagingPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'All' | 'Unread'>('All');
  const [isComposing, setIsComposing] = useState(false);
  const [recipients, setRecipients] = useState<string[]>(['markus@gmail.com', 'molli@gmail.com']);
  const [subject, setSubject] = useState('Meeting with new client');
  const [messageContent, setMessageContent] = useState(`Hey there! 👋

Hey there! Just wanted to check in and see how you're doing. It's been a while since we caught up and I'd love to hear what's new with you. Let's plan a call sometime soon!...

Today we will have a meeting with a client at 10 am. Prepare your selves guys okay! Edward will present it At neque, luctus dictum sit lobortis. Urna pharetra enim, nec et, ridiculus fringilla faucibus id aliquam...

Regard,
Linda M.`);

  const messages: Message[] = [
    {
      id: '1',
      sender: 'Linda',
      avatar: 'L',
      content: "Hey there! Just wanted to check in and see how you're doing. It's been a while since we caught up and I'd love to hear what's new with you. Let's plan a call sometime soon!...",
      date: 'Mar 3',
      isRead: true
    },
    {
      id: '2',
      sender: 'Vic Stewart',
      avatar: 'V',
      content: "What's up, [friend's name]! Did you hear about that new restaurant that just opened up?...",
      date: 'Mar 1',
      isRead: true
    },
    {
      id: '3',
      sender: 'Darrel',
      avatar: 'D',
      content: "Happy birthday. I hope you have an amazing day filled with all your favorite things. Let's celebrate together soon (and don't worry, the first round of drinks is on me 😊)...",
      date: 'Feb 27',
      isRead: true
    },
    {
      id: '4',
      sender: 'Ann Black',
      avatar: 'A',
      content: "Let's celebrate together soon (and don't worry, the first round of drinks is on me 😊)....",
      date: 'Feb 25',
      isRead: true
    }
  ];

  const removeRecipient = (email: string) => {
    setRecipients(prev => prev.filter(r => r !== email));
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 h-full flex flex-col">
      {!isComposing ? (
        <>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setActiveTab('All')}
                className={`text-sm font-medium ${activeTab === 'All' ? 'text-blue-600' : 'text-gray-600'}`}
              >
                All
              </button>
              <button
                onClick={() => setActiveTab('Unread')}
                className={`text-sm font-medium ${activeTab === 'Unread' ? 'text-blue-600' : 'text-gray-600'}`}
              >
                Unread
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-1 hover:bg-gray-100 rounded">
                <RotateCcw className="w-4 h-4 text-gray-600" />
              </button>
              <button className="p-1 hover:bg-gray-100 rounded">
                <MoreHorizontal className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Messages List */}
          <div className="flex-1 overflow-y-auto">
            {messages.map((message) => (
              <div key={message.id} className="flex items-start gap-3 p-4 hover:bg-gray-50 border-b border-gray-100 cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
                  {message.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-semibold text-gray-900 truncate">{message.sender}</h4>
                    <span className="text-xs text-gray-500">{message.date}</span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{message.content}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Compose Button */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={() => setIsComposing(true)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              New Message
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Compose Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">New Message</h3>
            <div className="flex items-center gap-2">
              <button className="p-1 hover:bg-gray-100 rounded">
                <Maximize2 className="w-4 h-4 text-gray-600" />
              </button>
              <button 
                onClick={() => setIsComposing(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Compose Form */}
          <div className="flex-1 flex flex-col">
            {/* Recipients */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-gray-700 min-w-0">Send to</span>
                <div className="flex flex-wrap gap-1 flex-1">
                  {recipients.map((email) => (
                    <span key={email} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                      {email}
                      <button onClick={() => removeRecipient(email)} className="hover:bg-blue-200 rounded">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Subject */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700 min-w-0">Subjects</span>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="flex-1 text-sm font-medium text-gray-900 bg-transparent border-none focus:outline-none"
                  placeholder="Subject"
                />
              </div>
            </div>

            {/* Message Content */}
            <div className="flex-1 flex flex-col p-4">
              <textarea
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                className="flex-1 resize-none border-none focus:outline-none text-sm text-gray-700 leading-relaxed"
                placeholder="Type your message here..."
              />
            </div>

            {/* Formatting Toolbar */}
            <div className="px-4 py-2 border-t border-gray-100">
              <div className="flex items-center gap-1">
                <button className="p-1.5 hover:bg-gray-100 rounded">
                  <Bold className="w-4 h-4 text-gray-600" />
                </button>
                <button className="p-1.5 hover:bg-gray-100 rounded">
                  <Italic className="w-4 h-4 text-gray-600" />
                </button>
                <button className="p-1.5 hover:bg-gray-100 rounded">
                  <Underline className="w-4 h-4 text-gray-600" />
                </button>
                <div className="w-px h-4 bg-gray-300 mx-1"></div>
                <button className="p-1.5 hover:bg-gray-100 rounded">
                  <List className="w-4 h-4 text-gray-600" />
                </button>
                <button className="p-1.5 hover:bg-gray-100 rounded">
                  <AlignLeft className="w-4 h-4 text-gray-600" />
                </button>
                <button className="p-1.5 hover:bg-gray-100 rounded">
                  <AlignCenter className="w-4 h-4 text-gray-600" />
                </button>
                <button className="p-1.5 hover:bg-gray-100 rounded">
                  <AlignRight className="w-4 h-4 text-gray-600" />
                </button>
                <button className="p-1.5 hover:bg-gray-100 rounded">
                  <AlignJustify className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between p-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-100 rounded">
                  <Paperclip className="w-4 h-4 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded">
                  <ImageIcon className="w-4 h-4 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded">
                  <Trash2 className="w-4 h-4 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded">
                  <MoreHorizontal className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center gap-2">
                <Send className="w-4 h-4" />
                Send Message
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MessagingPanel;
