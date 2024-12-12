import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import TestResponses from '../TestResponses';
import { TestMessage } from '../../types/test';
import { Persona } from '../../types/persona';

// Mock useTranslation hook
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('TestResponses', () => {
  const mockPersonas: Persona[] = [
    {
      id: '1',
      name: 'Persona 1',
      occupation: 'Developer',
      avatar: 'avatar1.jpg',
    },
    {
      id: '2',
      name: 'Persona 2',
      occupation: 'Designer',
      avatar: 'avatar2.jpg',
    },
  ];

  const mockMessages: TestMessage[] = [
    {
      id: '1',
      personaId: '1',
      content: 'Message from persona 1',
      timestamp: new Date().toISOString(),
    },
    {
      id: '2',
      personaId: '2',
      content: 'Message from persona 2',
      timestamp: new Date().toISOString(),
    },
  ];

  const mockPersonaStatus = [
    {
      personaId: '1',
      status: 'completed' as const,
    },
    {
      personaId: '2',
      status: 'running' as const,
    },
  ];

  const renderComponent = (props = {}) => {
    return render(
      <ChakraProvider>
        <TestResponses
          messages={mockMessages}
          personas={mockPersonas}
          personaStatus={mockPersonaStatus}
          isRunning={true}
          {...props}
        />
      </ChakraProvider>
    );
  };

  it('renders all personas as tabs', () => {
    renderComponent();
    mockPersonas.forEach(persona => {
      expect(screen.getByText(persona.name)).toBeInTheDocument();
    });
  });

  it('shows progress bar when test is running', () => {
    renderComponent();
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
  });

  it('hides progress bar when test is not running', () => {
    renderComponent({ isRunning: false });
    const progressBar = screen.queryByRole('progressbar');
    expect(progressBar).not.toBeInTheDocument();
  });

  it('displays correct status badges for each persona', () => {
    renderComponent();
    expect(screen.getByText('test.status.completed')).toBeInTheDocument();
    expect(screen.getByText('test.status.running')).toBeInTheDocument();
  });

  it('shows messages for the selected persona', () => {
    renderComponent();
    // First persona's messages should be visible by default
    expect(screen.getByText('Message from persona 1')).toBeInTheDocument();
    
    // Click on second persona's tab
    fireEvent.click(screen.getByText('Persona 2'));
    expect(screen.getByText('Message from persona 2')).toBeInTheDocument();
  });

  it('shows thinking message for running personas', () => {
    renderComponent();
    // Click on second persona's tab (which has 'running' status)
    fireEvent.click(screen.getByText('Persona 2'));
    expect(screen.getByTestId('thinking-message')).toBeInTheDocument();
  });

  it('shows error message when persona status is error', () => {
    const errorStatus = [
      {
        personaId: '1',
        status: 'error' as const,
        error: 'Test error message',
      },
    ];
    
    renderComponent({ personaStatus: errorStatus });
    expect(screen.getByText('test.messages.error')).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });
});
