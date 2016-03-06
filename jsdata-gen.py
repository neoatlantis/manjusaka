#!/usr/bin/env python

"""
Generate the web page carrying post-mortem messages.
"""

import base64
import hashlib
import hmac
import json
import os
import subprocess
import sys
import yaml



# ---- Function for calling GPG encryption

def gpgEncryptWithPassword(message, password):
    cmd = [
        'gpg',
        '--armor',
        '--symmetric',
        '--cipher-algo', 'AES',
        '--passphrase', password,
    ]
    proc = subprocess.Popen(
        cmd,
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE
    )
    out, err = proc.communicate(input=message)
    if err:
        raise Exception(
            'GPG encryption failed. Check GPG installation and try again.'
        )
    return out



# ---- ACL rules manager, which decides passwords for each message

class ACLManager:

    def __init__(self, path):
        # 1. Load ACL configuration and check format
        config = yaml.load(open(path, 'r').read())
        try:
            assert type(config["categories"]) == list
            assert type(config["qa"]) == dict
            for each in config["categories"]: assert(type(each) == str)
            for each in config["qa"]: 
                assert type(each) == str
                assert type(config["qa"][each]["q"]) == str
                assert type(config["qa"][each]["a"]) == str
        except:
            raise Exception("ACL configuration error.")

        # 2. Load categories and generate password seeds for them.
        #    Notice that human-readable form will be directly feed to
        #    GPG(instead of feeding raw bytes).
        self.categoryPasswordSeeds = {}
        for each in config["categories"]:
            seed = base64.b32encode(os.urandom(20)).strip('=').lower()
            self.categoryPasswordSeeds[each] = {
                "seed": seed,
                "puzzle": hashlib.sha256(seed).hexdigest()[:16].lower(),
            }
        
        # 3. Load QA definitions, generate and encrypt password seeds
        self.qa = config["qa"]
        for each in self.qa:
            self.qa[each]["seed"] = os.urandom(16)
            self.qa[each]["puzzle"] = gpgEncryptWithPassword(
                self.qa[each]["seed"],
                self.qa[each]["a"] # encrypt with 'a'-answer
            )

    def hints(self):
        categories = {}
        for each in self.categoryPasswordSeeds: 
            categories[each] = self.categoryPasswordSeeds[each]["puzzle"]
        qa = {}
        for each in self.qa:
            qa[each] = {
                "q": self.qa[each]["q"],
                "puzzle": self.qa[each]["puzzle"]
            }
        return { 'categories': categories, 'qa': qa }

    def showSeeds(self):
        ret = {}
        for each in self.categoryPasswordSeeds:
            ret[each] = self.categoryPasswordSeeds[each]["seed"]
        return ret

    def encrypt(self, message, category, questions=[]):
        # 1. Find category determined password seed
        if not self.categoryPasswordSeeds.has_key(category):
            raise Exception(\
                "Category [%s] not defined in ACL profile." % category
            )
        categoryPasswordSeed = self.categoryPasswordSeeds[category]["seed"]

        # 2. Gather seeds determined by questions
        questionGathered = []
        for questionID in questions:
            if not self.qa.has_key(questionID):
                raise Exception(\
                    "Question [%s] not defined in ACL profile." % questionID
                )
            questionProfile = self.qa[questionID]
            questionGathered.append((questionID, questionProfile))

        # 3. Generate encryption passphrase for message. This is done by (1)
        #    calculating HMACs using each question's seed as key against the
        #    category seed, and (2) joining the HMACs together as a new key,
        #    and using this key to authenticate the category seed again as
        #    final output of passphrase.
        #
        #    The category seed can be seen as a `main-key`. Step (1) works as
        #    a proof of knowledge of all seeds, and (2) just makes sure the
        #    output consisting of both category-seed and question-seed and is
        #    in HEX format.
        questionGathered.sort(key=lambda i: i[0]) # sort questions by their ID
        questionSeeds = [i[1]["seed"] for i in questionGathered]
        hmacs = [hmac.HMAC(
            s,
            categoryPasswordSeed,
            hashlib.sha256
        ).digest() for s in questionSeeds]
        finalKey = hmac.HMAC(
            ''.join(hmacs),
            categoryPasswordSeed,
            hashlib.sha256
        ).hexdigest().lower() # NOTICE here is HEX outputed.

        # 4. Encrypt the message using key.
        ciphertext = gpgEncryptWithPassword(message, finalKey)

        # 5. return ciphertext
        return ciphertext



# ---- Testament file parsing and encrypting

class TestamentParser:

    def __init__(self, acl): # requires an instance of ACLManager
        self.acl = acl

    def process(self, path): # process a testament file
        content = open(path, 'r').read()
        contentLines = [i.strip() for i in content.split('\n')]
        try:
            endOfYaml = contentLines.index('...')
            yamlStr = '\n'.join(contentLines[:endOfYaml])
            bodyStr = '\n'.join(contentLines[endOfYaml+1:])
            meta = yaml.load(yamlStr)

            assert type(meta["category"]) == str
            category = meta["category"]

            questions = []
            if meta.has_key("questions"):
                assert type(meta["questions"] == list)
                for each in meta["questions"]: assert type(each) == str
                questions = meta["questions"]
        except:
            raise Exception("Malformed testament message input.")

        ciphertext = acl.encrypt(bodyStr, category, questions)
        return {
            "ciphertext": ciphertext,
            "category": category,
            "questions": questions,
        }


##############################################################################
# Proceed all yaml files

BASE = os.path.realpath(os.path.dirname(sys.argv[0]))

subprocess.call(['mkdir', '-p', os.path.join(BASE, 'build')])
outputFile = open(os.path.join(BASE, 'build', 'data.js'), 'w+')
write = outputFile.write


acl = ACLManager(os.path.join(BASE, 'messages', '_acl.yaml'))
parser = TestamentParser(acl)


# ---- output QA hints

hints = acl.hints()

write('var hints = %s;\n' % json.dumps(hints))


# ---- process all messages

write('var messages = [');

filelist = os.listdir(os.path.join(BASE, 'messages'))
filelist = [i for i in filelist if i.endswith('.yaml') and i != '_acl.yaml']
for filename in filelist:
    fullpath = os.path.join(BASE, 'messages', filename)
    result = parser.process('messages/001-to-alice.yaml')

    write(json.dumps(result) + ', ')

write('];\n')

# ---- close file

outputFile.close()

# ---- show seeds

seeds = acl.showSeeds()
for each in seeds:
    print "%20s -> %s" % (each, seeds[each])
