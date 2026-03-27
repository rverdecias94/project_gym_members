import { DataGrid } from '@mui/x-data-grid';
import DialogMessage from './DialogMessage';
import { useState } from 'react';
import EditTrainer from './EditTrainer';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { UserPlus, Edit, Trash2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// eslint-disable-next-line react/prop-types
export const TableTrainersList = ({ trainersList }) => {
  const [openDelete, setOpenDelete] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [trainerInfo, setTrainerInfo] = useState({});
  const isDark = document.documentElement.classList.contains('dark');

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
      headerName: 'Acciones',
      sortable: false,
      width: 120,
      renderCell: (params) => (
        <div className="flex gap-2 items-center h-full">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => handleOpenEdit(params?.row)}>
                  <Edit className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Editar Entrenador</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleOpenDelete(params?.row)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Eliminar Entrenador</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ),
    },
    { field: 'name', headerName: 'Nombre', width: 130 },
    { field: 'last_name', headerName: 'Apellidos', width: 130 },
    { field: 'ci', headerName: 'CI', width: 130 },
  ];

  return (
    <div className="w-full p-4 max-w-[1400px] mx-auto mt-20 md:mt-4 mb-20 md:mb-10">
      <Link to="/new_trainer" className="w-fit block no-underline mb-4">
        <Button className="bg-[#e49c10] hover:bg-[#c9890e] text-white">
          <UserPlus className="mr-2 h-4 w-4" /> Entrenador
        </Button>
      </Link>

      <div className="bg-card rounded-lg border border-border overflow-hidden pb-10 md:pb-0 h-[400px]">
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
          disableRowSelectionOnClick
          sx={{
            border: 'none',
            color: 'inherit',
            '& .MuiDataGrid-cell': {
              borderColor: 'var(--border)',
            },
            '& .MuiDataGrid-columnHeaders': {
              borderColor: 'var(--border)',
              backgroundColor: 'hsl(var(--muted))',
              color: 'hsl(var(--muted-foreground))',
            },
            '& .MuiDataGrid-footerContainer': {
              borderColor: 'var(--border)',
              color: 'inherit',
            },
            '& .MuiTablePagination-root': {
              color: 'inherit',
            },
            '& .MuiSvgIcon-root': {
              color: 'inherit',
            }
          }}
        />
      </div>
      <DialogMessage
        handleClose={handleClose}
        info={trainerInfo}
        title="Eliminar Entrenador"
        open={openDelete}
        msg={`¿Esta seguro que desea eliminar la informacion de ${trainerInfo.name} ${trainerInfo.last_name}?`}
        type={2} />
      <EditTrainer handleClose={handleClose} trainerInfo={trainerInfo} open={openEdit} />
    </div>
  );
}