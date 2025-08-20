// Utilities for Projects module
export const generateInitials = (fullName: string) => {
  if (!fullName) return 'NA';
  return fullName
    .split(' ')
    .map(name => name.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2);
};

export const getRandomAssigneeColor = () => {
  const colors = [
    'bg-purple-500', 'bg-blue-500', 'bg-green-500',
    'bg-yellow-500', 'bg-pink-500', 'bg-indigo-500',
    'bg-red-500', 'bg-teal-500', 'bg-orange-500'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

export const getRandomColor = () => {
  const colors = [
    'bg-purple-500',
    'bg-blue-500',
    'bg-gray-500',
    'bg-yellow-500',
    'bg-pink-500',
    'bg-green-500',
    'bg-red-500',
    'bg-indigo-500',
    'bg-teal-500'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};
