import React, { useState, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

interface DropdownItem {
  id: string;
  label: string;
  value: unknown;
  icon?: ReactNode;
  description?: string;
  shortcut?: string;
  isAdmin?: boolean;
  isDivider?: boolean;
  onClick?: () => void;
}

interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  className?: string;
  dropdownClassName?: string;
  placement?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  onItemSelect?: (item: DropdownItem) => void;
  disabled?: boolean;
  showChevron?: boolean;
}

const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  className = '',
  dropdownClassName = '',
  placement = 'bottom-right',
  onItemSelect,
  disabled = false,
  showChevron = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      const menuItems = dropdownRef.current?.querySelectorAll('[role="menuitem"]:not([disabled])');
      if (!menuItems) return;

      const currentIndex = Array.from(menuItems).findIndex(item => item === document.activeElement);

      switch (event.key) {
        case 'ArrowDown': {
          event.preventDefault();
          const nextIndex = currentIndex < menuItems.length - 1 ? currentIndex + 1 : 0;
          (menuItems[nextIndex] as HTMLElement).focus();
          break;
        }
        case 'ArrowUp': {
          event.preventDefault();
          const prevIndex = currentIndex > 0 ? currentIndex - 1 : menuItems.length - 1;
          (menuItems[prevIndex] as HTMLElement).focus();
          break;
        }
        case 'Escape':
          event.preventDefault();
          setIsOpen(false);
          triggerRef.current?.focus();
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          if (document.activeElement) {
            (document.activeElement as HTMLElement).click();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleTriggerClick = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleItemClick = (item: DropdownItem) => {
    if (item.isDivider) return;
    
    setIsOpen(false);
    if (item.onClick) {
      item.onClick();
    }
    if (onItemSelect) {
      onItemSelect(item);
    }
  };

  const getPlacementClasses = () => {
    switch (placement) {
      case 'bottom-left':
        return 'top-full left-0 mt-2';
      case 'bottom-right':
        return 'top-full right-0 mt-2';
      case 'top-left':
        return 'bottom-full left-0 mb-2';
      case 'top-right':
        return 'bottom-full right-0 mb-2';
      default:
        return 'top-full right-0 mt-2';
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        onClick={handleTriggerClick}
        disabled={disabled}
        className={`
          modern-dropdown-trigger
          flex items-center gap-3 px-4 py-2 
          bg-white border-2 border-gray-200 rounded-xl
          hover:border-primary-500 hover:bg-gray-50
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
          transition-all duration-300 ease-in-out
          disabled:opacity-50 disabled:cursor-not-allowed
          ${isOpen ? 'border-primary-500 bg-gray-50 shadow-lg' : ''}
        `}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {trigger}
        {showChevron && (
          <ChevronDown 
            className={`h-4 w-4 text-gray-400 transition-transform duration-300 ${
              isOpen ? 'rotate-180' : ''
            }`} 
          />
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`
            modern-dropdown-menu
            absolute ${getPlacementClasses()}
            min-w-80 bg-white rounded-xl shadow-2xl border border-gray-200
            py-2 overflow-hidden
            animate-dropdown-fade-in
            ${dropdownClassName}
          `}
          style={{
            boxShadow: '0 12px 40px rgba(90, 92, 219, 0.15), 0 4px 16px rgba(0, 0, 0, 0.05)',
            backdropFilter: 'blur(10px)',
            zIndex: 9999,
            position: 'absolute',
          }}
        >
          {items.map((item, index) => {
            if (item.isDivider) {
              return (
                <hr 
                  key={`divider-${index}`} 
                  className="my-2 border-gray-200 opacity-50" 
                />
              );
            }

            return (
              <button
                key={item.id}
                role="menuitem"
                onClick={() => handleItemClick(item)}
                className={`
                  modern-dropdown-item
                  w-full flex items-center gap-4 px-4 py-3 text-left
                  text-gray-700 hover:bg-gray-50 hover:text-primary-600
                  focus:outline-none focus:bg-gray-50 focus:text-primary-600
                  transition-all duration-200 ease-in-out
                  hover:transform hover:translate-x-1
                  ${item.isAdmin ? 'border-l-4 border-l-yellow-400' : ''}
                `}
              >
                {/* Icon */}
                {item.icon && (
                  <div className={`
                    flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg
                    transition-all duration-200 ease-in-out
                    ${item.isAdmin 
                      ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' 
                      : 'bg-gray-100 text-gray-600 hover:bg-primary-100 hover:text-primary-600'
                    }
                  `}>
                    {item.icon}
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm leading-tight">
                    {item.label}
                  </p>
                  {item.description && (
                    <p className="text-xs text-gray-500 mt-0.5 leading-tight">
                      {item.description}
                    </p>
                  )}
                </div>

                {/* Shortcut */}
                {item.shortcut && (
                  <kbd className="
                    hidden md:inline-block px-2 py-1 text-xs font-mono 
                    bg-gray-100 text-gray-600 rounded border
                    shadow-sm
                  ">
                    {item.shortcut}
                  </kbd>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dropdown;