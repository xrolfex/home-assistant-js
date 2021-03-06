import { getters as authGetters } from '../auth';
import { getters as streamGetters } from '../stream';
import { getters as navigationGetters } from '../navigation';

const storage = 'localStorage' in window ? localStorage : {};

const observe = {
  authToken: {
    getter: [
      authGetters.currentAuthToken,
      authGetters.rememberAuth,
      (authToken, rememberAuth) => rememberAuth ? authToken : null,
    ],
    defaultValue: null,
  },
  useStreaming: {
    getter: streamGetters.useStreaming,
    defaultValue: true,
  },
  showSidebar: {
    getter: navigationGetters.showSidebar,
    defaultValue: false,
  },
};

const preferences = {};

Object.keys(observe).forEach(prop => {
  if (!(prop in storage)) {
    storage[prop] = observe[prop].defaultValue;
  }

  Object.defineProperty(preferences, prop, {
    get: () => {
      try {
        return JSON.parse(storage[prop]);
      } catch (err) {
        return observe[prop].defaultValue;
      }
    },
  });
});

preferences.startSync = function startSync(reactor) {
  Object.keys(observe).forEach(prop => {
    const { getter } = observe[prop];
    const valueChanged = function valueChanged(value) {
      storage[prop] = JSON.stringify(value);
    };
    reactor.observe(getter, valueChanged);
    valueChanged(reactor.evaluate(getter));
  });
};

export default preferences;
