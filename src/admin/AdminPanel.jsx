import { DataGrid } from "@mui/x-data-grid"
import { useState } from "react";
import { styled } from '@mui/material/styles';
import Switch from '@mui/material/Switch';
import { useEffect } from "react";
import { supabase } from '../supabase/client';
import { Button, Grid, TextField, Typography } from "@mui/material";
import AutorenewIcon from '@mui/icons-material/Autorenew';
import { Toaster, toast } from 'react-hot-toast';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';

const CustomSwitch = styled(Switch)(({ theme }) => ({
  width: 62,
  height: 34,
  padding: 7,
  '& .MuiSwitch-switchBase': {
    margin: 1,
    padding: 0,
    transform: 'translateX(6px)',
    '&.Mui-checked': {
      color: '#fff',
      transform: 'translateX(22px)',
      '& .MuiSwitch-thumb:before': {
        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
          '#fff',
        )}" d="M4.2 2.5l-.7 1.8-1.8.7 1.8.7.7 1.8.6-1.8L6.7 5l-1.9-.7-.6-1.8zm15 8.3a6.7 6.7 0 11-6.6-6.6 5.8 5.8 0 006.6 6.6z"/></svg>')`,
      },
      '& + .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: '#aab4be',
        ...theme.applyStyles('dark', {
          backgroundColor: '#8796A5',
        }),
      },
    },
  },
  '& .MuiSwitch-thumb': {
    backgroundColor: '#e49c10',
    width: 32,
    height: 32,
    '&::before': {
      content: "''",
      position: 'absolute',
      width: '100%',
      height: '100%',
      left: 0,
      top: 0,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
        '#fff',
      )}" d="M9.305 1.667V3.75h1.389V1.667h-1.39zm-4.707 1.95l-.982.982L5.09 6.072l.982-.982-1.473-1.473zm10.802 0L13.927 5.09l.982.982 1.473-1.473-.982-.982zM10 5.139a4.872 4.872 0 00-4.862 4.86A4.872 4.872 0 0010 14.862 4.872 4.872 0 0014.86 10 4.872 4.872 0 0010 5.139zm0 1.389A3.462 3.462 0 0113.471 10a3.462 3.462 0 01-3.473 3.472A3.462 3.462 0 016.527 10 3.462 3.462 0 0110 6.528zM1.665 9.305v1.39h2.083v-1.39H1.666zm14.583 0v1.39h2.084v-1.39h-2.084zM5.09 13.928L3.616 15.4l.982.982 1.473-1.473-.982-.982zm9.82 0l-.982.982 1.473 1.473.982-.982-1.473-1.473zM9.305 16.25v2.083h1.389V16.25h-1.39z"/></svg>')`,
    },
    ...theme.applyStyles('dark', {
      backgroundColor: '#6164c7',
    }),
  },
  '& .MuiSwitch-track': {
    opacity: 1,
    backgroundColor: '#aab4be',
    borderRadius: 20 / 2,
    ...theme.applyStyles('dark', {
      backgroundColor: '#8796A5',
    }),
  },
}));

