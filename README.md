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
* Following commands should be available in shell:
   * `python`, `gpg`, `make`
   * `git`
   * `browserify` and `uglify` (This could be removed in the future).

### Usage

0. `git clone https://github.com/neoatlantis/manjusaka`
0. `cd` into the `sample-messages/` and read the examples.
0. `cd ..` and create a `messages/` directory on the same level as of
   `sample-message`, i.e. on the root directory of this project.
0. define your own ACL rules(see `sample-messages/_acl.yaml`) in `messages/`
   dir, and write your other testaments in the same dir with `.yaml` suffix.
0. use `make test` to make fastly but a large composed webpage(`build/page.html`).
   Or use `make` directly to make a compressed one(`build/page.min.html`).
0. **remember** write down the passwords the program have given to you after
   `make`. Put them in emails that should be scheduled for sending after death.
0. you can now load the webpage and test that with passwords and Q&As.
0. if everything is fine, publish the page wherever you want, maybe the blog?


### Planned

* GPG signature for each testament.
* Multi-language support.
