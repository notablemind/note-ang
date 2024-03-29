
build: index.js notes.styl template.js
	@component build --dev --use component-stylus

buildci: components
	@component build --dev

template.js: template.html
	@component convert $<

template.html: template.jade
	@jade template.jade

components: component.json
	@component install --dev

node_modules: package.json
	@npm install

clean:
	rm -fr build components template.js

testem: build
	@testem -f test/testem.json -l Chrome

# open browser correctly in mac or linux
UNAME_S := $(shell uname -s)
ifeq ($(UNAME_S),Linux)
		open := google-chrome
endif
ifeq ($(UNAME_S),Darwin)
		open := open
endif

example: build
	@${open} test/example.html

test: lint test-only
testci: lint testci-only

test-only: build
	@${open} test/index.html

testci-only: buildci
	@testem ci -f test/testem.json -l PhantomJS

lint:
	@./node_modules/.bin/jshint *.js *.json test/setup-e2e.js test/tests-e2e.js

.PHONY: clean testem test testci buildci test-only lint testci-only
