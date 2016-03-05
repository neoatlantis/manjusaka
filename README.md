Project Manjusaka
=================

This project trys to generate a single webpage, which carries your most
important words after death.

Using cryptography, one can load his/her post-mortem message(testaments) in a
secured way that can be decrypted only with given keys and correct answers to a
series of questions.

The generated single web page can then be put to e.g. somewhere on a personal
website. The keys for reading such messages can be loaded into pre-written
emails, which will be sent after online inactivity of the author exceeds.

### Requirements

To run this program, you need to:

* Use a Linux distribution.
* Be able to run `python`, `gpg` and `make` commands(most Linux distros have
  already got them as default).

### Features(planned):

* YAML-formatted testament input, with customization on catalog and required
  questions.
* GPG signature for each testament.
* Multi-language support.
