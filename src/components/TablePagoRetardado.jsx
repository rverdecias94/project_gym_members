import { Button, Grid, MenuItem, TextField, Tooltip, IconButton } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useState, useEffect } from 'react';
import { useMembers } from '../context/Context';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import "./css/styles.css"
import ViewDetails from './ViewDetails';
import ContactPageIcon from '@mui/icons-material/ContactPage';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { useTheme } from '@mui/material/styles';
import PaymentModal from './PaymentModal'; // Importar el nuevo modal
import PaymentIcon from '@mui/icons-material/Payment';

// eslint-disable-next-line react/prop-types
export const TablePagoRetardado = ({ membersPaymentDelayed = [] }) => {
  const theme = useTheme();
  const { trainersList } = useMembers();
  const [membersPendingOriginal, setMembersPendingOriginal] = useState([]);
  const [membersDelayed, setMembersDelayed] = useState([]);
  const [trainer_name, setTrainerName] = useState("");
  const [trainers, setTrainers] = useState([]);
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    if (trainersList?.length > 0) {
      const trainers = [];
      trainers.push({ value: "Todos", label: "Todos" })
      trainers.push({ value: "Sin Entrenador", label: "Sin Entrenador" })
      trainersList.forEach(element => {
        trainers.push({ value: element.name, label: element.name });
      });
      setTrainers(trainers);
    }
  }, [trainersList])

  useEffect(() => {
    setMembersPendingOriginal(membersPaymentDelayed);
    setMembersDelayed(membersPaymentDelayed);
  }, [membersPaymentDelayed]);

  useEffect(() => {
    if (trainer_name !== "") {
      let members = [...membersPendingOriginal]
      if (trainer_name !== "Sin Entrenador" && trainer_name !== "Todos") {
        setMembersDelayed(members.filter(elem => elem.trainer_name === trainer_name));
      } else if (trainer_name === "Sin Entrenador") {
        setMembersDelayed(members.filter(elem => elem.trainer_name === null));
      } else if (trainer_name === "Todos") {
        setMembersDelayed(members);
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
    {
      field: 'payment',
      headerName: 'Pago',
      sortable: false,
      width: 100,
      renderCell: (params) => (
        <Tooltip title="Registrar Pago" placement='top'>
          <IconButton
            sx={{ color: "green" }}
            onClick={() => handleOpenPayment(params?.row)}
            size="small"
          >
            <PaymentIcon />
          </IconButton>
        </Tooltip>
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
    const data = [...membersDelayed];
    const doc = new jsPDF();
    doc.autoTable({
      head: [columns.filter(col => col.field !== 'payment').map((column) => column.headerName)],
      body: data.map((row) => columns.filter(col => col.field !== 'payment').map((column) => row[column.field])),
    });

    doc.save('Listado de clientes próximos a pagar.pdf');
  }

  return (
    <Grid style={{ height: 400, width: '100%', marginBottom: 40 }}>
      <br />
      <Grid container style={{ display: "flex", justifyContent: "start", gap: 10 }}>
        <Grid item xl={2} lg={2} md={2} sm={2} xs={12}>
          <Button
            variant='contained'
            onClick={downloadPDF}
            fullWidth
            color='primary'
            sx={{ height: "100%" }}
            disabled={membersDelayed.length === 0}
            className='btn-pdf'
          >
            <PictureAsPdfIcon /> Descargar
          </Button>
        </Grid>
        <Grid item xl={2} lg={2} md={2} sm={2} xs={12}>
          <TextField
            id="outlined-select-currency"
            select
            disabled={membersDelayed.length === 0}
            label="Entrenador"
            defaultValue=""
            placeholder="Entrenador"
            name="trainer_name"
            onChange={handlerChange}
            value={trainer_name}
            style={{ width: "100%" }}
            size='small'
          >
            {trainers.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>
      <br />
      <Grid container style={{ paddingBottom: '5rem' }}>
        <DataGrid
          autoHeight
          rows={membersDelayed}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 5 },
            },
          }}
          pageSizeOptions={[5, 10]}
        />
      </Grid>
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
    </Grid>
  );
}