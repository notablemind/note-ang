
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
      {title: 'Family2', children:[]},
      {title: 'Family3', children:[]},
      {title: 'Family4', children:[]},
      {title: 'Family5', children:[]},
      {title: 'Family6', children:[
        {title: 'Family7', children:[]},
      ]},
      {title: 'Family8', children:[]}
    ]
  };
}

angular.module('test', ['note'])
  .factory('settings', function(){
    return new settings.SettingsManager(note.defaultSettings);
  });

