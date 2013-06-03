
var template = require('template');

var ng = {
  deps: ['tags'],
  directive: {
    scope: {},
    replace: true,
    restrict: 'A',
    template: template,
    link: function (scope, element, attrs) {
      var name = attrs.note;
      var localName = 'note';
      scope.$parent.$watch(name, function(value) {
        scope[localName] = value;
      });
      scope.$watch(localName, function(value) {
        scope.$parent[name] = value;
      });
    }
  }
};

module.exports = ng;


