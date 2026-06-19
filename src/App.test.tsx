import { fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from './App';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('App interaction prototype', () => {
  it('walks from hero selection to monster selection to an encounter', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: /välj hjälte/i })).toBeInTheDocument();

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'riddar-rohan' } });
    fireEvent.click(screen.getByRole('button', { name: /välj monster/i }));

    expect(screen.getByRole('heading', { name: /välj monster/i })).toBeInTheDocument();
    expect(screen.getByText(/hjälte vald: riddar rohan/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /bergstroll/i }));

    const encounter = screen.getByRole('region', { name: /pågående möte/i });
    expect(within(encounter).getByRole('heading', { name: /riddar rohan/i })).toBeInTheDocument();
    expect(within(encounter).getByRole('heading', { name: /bergstroll/i })).toBeInTheDocument();
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

  it('shows a monster crit toggle in the debug section', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /välj monster/i }));
    fireEvent.click(screen.getByRole('button', { name: /skelett/i }));

    const toggle = screen.getByRole('checkbox', { name: /monsterkritar/i });
    expect(toggle).toBeChecked();

    fireEvent.click(toggle);
    expect(toggle).not.toBeChecked();
  });

  it('shows monster action and outcome modals after the hero result is closed', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /välj monster/i }));
    fireEvent.click(screen.getByRole('button', { name: /svartalv/i }));
    fireEvent.click(screen.getByRole('button', { name: /anfall/i }));
    fireEvent.click(screen.getByRole('button', { name: /^1$/i }));
    fireEvent.click(screen.getByRole('button', { name: /bekräfta 1/i }));

    expect(screen.getByRole('dialog', { name: /anfall/i })).toHaveTextContent(/du missar/i);
    fireEvent.click(screen.getByRole('button', { name: /stäng/i }));

    const actionModal = await screen.findByRole('dialog', { name: /monstrets handling/i });
    expect(within(actionModal).getByText(/anfall/i)).toBeInTheDocument();

    fireEvent.click(within(actionModal).getByRole('button', { name: /visa utfall/i }));

    const outcomeModal = await screen.findByRole('dialog', { name: /monstrets anfall/i });
    expect(outcomeModal).toHaveTextContent(/missar/i);
  });
});
