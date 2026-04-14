import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { ContextProvider, useMembers } from '../Context';

let membersCallCount = 0;

vi.mock('../../supabase/client', () => {
  const chain = (table) => {
    const api = {
      select: () => api,
      eq: async () => {
        if (table === 'members') {
          membersCallCount += 1;
          return {
            data: membersCallCount === 1
              ? [{ id: 1, gym_id: 'gym-1', active: true, phone: 12345678, pay_date: '2026-04-14' }]
              : [],
            error: null,
          };
        }
        if (table === 'trainers') {
          return { data: [], error: null };
        }
        return { data: [], error: null };
      },
      update: () => api,
    };
    return api;
  };

  return {
    supabase: {
      auth: {
        getUser: async () => ({ data: { user: { id: 'gym-1' } }, error: null }),
      },
      from: (table) => chain(table),
    },
  };
});

vi.mock('../../services/accountType', () => ({
  identifyAccountType: async () => ({ type: 'gym', data: { next_payment_date: null, store: true } }),
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn(), warning: vi.fn(), info: vi.fn() },
}));

function Consumer() {
  const { membersList, getMembers } = useMembers();
  return (
    <div>
      <div data-testid="count">{membersList.length}</div>
      <button type="button" onClick={() => getMembers(true)}>
        refresh
      </button>
    </div>
  );
}

describe('Context.getMembers - limpia lista cuando viene vacía', () => {
  beforeEach(() => {
    membersCallCount = 0;
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('deja membersList en [] cuando Supabase devuelve [] tras haber tenido datos', async () => {
    render(
      <MemoryRouter>
        <ContextProvider>
          <Consumer />
        </ContextProvider>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('refresh'));
    await act(async () => {
      vi.runAllTimers();
    });
    expect(screen.getByTestId('count')).toHaveTextContent('1');

    fireEvent.click(screen.getByText('refresh'));
    await act(async () => {
      vi.runAllTimers();
    });
    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });
});

