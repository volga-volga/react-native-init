export type Navigation = {
  dispatch: (arg: any) => void,
  navigate: (routeName: string, params: ?{}) => any,
  goBack: () => void,
  setParams: (params: {}) => any,
  state: ?{
    params: ?{
      // PhoneConfirmation
      id: ?string,
      code: ?string,
      // NewTask
      refreshTasksList: ?() => void,
      task: ?Task,
      onApply: ?(price: ?number) => void,
      // NewStage
      stage: ?LocalStage,
      index: number,
      start: Date,
      deadline: Date,
      // TaskInfo
      id: string,
      stageId: string,
      refresh: () => void
    }
  }
};

export type ScreenProps = {
  token: string,
  user: User,
  setToken: (token: string) => any,
  setUser: (user: ?User) => any,
  logout: (navigation: Navigation) => any,
  updatePushState: (notifications: boolean) => any,
  setStatusBarDark: (isDark: boolean) => any,
  onInvalidToken: (navigation: Navigation) => any
};
