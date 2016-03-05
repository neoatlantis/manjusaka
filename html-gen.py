#!/usr/bin/env python

import os
import sys


BASE = os.path.realpath(os.path.dirname(sys.argv[0]))

jsdata = open(os.path.join(BASE, 'build', 'data.js'), 'r')
jsscript = open(os.path.join(BASE, 'build', 'index.js'), 'r')

def dumpFile(f, writeFunc):
    while True:
        data = f.read(65535)
        if not data: break
        writeFunc(data)


templateLines = [i.strip() for i in open(
    os.path.join(BASE, 'template.html'),
    'r'
).read().split('\n')]

splitLine = templateLines.index('<!-- INSERT SCRIPT HERE -->')

beforeHTML = '\n'.join(templateLines[:splitLine])
afterHTML = '\n'.join(templateLines[splitLine+1:])

output = open(os.path.join(BASE, 'build', 'page.html'), 'w+')
write = output.write
write(beforeHTML)
dumpFile(jsdata, write)
dumpFile(jsscript, write)
write(afterHTML)
output.close()
