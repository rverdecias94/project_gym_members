import { DataGrid } from '@mui/x-data-grid';
import DeleteDialog from './DeleteDialog';
import { useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EditTrainer from './EditTrainer';
import { Link } from 'react-router-dom';
import { Button, Grid } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

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
    <div style={{ height: "auto", width: '100%', padding: "1rem" }}>
      <br />
      <Link to="/new_trainer" style={{ width: "fit-content", display: "block", color: "white", textDecoration: "none" }}>
        <Button variant="contained" style={{ display: "flex", justifyContent: "space-evenly", background: "#356dac" }}>
          <PersonAddIcon /> Entrenador
        </Button>
      </Link>
      <br />
      <Grid container style={{ paddingBottom: '5rem' }}>
        <DataGrid
          autoHeight
          rows={trainersList}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 5 },
            },
          }}
          pageSizeOptions={[5, 10]}
        />
      </Grid>
      <DeleteDialog handleClose={handleClose} info={trainerInfo} open={openDelete} type={2} />
      <EditTrainer handleClose={handleClose} trainerInfo={trainerInfo} open={openEdit} />
    </div>
  );
}