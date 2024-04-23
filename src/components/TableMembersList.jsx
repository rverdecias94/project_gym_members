import { DataGrid,/*  GridToolbarContainer, GridToolbarExport */ } from '@mui/x-data-grid';
import DeleteDialog from './DeleteDialog';
import EditMember from './EditMember';
import { useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Checkbox, FormControlLabel, Button } from '@mui/material';
import { useMembers } from '../context/Context';
import AddRuleDialog from './AddRuleDialog';

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
export const TableMembersList = ({ membersList = [] }) => {
  const { loadingMembersList } = useMembers();
  const [openDelete, setOpenDelete] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openRule, setOpenRule] = useState(false);
  const [memberInfo, setMemberInfo] = useState({});
  const [selectedRows, setSelectedRows] = useState([]);
  const [amountDays, setAmountDays] = useState("");
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
    setAmountDays(e.target.value)
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
    { field: 'first_name', headerName: 'Nombre', width: 130 },
    { field: 'last_name', headerName: 'Apellidos', width: 130 },
    { field: 'ci', headerName: 'CI', width: 130 },
    { field: 'address', headerName: 'Dirección', width: 130 },
  ];

  /*  function CustomToolbar() {
     return (
       <div style={{ display: "flex", justifyContent: "end" }}>
         <GridToolbarContainer>
           <GridToolbarExport
             slotProps={{
               tooltip: { title: 'Export data' },
               button: { variant: 'outlined' },
             }}
           />
         </GridToolbarContainer>
       </div>
     );
   } */
  return (
    <div style={{ height: 400, width: '100%', marginBottom: 40 }}>

      <Button
        variant='contained'
        disabled={selectedRows.length === 0}
        color='primary'
        onClick={handleOpenRule}
      >
        Aplicar regla
      </Button>
      <br />
      <br />
      {loadingMembersList && <span>Cargando listado de miembros...</span>}
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
        pageSizeOptions={[5, 10]}
      /* slots={{ toolbar: CustomToolbar }} */
      /* checkboxSelection
      disableRowSelectionOnClick */
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
      />
      <EditMember handleClose={handleClose} memberInfo={memberInfo} open={openEdit} />
    </div>
  );
}