import { createStackNavigator, createAppContainer } from 'react-navigation';
import { Animated, Easing } from 'react-native';
import * as screens from './routeNames';
import Splash from '../screens/Splash/Splash';

const nullHeaderNavigationOptions = { header: () => null };

const AppNavigator = createStackNavigator(
  {
    [screens.SPLASH]: {
      screen: Splash,
      navigationOptions: nullHeaderNavigationOptions
    }
  },
  {
    cardStyle: { backgroundColor: 'white', shadowColor: 'transparent' },
    navigationOptions: ({ navigation }) => {
      if (navigation.state.params?.disableGestures) {
        return { gesturesEnabled: false };
      }
      return { gesturesEnabled: true };
    },
    initialRouteName: routeNames.SPLASH,
    transitionConfig: (...arg) => {
      const { routes } = arg[0].navigation.state;
      if (
        routes[routes.length - 1].params &&
        routes[routes.length - 1].params.disableAnimation
      ) {
        return {
          transitionSpec: {
            duration: 0,
            timing: Animated.timing,
            easing: Easing.step0
          }
        };
      }
      return null;
    }
  }
);

const AppContainer = createAppContainer(AppNavigator);

export default AppContainer;
