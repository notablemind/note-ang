
var expect = require('chai').expect
  , angular = require('angularjs')
  , query = require('query')
  , settings = require('settings')
  , keys = require('keys')
  , note = require('note');

var bootstrap = function (templateId, mainModule) {
  var src = document.getElementById(templateId).innerHTML;
  var parent = document.createElement('div');
  parent.innerHTML = src;
  var node = parent.firstElementChild;
  document.body.appendChild(node);
  angular.bootstrap(node, [mainModule]);
  return node;
};

after(function(){
  // bootstrap('template', 'test');
});

// no phantomjs
var keyme = function (node, name) {
  var e = new Event('keydown');
  var attrs = keys.serialize(name);
  if (!attrs) throw new Error('bad key name: ' + name);
  Object.keys(attrs).forEach(function(key){
    e[key] = attrs[key];
  });
  node.dispatchEvent(e);
};

var keyyou = function (name) {
  var attrs = keys.serialize(name);
  attrs.preventDefault = function(){};
  attrs.stopPropagation = function(){};
  return attrs;
};
 
describe('note guy', function(){
  var node, injector;
  beforeEach(function(){
    node = bootstrap('template', 'test');
    injector = angular.element(node).injector();
  });
  afterEach(function(){
    node.parentNode.removeChild(node);
    injector = undefined;
  });
    
  it('should load, having a head and a body', function(){
    var head = query('.head', node)
      , body = query('.body', node);
    expect(head).to.be.ok;
    expect(body).to.be.ok;
  });

  it('should have 10 titles', function(){
    var titles = query.all('.title', node);
    expect(titles.length).to.eql(10);
  });

  describe('when the second title is focused', function(){
    var title, $title, settings;
    beforeEach(function(){
      title = query.all('.title', node)[1];
      $title = angular.element(title);
      title.focus();
      settings = injector.get('settings');
    });
    describe('and the down key is pressed', function(){
      beforeEach(function(){
        var down = settings.get('goDown');
        // keyme(title, down.split('|')[0]);
        var e = keyyou(down.split('|')[0]);
        var s = $title.scope();
        $title.scope().keydown(e);
      });
      it('should focus the next one', function(){
        var next = query.all('.title', node)[2];
        expect(document.activeElement).to.equal(next);
      });
    });
    describe('and the up key is pressed', function(){
      beforeEach(function(){
        var up = settings.get('goUp').split('|')[0];
        var e = keyyou(up);
        $title.scope().keydown(e);
        // keyme(title, up);
      });
      it('should focus the previous one', function(){
        expect(document.activeElement).to.equal(query('.title', node));
      });
    });
  });

  // TODO: record functionality for moving up and down the tree
});

