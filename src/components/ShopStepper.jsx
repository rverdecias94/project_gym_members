/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import {
  Stepper,
  Step,
  StepLabel,
  Button,
  Box,
  Grid,
} from "@mui/material";
import ShopInfo from "./ShopInfo";
import { useMembers } from "../context/Context";

const steps = ["Datos Generales", "Horarios de funcionamiento"];

export default function ShopStepper({ id }) {
  const [activeStep, setActiveStep] = useState(0);
  const { shopInfo } = useMembers();
  const [isSaveButtonEnabled, setIsSaveButtonEnabled] = useState(false);
  const [clickOnSave, setClickOnSave] = useState(false);
  const [userActive, setUserActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');

  const todayStr = `${yyyy}-${mm}-${dd}`;
  const nextPaymentStr = shopInfo?.next_payment_date;

  useEffect(() => {
    if (shopInfo && shopInfo.next_payment_date) {
      if (nextPaymentStr >= todayStr) {
        setUserActive(true);
      } else {
        setUserActive(false);
      }
    }
  }, [shopInfo, nextPaymentStr, todayStr]);

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
        {shopInfo?.active && userActive && !isLoading &&
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        }

        <Box sx={{ mt: 4 }}>
          <ShopInfo
            id={id}
            step={activeStep}
            setIsSaveButtonEnabled={setIsSaveButtonEnabled}
            clickOnSave={clickOnSave}
            setIsLoading={setIsLoading}
          />
        </Box>

        {shopInfo?.active && userActive && !isLoading &&
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