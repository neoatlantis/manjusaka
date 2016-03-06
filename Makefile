all: build/page.min.html

test: build/page.html

clean:
	rm -f build/*

build/page.html: template.html build/data.js build/index.js html-gen.py
	python html-gen.py build/data.js build/index.js > build/page.html

build/page.min.html: template.html build/data.min.js build/index.min.js html-gen.py
	python html-gen.py build/data.min.js build/index.min.js > build/page.min.html

build/index.min.js: build/index.js
	uglifyjs build/index.js > build/index.min.js

build/data.min.js: build/data.js
	uglifyjs build/data.js > build/data.min.js

build/data.js: messages/*.yaml jsdata-gen.py
	python jsdata-gen.py

build/index.js: jssrc/*.js
	browserify jssrc/index.js -o build/index.js
