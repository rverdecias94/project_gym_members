/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import * as React from 'react';
import { useMembers } from '../context/Context';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from 'lucide-react';

export default function DialogMessage({ handleClose, info, open, type, fn, msg, title }) {
  const { deleteMember, deleteTrainer } = useMembers();

  const handleDelete = async () => {
    await type === 1 ? deleteMember(info?.id) : deleteTrainer(info?.id);
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl font-bold text-destructive">
            <AlertTriangle className="w-5 h-5 mr-2" />
            {title}
          </DialogTitle>
          <DialogDescription className="pt-4 text-base text-foreground">
            {msg}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0 mt-4">
          <Button
            variant="outline"
            onClick={handleClose}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={fn ? fn : handleDelete}
            className="w-full sm:w-auto font-semibold"
          >
            Aceptar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}