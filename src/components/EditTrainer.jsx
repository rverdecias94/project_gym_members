/* eslint-disable react/prop-types */
import * as React from 'react';
import TrainersForm from './TrainersForm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UserPlus, Edit } from 'lucide-react';

export default function EditTrainer({ handleClose, trainerInfo, open }) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-[800px] w-[95vw] max-h-[90vh] overflow-hidden p-0 flex flex-col">
        <DialogHeader className="p-4 md:p-6 border-b border-border bg-card flex flex-row items-center justify-between">
          <DialogTitle className="flex items-center text-xl font-bold">
            <Edit className="w-5 h-5 mr-2 text-primary" />
            Editar Entrenador
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto">
          <TrainersForm trainer={trainerInfo} onClose={handleClose} />
        </div>
      </DialogContent>
    </Dialog>
  );
}