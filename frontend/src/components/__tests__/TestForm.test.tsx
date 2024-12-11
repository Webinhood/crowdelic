import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../test-utils';
import TestForm from '../TestForm';

const mockOnSubmit = jest.fn();

const defaultProps = {
  onSubmit: mockOnSubmit,
  submitLabel: 'Create Test',
};

describe('TestForm', () => {
  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('renders all form fields', () => {
    render(<TestForm {...defaultProps} />);

    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/objective/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create test/i })).toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    render(<TestForm {...defaultProps} />);

    await userEvent.type(screen.getByLabelText(/title/i), 'Test Title');
    await userEvent.type(screen.getByLabelText(/description/i), 'Test Description');
    await userEvent.type(screen.getByLabelText(/objective/i), 'Test Objective');

    await userEvent.click(screen.getByRole('button', { name: /create test/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'Test Title',
        description: 'Test Description',
        objective: 'Test Objective',
      });
    });
  });

  it('shows validation errors for empty fields', async () => {
    render(<TestForm {...defaultProps} />);

    await userEvent.click(screen.getByRole('button', { name: /create test/i }));

    expect(await screen.findByText(/title is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/description is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/objective is required/i)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('pre-fills form with initial values', () => {
    const initialValues = {
      title: 'Initial Title',
      description: 'Initial Description',
      objective: 'Initial Objective',
    };

    render(<TestForm {...defaultProps} initialValues={initialValues} />);

    expect(screen.getByLabelText(/title/i)).toHaveValue('Initial Title');
    expect(screen.getByLabelText(/description/i)).toHaveValue('Initial Description');
    expect(screen.getByLabelText(/objective/i)).toHaveValue('Initial Objective');
  });
});
