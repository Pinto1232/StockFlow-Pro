# Toast Component System

A comprehensive, reusable, and highly customizable toast notification system for React applications. Built with TypeScript, Tailwind CSS, and modern React patterns.

## Features

✨ **Multiple Toast Types**: Success, Error, Warning, Info, Notification, Loading, and Custom toasts  
🎨 **Highly Customizable**: Custom colors, icons, positions, animations, and styling  
⚡ **Easy to Use**: Simple hook-based API with intuitive methods  
🔄 **Auto-dismiss**: Configurable duration with progress indicators  
📱 **Responsive**: Works perfectly on all screen sizes  
🎯 **Multiple Positions**: 6 different positioning options  
🎭 **Rich Animations**: 6 different animation types  
⚙️ **Action Buttons**: Add interactive buttons to toasts  
🎛️ **Persistent Toasts**: Option to keep toasts visible until manually closed  
🚀 **Performance Optimized**: Efficient rendering and memory management  

## Installation

The toast system is already included in your project. Simply import the components:

```tsx
import { ToastProvider, useToast } from '@/components/ui';
```

## Quick Start

### 1. Wrap your app with ToastProvider

```tsx
import { ToastProvider } from '@/components/ui';

function App() {
  return (
    <ToastProvider>
      <YourAppContent />
    </ToastProvider>
  );
}
```

### 2. Use the toast hook in your components

```tsx
import { useToast } from '@/hooks/useToast';

function MyComponent() {
  const { toast } = useToast();

  const handleClick = () => {
    toast.success('Operation completed successfully!');
  };

  return <button onClick={handleClick}>Show Toast</button>;
}
```

## API Reference

### useToast Hook

The `useToast` hook provides the following methods:

#### Basic Toast Types

```tsx
const { toast } = useToast();

// Success toast
toast.success('Message here', options);

// Error toast
toast.error('Error message', options);

// Warning toast
toast.warning('Warning message', options);

// Info toast
toast.info('Info message', options);

// Notification toast
toast.notification('Notification message', options);

// Loading toast (persistent by default)
toast.loading('Loading message', options);

// Custom toast
toast.custom({ 
  message: 'Custom message',
  type: 'custom',
  customIcon: <Icon />,
  customColor: { background: '#...', text: '#...', accent: '#...' }
});
```

#### Advanced Methods

```tsx
const { showToast, hideToast, hideAllToasts, updateToast } = useToast();

// Show any toast type
const toastId = showToast({
  message: 'Custom toast',
  type: 'success',
  // ... other options
});

// Hide specific toast
hideToast(toastId);

// Hide all toasts
hideAllToasts();

// Update existing toast
updateToast(toastId, {
  message: 'Updated message',
  type: 'error'
});
```

### Toast Options

All toast methods accept an optional second parameter with these options:

```tsx
interface ToastOptions {
  // Display options
  title?: string;                    // Toast title
  duration?: number;                 // Auto-dismiss time in ms (0 = no auto-dismiss)
  position?: ToastPosition;          // Where to show the toast
  animation?: ToastAnimation;        // Animation type
  
  // Visual options
  showProgress?: boolean;            // Show progress bar
  showIcon?: boolean;               // Show type icon
  closable?: boolean;               // Show close button
  persistent?: boolean;             // Prevent auto-dismiss
  
  // Customization
  customIcon?: React.ReactNode;     // Custom icon component
  customColor?: {                   // Custom color scheme
    background: string;
    text: string;
    accent: string;
  };
  className?: string;               // Additional CSS classes
  
  // Interactions
  onClick?: () => void;             // Click handler
  actions?: ToastAction[];          // Action buttons
}
```

### Toast Positions

```tsx
type ToastPosition = 
  | 'top-left' 
  | 'top-center' 
  | 'top-right'
  | 'bottom-left' 
  | 'bottom-center' 
  | 'bottom-right';
```

### Toast Animations

```tsx
type ToastAnimation = 
  | 'slide-in'     // Slides from the side
  | 'fade-in'      // Fades in
  | 'bounce-in'    // Bounces in
  | 'zoom-in'      // Zooms in
  | 'slide-up'     // Slides up from bottom
  | 'slide-down';  // Slides down from top
```

### Action Buttons

Add interactive buttons to your toasts:

