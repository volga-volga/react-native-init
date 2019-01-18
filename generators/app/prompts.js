'use strict';

module.exports = [
  {
    type: 'input',
    name: 'title',
    message: 'Your project title',
    store: true
  },
  {
    type: 'input',
    name: 'packageName',
    message: 'Package name (com.google)',
    store: true
  },
  {
    type: 'input',
    name: 'apiKey',
    message: 'FABRIC API KEY',
    store: true
  },
  {
    type: 'input',
    name: 'buildSecrect',
    message: 'FABRIC BUILD SECRECT',
    store: true
  },
  {
    type: 'confirm',
    name: 'redux',
    message: 'Do you want to install redux/thunk/logger',
    default: true
  },
  {
    type: 'confirm',
    name: 'icons',
    message: 'Do you want to install vector icons',
    default: true
  }
]
