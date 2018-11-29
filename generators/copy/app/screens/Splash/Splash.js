import * as React from 'react';
import { View, StyleSheet, AsyncStorage } from 'react-native';
import { NavigationActions, StackActions } from 'react-navigation';
import type { Navigation, ScreenProps } from '../../lib/types';
import { routeNames } from '../../routes';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  }
});

type Props = {
  navigation: Navigation,
};

export default class Splash extends React.PureComponent<Props> {
  navigate(routeName: string): void {
    const resetAction = StackActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({ routeName })]
    });
    this.props.navigation.dispatch(resetAction);
  }

  render() {
    return <View style={styles.container} />;
  }
}