```tsx
toast.error('Something went wrong!', {
  actions: [
    {
      label: 'Retry',
      onClick: () => retryOperation(),
      variant: 'primary'  // 'primary' | 'secondary' | 'danger'
    },
    {
      label: 'Report',
      onClick: () => reportIssue(),
      variant: 'secondary'
    }
  ]
});
```

## Examples

### Basic Usage

```tsx
// Simple success message
toast.success('File uploaded successfully!');

// Error with title and longer duration
toast.error('Upload failed', {
  title: 'Error',
  duration: 8000
});

// Warning with custom position
toast.warning('This action cannot be undone', {
  position: 'top-center',
  persistent: true
});
```

### Advanced Usage

```tsx
// Loading toast that updates
const loadingId = toast.loading('Processing request...');

setTimeout(() => {
  hideToast(loadingId);
  toast.success('Request completed!');
}, 3000);

// Custom toast with actions
toast.custom({
  title: 'New Message',
  message: 'You have received a new message from John',
  type: 'notification',
  position: 'top-right',
  animation: 'slide-down',
  actions: [
    {
      label: 'View',
      onClick: () => openMessage(),
      variant: 'primary'
    },
    {
      label: 'Mark as Read',
      onClick: () => markAsRead(),
      variant: 'secondary'
    }
  ]
});

// Fully custom toast
toast.custom({
  title: 'Special Offer!',
  message: 'Get 50% off on your next purchase',
  type: 'custom',
  customIcon: <Star className="h-5 w-5 text-yellow-400" />,
  customColor: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    text: '#ffffff',
    accent: '#fbbf24'
  },
  position: 'bottom-center',
  animation: 'bounce-in',
  duration: 10000,
  actions: [
    {
      label: 'Claim Offer',
      onClick: () => claimOffer(),
      variant: 'primary'
    }
  ]
});
```

### Provider Configuration

Customize the default behavior:

```tsx
<ToastProvider
  maxToasts={5}                    // Maximum toasts to show
  defaultPosition="bottom-right"   // Default position
  defaultAnimation="slide-in"      // Default animation
  gutter={12}                     // Space between toasts
>
  <App />
</ToastProvider>
```

## Best Practices

### 1. **Appropriate Toast Types**
- Use `success` for completed actions
- Use `error` for failures that need attention
- Use `warning` for important notices
- Use `info` for general information
- Use `notification` for updates and alerts
- Use `loading` for ongoing processes

### 2. **Message Guidelines**
- Keep messages concise and clear
- Use action-oriented language
- Provide context when necessary
- Include recovery actions for errors

### 3. **Timing and Persistence**
- Use appropriate durations (3-7 seconds for most cases)
- Make important messages persistent
- Use shorter durations for success messages
- Use longer durations for error messages

### 4. **Positioning**
- Use `top` positions for urgent notifications
- Use `bottom` positions for status updates
- Use `center` positions for important announcements
- Consider your app's layout and user flow

### 5. **Actions**
- Limit to 2-3 actions maximum
- Use clear, action-oriented labels
- Provide meaningful interactions
- Consider the visual hierarchy

## Styling and Theming

The toast system uses Tailwind CSS classes and supports full customization:

### Custom Colors

```tsx
toast.custom({
  message: 'Custom styled toast',
  customColor: {
    background: '#your-bg-color',
    text: '#your-text-color',
    accent: '#your-accent-color'
  }
});
```

### Custom CSS Classes

```tsx
toast.success('Message', {
  className: 'your-custom-classes'
});
```

### Dark Mode Support

The toast system automatically adapts to your app's color scheme and supports dark mode through Tailwind's dark mode utilities.

## TypeScript Support

The toast system is fully typed with TypeScript, providing excellent IntelliSense and type safety:

```tsx
import type { ToastProps, ToastType, ToastPosition } from '@/components/ui';
```

## Accessibility

The toast system follows accessibility best practices:

- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast support
- Focus management

## Performance

The toast system is optimized for performance:

- Efficient re-rendering with React.memo
- Proper cleanup of timers and animations
- Memory leak prevention
- Minimal bundle impact

## Browser Support

- Chrome/Chromium (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

To contribute to the toast system:

1. Follow the existing code style
2. Add proper TypeScript types
3. Include comprehensive tests
4. Update documentation
5. Test accessibility features

## License

This component is part of the StockFlow-Pro project and follows the project's licensing terms.
