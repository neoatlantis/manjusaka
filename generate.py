#!/usr/bin/env python

"""
Generate the web page carrying post-mortem messages.
"""

import base64
import hashlib
import hmac
import os
import subprocess
import yaml


# ---- Function for calling GPG encryption

def gpgEncryptWithPassword(message, password):
    cmd = [
        'gpg',
        '--armor',
        '--symmetric',
        '--passphrase', password,
    ]
    proc = subprocess.Popen(
        cmd,
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE
    )
    out, err = proc.communicate(input=message)
    return out



# ---- ACL rules manager, which decides passwords for each message

class ACLManager:

    def __init__(self, configYaml):
        # 1. Load ACL configuration and check format
        config = yaml.load(configYaml)
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

        # 2. Load categories and generate password seeds for them
        self.categoryPasswordSeeds = {}
        for each in config["categories"]:
            self.categoryPasswordSeeds[each] = base64.b32encode(
                os.urandom(20)
            ).strip("=").lower()
        
        # 3. Load QA definitions, generate and encrypt password seeds
        self.qa = config["qa"]
        for each in self.qa:
            self.qa[each]["seed"] = os.urandom(16)
            self.qa[each]["puzzle"] = gpgEncryptWithPassword(
                self.qa[each]["seed"],
                self.qa[each]["a"] # encrypt with 'a'-answer
            )

        print self.categoryPasswordSeeds
        print self.qa

    def encrypt(self, message, category, questions=[]):
        # 1. Find category determined password seed
        if not self.categoryPasswordSeeds.has_key(category):
            raise Exception(\
                "Category [%s] not defined in ACL profile." % category
            )
        categoryPasswordSeed = self.categoryPasswordSeeds[category]

        # 2. Gather seeds determined by questions, and sort by question ID
        questionGathered = []
        for questionID in questions:
            if not self.qa.has_key(questionID):
                raise Exception(\
                    "Question [%s] not defined in ACL profile." % questionID
                )
            questionProfile = self.qa[questionID]
            questionGathered.append((questionID, questionProfile))
        questionGathered.sort(key=lambda i: i[0]) # sort questions by their ID

        # 3. Generate encryption passphrase for message. This is done by (1)
        #    calculating HMACs using each question's seed as key against the
        #    category seed, and (2) joining the HMACs together as a new key,
        #    and using this key to authenticate the category seed again as
        #    final output of passphrase.
        #
        #    The category seed can be seen as a `main-key`. Step (1) works as
        #    a proof of knowledge of all seeds, and (2) just makes the output
        #    consisting of both category-seed and question-seed.
        questionSeeds = [i[1]["seed"] for i in questionGathered]
        hmacs = [hmac.HMAC(
            s,
            categoryPasswordSeed,
            hashlib.sha1
        ).digest() for s in questionSeeds]
        finalKey = hmac.HMAC(
            ''.join(hmacs),
            categoryPasswordSeed,
            hashlib.sha256
        ).digest()

        # 4. Encrypt the message using key.
        ciphertext = gpgEncryptWithPassword(message, finalKey)

        # 5. return (ciphertext, category-seed), where
        return (ciphertext, categoryPasswordSeed)




acl = ACLManager(open('messages/_acl.yaml', 'r').read())

print acl.encrypt('test', 'soulmate', ['birthday', 'id-number'])
