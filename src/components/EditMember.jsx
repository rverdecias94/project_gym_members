/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useMembers } from '../context/MembersContext';
import MembersForm from './MembersForm';
import CancelIcon from '@mui/icons-material/Cancel';
import IconButton from '@mui/material/IconButton';

export default function EditMember({ handleClose, memberInfo, open }) {
  const { deleteMember } = useMembers();

  const handleDelete = (memberInfo) => {
    console.log(memberInfo);
  };


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
          <MembersForm member={memberInfo} />
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
}