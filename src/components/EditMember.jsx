/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MembersForm from './MembersForm';
import CancelIcon from '@mui/icons-material/Cancel';
import IconButton from '@mui/material/IconButton';

export default function EditMember({ handleClose, memberInfo, open }) {

  return (
    <React.Fragment>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth={"lg"}
      >
        <DialogTitle id="alert-dialog-title" sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {"Editar"}
          <IconButton aria-label="cancel" size="large" onClick={handleClose}>
            <CancelIcon sx={{ color: "#6164c7" }}></CancelIcon>
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <MembersForm member={memberInfo} onClose={handleClose} />
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
}