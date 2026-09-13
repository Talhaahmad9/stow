import Storage from "expo-sqlite/kv-store";
import { createContext, useContext } from "react";

export const ONBOARDING_COMPLETE_KEY = "stow:onboarding-complete:v1";

export async function readOnboardingComplete(): Promise<boolean> {
  return (await Storage.getItemAsync(ONBOARDING_COMPLETE_KEY)) === "true";
}

export async function writeOnboardingComplete(): Promise<void> {
  await Storage.setItemAsync(ONBOARDING_COMPLETE_KEY, "true");
}

interface OnboardingStateContextValue {
  completed: boolean;
  markCompleted: () => void;
}

const OnboardingStateContext =
  createContext<OnboardingStateContextValue | null>(null);

export function OnboardingStateProvider({
  completed,
  markCompleted,
  children,
}: OnboardingStateContextValue & { children: React.ReactNode }) {
  return (
    <OnboardingStateContext.Provider
      value={{ completed, markCompleted }}
    >
      {children}
    </OnboardingStateContext.Provider>
  );
}

export function useOnboardingState(): OnboardingStateContextValue {
  const context = useContext(OnboardingStateContext);
  if (!context) {
    throw new Error("useOnboardingState must be used within its provider");
  }
  return context;
}
