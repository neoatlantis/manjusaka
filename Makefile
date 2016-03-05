all: build/page.html

build/page.html: template.html build/data.js build/index.js html-gen.py
	python html-gen.py

build/data.js: messages/*.yaml jsdata-gen.py
	python jsdata-gen.py

build/index.js: jssrc/*.js
	browserify jssrc/index.js -o build/index.js
