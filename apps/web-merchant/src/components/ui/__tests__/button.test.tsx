import { render, screen } from '@testing-library/react';
import { Button } from '../button';
import { describe, it, expect } from 'vitest';

describe('Button Component', () => {
  it('renders the button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('can be disabled', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button', { name: /disabled/i })).toBeDisabled();
  });
});
