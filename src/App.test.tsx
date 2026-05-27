import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('App interaction prototype', () => {
  it('walks from hero selection to monster selection to an encounter', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: /välj hjälte/i })).toBeInTheDocument();

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'riddar-rohan' } });
    fireEvent.click(screen.getByRole('button', { name: /välj monster/i }));

    expect(screen.getByRole('heading', { name: /välj monster/i })).toBeInTheDocument();
    expect(screen.getByText(/hjälte vald: riddar rohan/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /bergstroll/i }));

    expect(screen.getByRole('heading', { name: /riddar rohan/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /bergstroll/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /anfall/i })).toBeInTheDocument();
  });

  it('opens a modal roll prompt after declaring an attack', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /välj monster/i }));
    fireEvent.click(screen.getByRole('button', { name: /svartalv/i }));
    fireEvent.click(screen.getByRole('button', { name: /anfall/i }));

    expect(screen.getByRole('dialog', { name: /anfall/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^8$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /slå i app/i })).toBeInTheDocument();
  });
});
