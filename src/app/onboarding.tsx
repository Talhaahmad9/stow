import { useFocusEffect } from "expo-router";
import { Image } from "expo-image";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  BackHandler,
  FlatList,
  Pressable,
  Text,
  View,
  useWindowDimensions,
  type ListRenderItemInfo,
} from "react-native";
import { AppScreen } from "../components/app-screen";
import { StowIcon, type StowIconName } from "../components/ui/stow-icon";
import {
  useOnboardingState,
  writeOnboardingComplete,
} from "../features/onboarding/onboarding-state";
import { useCssVariables } from "../hooks/useCssVariables";

type OnboardingPage = "brand" | "how-it-works";

const PAGES: OnboardingPage[] = ["brand", "how-it-works"];

const FEATURES: Array<{
  icon: StowIconName;
  title: string;
  description: string;
}> = [
  {
    icon: "square-pen",
    title: "Capture",
    description: "Save a thought, photo, or file.",
  },
  {
    icon: "bell",
    title: "Remember",
    description: "Add a reminder when it matters.",
  },
  {
    icon: "inbox",
    title: "Sort later",
    description: "Everything starts in your Inbox.",
  },
];

const LOGO = require("../../assets/images/stow-mark-master.png");

function PaginationDots({ activeIndex }: { activeIndex: number }) {
  return (
    <View
      className="mb-5 flex-row items-center justify-center gap-2"
      accessibilityLabel={`Onboarding page ${activeIndex + 1} of 2`}
    >
      {[0, 1].map((index) => (
        <View
          key={index}
          className={`h-2.5 rounded-full ${
            index === activeIndex ? "w-7 bg-accent" : "w-2.5 bg-border"
          }`}
        />
      ))}
    </View>
  );
}

function PrimaryAction({
  label,
  onPress,
}: {
  label: "Next" | "Finish";
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="min-h-12 w-full items-center justify-center rounded-2xl bg-accent px-4 py-3 active:bg-accent-pressed"
    >
      <Text className="font-sans-semibold text-base text-on-accent">
        {label}
      </Text>
    </Pressable>
  );
}

function BrandPage() {
  return (
    <View className="flex-1 justify-between px-6 py-6">
      <View className="flex-1 items-center justify-center">
        <View className="h-32 w-32 items-center justify-center overflow-hidden rounded-3xl bg-[#5B5BD6]">
          <Image
            source={LOGO}
            contentFit="contain"
            style={{ width: 112, height: 112 }}
            accessibilityLabel="Stow logo"
          />
        </View>
        <Text className="mt-6 font-sans-semibold text-4xl text-foreground">
          Stow
        </Text>
        <Text className="mt-2 text-center font-sans text-lg text-foreground-muted">
          Stow away your thoughts
        </Text>
      </View>
    </View>
  );
}

function FeatureRow({
  icon,
  title,
  description,
}: {
  icon: StowIconName;
  title: string;
  description: string;
}) {
  const colors = useCssVariables();
  return (
    <View className="mb-5 flex-row items-center">
      <View className="mr-4 h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft">
        <StowIcon name={icon} size={23} color={colors.accent} />
      </View>
      <View className="flex-1">
        <Text className="font-sans-semibold text-lg text-foreground">
          {title}
        </Text>
        <Text className="mt-1 font-sans text-base text-foreground-muted">
          {description}
        </Text>
      </View>
    </View>
  );
}

function HowItWorksPage() {
  return (
    <View className="flex-1 justify-between px-6 py-6">
      <View className="pt-6">
        <Text className="font-sans-semibold text-3xl text-foreground">
          How Stow works
        </Text>
        <View className="mt-10">
          {FEATURES.map((feature) => (
            <FeatureRow key={feature.title} {...feature} />
          ))}
        </View>
      </View>
    </View>
  );
}

export default function Onboarding() {
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList<OnboardingPage>>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const { markCompleted } = useOnboardingState();

  useEffect(() => {
    listRef.current?.scrollToOffset({
      offset: activeIndex * width,
      animated: false,
    });
  }, [activeIndex, width]);

  const moveToPage = useCallback(
    (index: number) => {
      listRef.current?.scrollToIndex({ index, animated: true });
    },
    [],
  );

  const handleFinish = useCallback(async () => {
    try {
      await writeOnboardingComplete();
      markCompleted();
    } catch (error) {
      console.error("Unable to save onboarding completion.", error);
      Alert.alert(
        "Onboarding not finished",
        "We could not save your onboarding progress. Please try again.",
      );
    }
  }, [markCompleted]);

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        () => {
          if (activeIndex === 1) {
            moveToPage(0);
            return true;
          }
          return false;
        },
      );
      return () => subscription.remove();
    }, [activeIndex, moveToPage]),
  );

  const renderPage = useCallback(
    ({ item }: ListRenderItemInfo<OnboardingPage>) => (
      <View style={{ width }}>
        {item === "brand" ? <BrandPage /> : <HowItWorksPage />}
      </View>
    ),
    [width],
  );

  return (
    <AppScreen>
      <View className="flex-1 bg-background">
        <FlatList
          ref={listRef}
          data={PAGES}
          keyExtractor={(item) => item}
          renderItem={renderPage}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          bounces={false}
          getItemLayout={(_, index) => ({
            length: width,
            offset: width * index,
            index,
          })}
          onMomentumScrollEnd={(event) => {
            const nextIndex = Math.round(
              event.nativeEvent.contentOffset.x / width,
            );
            setActiveIndex(nextIndex);
          }}
        />
        <View className="px-6 pb-6">
          <PaginationDots activeIndex={activeIndex} />
          {activeIndex === 0 ? (
            <PrimaryAction label="Next" onPress={() => moveToPage(1)} />
          ) : (
            <PrimaryAction label="Finish" onPress={() => void handleFinish()} />
          )}
        </View>
      </View>
    </AppScreen>
  );
}
