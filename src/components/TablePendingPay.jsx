import { DataGrid,/*  GridToolbarContainer, GridToolbarExport */ } from '@mui/x-data-grid';

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
export const TablePendingPay = ({ membersPendingPay = [] }) => {

  const columns = [
    { field: 'first_name', headerName: 'Nombre', width: 130 },
    { field: 'last_name', headerName: 'Apellidos', width: 130 },
    { field: 'pay_date', headerName: 'Fecha de Pago', width: 130 },
    { field: 'trainer_name', headerName: 'Entrenador', width: 130 },
  ];

  return (
    <div style={{ height: 400, width: '100%', marginBottom: 40 }}>
      <br />
      <br />
      <DataGrid
        rows={membersPendingPay}
        columns={columns}
        localeText={esES}
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