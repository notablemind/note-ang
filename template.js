module.exports = '<div ng-class="{&quot;major&quot;: note.properties.type == &quot;major&quot;}" class="note"><div class="head"><div class="bullet">{{ note.properties.type == "major" ? "&raquo;" : "&bull;" }}</div><span data-ng-model="note.title" contenteditable="true" class="title"></span><div data-tags="note.tags" class="tags"></div></div><div class="body"><div data-ng-repeat="child in note.children" data-note="child" class="child"></div></div></div>';