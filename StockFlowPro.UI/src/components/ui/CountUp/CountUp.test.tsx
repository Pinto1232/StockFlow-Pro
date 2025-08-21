import { render, screen } from '@testing-library/react';
import { CountUp } from '.';

describe('CountUp (refactored)', () => {
  it('renders and shows end value when duration=0', () => {
    render(<CountUp end={42} duration={0} />);
    expect(screen.getByTestId('count-up')).toHaveTextContent('42');
  });
});
