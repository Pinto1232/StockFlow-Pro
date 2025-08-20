
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CustomAnimatedDropdown from '../components/CustomAnimatedDropdown';

describe('CustomAnimatedDropdown', () => {
  const employees = [
    { id: '1', fullName: 'Alice Smith', jobTitle: 'Developer' },
    { id: '2', fullName: 'Bob Jones', jobTitle: 'Designer' },
  ];

  it('displays employee full name and ID in dropdown', () => {
    render(
      <CustomAnimatedDropdown
        employees={employees}
        onSelect={() => {}}
        disabled={false}
        assignedIds={[]}
      />
    );
    // Open dropdown
    fireEvent.click(screen.getByRole('button'));
    // Check for full name and ID
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByText('ID: 1')).toBeInTheDocument();
    expect(screen.getByText('Bob Jones')).toBeInTheDocument();
    expect(screen.getByText('ID: 2')).toBeInTheDocument();
  });
});
