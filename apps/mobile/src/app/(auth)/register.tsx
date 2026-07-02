import { zodResolver } from "@hookform/resolvers/zod";
import { APP_NAME } from "@vibevault/config";
import { RegisterRequestSchema } from "@vibevault/types";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { z } from "zod";
import {
  VaultButton,
  VaultHeading,
  VaultSubheading,
} from "@/components/ui/button";
import { VaultInput } from "@/components/ui/input";
import { Screen } from "@/components/ui/screen";
import { ApiClientError } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";

const registerFormSchema = RegisterRequestSchema;
type RegisterFormValues = z.infer<typeof registerFormSchema>;

export default function RegisterScreen() {
  const router = useRouter();
  const register = useAuthStore((state) => state.register);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: { email: "", password: "", displayName: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setErrorMessage(null);
    try {
      await register(values.email, values.password, values.displayName);
      router.replace("/(tabs)");
    } catch (error) {
      if (error instanceof ApiClientError) {
        setErrorMessage(error.message);
        return;
      }
      setErrorMessage("Something went wrong. Please try again.");
    }
  });

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerClassName="flex-grow justify-center py-8"
          keyboardShouldPersistTaps="handled"
        >
          <View className="gap-8">
            <View>
              <VaultHeading>Create account</VaultHeading>
              <VaultSubheading>
                Join your household {APP_NAME} server.
              </VaultSubheading>
            </View>

            <View className="gap-4">
              <Controller
                control={control}
                name="displayName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <VaultInput
                    autoComplete="name"
                    error={errors.displayName?.message}
                    label="Display name"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    placeholder="Your name"
                    value={value}
                  />
                )}
              />

              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <VaultInput
                    autoComplete="email"
                    error={errors.email?.message}
                    keyboardType="email-address"
                    label="Email"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    placeholder="you@example.com"
                    value={value}
                  />
                )}
              />

              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <VaultInput
                    autoComplete="new-password"
                    error={errors.password?.message}
                    label="Password"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    placeholder="At least 8 characters"
                    secureTextEntry
                    value={value}
                  />
                )}
              />
            </View>

            {errorMessage ? (
              <Text className="font-inter text-sm text-vault-negative">{errorMessage}</Text>
            ) : null}

            <VaultButton label="Create account" loading={isSubmitting} onPress={onSubmit} />

            <View className="flex-row justify-center gap-1">
              <Text className="font-inter text-sm text-vault-muted">
                Already have an account?
              </Text>
              <Link href="/(auth)/login">
                <Text className="font-inter-semibold text-sm text-vault-text">
                  Sign in
                </Text>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
