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
} from '@mui/material';
import { useMembers } from '../context/Context';
import AddRuleDialog from './AddRuleDialog';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import jsPDF from 'jspdf';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

// eslint-disable-next-line react/prop-types
export const TableMembersList = ({ membersList = [] }) => {
  const { loadingMembersList, adding, trainersList } = useMembers();
  const [openDelete, setOpenDelete] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openRule, setOpenRule] = useState(false);
  const [memberInfo, setMemberInfo] = useState({});
  const [selectedRows, setSelectedRows] = useState([]);
  const [amountDays, setAmountDays] = useState("");
  const [trainer_name, setTrainerName] = useState("");
  const [trainers, setTrainers] = useState([]);

  /* const theme = useTheme(); */
  /* const isMobile = useMediaQuery(theme.breakpoints.down("sm"), {
    defaultMatches: true,
  }); */

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

        <div style={{ display: "flex", alignItems: "center" }}>
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
        <Grid item xl={8} lg={7} md={7} sm={12} xs={12}>
          <Grid container style={{ display: "flex", justifyContent: "start", gap: 15 }}>
            <Grid item xl={4} lg={4} md={4} sm={12} xs={12}>
              <Button
                variant='contained'
                disabled={selectedRows.length === 0}
                color='primary'
                fullWidth
                onClick={handleOpenRule}
                sx={{ mr: 1.2, height: '100%' }}
              >
                Aplicar regla
              </Button>
            </Grid>
            <Grid item xl={4} lg={4} md={4} sm={12} xs={12}>
              <TextField
                id="outlined-select-currency"
                select
                disabled={membersList.length === 0}
                label="Entrenador"
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
            <Grid item xl={4} lg={4} md={4} sm={12} xs={12} className='container-add-client'>
              <Link to="/new_member" style={{ height: '100%', color: "white", textDecoration: "none" }}>
                <Button variant="contained" color='primary' className='btn-add-client'>
                  <PersonAddIcon sx={{ fontSize: 22, height: "100%" }} />
                  <span className='text-add-client' style={{ marginLeft: 5 }}>
                    Miembro
                  </span>
                </Button>
              </Link>
            </Grid>
          </Grid>
        </Grid>

        <Grid item xl={4} lg={5} md={5} sm={12} xs={12} className='container-options-sec_2'>
          <Grid container style={{ display: "flex", flexWrap: "nowrap", gap: 15 }}>
            <Grid item xl={6} lg={6} md={6} sm={3} xs={3}>
              <Button
                variant='contained'
                onClick={downloadPDF}
                disabled={membersList.length === 0}
                fullWidth
                sx={{ mr: 1.2, height: '100%', width: "fit-context" }}
              >
                <PictureAsPdfIcon /> <span className='text-dw-pdf'>Descargar</span>
              </Button>
            </Grid>

            <Grid item xl={6} lg={6} md={6} sm={9} xs={9}>
              <Button
                variant='contained'
                className='btn-pdf'
                onClick={handlerCheckBox}
                disabled={membersList.length === 0}
                sx={{ flexGrow: .1, float: 'right', width: "fit-context" }}
              >
                <CheckBoxIcon /> {membersList.length !== selectedRows.length ? "Selec. Todos" : "Desmarcar Todos"}
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <br />
      {loadingMembersList && <span>Cargando listado de clientes...</span>}
      {adding && <span>Aplicando reglas a clientes seleccionados...</span>}
      <DataGrid
        rows={membersList}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 5 },
          },
        }}
        pageSizeOptions={[5, 10]}
      />

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
      <EditMember handleClose={handleClose} memberInfo={memberInfo} open={openEdit} />
    </Grid>
  );
}