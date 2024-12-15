import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { Button, Grid, IconButton } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { DataGrid } from "@mui/x-data-grid";
import { supabase } from '../supabase/client';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import CloseIcon from '@mui/icons-material/Close';
import { useMembers } from '../context/Context';

const FileUpload = () => {

  const { importClients } = useMembers();

  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const inputFileRef = useRef(null);

  useEffect(() => {
    if (data.length > 0) {
      openModal();
    }
  }, [data]);

  const handleFileChange = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;

    const fileExtension = file.name.split('.').pop();

    if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const binaryStr = e.target.result;
        const workbook = XLSX.read(binaryStr, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        processData(jsonData);
      };
      reader.readAsBinaryString(file);
    } else if (fileExtension === 'csv') {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          processData(results.data);
        },
      });
    }
  }, []);

  const calculatePaymentDate = useCallback(() => {
    const fechaActual = new Date();
    fechaActual.setMonth(fechaActual.getMonth() + 1);
    if (fechaActual.getMonth() === 0) {
      fechaActual.setFullYear(fechaActual.getFullYear() + 1);
    }
    return fechaActual;
  }, []);

  const processData = useCallback(async (rawData) => {
    const { data } = await supabase.auth.getUser();
    const fechaActual = calculatePaymentDate();
    const processedData = rawData.map((item, index) => ({
      id: index,
      gym_id: data?.user?.id,
      first_name: item.Nombre !== undefined ? item.Nombre : "",
      last_name: item.Apellidos !== undefined ? item.Apellidos : "",
      gender: item.Sexo !== undefined ? item.Sexo : "",
      ci: item.CI !== undefined ? item.CI : "",
      address: item.Direccion !== undefined ? item.Direccion : "",
      phone: item.Telefono !== undefined ? item.Telefono : "",
      has_trainer: item.Entrenador !== undefined ? true : false,
      trainer_name: item.Entrenador !== undefined ? item.Entrenador : "",
      image_profile: null,
      pay_date: fechaActual,
    }));
    setData(processedData);
  }, [calculatePaymentDate]);

  const openModal = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setData([]);
  };

  const saveClients = () => {
    let clientsToImport = [...data]
    clientsToImport.forEach(client => {
      Reflect.deleteProperty(client, 'id')
    });
    setOpen(false);
    importClients(clientsToImport);
  };

  const columns = useMemo(() => [
    { field: 'first_name', headerName: 'Nombre', width: 130, editable: true },
    { field: 'last_name', headerName: 'Apellidos', width: 110, editable: true },
    { field: 'address', headerName: 'Dirección', width: 130, editable: true },
    {
      field: 'gender',
      headerName: 'Género',
      width: 110,
      editable: true,
      renderCell: (params) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          {params.value !== null ? params.value : <strong style={{ fontSize: 20 }}>-</strong>}
        </div>
      ),
    },
    { field: 'ci', headerName: 'CI', width: 130, editable: true },
    { field: 'phone', headerName: 'Teléfono', width: 130, editable: true },
    {
      field: 'trainer_name',
      headerName: 'Entrenador',
      width: 130,
      editable: true,
      renderCell: (params) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          {params.value !== null ? params.value : <strong style={{ fontSize: 20 }}>-</strong>}
        </div>
      ),
    },
  ], []);

  const handleProcessRowUpdate = (newRow) => {
    const updatedRows = data.map((row) => (row.id === newRow.id ? newRow : row));
    setData(updatedRows);
    return newRow;
  };

  return (
    <div>
      <input
        type="file"
        accept=".xlsx,.xls,.csv"
        ref={inputFileRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={() => inputFileRef.current.click()}
        sx={{ width: "100%" }}
      >
        <UploadFileIcon />
        Importar
      </Button>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth={"lg"}
      >
        <DialogTitle id="alert-dialog-title">
          {"Listado de clientes importados"}
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Grid container sx={{ mt: 3 }}>
            <DataGrid
              sx={{ height: "60vh" }}
              rows={data}
              columns={columns}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 5 },
                },
              }}
              pageSizeOptions={[5, 10, 20]}
              processRowUpdate={handleProcessRowUpdate}
            />
          </Grid>
        </DialogContent>
        <DialogActions sx={{ marginRight: 4 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={saveClients}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default FileUpload;
