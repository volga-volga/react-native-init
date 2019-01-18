import { createStackNavigator, createAppContainer } from "react-navigation";
import * as screens from "./routeNames";
import Splash from "../screens/Splash/Splash";

const nullHeaderNavigationOptions = { header: () => null };

const AppNavigator = createStackNavigator(
  {
    [screens.SPLASH]: {
      screen: Splash,
      navigationOptions: nullHeaderNavigationOptions
    }
  },
  {
    cardStyle: { backgroundColor: "white", shadowColor: "transparent" },
    navigationOptions: ({ navigation }) => {
      if (navigation.state.params?.disableGestures) {
        return { gesturesEnabled: false };
      }
      return { gesturesEnabled: true };
    },
    initialRouteName: routeNames.SPLASH
  }
);

const AppContainer = createAppContainer(AppNavigator);

export default AppContainer;
