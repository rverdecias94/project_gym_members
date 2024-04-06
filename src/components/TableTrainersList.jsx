import { DataGrid } from '@mui/x-data-grid';
import DeleteDialog from './DeleteDialog';
import { useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EditTrainer from './EditTrainer';

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
export const TableTrainersList = ({ trainersList }) => {
  const [openDelete, setOpenDelete] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [trainerInfo, setTrainerInfo] = useState({});

  const handleOpenDelete = (trainer) => {
    setOpenDelete(true);
    setTrainerInfo(trainer);
  };

  const handleClose = () => {
    setOpenDelete(false);
    setOpenEdit(false);
  };

  const handleOpenEdit = (trainer) => {
    setOpenEdit(true);
    setTrainerInfo(trainer);
  };


  const columns = [
    {
      field: 'actions',
      headerName: '',
      sortable: false,
      width: 80,
      renderCell: (params) => (
        <div>
          <EditIcon
            color="primary"
            onClick={() => handleOpenEdit(params?.row)}
          />
          <DeleteIcon
            sx={{ color: "#e7657e" }}
            onClick={() => handleOpenDelete(params?.row)}
          />
        </div>
      ),
    },
    { field: 'name', headerName: 'Nombre', width: 130 },
    { field: 'last_name', headerName: 'Apellidos', width: 130 },
    { field: 'ci', headerName: 'CI', width: 130 },
  ];

  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={trainersList}
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
        pageSizeOptions={[5, 10]}
      />

      <DeleteDialog handleClose={handleClose} info={trainerInfo} open={openDelete} type={2} />
      <EditTrainer handleClose={handleClose} trainerInfo={trainerInfo} open={openEdit} />
    </div>
  );
}