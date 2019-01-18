import React from 'react';
import { AppRegistry, BackHandler, StatusBar, View } from 'react-native';
import { Provider } from 'react-redux';
import AppNavigator from './routes';

export const App = () => (
  <Provider store={store}>
    <AppNavigator />
  </Provider>
);
