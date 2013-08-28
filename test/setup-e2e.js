
var expect = require('expect.js')
  , angular = require('angularjs')
  , settings = require('settings')
  , angularSettings = require('angular-settings')
  , note = require('note')
  , Events = require('scoped-events');

angularSettings.factory('settings', settings.getSettings());

angular.module('test', ['note', 'settings'])
  .factory('$exceptionHandler', function () {
    return function (exception, cause) {
      exception.message += ' (caused by "' + cause + '")';
      throw exception;
    };
  })
  .controller('Tester', ['$scope', function ($scope) {
    $scope.events = new Events();
    $scope.events.on('move:wf:up', function () {
      console.log([].slice.call(arguments));
    });
    $scope.mylar = {
      title: 'Mankey',
      tags: [],
      properties: {
        type: 'major',
        id: '1',
        slug: 'Mankey'
      },
      children: [
        {title: 'Food', children:[], properties: {id: '2'}},
        {title: 'Friends', children:[],
         properties: {type: 'major', id: '3', slug: 'friends'}},
        {title: 'Family2', children:[], properties: {id: '4'}},
        {title: 'Family3', children:[], properties: {id: '5'}},
        {title: 'Family4', children:[], properties: {id: '6'}},
        {title: 'Family5', children:[], properties: {id: '7'}},
        {title: 'Family6', children:[
          {title: 'Family7', children:[], properties: {id: '9'}},
        ], properties: {id: '8'}},
        {title: 'Family8', children:[], properties: {id: '10'}}
      ]
    };
  }]);

