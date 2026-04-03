/* eslint-disable react/prop-types */
import { DataGrid } from '@mui/x-data-grid';
import DialogMessage from './DialogMessage';
import EditMember from './EditMember';
import { useState, useEffect } from 'react';
import { useMembers } from '../context/Context';
import AddRuleDialog from './AddRuleDialog';
import jsPDF from 'jspdf';
import { supabase } from '../supabase/client';
import MembersForm from './MembersForm';
import QrReader from './QrReader';
import PaymentRecords from './PaymentRecords';
import { toast } from 'sonner';

import { Edit, Trash2, FileText, CheckSquare, XCircle, Search, QrCode, Receipt, UserPlus, CalendarDays, CheckSquare as CheckSquareIcon, Square } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import dayjs from 'dayjs';

// eslint-disable-next-line react/prop-types
export const TableMembersList = ({ membersList = [] }) => {
  const { adding, trainersList, setBackdrop, gymInfo, getAuthUser } = useMembers();
  const hasTrainers = Array.isArray(trainersList) && trainersList.length > 0;
  const [openDelete, setOpenDelete] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openRule, setOpenRule] = useState(false);
  const [verifiedAcount, setVerifiedAcount] = useState(false);
  const [memberInfo, setMemberInfo] = useState({});
  const [selectedRows, setSelectedRows] = useState([]);
  const [amountDays, setAmountDays] = useState("");
  const [trainer_name, setTrainerName] = useState("");
  const [trainers, setTrainers] = useState([]);
  const [membersOriginal, setMembersOriginal] = useState([]);
  const [members, setMembers] = useState([]);
  const [paymentRecordsOpen, setPaymentRecordsOpen] = useState(false);
  const [selectedMemberForRecords, setSelectedMemberForRecords] = useState(null);

  const [open, setOpen] = useState(false);
  const [showQrScanner, setShowQrScanner] = useState(false); // Nuevo estado para alternar entre formulario y QR
  const [associated, setAssociated] = useState(false)

  const [id, setId] = useState('');
  const [resultados, setResultados] = useState([]);
  const [error, setError] = useState(null);

  // Estados para paginación móvil
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  const [openMemberForm, setOpenMemberForm] = useState(false);

  const handleOpenMember = () => {
    if (!gymInfo?.store) {
      if (members.length < 100) {
        setOpenMemberForm(true);
      } else {
        toast.error("Has alcanzado el límite de clientes para tu plan actual. Por favor, actualiza tu plan para agregar más clientes.");
        return;
      }
    } else
      setOpenMemberForm(true);
  };

  const handleCloseMemberForm = () => {
    setOpenMemberForm(false);
  };

  const isMobile = window.innerWidth <= 768;
  const isDark = document.documentElement.classList.contains('dark');

  useEffect(() => {
    if (!hasTrainers) {
      setTrainers([]);
      setTrainerName("");
      return;
    }

    const trainers = [];
    trainers.push({ value: "Todos", label: "Todos" })
    trainers.push({ value: "Sin Entrenador", label: "Sin Entrenador" })

    trainersList.forEach(element => {
      trainers.push({ value: element.name, label: element.name });
    });
    setTrainers(trainers);
  }, [hasTrainers, trainersList])

  useEffect(() => {
    setMembersOriginal(membersList);
    setMembers(membersList);
    setSelectedRows([]);
    setCurrentPage(1); // Reset pagination when data changes

    const updateClientsLength = async () => {
      const { data } = await getAuthUser();
      try {
        const cachedGymInfo = sessionStorage.getItem("gym_info");
        if (cachedGymInfo) {
          const parsed = JSON.parse(cachedGymInfo);
          parsed.clients = membersList.length;
          sessionStorage.setItem("gym_info", JSON.stringify(parsed));
        }
      } catch (e) {
        console.error(e);
      }
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
      setCurrentPage(1); // Reset pagination when filter changes
    }
  }, [trainer_name]);

  const buscarRegistro = async (value) => {
    if (value.length !== 36) return

    let scannedId = value !== null && value !== undefined ? value : id;

    setBackdrop(true);
    setError(null);
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('member_id', scannedId);

    setBackdrop(false);
    if (error) {
      setError('Error al buscar el registro');
      setResultados([]);
      setVerifiedAcount(false);
    } else if (!data || data.length === 0) {
      setError('No se encontró ningún cliente con ese ID');
      setResultados([]);
      setVerifiedAcount(false);
    } else {
      setResultados(data);
      setVerifiedAcount(true);
    }
  };

  const handleOpenDelete = (member) => {
    setOpenDelete(true);
    setMemberInfo(member);
  };

  const handleOpenPaymentRecords = (member) => {
    setSelectedMemberForRecords(member);
    setPaymentRecordsOpen(true);
  };

  const handleClosePaymentRecords = () => {
    setPaymentRecordsOpen(false);
    setSelectedMemberForRecords(null);
  };

  const handleClose = () => {
    setOpenDelete(false);
    setOpenEdit(false);
    setOpenRule(false);
    setOpen(false);
    setShowQrScanner(false);
    setId('');
    setResultados([]);
  };

  const handleOpenEdit = (member, value = false) => {
    const normalized = {
      ...member,
      phone: member?.phone !== undefined && member?.phone !== null ? String(member.phone) : '',
    };
    setOpenEdit(true);
    setMemberInfo(normalized);
    setAssociated(value)
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

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleQrScanSuccess = (scannedId) => {
    setId(scannedId);
    setShowQrScanner(false);
    setResultados([]);
    buscarRegistro(scannedId);
  };

  // Calcular elementos para la página actual en vista móvil
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMembers = members.slice(startIndex, endIndex);
  const totalPages = Math.ceil(members.length / itemsPerPage);

  const columns = [
    {
      field: 'actions',
      headerName: 'Seleccionar',
      sortable: false,
      width: 100,
      renderCell: (params) => (
        <div className="flex items-center justify-center h-full cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 cursor-pointer"
            checked={selectedRows?.includes(params.row)}
            onChange={(e) => handlerChangeStatus(e, params.row)}
            name='active'
          />
        </div>
      ),
    },
    { field: 'first_name', headerName: 'Nombre', width: 180 },
    { field: 'last_name', headerName: 'Apellidos', width: 180 },
    {
      field: 'phone',
      headerName: 'Teléfono',
      width: 130,
      renderCell: (params) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          {params.value ? params.value : <strong style={{ fontSize: 20 }}>-</strong>}
        </div>
      ),
    },
    {
      field: 'pay_date',
      headerName: 'Fecha de Pago',
      width: 130,
      renderCell: (params) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          {dayjs(params.value).format('DD-MM-YYYY')}
        </div>
      ),
    },
    { field: 'ci', headerName: 'CI', width: 130 },
    { field: 'address', headerName: 'Dirección', width: 280 },
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
    {
      field: 'options',
      headerName: "Opciones",
      width: 150,
      renderCell: (params) => (
        <div className="flex gap-2 items-center h-full">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => handleOpenEdit(params.row)}>
                  <Edit className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Editar Cliente</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleOpenDelete(params.row)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Dar de Baja</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-secondary" onClick={() => handleOpenPaymentRecords(params.row)}>
                  <Receipt className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Historial de Pagos</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )
    }
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

  // Componente para mostrar tarjetas en móvil
  const MemberCard = ({ member }) => (
    <Card className="mb-4 shadow-sm">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-bold text-lg">
            {member.first_name} {member.last_name}
          </h3>
          <input
            type="checkbox"
            className="w-5 h-5 cursor-pointer accent-primary"
            checked={selectedRows?.includes(member)}
            onChange={(e) => handlerChangeStatus(e, member)}
            name='active'
          />
        </div>

        <div className="space-y-2 text-sm text-muted-foreground mb-4">
          <p><strong>Teléfono:</strong> {member.phone || '-'}</p>
          <p><strong>CI:</strong> {member.ci}</p>
          <p><strong>Dirección:</strong> {member.address}</p>
          <p><strong>Entrenador:</strong> {member.trainer_name || '-'}</p>
        </div>
      </CardContent>

      <CardFooter className="flex justify-end gap-2 p-4 pt-0">
        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => handleOpenEdit(member)}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleOpenDelete(member)}>
          <Trash2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-secondary" onClick={() => handleOpenPaymentRecords(member)}>
          <Receipt className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );

  return (
    <div className="w-full min-h-[400px] mb-10 pb-20 md:pb-0">
      <br />
      <div className="flex flex-col gap-4">
        <div className="w-full">
          {hasTrainers && membersList.length !== 0 && (
            <div className={`w-full ${!isMobile ? "max-w-xs" : ""}`}>
              <Select value={trainer_name || "Todos"} onValueChange={setTrainerName}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtro por entrenador" />
                </SelectTrigger>
                <SelectContent>
                  {trainers.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {hasTrainers && <hr className="my-2 border-border" />}

        <div className="flex flex-col md:flex-row w-full justify-between items-start md:items-center mt-2 relative gap-4">

          <div className="w-full md:w-auto">
            <Button
              className="w-full bg-[#e49c10] hover:bg-[#c9890e] text-white"
              onClick={() => {
                setOpen(true);
                setShowQrScanner(false); // Asegura que se vea el formulario por defecto
              }}
            >
              <QrCode className="mr-2 h-4 w-4" />
              <span>Asociar Cliente</span>
            </Button>

            {!gymInfo?.store && members.length >= 95 && members.length <= 100 && (
              <p className="text-sm mt-4">
                Recuerda que puedes agregar hasta 100 clientes para tu plan.
              </p>
            )}
          </div>

          {!isMobile && (
            <div className="grid grid-cols-4 gap-4 w-1/2">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleOpenMember} // Aquí manejamos la apertura del formulario
              >
                <UserPlus className="mr-2 h-4 w-4" />
                <span>Cliente</span>
              </Button>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Button
                        variant="outline"
                        disabled={selectedRows.length === 0}
                        className={cn("w-full transition-opacity", selectedRows.length === 0 && "opacity-50 cursor-not-allowed")}
                        onClick={handleOpenRule}
                      >
                        <CalendarDays className="mr-2 h-4 w-4" />
                        <span>Aplicar regla</span>
                      </Button>
                    </div>
                  </TooltipTrigger>
                  {selectedRows.length === 0 && <TooltipContent>Selecciona al menos un cliente</TooltipContent>}
                </Tooltip>
              </TooltipProvider>

              <Button
                variant="outline"
                className={cn("w-full transition-opacity", membersList.length === 0 && "opacity-50 cursor-not-allowed")}
                onClick={handlerCheckBox}
                disabled={membersList.length === 0}
              >
                {membersList.length !== selectedRows.length ? (
                  <Square className="mr-2 h-4 w-4" />
                ) : (
                  <CheckSquareIcon className="mr-2 h-4 w-4" />
                )}
                <span>
                  {membersList.length !== selectedRows.length ? "Sel. Todos" : "Desel. Todos"}
                </span>
              </Button>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Button
                        variant="outline"
                        className={cn("w-full transition-opacity", membersList.length === 0 && "opacity-50 cursor-not-allowed")}
                        onClick={downloadPDF}
                        disabled={membersList.length === 0}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        <span>Descargar</span>
                      </Button>
                    </div>
                  </TooltipTrigger>
                  {membersList.length === 0 && <TooltipContent>No hay datos para descargar</TooltipContent>}
                </Tooltip>
              </TooltipProvider>
            </div>
          )}

          {isMobile && (
            <div className="flex gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleOpenMember}
                    >
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Añadir Cliente</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Button
                        variant="outline"
                        size="icon"
                        disabled={selectedRows.length === 0}
                        className={cn("transition-opacity", selectedRows.length === 0 && "opacity-50 cursor-not-allowed")}
                        onClick={handleOpenRule}
                      >
                        <CalendarDays className="h-4 w-4" />
                      </Button>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>{selectedRows.length === 0 ? "Selecciona al menos un cliente" : "Aplicar Regla"}</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handlerCheckBox}
                        disabled={membersList.length === 0}
                        className={cn("transition-opacity", membersList.length === 0 && "opacity-50 cursor-not-allowed")}
                      >
                        {membersList.length !== selectedRows.length ? <Square className="h-4 w-4" /> : <CheckSquareIcon className="h-4 w-4" />}
                      </Button>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>{membersList.length !== selectedRows.length ? "Seleccionar Todos" : "Deseleccionar Todos"}</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={downloadPDF}
                        disabled={membersList.length === 0}
                        className={cn("transition-opacity", membersList.length === 0 && "opacity-50 cursor-not-allowed")}
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>{membersList.length === 0 ? "No hay datos para descargar" : "Descargar PDF"}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>
      </div>
      <br />

      {!isMobile ? (
        <div className="bg-card rounded-lg border border-border overflow-hidden pb-10 md:pb-0">
          <DataGrid
            autoHeight
            rows={trainer_name !== 'Todos' && trainer_name !== ''
              ? membersList.filter(row => row.trainer_name === trainer_name)
              : membersList}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 5 },
              },
            }}
            pageSizeOptions={[5, 10]}
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
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {(trainer_name !== 'Todos' && trainer_name !== ''
            ? membersList.filter(row => row.trainer_name === trainer_name)
            : membersList).map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}
        </div>
      )}

      {adding && <span className="text-sm text-muted-foreground mt-2 block">Aplicando reglas a clientes seleccionados...</span>}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span>Asociar cliente al sistema</span>
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            {!showQrScanner ? (
              <>
                <Input
                  placeholder="Escribe el ID"
                  value={id}
                  onChange={e => setId(e.target.value)}
                  className="w-full"
                />

                <Button
                  variant="default"
                  className="w-full"
                  onClick={() => {
                    setShowQrScanner(true);
                    setId('');
                    setResultados([]);
                    setError(null);
                  }}
                >
                  <QrCode className="mr-2 h-4 w-4" />
                  Escanear QR
                </Button>

                {id.length === 36 && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => buscarRegistro(id ?? null)}
                  >
                    <Search className="mr-2 h-4 w-4" />
                    Buscar
                  </Button>
                )}

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </>
            ) : (
              <QrReader
                onScanSuccess={handleQrScanSuccess}
                onToggleMode={() => setShowQrScanner(false)}
              />
            )}

            <div className="flex flex-col gap-2 mt-4">
              {resultados.map(registro => (
                <Card key={registro.id}>
                  <CardContent className="p-4 flex flex-col gap-2">
                    <p><strong>Nombre:</strong> {registro.first_name}</p>
                    <p><strong>Apellido:</strong> {registro.last_name}</p>
                    <Button
                      className="mt-2 bg-[#e49c10] hover:bg-[#c9890e] text-white w-full"
                      onClick={() => handleOpenEdit(registro, true)}
                    >
                      Detalles de Cliente
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <MembersForm
        open={openMemberForm}
        handleClose={handleCloseMemberForm}
      />

      <DialogMessage
        handleClose={handleClose}
        title="Eliminar Cliente"
        info={memberInfo}
        open={openDelete}
        msg={`¿Estás seguro que deseas eliminar la información de ${memberInfo.first_name} ${memberInfo.last_name}?`}
        type={1}
      />

      <EditMember
        handleClose={handleClose}
        memberInfo={memberInfo}
        open={openEdit}
        virifiedAcount={verifiedAcount}
        associated={associated}
      />

      <PaymentRecords
        open={paymentRecordsOpen}
        handleClose={handleClosePaymentRecords}
        memberInfo={selectedMemberForRecords}
      />

      <AddRuleDialog
        handlerChangeAmount={handlerChangeAmount}
        handleClose={handleClose}
        open={openRule}
        selectedRows={selectedRows}
        amountDays={amountDays}
        setSelectedRows={setSelectedRows}
      />
    </div>
  );
}
