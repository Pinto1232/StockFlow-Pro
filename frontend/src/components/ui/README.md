# Dropdown Component

A modern, accessible dropdown component that matches the design system used in the Razor pages. This component provides consistent styling and behavior across the React frontend.

## Features

- **Consistent Design**: Matches the exact styling from the Razor pages dropdown components
- **Accessibility**: Full keyboard navigation and ARIA support
- **Responsive**: Mobile-friendly with responsive breakpoints
- **Customizable**: Multiple styling variants for different use cases
- **TypeScript**: Full TypeScript support with proper type definitions

## Basic Usage

```tsx
import Dropdown from '../ui/Dropdown';
import { Calendar } from 'lucide-react';

const MyComponent = () => {
  const items = [
    {
      id: 'option1',
      label: 'Option 1',
      value: 'option1',
      description: 'Description for option 1',
      onClick: () => console.log('Option 1 selected'),
    },
    {
      id: 'option2',
      label: 'Option 2',
      value: 'option2',
      description: 'Description for option 2',
      onClick: () => console.log('Option 2 selected'),
    },
  ];

  return (
    <Dropdown
      trigger={
        <>
          <Calendar className="h-4 w-4" />
          <span>Select Date Range</span>
        </>
      }
      items={items}
      onItemSelect={(item) => console.log('Selected:', item)}
    />
  );
};
```

## Props

### DropdownProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `trigger` | `ReactNode` | - | The content to display in the trigger button |
| `items` | `DropdownItem[]` | - | Array of dropdown items |
| `className` | `string` | `''` | Additional CSS classes for the container |
| `dropdownClassName` | `string` | `''` | Additional CSS classes for the dropdown menu |
| `placement` | `'bottom-left' \| 'bottom-right' \| 'top-left' \| 'top-right'` | `'bottom-right'` | Dropdown menu placement |
| `onItemSelect` | `(item: DropdownItem) => void` | - | Callback when an item is selected |
| `disabled` | `boolean` | `false` | Whether the dropdown is disabled |
| `showChevron` | `boolean` | `true` | Whether to show the chevron icon |

### DropdownItem

| Property | Type | Description |
|----------|------|-------------|
| `id` | `string` | Unique identifier for the item |
| `label` | `string` | Display text for the item |
| `value` | `any` | Value associated with the item |
| `icon` | `ReactNode` | Optional icon to display |
| `description` | `string` | Optional description text |
| `shortcut` | `string` | Optional keyboard shortcut display |
| `isAdmin` | `boolean` | Whether this is an admin-only item (special styling) |
| `isDivider` | `boolean` | Whether this item is a divider |
| `onClick` | `() => void` | Callback when the item is clicked |

## Styling Variants

The dropdown component supports different styling variants through CSS classes:

### Date Range Picker
```tsx
<div className="date-range-picker">
  <Dropdown ... />
</div>
```

### Download Button
```tsx
<div className="btn-group">
  <Dropdown ... />
</div>
```

### Filter Options
```tsx
<div className="filter-options">
  <Dropdown ... />
</div>
```

### User Menu
```tsx
<div className="user-dropdown">
  <Dropdown ... />
</div>
```

## Keyboard Navigation

- **Arrow Down/Up**: Navigate through menu items
- **Enter/Space**: Select the focused item
- **Escape**: Close the dropdown and return focus to trigger

## Accessibility Features

- ARIA attributes for screen readers
- Keyboard navigation support
- Focus management
- Proper role and state announcements

## Styling Classes

The component uses the following CSS classes that can be customized:

- `.modern-dropdown-trigger`: The trigger button
- `.modern-dropdown-menu`: The dropdown menu container
- `.modern-dropdown-item`: Individual menu items
- `.modern-dropdown-divider`: Divider lines
- `.user-dropdown-trigger`: User-specific trigger styling
- `.user-dropdown-menu`: User-specific menu styling
- `.user-menu-item`: User menu items

## Examples

See `DropdownExamples.tsx` for comprehensive examples of different dropdown variants and use cases.

## Design System Integration

This component is designed to match the exact styling and behavior of the dropdown components used in the Razor pages, including:

- Color scheme matching the primary brand colors (#5a5cdb)
- Shadow and border radius consistency
- Animation timing and easing
- Responsive breakpoints
- Typography and spacing

## Browser Support

- Modern browsers with ES6+ support
- Mobile browsers (iOS Safari, Chrome Mobile)
- Responsive design for all screen sizes