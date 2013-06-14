
build: components index.js notes.styl template.js node_modules
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

test: build
	@${open} test/index.html

testci: build
	@testem ci -f test/testem.json -l PhantomJS

.PHONY: clean testem test testci buildci
