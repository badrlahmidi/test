import { AppShell } from "@/components/layouts";
import { OnboardingProvider } from "@/components/onboarding/onboarding-provider";
import { getSession } from "@/lib/api-utils";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const tenantId = session?.user.tenantId ?? "";

  return (
    <AppShell>
      <OnboardingProvider tenantId={tenantId}>
        {children}
      </OnboardingProvider>
    </AppShell>
  );
}
