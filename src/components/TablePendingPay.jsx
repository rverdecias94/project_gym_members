import { Grid, MenuItem, TextField, Tooltip, IconButton } from '@mui/material';
import { Button } from "@/components/ui/button";
import { FileText } from 'lucide-react';
import { DataGrid } from '@mui/x-data-grid';
import { useState, useEffect } from 'react';
import { useMembers } from '../context/Context';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import "./css/styles.css"
import ViewDetails from './ViewDetails';
import ContactPageIcon from '@mui/icons-material/ContactPage';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { useTheme } from '@mui/material/styles';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import PaymentModal from './PaymentModal'; // Importar el nuevo modal
import PaymentIcon from '@mui/icons-material/Payment';

// eslint-disable-next-line react/prop-types
export const TablePendingPay = ({ membersPendingPayment = [] }) => {
  const theme = useTheme();
  const { trainersList } = useMembers();
  const hasTrainers = Array.isArray(trainersList) && trainersList.length > 0;
  const [membersPendingOriginal, setMembersPendingOriginal] = useState([]);
  const [membersPending, setMembersPending] = useState([]);
  const [trainer_name, setTrainerName] = useState("");
  const [trainers, setTrainers] = useState([]);
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    if (!hasTrainers) {
      setTrainers([]);
      setTrainerName("");
      return;
    }

    const trainers = [];
    trainers.push({ value: "Todos", label: "Todos" })
    trainers.push({ value: "Sin Entrenador", label: "Sin Entrenador" })
    trainersList.forEach(element => {
      trainers.push({ value: element.name, label: element.name });
    });
    setTrainers(trainers);
  }, [hasTrainers, trainersList])

  useEffect(() => {
    setMembersPendingOriginal(membersPendingPayment);
    setMembersPending(membersPendingPayment);
  }, [membersPendingPayment]);

  useEffect(() => {
    if (trainer_name !== "") {
      let members = [...membersPendingOriginal]
      if (trainer_name !== "Sin Entrenador" && trainer_name !== "Todos") {
        setMembersPending(members.filter(elem => elem.trainer_name === trainer_name));
      } else if (trainer_name === "Sin Entrenador") {
        setMembersPending(members.filter(elem => elem.trainer_name === null));
      } else if (trainer_name === "Todos") {
        setMembersPending(members);
      }
    }
  }, [trainer_name]);

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpenEdit = (client) => {
    setOpen(true);
    setProfile(client);
  };

  const handleOpenPayment = (member) => {
    setSelectedMember(member);
    setPaymentModalOpen(true);
  };

  const handleClosePayment = () => {
    setPaymentModalOpen(false);
    setSelectedMember(null);
  };

  const columns = [
    {
      field: 'details',
      headerName: 'Detalles',
      sortable: false,
      width: 100,
      renderCell: (params) => (
        <Tooltip title="Ver Detalles">
          <ContactPageIcon
            color="primary"
            onClick={() => handleOpenEdit(params?.row)}
            style={{ cursor: 'pointer' }}
          />
        </Tooltip>
      ),
    },
    {
      field: 'payment',
      headerName: 'Pago',
      sortable: false,
      width: 100,
      renderCell: (params) => (
        <Tooltip title="Registrar Pago">
          <IconButton
            color="primary"
            onClick={() => handleOpenPayment(params?.row)}
            size="small"
          >
            <PaymentIcon />
          </IconButton>
        </Tooltip>
      ),
    },
    { field: 'first_name', headerName: 'Nombre', width: 130 },
    { field: 'last_name', headerName: 'Apellidos', width: 130 },
    {
      field: 'phone',
      headerName: 'Teléfono',
      width: 130,
      renderCell: (params) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          {
            params.value !== null ? params.value
              : <strong style={{ fontSize: 20 }}>-</strong>
          }
        </div>
      ),
    },
    { field: 'pay_date', headerName: 'Fecha de Pago', width: 130 },
    {
      field: 'trainer_name',
      headerName: 'Entrenador',
      width: 130,
      renderCell: (params) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          {
            params.value !== null ? params.value
              : <strong style={{ fontSize: 20 }}>-</strong>
          }
        </div>
      ),
    },
    {
      field: 'contact',
      headerName: 'Contacto',
      width: 130,
      renderCell: ({ row }) => (
        <div style={{
          display: "flex",
          alignItems: "center",
          height: "100%",
          justifyContent: "center"
        }}>
          {
            row.phone !== "" &&
            <WhatsAppIcon
              style={{ color: theme.palette.primary.main, cursor: "pointer" }}
              onClick={() => enviarNotificacion(row)}
            />
          }
        </div>
      ),
    },
  ];

  const enviarNotificacion = ({ first_name, last_name, pay_date, phone }) => {
    let nombre = [first_name, last_name].join(" ");
    const phoneNumber = `53${phone}`;
    const message = encodeURIComponent(`Hola ${nombre}, le recordamos que próximamente se cumplirá su fecha de pago (${pay_date}).`);

    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  const handlerChange = (e) => {
    setTrainerName(e?.target?.value)
  }

  const downloadPDF = () => {
    const data = [...membersPending];
    const doc = new jsPDF();
    doc.autoTable({
      head: [columns.filter(col => col.field !== 'payment').map((column) => column.headerName)],
      body: data.map((row) => columns.filter(col => col.field !== 'payment').map((column) => row[column.field])),
    });

    doc.save('Listado de clientes próximos a pagar.pdf');
  }

  return (
    <div className="w-full mb-10">
      <br />
      <div className={cn("flex items-center w-full gap-4", hasTrainers ? "justify-between" : "justify-end")}>
        {hasTrainers && (
          <div className="w-full max-w-[200px]">
            <Select value={trainer_name || "Todos"} onValueChange={(val) => setTrainerName(val)}>
              <SelectTrigger disabled={membersPending.length === 0} className="w-full bg-transparent">
                <SelectValue placeholder="Entrenador" />
              </SelectTrigger>
              <SelectContent>
                {trainers.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Lado derecho: Botón Descargar */}
        <div className="flex-shrink-0">
          <Button
            variant="outline"
            onClick={downloadPDF}
            disabled={membersPending.length === 0}
            className={cn("transition-opacity", membersPending.length === 0 && "opacity-50 cursor-not-allowed")}
          >
            <FileText className="mr-2 h-4 w-4" />
            <span>Descargar</span>
          </Button>
        </div>
      </div>
      <br />
      <div className="bg-card rounded-lg border border-border overflow-hidden pb-10 md:pb-0">
        <DataGrid
          autoHeight
          rows={membersPending}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 5 },
            },
          }}
          pageSizeOptions={[5, 10]}
          sx={{
            border: 'none',
            '& .MuiDataGrid-cell': {
              borderColor: 'hsl(var(--border))',
              color: 'hsl(var(--foreground))',
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: 'hsl(var(--muted))',
              color: 'hsl(var(--muted-foreground))',
              borderBottom: '1px solid hsl(var(--border))',
            },
            '& .MuiDataGrid-footerContainer': {
              borderTop: '1px solid hsl(var(--border))',
              color: 'hsl(var(--foreground))',
            },
            '& .MuiTablePagination-root': {
              color: 'hsl(var(--foreground))',
            },
          }}
        />
      </div>
      <ViewDetails
        handleClose={handleClose}
        open={open}
        profile={profile}
      />
      <PaymentModal
        open={paymentModalOpen}
        handleClose={handleClosePayment}
        member={selectedMember}
      />
    </div>
  );
}
