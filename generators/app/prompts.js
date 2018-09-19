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
  // {
  //   type: 'checkbox',
  //   name: 'dependencies',
  //   message: 'What more would you like?',
  //   choices: [
  //     {
  //       name: 'redux',
  //       value: 'includeRedux',
  //       checked: true
  //     },
  //     {
  //       name: 'react-native-vector-icons',
  //       value: 'includeRNVI',
  //       checked: true
  //     },
  //     {
  //       name: 'Modernizr',
  //       value: 'includeModernizr',
  //       checked: true
  //     }
  //   ]
  // },
  // {
  //   type: 'checkbox',
  //   name: 'libs',
  //   message: 'What more would you like?',
  //   choices: libs().map(i => ({
  //     name: i.name,
  //     value: i.name,
  //     checked: i.checked
  //   }))
  // }
];

// {
//   type: 'checkbox',
//   name: 'libs',
//   message: 'What more would you like?',
//   choices: libs().map(i => ({
//     name: i.name,
//     value: i.name,
//     checked: i.checked
//   }))
// }
// ];

// {
//   type: 'confirm',
//   name: 'redux',
//   message: 'Do you want to install redux/thunk/logger',
//   default: true
// },
// {
//   type: 'confirm',
//   name: 'icons',
//   message: 'Do you want to install vector icons',
//   default: true
// },

// module.exports = [
//   {
//     type: 'input',
//     name: 'title',
//     message: 'Your project title',
//     store: true
//   },
//   {
//     type: 'checkbox',
//     name: 'dependencies',
//     message: 'What more would you like?',
//     choices: [
//       {
//         name: 'redux',
//         value: 'includeRedux',
//         checked: true
//       },
//       {
//         name: 'react-native-vector-icons',
//         value: 'includeRNVI',
//         checked: true
//       }
//     ]
//   }