const AdminPanel = () => {

  const [gymInfoOriginal, setGymInfoOriginal] = useState([])
  const [gymInfo, setGymInfo] = useState([])
  const [search, setSearchTerm] = useState(null)
  const [rotate, setRotate] = useState(false)

  useEffect(() => {
    getAllGyms();
  }, [])

  const getAllGyms = async () => {
    setRotate(true);
    try {
      const { data, error } = await supabase
        .from('info_general_gym')
        .select('*')

      setTimeout(() => {
        setRotate(false);
      }, 1000);
      if (error) {
        toast.error("Error cargando listado de gimnasios", { duration: 3000 })
        return;
      }

      if (data) {
        toast.success("Listado actualizado", { duration: 2000 })
        setGymInfo(data);
        setGymInfoOriginal(data);
      } else {
        toast.error("Imposible cargar datos", { duration: 5000 })
      }
    } catch (err) {
      console.error("Error:", err);
      toast.error("Hubo un error al validar las credenciales", { duration: 5000 });
    }
  };

  const updateNextPaymentDate = async (row, newDate) => {
    const updatedRow = {
      ...row,
      next_payment_date: newDate ? dayjs(newDate).format("YYYY-MM-DD") : null,
    };

    try {
      const { error } = await supabase
        .from("info_general_gym")
        .update(updatedRow)
        .eq("owner_id", row.owner_id);

      if (error) {
        throw error;
      }

      toast.success("¡Fecha de pago actualizada con éxito!", { duration: 5000 });
      getAllGyms(); // Refresca los datos
    } catch (error) {
      console.error("Error al actualizar la fecha:", error);
      toast.error("Error al actualizar la fecha de pago.", { duration: 5000 });
    }
  };


  const updateActiveStatus = async (row) => {
    const updatedRow = {
      ...row,
      active: !row.active,
    };

    try {
      const result = await supabase
        .from("info_general_gym")
        .update(updatedRow)
        .eq("owner_id", row.owner_id);

      if (result) {
        toast.success("¡Estado de activación actualizado con éxito!", { duration: 5000 })
        getAllGyms();
      }
    } catch (error) {
      console.error(error);
    }
  }

  const columns = [
    { field: 'gym_name', headerName: 'Nombre Gym', width: 130 },
    { field: 'address', headerName: 'Dirección', width: 130 },
    { field: 'owner_name', headerName: 'Propietario', width: 110 },
    {
      field: 'owner_phone',
      headerName: 'Teléfono',
      width: 110,
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
      field: 'next_payment_date',
      headerName: 'Fecha de Pago',
      width: 180,
      renderCell: ({ row }) => (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <MobileDatePicker
            defaultValue={row.next_payment_date ? dayjs(row.next_payment_date) : null}
            onChange={(newDate) => updateNextPaymentDate(row, newDate)}
          />
        </LocalizationProvider>
      ),
    },
    {
      field: 'state',
      headerName: 'Provincia',
      width: 110,
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
      field: 'city',
      headerName: 'Municipio',
      width: 110,
      renderCell: (params) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          {
            params.value !== null ? params.value
              : <strong style={{ fontSize: 20 }}>-</strong>
          }
        </div>
      ),
    },
    { field: 'clients', headerName: 'Clientes', width: 80 },
    {
      field: 'actions',
      headerName: 'Activar',
      sortable: false,
      width: 100,
      renderCell: ({ row }) => (
        <div style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
          <CustomSwitch
            onChange={() => updateActiveStatus(row)}
            checked={row.active}
            value={gymInfo.active}
          />
        </div>
      ),
    },
  ];

  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);

    if (value === '') {
      setGymInfo(gymInfoOriginal);
    } else {
      const filteredData = gymInfo.filter(item =>
        item.gym_name.toLowerCase().includes(value) ||
        item.address.toLowerCase().includes(value) ||
        item.owner_name.toLowerCase().includes(value) ||
        item.city.toLowerCase().includes(value)
      );
      setGymInfo(filteredData);
    }
  };

  return (
    <>
      <Toaster
        position="top-right"
        reverseOrder={false}
      />
      <Grid container style={{
        display: "flex", flexDirection: "column", gap: 20,
        justifyContent: "center", alignItems: "center", height: "100vh"
      }}>

        <Grid style={{ width: "66%", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography
            variant="h5"
            sx={{
              color: "white",
            }}
          >
            Listado de Gimnasios
          </Typography>
          <TextField
            required
            id="outlined-required"
            name="name"
            label="Buscar por nombre"
            value={search}
            onChange={handleSearch}
            style={{ width: "50%", marginTop: 20 }}
          />
          <Button
            title="Actualizar"
            onClick={getAllGyms}
            sx={{
              transition: 'transform 1s ease',
              transform: rotate ? 'rotate(360deg)' : 'rotate(0deg)'
            }}
          >
            <AutorenewIcon />
          </Button>
        </Grid>
        <Grid item lg={8} xl={8} md={8} sm={8} xs={12}>
          <DataGrid
            sx={{ height: "60vh" }}
            rows={gymInfo}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 5 },
              },
            }}
            pageSizeOptions={[5, 10, 20]}
          />
        </Grid>
      </Grid>
    </>
  )
}

export default AdminPanel