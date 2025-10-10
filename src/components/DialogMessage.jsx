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



export default function DialogMessage({ handleClose, info, open, type, fn, msg, title }) {
  const { deleteMember, deleteTrainer } = useMembers();

  const handleDelete = async () => {
    await type === 1 ? deleteMember(info?.id) : deleteTrainer(info?.id);
    handleClose();
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
          {title}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {msg}
          </DialogContentText>
        </DialogContent>
        <DialogActions style={{ padding: "1.25rem" }}>
          <Button
            onClick={handleClose}
            color='error'
            variant='contained'
            size='small'
          >
            Cancelar
          </Button>
          <Button onClick={fn ? fn : handleDelete} autoFocus size='small' variant='contained'>
            Aceptar
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}