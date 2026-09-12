import { Text, View } from "react-native";

export default function Index() {
  return (
    <View className="flex-1 bg-background px-5 py-8">
      <Text className="font-sans-semibold text-2xl text-foreground">
        Quiet Indigo palette
      </Text>
      <Text className="mt-1 font-sans text-sm text-foreground-muted">
        Temporary semantic color verification
      </Text>

      <View className="mt-6 gap-3">
        <View className="rounded-2xl border border-border bg-surface p-4">
          <Text className="font-sans-semibold text-base text-foreground">
            Surface
          </Text>
          <Text className="mt-1 font-sans text-sm text-foreground-muted">
            Regular surface with primary and secondary text.
          </Text>
        </View>

        <View className="rounded-2xl border border-border-strong bg-surface-muted p-4">
          <Text className="font-sans-medium text-base text-foreground">
            Muted surface
          </Text>
          <Text className="mt-1 font-sans text-sm text-foreground-muted">
            Strong border and muted surface pairing.
          </Text>
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1 rounded-2xl bg-accent p-4">
            <Text className="font-sans-semibold text-base text-on-accent">
              Accent
            </Text>
            <Text className="mt-1 font-sans text-sm text-on-accent">
              On-accent
            </Text>
          </View>
          <View className="flex-1 rounded-2xl bg-accent-soft p-4">
            <Text className="font-sans-medium text-base text-accent">
              Accent soft
            </Text>
            <Text className="mt-1 font-sans text-sm text-accent">
              Accent text
            </Text>
          </View>
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1 rounded-2xl bg-danger p-4">
            <Text className="font-sans-semibold text-base text-on-danger">
              Danger
            </Text>
            <Text className="mt-1 font-sans text-sm text-on-danger">
              On-danger
            </Text>
          </View>
          <View className="flex-1 rounded-2xl bg-danger-soft p-4">
            <Text className="font-sans-medium text-base text-danger">
              Danger soft
            </Text>
            <Text className="mt-1 font-sans text-sm text-danger">
              Danger text
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
