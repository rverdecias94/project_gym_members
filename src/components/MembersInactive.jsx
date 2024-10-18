import { DataGrid } from '@mui/x-data-grid';
import { useState } from 'react';
import ContactPageIcon from '@mui/icons-material/ContactPage';
import { Checkbox, FormControlLabel, Button, Grid } from '@mui/material';
import { useMembers } from '../context/Context';
import ViewDetails from './ViewDetails';

// eslint-disable-next-line react/prop-types
export const MembersInactive = ({ membersList = [] }) => {
  const { changedStatusToActive } = useMembers();
  const [selectedRows, setSelectedRows] = useState([]);
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState(false);

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
          <ContactPageIcon
            color="primary"
            onClick={() => handleOpenEdit(params?.row)}
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

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpenEdit = (client) => {
    setOpen(true);
    setProfile(client);
  };

  return (
    <Grid style={{ height: 400, width: '100%' }}>
      <br />
      <Grid container style={{ display: "flex", gap: 10 }}>
        <Grid item xl={2} lg={2} md={2} sm={2} xs={12}>
          <Button
            variant='contained'
            color='primary'
            fullWidth
            disabled={selectedRows?.length === 0}
            onClick={handlerActivateRows}
            sx={{ height: "100%" }}
          >
            Activar usuarios
          </Button>
        </Grid>
      </Grid>
      <br />
      <Grid container style={{ paddingBottom: '9rem' }}>
        <DataGrid
          autoHeight
          rows={membersList}
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