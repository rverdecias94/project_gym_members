/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useMembers } from '../context/Context';
import { Checkbox, FormControlLabel, TextField } from '@mui/material';
import { useState } from 'react';
import { useEffect } from 'react';



export default function AddRuleDialog({
  handleClose, selectedRows, open, handlerChangeAmount, amountDays }) {

  const [activateUsers, setActivateUsers] = useState(false);
  const [addMonth, setAddMonth] = useState(false);
  const [addDays, setAddDays] = useState(false);


  useEffect(() => {
    console.log(selectedRows)
  }, [])


  const handleDelete = () => {
    console.log("new rule")
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
            value={activateUsers}
            onChange={() => setActivateUsers(!activateUsers)}
            control={
              <Checkbox
                name='active'
                checked={activateUsers}
              />}
            label="Desactivar miembros seleccionados"
          />
          <FormControlLabel
            value={addMonth}
            onChange={() => setAddMonth(!addMonth)}
            control={
              <Checkbox
                name='active'
                checked={addMonth}
              />}
            label="Adicionar un mes a la fecha de pago"
          />
          <FormControlLabel
            value={addDays}
            onChange={() => setAddDays(!addDays)}
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
            />
          }
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleDelete} autoFocus>
            Aceptar
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}