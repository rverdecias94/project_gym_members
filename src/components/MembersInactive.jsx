import { DataGrid } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';

import { Checkbox, FormControlLabel, Button } from '@mui/material';
import { useMembers } from '../context/Context';


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
export const MembersInactive = ({ membersList = [] }) => {
  const { changedStatusToActive } = useMembers();
  const [selectedRows, setSelectedRows] = useState([]);

  useEffect(() => {
    console.log(selectedRows);
  }, [selectedRows])

  const handlerActivateRows = async () => {
    if (selectedRows.length > 0) {

      const updatedRows = selectedRows.map((row) => {
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

        // Actualizar la clave pay_date en el objeto
        return { ...row, active: true, pay_date: `${año}-${mes}-${dia}` };
      });
      setSelectedRows(updatedRows);
      changedStatusToActive(updatedRows);
    }
  };

  const columns = [
    {
      field: 'actions',
      headerName: '',
      sortable: false,
      width: 80,
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
    { field: 'ci', headerName: 'CI', width: 130 },
  ];

  const handlerChangeStatus = (e, row) => {
    if (e.target.checked) {
      setSelectedRows((prevSelectedRows) => [...prevSelectedRows, row]);
    } else {
      setSelectedRows((prevSelectedRows) =>
        prevSelectedRows?.filter((item) => item.id !== row.id)
      );
    }
  };


  return (
    <div style={{ height: 400, width: '100%' }}>
      <br />
      <Button
        variant='contained'
        color='primary'
        disabled={selectedRows?.length === 0}
        onClick={handlerActivateRows}
      >
        Activar usuarios
      </Button>
      <br />
      <br />
      <DataGrid
        rows={membersList}
        columns={columns}
        localeText={esES}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 5 },
          },
        }}
        onCellClick={(params) => {
          if (params.field !== 'actions') {
            console.log('Fila seleccionada:', params.row);
          }
        }}
        /* checkboxSelection */
        pageSizeOptions={[5, 10]}
      />
    </div>
  );
}