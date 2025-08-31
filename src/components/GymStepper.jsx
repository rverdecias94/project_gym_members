/* eslint-disable react/prop-types */
import { useState } from "react";
import {
  Stepper,
  Step,
  StepLabel,
  Button,
  Box,
  Grid,
} from "@mui/material";
import GeneralInfo from "./GeneralInfo";
import { useMembers } from "../context/Context";

const steps = ["Datos Generales", "Tipo de pago", "Horarios de funcionamiento"];

export default function GymStepper({ id }) {
  const [activeStep, setActiveStep] = useState(0);
  const { gymInfo } = useMembers();
  // estado global para habilitar el botón final
  const [isSaveButtonEnabled, setIsSaveButtonEnabled] = useState(false);
  const [clickOnSave, setClickOnSave] = useState(false);

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      setClickOnSave(true);
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  return (
    <Grid container justifyContent="center" sx={{ p: 4 }}>
      <Grid item xs={12} md={10} lg={8}>
        {gymInfo.active &&
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        }


        <Box sx={{ mt: 4 }}>
          <GeneralInfo
            id={id}
            step={activeStep}
            setIsSaveButtonEnabled={setIsSaveButtonEnabled}
            clickOnSave={clickOnSave}
          />
        </Box>

        {gymInfo.active &&
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              variant="outlined"
            >
              Atrás
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
              disabled={activeStep === steps.length - 1 && !isSaveButtonEnabled}
            >
              {activeStep === steps.length - 1 ? "Guardar" : "Siguiente"}
            </Button>
          </Box>
        }
      </Grid>
    </Grid>
  );
}
