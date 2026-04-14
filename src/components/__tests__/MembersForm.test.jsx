import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MembersForm from '../MembersForm';

let membersContextValue;

vi.mock('../../context/Context', () => ({
  useMembers: () => membersContextValue,
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ state: { from: '/clientes' } }),
  };
});

vi.mock('../ImageUploader', () => ({
  default: ({ image, setImageBase64 }) => {
    return (
      <div>
        <div data-testid="image-uploader">{image ?? ''}</div>
        <button type="button" onClick={() => setImageBase64('MOCK_IMAGE')}>set</button>
      </div>
    );
  },
}));

vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children }) => <div>{children}</div>,
  DialogContent: ({ children }) => <div>{children}</div>,
  DialogHeader: ({ children }) => <div>{children}</div>,
  DialogTitle: ({ children }) => <div>{children}</div>,
  DialogFooter: ({ children }) => <div>{children}</div>,
}));

vi.mock('@/components/ui/button', () => ({
  Button: (props) => <button {...props} />,
}));

vi.mock('@/components/ui/input', () => ({
  Input: (props) => <input {...props} />,
}));

vi.mock('@/components/ui/label', () => ({
  Label: (props) => <label {...props} />,
}));

vi.mock('@/components/ui/checkbox', () => ({
  Checkbox: ({ checked, onCheckedChange, ...props }) => (
    <input
      type="checkbox"
      checked={!!checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      {...props}
    />
  ),
}));

vi.mock('@/components/ui/select', () => ({
  Select: ({ children }) => <div>{children}</div>,
  SelectTrigger: ({ children }) => <div>{children}</div>,
  SelectValue: ({ children }) => <div>{children}</div>,
  SelectContent: ({ children }) => <div>{children}</div>,
  SelectItem: ({ children }) => <div>{children}</div>,
}));

vi.mock('@/components/ui/date-picker', () => ({
  DatePicker: ({ value, onChange, id }) => (
    <input
      id={id}
      data-testid="pay-date"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
    />
  ),
}));

function fillRequiredFields() {
  fireEvent.change(screen.getByLabelText(/Nombre/i), { target: { value: 'Ana' } });
  fireEvent.change(screen.getByLabelText(/Apellidos/i), { target: { value: 'Pérez' } });
  fireEvent.change(screen.getByLabelText(/^CI/i), { target: { value: '12345678901' } });
  fireEvent.change(screen.getByLabelText(/Teléfono/i), { target: { value: '12345678' } });
  fireEvent.change(screen.getByLabelText(/Dirección/i), { target: { value: 'Calle 1' } });
  fireEvent.change(screen.getByTestId('pay-date'), { target: { value: '2026-04-14' } });
}

describe('MembersForm - foto de perfil por tipo de cuenta', () => {
  beforeEach(() => {
    membersContextValue = {
      createNewMember: vi.fn().mockResolvedValue(undefined),
      updateClient: vi.fn().mockResolvedValue(undefined),
      adding: false,
      trainersList: [],
      gymInfo: { store: true },
      getGymInfo: vi.fn().mockResolvedValue(undefined),
    };
  });

  it('muestra la sección de imagen solo en premium', () => {
    render(<MembersForm open={true} handleClose={vi.fn()} />);
    expect(screen.getByTestId('image-uploader')).toBeInTheDocument();
  });

  it('oculta la sección de imagen en standard y fuerza image_profile=null al crear', async () => {
    const handleClose = vi.fn();
    membersContextValue.gymInfo = { store: false };

    render(<MembersForm open={true} handleClose={handleClose} />);

    expect(screen.queryByTestId('image-uploader')).not.toBeInTheDocument();

    fillRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: /Guardar Cliente/i }));

    await waitFor(() => {
      expect(membersContextValue.createNewMember).toHaveBeenCalledTimes(1);
    });

    const payload = membersContextValue.createNewMember.mock.calls[0][0];
    expect(payload.image_profile).toBeNull();
    expect(handleClose).toHaveBeenCalled();
  });

  it('en edición premium muestra la imagen existente', () => {
    const member = {
      id: 1,
      first_name: 'Ana',
      last_name: 'Pérez',
      ci: '12345678901',
      phone: '12345678',
      address: 'Calle 1',
      pay_date: '2026-04-14',
      image_profile: 'SAVED_IMAGE',
      active: true,
    };

    render(<MembersForm open={true} handleClose={vi.fn()} member={member} />);
    expect(screen.getByTestId('image-uploader')).toHaveTextContent('SAVED_IMAGE');
  });

  it('en edición standard no muestra la imagen aunque exista', () => {
    membersContextValue.gymInfo = { store: false };
    const member = {
      id: 1,
      first_name: 'Ana',
      last_name: 'Pérez',
      ci: '12345678901',
      phone: '12345678',
      address: 'Calle 1',
      pay_date: '2026-04-14',
      image_profile: 'SAVED_IMAGE',
      active: true,
    };

    render(<MembersForm open={true} handleClose={vi.fn()} member={member} />);
    expect(screen.queryByTestId('image-uploader')).not.toBeInTheDocument();
  });
});

