
build: components index.js notes.styl template.js
	@component build --dev

template.js: template.html
	@component convert $<

template.html: template.jade
	@jade template.jade

components: component.json
	@component install --dev

clean:
	rm -fr build components template.js

.PHONY: clean
