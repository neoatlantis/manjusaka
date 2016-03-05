all:

build/data.js: messages/*.yaml jsdata-gen.py
	python jsdata-gen.py
