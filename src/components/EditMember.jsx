/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MembersForm from './MembersForm';
import CancelIcon from '@mui/icons-material/Cancel';
import IconButton from '@mui/material/IconButton';

export default function EditMember({ handleClose, memberInfo, open, virifiedAcount = false }) {

  return (
    <React.Fragment>
      <MembersForm member={memberInfo} open={open} handleClose={handleClose} virifiedAcount={virifiedAcount} />
    </React.Fragment>
  );
}