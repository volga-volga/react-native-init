import { AppRegistry, BackHandler, StatusBar, View } from 'react-native';
import { createStore, applyMiddleware } from 'redux';
import {
  reduxifyNavigator,
  createReactNavigationReduxMiddleware
} from 'react-navigation-redux-helpers';
import { Provider, connect } from 'react-redux';
import { NavigationActions } from 'react-navigation';
import React from 'react';
import thunk from 'redux-thunk';
import AppNavigator from './routes';
import reducers from './reducers';

NavigationReduxMiddleware = createReactNavigationReduxMiddleware(
  'root',
  state => state.nav
);

const _App = reduxifyNavigator(AppNavigator, 'root');

const mapStateToProps = state => ({
  state: state.nav,
  navigation: state.nav
});

const store = createStore(
  reducers,
  applyMiddleware(thunk, NavigationReduxMiddleware)
);

const App2 = connect(mapStateToProps)(_App);

class Root extends React.Component {
  constructor(props) {
    super(props);
    this.onBackPress = this.onBackPress.bind(this);
  }

  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.onBackPress);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.onBackPress);
  }

  onBackPress() {
    const { dispatch, navigation } = this.props;
    if (navigation.index === 0) {
      return false;
    }
    dispatch(NavigationActions.back());
    return true;
  }

  render() {
    return (
      <View style={{ flex: 1, width: '100%', height: '100%' }}>
        <StatusBar
          ref={bar => {
            this.bar = bar;
          }}
          barStyle="light-content"
        />
        <App2 />
      </View>
    );
  }
}

const AppWithNavigationState = connect(mapStateToProps)(Root);

export const App = () => (
  <Provider store={store}>
    <AppWithNavigationState />
  </Provider>
);

// UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
console.disableYellowBox = true;

export default store;
