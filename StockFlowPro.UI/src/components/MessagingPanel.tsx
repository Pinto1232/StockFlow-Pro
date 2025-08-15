import React, { useState, useMemo } from 'react';
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
import { useEmployees, EmployeeDto } from '../hooks/employees';

// Utility functions from EmployeeProfile
function buildFullName(first?: string | null, last?: string | null) {
  return `${first ?? ""} ${last ?? ""}`.trim();
}

function initials(first?: string | null, last?: string | null) {
  const f = (first ?? "").trim();
  const l = (last ?? "").trim();
  const fi = f ? f[0]! : "";
  const li = l ? l[0]! : "";
  return (fi + li || "??").toUpperCase();
}

function resolveImageUrl(url?: string | null, cacheBusting: boolean = false) {
  if (!url) return undefined;
  if (/^https?:\/\//i.test(url)) {
    if (cacheBusting) {
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}t=${Date.now()}`;
    }
    return url;
  }
  const base = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '');
  const origin = base.endsWith('/api') ? base.slice(0, -4) : base;
  if (!origin) return url;
  const fullUrl = url.startsWith('/') ? `${origin}${url}` : `${origin}/${url}`;
  if (cacheBusting) {
    const separator = fullUrl.includes('?') ? '&' : '?';
    return `${fullUrl}${separator}t=${Date.now()}`;
  }
  return fullUrl;
}

function statusToLabel(status: number): string {
  switch (status) {
    case 0: return 'Onboarding';
    case 1: return 'Active';
    case 2: return 'Suspended';
    case 3: return 'Offboarding';
    case 4: return 'Terminated';
    default: return 'Unknown';
  }
}

interface Message {
  id: string;
  employeeId: string; // Reference to actual employee
  content: string;
  date: string;
  isRead: boolean;
}

// Employee Avatar Component
interface EmployeeAvatarProps {
  employee?: {
    firstName?: string;
    lastName?: string;
    imageUrl?: string;
  };
  fallbackAvatar?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const EmployeeAvatar: React.FC<EmployeeAvatarProps> = ({ 
  employee, 
  fallbackAvatar, 
  size = 'md',
  className = '' 
}) => {
  const imageUrl = resolveImageUrl(employee?.imageUrl);
  const displayInitials = employee?.firstName || employee?.lastName 
    ? initials(employee.firstName, employee.lastName)
    : fallbackAvatar;

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base'
  };

  if (imageUrl) {
    return (
      <img 
        src={imageUrl} 
        alt={buildFullName(employee?.firstName, employee?.lastName) || 'Employee'} 
        className={`${sizeClasses[size]} rounded-full object-cover flex-shrink-0 ${className}`}
        onError={(e) => {
          // Fallback to initials if image fails to load
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const fallbackDiv = target.nextElementSibling as HTMLElement;
          if (fallbackDiv) {
            fallbackDiv.style.display = 'flex';
          }
        }}
      />
    );
  }

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white flex items-center justify-center font-semibold flex-shrink-0 ${className}`}>
      {displayInitials}
    </div>
  );
};

