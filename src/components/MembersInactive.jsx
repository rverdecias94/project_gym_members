import { DataGrid } from '@mui/x-data-grid';
import { useState } from 'react';
import ContactPageIcon from '@mui/icons-material/ContactPage';
import { Checkbox, FormControlLabel, Grid } from '@mui/material';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { UserCheck } from "lucide-react";
import { useMembers } from '../context/Context';
import ViewDetails from './ViewDetails';
import { Card, CardContent, CardFooter } from "@/components/ui/card";

// eslint-disable-next-line react/prop-types
export const MembersInactive = ({ membersList = [] }) => {
  const { changedStatusToActive } = useMembers();
  const [selectedRows, setSelectedRows] = useState([]);
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState(false);
  const isMobile = window.innerWidth <= 768;

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
    <div className="w-full min-h-[400px] mb-10 pb-20 md:pb-0">
      <br />
      <div className="flex justify-end items-center w-full gap-4">
        {/* Lado derecho: Botón Activar usuarios */}
        <div className="flex-shrink-0">
          <Button
            variant="outline"
            disabled={selectedRows?.length === 0}
            onClick={handlerActivateRows}
            className={cn("transition-opacity", selectedRows?.length === 0 && "opacity-50 cursor-not-allowed")}
          >
            <UserCheck className="mr-2 h-4 w-4" />
            <span>Activar usuarios</span>
          </Button>
        </div>
      </div>
      <br />
      {!isMobile ? (
        <div className="bg-card rounded-lg border border-border overflow-hidden pb-10 md:pb-0">
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
            sx={{
              border: 'none',
              '& .MuiDataGrid-cell': {
                borderColor: 'hsl(var(--border))',
                color: 'hsl(var(--foreground))',
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: 'hsl(var(--muted))',
                color: 'hsl(var(--muted-foreground))',
                borderBottom: '1px solid hsl(var(--border))',
              },
              '& .MuiDataGrid-footerContainer': {
                borderTop: '1px solid hsl(var(--border))',
                color: 'hsl(var(--foreground))',
              },
              '& .MuiTablePagination-root': {
                color: 'hsl(var(--foreground))',
              },
            }}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {membersList.length === 0 ? (
            <div className="text-center text-muted-foreground py-10">Sin registros</div>
          ) : (
            membersList.map((member) => (
              <Card key={member.id} className="shadow-sm">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start gap-3">
                    <h3 className="font-bold text-lg">
                      {member.first_name} {member.last_name}
                    </h3>
                    <input
                      type="checkbox"
                      className="w-5 h-5 cursor-pointer accent-primary"
                      checked={selectedRows?.some((row) => row.id === member.id)}
                      onChange={(e) => handlerChangeStatus(e, member)}
                      name="active"
                    />
                  </div>

                  <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                    <p><strong>CI:</strong> {member.ci || '-'}</p>
                  </div>
                </CardContent>

                <CardFooter className="flex justify-end gap-2 p-4 pt-0">
                  <Button variant="outline" size="icon" onClick={() => handleOpenEdit(member)}>
                    <ContactPageIcon fontSize="small" />
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      )}
      <ViewDetails
        handleClose={handleClose}
        open={open}
        profile={profile}
      />
    </div>
  );
}
