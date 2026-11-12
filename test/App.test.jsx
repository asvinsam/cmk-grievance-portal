import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { StatusBadge, PriorityBadge, KPICard } from '../components/ui/index.jsx';
import LoginPage from '../pages/auth/LoginPage.jsx';
import { AuthProvider } from '../context/AuthContext.jsx';

describe('UI Components', () => {
  it('renders StatusBadge with correct status text', () => {
    render(<StatusBadge status="Resolved" />);
    expect(screen.getByText('Resolved')).toBeInTheDocument();
  });

  it('renders PriorityBadge with priority text', () => {
    render(<PriorityBadge priority="High" />);
    expect(screen.getByText('High')).toBeInTheDocument();
  });

  it('renders KPICard with title and formatted value', () => {
    render(<KPICard title="Total Grievances" value={1250} />);
    expect(screen.getByText('Total Grievances')).toBeInTheDocument();
    expect(screen.getByText('1,250')).toBeInTheDocument();
  });

  it('renders LoginPage with demo credentials and sign in button', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </MemoryRouter>
    );
    expect(screen.getByText('Portal Login')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
    expect(screen.getByText('citizen.demo@example.com')).toBeInTheDocument();
  });
});
