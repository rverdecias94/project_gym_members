import { Button, Checkbox, FormControlLabel, MenuItem, TextField } from '@mui/material';
import { DataGrid,/*  GridToolbarContainer, GridToolbarExport */ } from '@mui/x-data-grid';
import { useState, useEffect } from 'react';
import { useMembers } from '../context/Context';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import "./css/styles.css"

const esES = {
  noRowsLabel: "No se ha encontrado datos.",
  noResultsOverlayLabel: "No se ha encontrado ningún resultado",
  toolbarColumns: "Columnas",
  toolbarColumnsLabel: "Seleccionar columnas",
  toolbarFilters: "Filtros",
  toolbarFiltersLabel: "Ver filtros",
  toolbarFiltersTooltipHide: "Quitar filtros",
  toolbarFiltersTooltipShow: "Ver filtros",
};

// eslint-disable-next-line react/prop-types
export const TablePendingPay = ({ membersPendingPayment = [] }) => {
  const { trainersList } = useMembers();
  const [membersPendingOriginal, setMembersPendingOriginal] = useState([]);
  const [membersPending, setMembersPending] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [trainer_name, setTrainerName] = useState("");
  const [trainers, setTrainers] = useState([]);

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
    setMembersPendingOriginal(membersPendingPayment)
    setMembersPending(membersPendingPayment)
  }, [membersPendingPayment]);

  useEffect(() => {
    if (trainer_name !== "") {
      console.log(trainer_name)
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

  const columns = [
    {
      field: 'actions',
      headerName: '',
      sortable: false,
      width: 50,
      renderCell: (params) => (
        <div>
          <FormControlLabel
            control={
              <Checkbox
                checked={selectedRows?.includes(params.row)}
                onChange={(e) => handlerChangeStatus(e, params.row)}
                name='active'
              />
            }
          />
        </div>
      ),
    },
    { field: 'first_name', headerName: 'Nombre', width: 130 },
    { field: 'last_name', headerName: 'Apellidos', width: 130 },
    { field: 'pay_date', headerName: 'Fecha de Pago', width: 130 },
    { field: 'trainer_name', headerName: 'Entrenador', width: 130 },
  ];

  const handlerActivateRows = () => {
    console.log(selectedRows)
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

  const handlerChange = (e) => {
    setTrainerName(e?.target?.value)
  }

  const downloadPDF = () => {
    const data = [...membersPending];
    const doc = new jsPDF();
    doc.autoTable({
      head: [columns.map((column) => column.headerName)],
      body: data.map((row) => columns.map((column) => row[column.field])),
    });

    doc.save('Listado de clientes próximos a pagar.pdf');
  }

  return (
    <div style={{ height: 400, width: '100%', marginBottom: 40 }}>
      <div style={{ display: "flex", justifyContent: "start", gap: 10 }}>
        <Button
          variant='contained'
          disabled={selectedRows?.length === 0}
          onClick={handlerActivateRows}
          style={{ height: '100%' }}
        >
          Registrar Pago
        </Button>
        <TextField
          id="outlined-select-currency"
          select
          label="Filtrar por"
          defaultValue=""
          placeholder="Filtrar por"
          name="trainer_name"
          onChange={handlerChange}
          value={trainer_name}
          style={{ width: "15%" }}
          size='small'
        >
          {trainers.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
        <button id="pdf-button" className='btn-pdf' onClick={downloadPDF}>
          <PictureAsPdfIcon /> Descargar
        </button>
      </div>
      <br />
      <DataGrid
        rows={membersPending}
        columns={columns}
        localeText={esES}
        paginationPerPage={5}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 5 },
          },
        }}
        pageSizeOptions={[5, 10]}
      />

    </div>
  );
}