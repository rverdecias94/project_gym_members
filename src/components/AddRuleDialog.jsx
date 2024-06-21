/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { useMembers } from '../context/Context';
import { Checkbox, FormControlLabel, TextField } from '@mui/material';
import { useState } from 'react';



export default function AddRuleDialog({
  handleClose, selectedRows, setSelectedRows, open, handlerChangeAmount, amountDays }) {

  const { applyRuleToRows } = useMembers();
  const [inactivateUsers, setActivateUsers] = useState(false);
  const [addMonth, setAddMonth] = useState(false);
  const [addDays, setAddDays] = useState(false);


  const handleApplyRule = () => {
    if (inactivateUsers) {
      let newRows = selectedRows.map(row => {
        return { ...row, active: false };
      })
      if (newRows.length > 0) {
        applyRuleToRows(newRows);
        handleClose(false);
        setSelectedRows([]);
        setActivateUsers(false);
      }
    } else if (addMonth) {
      let newRows = selectedRows.map(elem => {
        const fechaPago = new Date(elem.pay_date);
        fechaPago.setMonth(fechaPago.getMonth() + 1);
        // Verificar si el mes resultante es enero para ajustar el año
        if (fechaPago.getMonth() === 0) {
          fechaPago.setFullYear(fechaPago.getFullYear() + 1);
        }
        // Formatear la fecha en formato día, mes, año
        const dia = fechaPago.getDate();
        const mes = fechaPago.getMonth() + 1;
        const año = fechaPago.getFullYear();
        return { ...elem, pay_date: `${año}-${mes}-${dia}` };
      });
      if (newRows.length > 0) {
        applyRuleToRows(newRows);
        handleClose(false);
        setSelectedRows([]);
        setAddMonth(false);
      }
    } else if (addDays) {
      let newRows = selectedRows.map(elem => {
        const fechaPago = new Date(elem.pay_date);
        fechaPago.setDate(fechaPago.getDate() + parseInt(amountDays));
        return {
          ...elem,
          pay_date: fechaPago.toISOString().split('T')[0]
        };
      });
      if (newRows.length > 0) {
        applyRuleToRows(newRows);
        handleClose(false);
        setSelectedRows([]);
        setAddDays(false);
      }
    }
  };



  return (
    <React.Fragment>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Seleccione una regla a aplicar"}
        </DialogTitle>
        <DialogContent>
          <FormControlLabel
            value={inactivateUsers}
            onChange={() => {
              setAddDays(false);
              setAddMonth(false);
              setActivateUsers(!inactivateUsers);
              handlerChangeAmount("")
            }}
            control={
              <Checkbox
                name='active'
                checked={inactivateUsers}
              />}
            label={`Desactivar ${selectedRows.length > 1 ? "clientes seleccionados" : "cliente seleccionado"}`}
          />
          <FormControlLabel
            value={addMonth}
            onChange={() => {
              setActivateUsers(false);
              setAddDays(false);
              setAddMonth(!addMonth);
              handlerChangeAmount("")
            }
            }
            control={
              <Checkbox
                name='active'
                checked={addMonth}
              />}
            label="Adicionar un mes a la fecha de pago"
          />
          <FormControlLabel
            value={addDays}
            onChange={() => {
              setActivateUsers(false);
              setAddMonth(false)
              setAddDays(!addDays)
              handlerChangeAmount("")
            }}
            control={
              <Checkbox
                name='active'
                checked={addDays}
              />}
            label="Definir cantidad de días a la fecha de pago"
          />
          <br />
          <br />
          {addDays &&
            <TextField
              id="amount"
              placeholder="7 días"
              name="amount"
              onChange={handlerChangeAmount}
              value={amountDays}
              sx={{ width: "100%" }}
            />
          }
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button
            disabled={!addMonth && !inactivateUsers && (!addDays || amountDays === "")}
            onClick={handleApplyRule}
            autoFocus>
            Aceptar
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}