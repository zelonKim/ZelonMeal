import { Dimensions, Platform } from "react-native";

export const { height } = Dimensions.get("window");

export const CARD_HEIGHT = Platform.select({
  ios: height * 0.33,
  android: height * 0.38,
  default: height * 0.4,
});
