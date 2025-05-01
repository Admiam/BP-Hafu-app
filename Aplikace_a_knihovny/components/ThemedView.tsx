import { View, type ViewProps } from 'react-native';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  className?: string;
};

export function ThemedView({ style, lightColor, darkColor, className, ...otherProps }: ThemedViewProps) {

  return (
      // If using NativeWind, you might need to import the tw-styled version of View
      // or wrap your component with `styled` from nativewind.
      <View style={style} {...otherProps} />
  );
}