const MessagingPanel: React.FC = () => {
  const { data: employees = [] } = useEmployees();
  const [activeTab, setActiveTab] = useState<'All' | 'Unread'>('All');
  const [isComposing, setIsComposing] = useState(false);
  
  // Create a map of employee ID to employee data for quick lookup
  const employeeMap = useMemo(() => {
    const map = new Map<string, EmployeeDto>();
    employees.forEach(emp => map.set(emp.id, emp));
    return map;
  }, [employees]);

  const [recipients, setRecipients] = useState<{email: string; employeeId?: string}[]>([
    {
      email: 'avatar@company.com',
      employeeId: undefined // Will be set when employees load
    },
    {
      email: 'olivia@company.com', 
      employeeId: undefined // Will be set when employees load
    }
  ]);

  const [ccRecipients, setCcRecipients] = useState<{email: string; employeeId?: string}[]>([]);
  const [showCcField, setShowCcField] = useState(false);
  const [ccInput, setCcInput] = useState('');
  const [showCcDropdown, setShowCcDropdown] = useState(false);

  // Update recipients with actual employee IDs when employees data loads
  React.useEffect(() => {
    if (employees.length > 0) {
      setRecipients(prev => prev.map(recipient => ({
        ...recipient,
        employeeId: recipient.email.includes('avatar') 
          ? employees.find(e => e.firstName === 'Avatar')?.id 
          : recipient.email.includes('olivia')
          ? employees.find(e => e.firstName === 'Olivia')?.id
          : recipient.employeeId
      })));
    }
  }, [employees]);
  
  const [subject, setSubject] = useState('Meeting with new client');
  const [messageContent, setMessageContent] = useState(`Hey there! 👋

Hey there! Just wanted to check in and see how you're doing. It's been a while since we caught up and I'd love to hear what's new with you. Let's plan a call sometime soon!...

Today we will have a meeting with a client at 10 am. Prepare your selves guys okay! Edward will present it At neque, luctus dictum sit lobortis. Urna pharetra enim, nec et, ridiculus fringilla faucibus id aliquam...

Regard,
Linda M.`);

  const messages: Message[] = [
    {
      id: '1',
      employeeId: employees.find(e => e.firstName === 'Avatar')?.id || '', // Avatar Active
      content: "Hey there! Just wanted to check in and see how you're doing. It's been a while since we caught up and I'd love to hear what's new with you. Let's plan a call sometime soon!...",
      date: 'Mar 3',
      isRead: true
    },
    {
      id: '2', 
      employeeId: employees.find(e => e.firstName === 'Ju')?.id || '', // Ju Onboard
      content: "What's up, [friend's name]! Did you hear about that new restaurant that just opened up?...",
      date: 'Mar 1',
      isRead: true
    },
    {
      id: '3',
      employeeId: employees.find(e => e.firstName === 'Liam')?.id || '', // Liam Terminated
      content: "Happy birthday. I hope you have an amazing day filled with all your favorite things. Let's celebrate together soon (and don't worry, the first round of drinks is on me 😊)...",
      date: 'Feb 27',
      isRead: true
    },
    {
      id: '4',
      employeeId: employees.find(e => e.firstName === 'Olivia')?.id || '', // Olivia Offboard
      content: "Let's celebrate together soon (and don't worry, the first round of drinks is on me 😊)....",
      date: 'Feb 25',
      isRead: true
    }
  ];

  const removeRecipient = (email: string) => {
    setRecipients(prev => prev.filter(r => r.email !== email));
  };

  // Filter employees for CC based on input and exclude already added recipients/cc
  const filteredCcEmployees = useMemo(() => {
    if (!ccInput.trim()) return [];
    
    const query = ccInput.toLowerCase();
    const existingEmails = new Set([
      ...recipients.map(r => r.email),
      ...ccRecipients.map(r => r.email)
    ]);
    
    return employees.filter(emp => 
      !existingEmails.has(emp.email) &&
      (
        emp.firstName.toLowerCase().includes(query) ||
        emp.lastName.toLowerCase().includes(query) ||
        emp.email.toLowerCase().includes(query) ||
        emp.jobTitle?.toLowerCase().includes(query) ||
        emp.departmentName?.toLowerCase().includes(query)
      )
    ).slice(0, 5); // Limit to 5 results
  }, [ccInput, employees, recipients, ccRecipients]);

  const addCcRecipient = (employee: EmployeeDto) => {
    const newCcRecipient = {
      email: employee.email,
      employeeId: employee.id
    };
    
    setCcRecipients(prev => [...prev, newCcRecipient]);
    
    // Clear input and hide dropdown
    setCcInput('');
    setShowCcDropdown(false);
  };

  const removeCcRecipient = (email: string) => {
    setCcRecipients(prev => prev.filter(r => r.email !== email));
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
            {messages.map((message) => {
              const employee = employeeMap.get(message.employeeId);
              return (
                <div key={message.id} className="flex items-start gap-3 p-4 hover:bg-gray-50 border-b border-gray-100 cursor-pointer">
                  <EmployeeAvatar 
                    employee={employee}
                    fallbackAvatar={employee ? initials(employee.firstName, employee.lastName) : '?'}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex flex-col">
                        <h4 className="text-sm font-semibold text-gray-900 truncate">
                          {employee ? buildFullName(employee.firstName, employee.lastName) : 'Unknown User'}
                        </h4>
                        {employee?.jobTitle && (
                          <span className="text-xs text-gray-500">{employee.jobTitle}</span>
                        )}
                        {employee?.departmentName && (
                          <span className="text-xs text-blue-600">{employee.departmentName}</span>
                        )}
                        {employee?.status !== undefined && (
                          <span className={`text-xs px-2 py-0.5 rounded-full text-center w-fit ${
                            employee.status === 1 ? 'bg-green-100 text-green-800' :
                            employee.status === 0 ? 'bg-blue-100 text-blue-800' :
                            employee.status === 2 ? 'bg-yellow-100 text-yellow-800' :
                            employee.status === 3 ? 'bg-purple-100 text-purple-800' :
                            employee.status === 4 ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {typeof employee.status === 'number' ? statusToLabel(employee.status) : employee.status}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">{message.date}</span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{message.content}</p>
                  </div>
                </div>
              );
            })}
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
          <div className="flex-1 flex flex-col min-h-0">
            {/* Recipients */}
            <div className="p-4 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-gray-700 min-w-0">Send to</span>
                <div className="flex flex-wrap gap-2 flex-1">
                  {recipients.map((recipient) => {
                    const employee = recipient.employeeId ? employeeMap.get(recipient.employeeId) : null;
                    return (
                      <div key={recipient.email} className="inline-flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm">
                        <EmployeeAvatar 
                          employee={employee}
                          fallbackAvatar={employee ? initials(employee.firstName, employee.lastName) : recipient.email[0].toUpperCase()}
                          size="sm"
                        />
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {employee ? buildFullName(employee.firstName, employee.lastName) : recipient.email}
                          </span>
                          {employee?.jobTitle && (
                            <span className="text-xs text-blue-600">{employee.jobTitle}</span>
                          )}
                          {employee?.departmentName && (
                            <span className="text-xs text-blue-600">{employee.departmentName}</span>
                          )}
                        </div>
                        <button onClick={() => removeRecipient(recipient.email)} className="hover:bg-blue-200 rounded p-0.5">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
                {!showCcField && (
                  <button
                    onClick={() => setShowCcField(true)}
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    CC
                  </button>
                )}
              </div>
            </div>

            {/* CC Recipients */}
            {showCcField && (
              <div className="p-4 border-b border-gray-100 transition-all duration-200 ease-in-out flex-shrink-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-gray-700 min-w-0">CC</span>
                  <div className="flex flex-wrap gap-2 flex-1">
                    {ccRecipients.map((recipient) => {
                      const employee = recipient.employeeId ? employeeMap.get(recipient.employeeId) : null;
                      return (
                        <div key={recipient.email} className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-800 rounded-lg text-sm">
                          <EmployeeAvatar 
                            employee={employee}
                            fallbackAvatar={employee ? initials(employee.firstName, employee.lastName) : recipient.email[0].toUpperCase()}
                            size="sm"
                          />
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {employee ? buildFullName(employee.firstName, employee.lastName) : recipient.email}
                            </span>
                            {employee?.jobTitle && (
                              <span className="text-xs text-gray-600">{employee.jobTitle}</span>
                            )}
                            {employee?.departmentName && (
                              <span className="text-xs text-gray-600">{employee.departmentName}</span>
                            )}
                          </div>
                          <button onClick={() => removeCcRecipient(recipient.email)} className="hover:bg-gray-200 rounded p-0.5">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setShowCcField(false)}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Hide CC
                  </button>
                </div>
                
                {/* Add New CC Recipient Input */}
                <div className="relative border-b border-gray-200 pb-1">
                  <input
                    type="text"
                    value={ccInput}
                    onChange={(e) => {
                      setCcInput(e.target.value);
                      setShowCcDropdown(e.target.value.length > 0);
                    }}
                    onFocus={() => setShowCcDropdown(ccInput.length > 0)}
                    onBlur={() => {
                      // Delay hiding dropdown to allow clicking on options
                      setTimeout(() => setShowCcDropdown(false), 200);
                    }}
                    placeholder="Add CC recipient (search by name, email, or department)..."
                    className="w-full px-0 py-2 text-sm border-none outline-none bg-transparent placeholder-gray-400"
                    style={{ boxShadow: 'none', border: 'none' }}
                  />
                  
                  {/* CC Employee Dropdown */}
                  {showCcDropdown && filteredCcEmployees.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                      {filteredCcEmployees.map((employee) => (
                        <div
                          key={employee.id}
                          className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                          onClick={() => addCcRecipient(employee)}
                        >
                          <EmployeeAvatar 
                            employee={employee}
                            size="sm"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-gray-900 truncate">
                                  {buildFullName(employee.firstName, employee.lastName)}
                                </span>
                                <span className="text-xs text-gray-500">{employee.email}</span>
                                {employee.jobTitle && (
                                  <span className="text-xs text-gray-400">{employee.jobTitle}</span>
                                )}
                              </div>
                              <div className="text-right">
                                {employee.departmentName && (
                                  <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                                    {employee.departmentName}
                                  </span>
                                )}
                                {employee.status !== undefined && (
                                  <span className={`text-xs px-2 py-0.5 rounded-full ml-1 ${
                                    employee.status === 1 ? 'bg-green-100 text-green-800' :
                                    employee.status === 0 ? 'bg-blue-100 text-blue-800' :
                                    employee.status === 2 ? 'bg-yellow-100 text-yellow-800' :
                                    employee.status === 3 ? 'bg-purple-100 text-purple-800' :
                                    employee.status === 4 ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {typeof employee.status === 'number' ? statusToLabel(employee.status) : employee.status}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* No CC Results Message */}
                  {showCcDropdown && ccInput.length > 0 && filteredCcEmployees.length === 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-3">
                      <div className="text-sm text-gray-500 text-center">
                        No employees found matching "{ccInput}"
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Subject */}
            <div className="p-4 border-b border-gray-100 flex-shrink-0">
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
            <div className="flex-1 flex flex-col p-4 min-h-0 overflow-hidden">
              <textarea
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                className="flex-1 resize-none border-none focus:outline-none text-sm text-gray-700 leading-relaxed"
                placeholder="Type your message here..."
              />
            </div>

            {/* Formatting Toolbar */}
            <div className="px-4 py-2 border-t border-gray-100 flex-shrink-0">
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
            <div className="flex items-center justify-between p-4 border-t border-gray-200 flex-shrink-0">
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
