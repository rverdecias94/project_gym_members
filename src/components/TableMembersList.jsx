import { DataGrid } from '@mui/x-data-grid';
import DeleteDialog from './DeleteDialog';
import EditMember from './EditMember';
import { useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Checkbox,
  FormControlLabel,
  Button,
  TextField,
  MenuItem,
  Grid,
  Tooltip,
  Alert,
  List,
  ListItem,
  Typography,
  Divider,
  Dialog,
  DialogTitle,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useMembers } from '../context/Context';
import AddRuleDialog from './AddRuleDialog';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import jsPDF from 'jspdf';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { supabase } from '../supabase/client';
import CancelIcon from '@mui/icons-material/Cancel';
import IconButton from '@mui/material/IconButton';


// eslint-disable-next-line react/prop-types
export const TableMembersList = ({ membersList = [] }) => {
  const { adding, trainersList } = useMembers();
  const [openDelete, setOpenDelete] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openRule, setOpenRule] = useState(false);
  const [memberInfo, setMemberInfo] = useState({});
  const [selectedRows, setSelectedRows] = useState([]);
  const [amountDays, setAmountDays] = useState("");
  const [trainer_name, setTrainerName] = useState("");
  const [trainers, setTrainers] = useState([]);
  const [membersOriginal, setMembersOriginal] = useState([]);
  const [members, setMembers] = useState([]);

  const [open, setOpen] = useState(false);

  const [id, setId] = useState('');
  const [resultados, setResultados] = useState([]);
  const [error, setError] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));


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
    setMembersOriginal(membersList);
    setMembers(membersList);
    setSelectedRows([]);

    const updateClientsLength = async () => {

      const { data } = await supabase.auth.getUser();
      await supabase
        .from("info_general_gym")
        .update({ clients: membersList.length })
        .eq("owner_id", data?.user?.id);
    }

    updateClientsLength();

  }, [membersList]);

  useEffect(() => {
    if (trainer_name !== "") {
      let members = [...membersOriginal]
      if (trainer_name !== "Sin Entrenador" && trainer_name !== "Todos") {
        setMembers(members.filter(elem => elem.trainer_name === trainer_name));
      } else if (trainer_name === "Sin Entrenador") {
        setMembers(members.filter(elem => elem.trainer_name === null));
      } else if (trainer_name === "Todos") {
        setMembers(members);
      }
    }
  }, [trainer_name]);

  const buscarRegistro = async () => {
    console.log(id)
    setError(null);

    const { data, error } = await supabase
      .from('members') // Reemplaza por el nombre de tu tabla
      .select('*')
      .eq('id', id);

    if (error) {
      setError('Error al buscar el registro');
      setResultados([]);
    } else {
      setResultados(data);
    }
  };

  const handleOpenDelete = (member) => {
    setOpenDelete(true);
    setMemberInfo(member);
  };

  const handleClose = () => {
    setOpenDelete(false);
    setOpenEdit(false);
    setOpenRule(false);
  };

  const handleOpenEdit = (member) => {
    setOpenEdit(true);
    setMemberInfo(member);
  };
  const handleOpenRule = () => {
    setOpenRule(true);
  };

  const handlerChangeStatus = (e, row) => {
    if (e.target.checked) {
      setSelectedRows((prevSelectedRows) => [...prevSelectedRows, row]);
    } else {
      setSelectedRows((prevSelectedRows) =>
        prevSelectedRows?.filter((item) => item.id !== row.id)
      );
    }
  };

  const handlerChangeAmount = (e) => {
    const input = e?.target?.value;
    if (input !== undefined) {
      const onlyDigits = input.replace(/\D/g, '');
      setAmountDays(onlyDigits)
    }
    else
      setAmountDays(e);
  }

  const columns = [
    {
      field: 'actions',
      headerName: 'Acciones',
      sortable: false,
      width: 100,
      renderCell: (params) => (

        <div style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={selectedRows?.includes(params.row)}
                onChange={(e) => handlerChangeStatus(e, params.row)}
                name='active'

              />
            }
            style={{ marginRight: 0 }}
          />
          <Tooltip title="Editar">
            <EditIcon
              color="primary"
              onClick={() => handleOpenEdit(params?.row)}
            />
          </Tooltip>
          <Tooltip title="Eliminar">
            <DeleteIcon
              sx={{ color: "#e7657e" }}
              onClick={() => handleOpenDelete(params?.row)}
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
    { field: 'ci', headerName: 'CI', width: 130 },
    { field: 'address', headerName: 'Dirección', width: 130 },
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




  const downloadPDF = () => {
    const data = [...membersList];
    const doc = new jsPDF();
    doc.autoTable({
      head: [columns.map((column) => column.headerName)],
      body: data.map((row) => columns.map((column) => row[column.field])),
    });

    doc.save('Listado de clientes.pdf');
  }
  const handlerCheckBox = () => {
    let rowsInt = [...selectedRows]
    if (rowsInt.length === membersList.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(membersList);
    }
  }
  const handlerChange = (e) => {
    setTrainerName(e?.target?.value)
  }
  return (
    <Grid item xl={12} lg={12} md={12} sm={12} xs={12} style={{ height: 400, width: '100%', marginBottom: 40 }}>
      <br />
      <Grid container className='container-options'>
        <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>


          {
            membersList.length !== 0 &&
            <Grid sx={{ display: "grid", gridTemplateColumns: "repeat(1, 1fr)", gap: 15, width: isMobile ? "100%" : "20%" }}>
              <TextField
                id="outlined-select-currency"
                select
                label="Filtro por entrenador"
                defaultValue="Todos"
                fullWidth
                placeholder="Entrenador"
                name="trainer_name"
                onChange={handlerChange}
                value={trainer_name}
                size='small'
                sx={{ mr: 1.2, height: '100%' }}
              >
                {trainers.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          }

        </Grid>

        <Divider />

        <Grid className='container-options-sec_2' sx={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center", marginTop: 2, position: "relative" }}>
          <Link to="/new_member" style={{ height: '100%', color: "white", textDecoration: "none", width: "fit-content" }} className={isMobile ? 'btn-add-client-mobile' : ""}>
            <Button variant="contained" className='btn-add-client' style={{ color: "white", background: "#e49c10" }}>
              <PersonAddIcon sx={{ fontSize: 22, height: "100%" }} />
              <span className='text-add-client' style={{ marginLeft: 5 }}>
                Cliente
              </span>
            </Button>
          </Link>

          <Grid container style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(1, 1fr)" : "repeat(4, 1fr)", gap: 15, width: isMobile ? "100%" : "50%" }}>
            <Grid item>
              <Button
                variant="outlined"
                size='small'
                fullWidth
                onClick={() => setOpen(true)}
                sx={{ height: '100%' }}
              >
                Asociar Cliente
              </Button>
            </Grid>
            <Grid item >
              <Button
                variant='outlined'
                disabled={selectedRows.length === 0}
                fullWidth
                size='small'
                onClick={handleOpenRule}
                sx={{
                  mr: 1.2, height: '100%',
                }}
              >
                Aplicar regla
              </Button>
            </Grid>

            <Grid >
              <Button
                variant='outlined'
                className='btn-check'
                onClick={handlerCheckBox}
                disabled={membersList.length === 0}
                sx={{
                  flexGrow: .1,
                  float: 'right',
                  width: "fit-context",
                }}
              >
                <CheckBoxIcon /> {membersList.length !== selectedRows.length ? "Sel. Todos" : "Desel. Todos"}
              </Button>
            </Grid>

            <Grid >
              <Button
                variant='outlined'
                onClick={downloadPDF}
                disabled={membersList.length === 0}
                fullWidth
                sx={{
                  flexGrow: .1,
                  float: 'right',
                  width: "fit-context",
                }}
              >
                <PictureAsPdfIcon /> <span className='text-dw-pdf'>Descargar</span>
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <br />
      {adding && <span>Aplicando reglas a clientes seleccionados...</span>}
      <Grid container style={{ paddingBottom: '9rem' }}>
        <DataGrid
          rows={members}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 5 },
            },
          }}
          pageSizeOptions={[5, 10]}
        />
      </Grid>

      <DeleteDialog
        handleClose={handleClose}
        info={memberInfo}
        open={openDelete}
        type={1}
      />
      <AddRuleDialog
        handlerChangeAmount={handlerChangeAmount}
        handleClose={handleClose}
        open={openRule}
        selectedRows={selectedRows}
        amountDays={amountDays}
        setSelectedRows={setSelectedRows}
      />

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="md"
        fullWidth
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {"Asociar cliente al sistema"}
          <IconButton aria-label="cancel" size="large" onClick={() => setOpen(false)}>
            <CancelIcon sx={{ color: "#6164c7" }}></CancelIcon>
          </IconButton>
        </DialogTitle>
        <Grid container style={{ display: "grid", gridTemplateColumns: "1fr ", gap: 15, padding: "5rem" }}>
          <TextField
            label="Escribe el ID"
            variant="outlined"
            value={id}
            onChange={e => setId(e.target.value)}
            fullWidth
            margin="normal"
            size='small'
          />
          <Button
            variant="contained"
            color="primary"
            onClick={buscarRegistro}
            fullWidth
            size='small'

          >
            Buscar
          </Button>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <List>
            {resultados.map(registro => (
              <ListItem
                key={registro.id}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  border: '1px solid #e0e0e0',
                  borderRadius: 2,
                  mb: 2,
                  p: 2,
                }}
              >
                <Typography variant="body1">
                  <strong>Nombre:</strong> {registro.first_name}
                </Typography>
                <Typography variant="body1">
                  <strong>Apellido:</strong> {registro.last_name}
                </Typography>
                <Button
                  variant="outlined"
                  color="secondary"
                  sx={{ mt: 1 }}
                  onClick={() => handleOpenEdit(registro)}
                >
                  Click
                </Button>
              </ListItem>
            ))}
          </List>
        </Grid>
      </Dialog>
      <EditMember handleClose={handleClose} memberInfo={memberInfo} open={openEdit} />
    </Grid>
  );
}