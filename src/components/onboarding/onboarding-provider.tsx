"use client";

import * as React from "react";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

interface OnboardingProviderProps {
  tenantId: string;
  children: React.ReactNode;
}

export function OnboardingProvider({ tenantId, children }: OnboardingProviderProps) {
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    const key = `onboarding_${tenantId}`;
    if (!localStorage.getItem(key)) {
      setShow(true);
    }
  }, [tenantId]);

  return (
    <>
      {children}
      {show && (
        <OnboardingWizard tenantId={tenantId} onComplete={() => setShow(false)} />
      )}
    </>
  );
}
