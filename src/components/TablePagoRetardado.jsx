import { Button, Checkbox, FormControlLabel, Grid, MenuItem, TextField, Tooltip } from '@mui/material';
import { DataGrid,/*  GridToolbarContainer, GridToolbarExport */ } from '@mui/x-data-grid';
import { useState } from 'react';
import { useMembers } from '../context/Context';
import { useEffect } from 'react';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import jsPDF from 'jspdf';
import ViewDetails from './ViewDetails';
import ContactPageIcon from '@mui/icons-material/ContactPage';


// eslint-disable-next-line react/prop-types
export const TablePagoRetardado = ({ membersPaymentDelayed = [] }) => {
  const [selectedRows, setSelectedRows] = useState([]);
  const { trainersList, makePayment, adding } = useMembers();
  const [membersPaymentDelayedOriginal, setMembersPaymentDelayedOriginal] = useState([]);
  const [membersDelayed, setMembersDelayed] = useState([]);
  const [trainer_name, setTrainerName] = useState("");
  const [trainers, setTrainers] = useState([]);
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState(false);


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
  }, [])

  useEffect(() => {
    setMembersPaymentDelayedOriginal(membersPaymentDelayed);
    setMembersDelayed(membersPaymentDelayed);
    setSelectedRows([]);
  }, [membersPaymentDelayed]);

  useEffect(() => {
    if (trainer_name !== "") {
      let members = [...membersPaymentDelayedOriginal]
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

  const columns = [
    {
      field: 'actions',
      headerName: '',
      sortable: false,
      width: 100,
      renderCell: (params) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={selectedRows?.includes(params.row)}
                onChange={(e) => handlerChangeStatus(e, params.row)}
                name='active'
              />
            }
          />
          <Tooltip title="Ver Detalles">
            <ContactPageIcon
              color="primary"
              onClick={() => handleOpenEdit(params?.row)}
            />
          </Tooltip>
        </div>
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
  ];

  const handlerMakePayment = () => {
    const fechaActual = new Date();
    fechaActual.setMonth(fechaActual.getMonth() + 1);
    // Verificar si el mes resultante es enero para ajustar el año
    if (fechaActual.getMonth() === 0) {
      fechaActual.setFullYear(fechaActual.getFullYear() + 1);
    }

    // Formatear la fecha en formato día, mes, año
    const dia = fechaActual.getDate();
    const mes = fechaActual.getMonth() + 1;
    const año = fechaActual.getFullYear();

    let dataToSave = [...selectedRows]
    dataToSave.forEach(elem => elem.pay_date = `${año}-${mes}-${dia}`);
    makePayment(dataToSave);
  }

  const handlerChangeStatus = (e, row) => {
    if (e.target.checked) {
      setSelectedRows((prevSelectedRows) => [...prevSelectedRows, row]);
    } else {
      setSelectedRows((prevSelectedRows) =>
        prevSelectedRows?.filter((item) => item.id !== row.id)
      );
    }
  };

  const downloadPDF = () => {
    const data = [...membersDelayed];
    const doc = new jsPDF();
    doc.autoTable({
      head: [columns.map((column) => column.headerName)],
      body: data.map((row) => columns.map((column) => row[column.field])),
    });

    doc.save('Listado de clientes con pago atrasado.pdf');
  }

  const handlerChange = (e) => {
    setTrainerName(e?.target?.value)
  }

  return (
    <Grid style={{ height: 400, width: '100%', marginBottom: 40 }}>
      <br />
      <Grid container style={{ display: "flex", gap: 10 }}>
        <Grid item xl={2} lg={2} md={2} sm={2} xs={12}>
          <Button
            variant='contained'
            color='primary'
            fullWidth
            disabled={selectedRows?.length === 0}
            onClick={handlerMakePayment}
            sx={{ height: "100%" }}
          >
            Registrar Pago
          </Button>
        </Grid>
        <Grid item xl={2} lg={2} md={2} sm={2} xs={12}>
          <Button
            variant='contained'
            fullWidth
            color='inherit'
            onClick={downloadPDF}
            disabled={membersDelayed.length === 0}
            sx={{ height: "100%" }}
            className='btn-pdf'
          >
            <PictureAsPdfIcon /> Descargar
          </Button>
        </Grid>
        <Grid item xl={2} lg={2} md={2} sm={2} xs={12}>
          <TextField
            disabled={membersDelayed.length === 0}
            id="outlined-select-currency"
            select
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
      {adding && <span>Actializando...</span>}
      <Grid container style={{ paddingBottom: '5rem' }}>
        <DataGrid
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
    </Grid>
  );
}