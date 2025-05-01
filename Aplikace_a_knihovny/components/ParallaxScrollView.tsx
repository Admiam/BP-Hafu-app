import type { PropsWithChildren, ReactElement } from 'react';
import {StyleSheet, SafeAreaView, StatusBar, Platform} from 'react-native';

export type ParallaxScrollViewProps = PropsWithChildren<{
  headerImage: ReactElement;
  headerBackgroundColor?: {
    dark?: string | undefined;
    light?: string | undefined;
  } | undefined;
  className?: string | undefined;

}>;

export default function ParallaxScrollView({
                                             children,
                                             headerImage,
                                             headerBackgroundColor,
                                           }: ParallaxScrollViewProps) {

  return (
      <SafeAreaView
          style={{ flex: 1, paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0 }}
      >
        {children}
      </SafeAreaView>
  );
}
