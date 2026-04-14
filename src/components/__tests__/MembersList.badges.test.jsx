import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';

let membersContextValue;

vi.mock('../../context/Context', () => ({
  useMembers: () => membersContextValue,
}));

vi.mock('../TableMembersList', () => ({
  TableMembersList: () => null,
}));

vi.mock('../MembersInactive', () => ({
  MembersInactive: () => null,
}));

vi.mock('../TablePendingPay', () => ({
  TablePendingPay: () => null,
}));

vi.mock('../TablePagoRetardado', () => ({
  TablePagoRetardado: () => null,
}));

vi.mock('@/components/ui/tabs', () => {
  const Tabs = ({ children }) => <div>{children}</div>;
  const TabsList = ({ children }) => <div>{children}</div>;
  const TabsTrigger = ({ children }) => <button type="button">{children}</button>;
  const TabsContent = ({ children }) => <div>{children}</div>;
  return { Tabs, TabsList, TabsTrigger, TabsContent };
});

vi.mock('@/components/ui/button', () => ({
  Button: (props) => <button {...props} />,
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe('MembersList - badges contadores en tabs', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-14T12:00:00.000Z'));

    const todayStr = new Date('2026-04-14T12:00:00.000Z').toISOString();
    const yesterdayStr = new Date('2026-04-13T12:00:00.000Z').toISOString();

    membersContextValue = {
      membersList: [
        { id: 1, active: true, pay_date: todayStr },
        { id: 2, active: true, pay_date: yesterdayStr },
        { id: 3, active: false, pay_date: todayStr },
      ],
      getMembers: vi.fn().mockResolvedValue(undefined),
      getTrainers: vi.fn().mockResolvedValue(undefined),
    };
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('muestra contadores para Por pagar, Pago atrasado e Inactivos', async () => {
    const { default: MembersList } = await import('../MembersList');
    render(<MembersList />);

    const porPagarBtn = screen.getByText(/Por pagar/i).closest('button');
    const atrasadoBtn = screen.getByText(/Pago atrasado/i).closest('button');
    const inactivosBtn = screen.getByText(/Inactivos/i).closest('button');

    expect(porPagarBtn).toHaveTextContent('2');
    expect(atrasadoBtn).toHaveTextContent('1');
    expect(inactivosBtn).toHaveTextContent('1');
  });
});

