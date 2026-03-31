/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import GeneralInfo from "./GeneralInfo";
import { useMembers } from "../context/Context";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const steps = ["Datos Generales", "Tipo de pago", "Horarios de funcionamiento"];

function StepHeader({ steps, current }) {
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-6 w-full mb-8">
      {steps.map((label, i) => {
        const active = i === current;
        const done = i < current;
        return (
          <div key={label} className="flex items-center gap-2 sm:gap-3">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-all duration-300 shadow-sm",
                done && "border-primary bg-primary text-primary-foreground",
                active && "border-primary bg-primary text-primary-foreground ring-4 ring-primary/20",
                !done && !active && "border-muted-foreground/30 bg-background text-muted-foreground"
              )}
            >
              {done ? (
                <Check className="h-5 w-5" />
              ) : (
                i + 1
              )}
            </div>
            <div className={cn("hidden sm:block text-sm font-medium", (active || done) ? "text-foreground" : "text-muted-foreground")}>{label}</div>
            {i !== steps.length - 1 && (
              <div
                className={cn(
                  "ml-2 sm:ml-6 h-px w-12 sm:w-24 rounded transition-all duration-300",
                  done ? "bg-primary" : "bg-muted-foreground/30"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function GymStepper({ id }) {
  const [activeStep, setActiveStep] = useState(0);
  const { gymInfo } = useMembers();
  const [isSaveButtonEnabled, setIsSaveButtonEnabled] = useState(false);
  const [clickOnSave, setClickOnSave] = useState(false);
  const [userActive, setUserActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');

  const todayStr = `${yyyy}-${mm}-${dd}`;
  const nextPaymentStr = gymInfo?.next_payment_date;

  useEffect(() => {
    if (gymInfo && gymInfo.next_payment_date) {
      if (nextPaymentStr >= todayStr) {
        setUserActive(true);
      } else {
        setUserActive(false);
      }
    }
  }, [gymInfo, nextPaymentStr, todayStr]);

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
    <div className="flex justify-center p-4 sm:p-8 w-full">
      <div className="w-full max-w-4xl space-y-6">
        {gymInfo?.active && userActive && !isLoading && (
          <StepHeader steps={steps} current={activeStep} />
        )}

        <div className="rounded-xl border border-border bg-card/60 p-5 shadow-sm">
          <GeneralInfo
            id={id}
            step={activeStep}
            setIsSaveButtonEnabled={setIsSaveButtonEnabled}
            clickOnSave={clickOnSave}
            setIsLoading={setIsLoading}
          />
        </div>

        {gymInfo?.active && userActive && !isLoading && (
          <>
            <Separator />
            <div className="flex items-center justify-between">
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                variant="secondary"
                className="min-w-[100px]"
              >
                Atrás
              </Button>
              <Button
                className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[100px]"
                onClick={handleNext}
                disabled={activeStep === steps.length - 1 && !isSaveButtonEnabled}
              >
                {activeStep === steps.length - 1 ? "Finalizar" : "Siguiente"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
