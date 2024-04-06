/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import CancelIcon from '@mui/icons-material/Cancel';
import IconButton from '@mui/material/IconButton';
import TrainersForm from './TrainersForm';

export default function EditTrainer({ handleClose, trainerInfo, open }) {

  return (
    <React.Fragment>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        fullScreen
      >
        <DialogTitle id="alert-dialog-title" sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {"Editar"}
          <IconButton aria-label="cancel" size="large">
            <CancelIcon onClick={handleClose} sx={{ color: "#1976d2" }}></CancelIcon>
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TrainersForm trainer={trainerInfo} onClose={handleClose} />
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
}