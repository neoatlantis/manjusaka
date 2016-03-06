#!/usr/bin/env python

import os
import sys


BASE = os.path.realpath(os.path.dirname(sys.argv[0]))


def dumpFile(filename, writeFunc):
    f = open(filename, 'r')
    while True:
        data = f.read(65535)
        if not data: break
        writeFunc(data)
    f.close()


templateLines = [i.strip() for i in open(
    os.path.join(BASE, 'template.html'),
    'r'
).read().split('\n')]

splitLine = templateLines.index('<!-- INSERT SCRIPT HERE -->')

beforeHTML = '\n'.join(templateLines[:splitLine])
afterHTML = '\n'.join(templateLines[splitLine+1:])


write = sys.stdout.write
write(beforeHTML)

for each in sys.argv[1:]:
    dumpFile(os.path.join(BASE, each), write)

write(afterHTML)
