
var keys = require('keys')
  , query = require('query')
  , angular = require('angularjs')
  , events = require('event');

// angular modules
require('tags');
require('contenteditable');
var settings = require('settings')
  , angularSettings = require('angular-settings');

var settingsShortcut = require('settings-shortcut');
angularSettings.register('keyboard-shortcut', settingsShortcut);

var template = require('./template')
  , defaultSettings = require('./settings')
  , makeKeyMap = require('./keymap').makeKeyMap
  , makeMovers = require('./movement').makeMovers;

// module.exports.defaultSettings = defaultSettings;

settings.add(defaultSettings);

angular.module('note', ['tags', 'contenteditable'])
  .directive('note', ['$compile', 'settings',
    function($compile, settings){
      return {
        scope: {},
        replace: true,
        restrict: 'A',
        link: function (scope, element, attrs) {
          var name = attrs.note;
          element.html(template);
          $compile(element.contents())(scope);
          scope.$parent.$watch(name, function(value) {
            scope.note = value;
          });
          scope.$watch('note', function(value) {
            scope.$parent[name] = value;
          });
          scope.parent = null;
          if (scope.$parent.$parent &&
              scope.$parent.$parent.move) {
            scope.parent = scope.$parent.$parent;
          }
          scope.el = element[0];
          scope.title = query('.title', scope.el);
          scope.body = query('.body', scope.el);
          scope.index = function () {
            return scope.$parent.$index;
          };
          scope.move = makeMovers(scope);
          scope.keydown = makeKeyMap(settings, scope);
          var keydown = keys(settings.getHashKeys(scope.keydown, {pre: 'nav.'}));
          events.bind(scope.title, 'keydown', keydown);
        }
      };
    }]);

