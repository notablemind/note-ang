
var expect = require('chai').expect
  , angular = require('angularjs')
  , settings = require('settings')
  , note = require('note');

function Tester($scope) {
  $scope.mylar = {
    title: 'Mankey',
    tags: [],
    properties: {type: 'major'},
    children: [
      {title: 'Food', children:[]},
      {title: 'Friends', children:[],
       properties: {type: 'major'}},
      {title: 'Family', children:[]},
      {title: 'Family', children:[]},
      {title: 'Family', children:[]},
      {title: 'Family', children:[]},
      {title: 'Family', children:[]},
      {title: 'Family', children:[]},
      {title: 'Family', children:[]}
    ]
  };
}

angular.module('test', ['note'])
  .factory('settings', function(){
    return new settings.SettingsManager(note.defaultSettings);
  });

