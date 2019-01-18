export type Navigation = {
  dispatch: (arg: any) => void,
  navigate: (routeName: string, params: ?{}) => any,
  goBack: () => void,
  setParams: (params: {}) => any,
};

