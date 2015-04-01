# CSED Research Project


### Overview
Leveraging the Center for Games back-end, this project is for visualizing programming practice problems and how to solve them.

## Setup

#### Prerequisites
1. git
1. ssh

#### Overview of setup procedure
Alright, you thought this was going to be easy. :P Don't worry, it's not too bad.

This doc walks you through how to checkout the code, running into the walls I ran into while trying to set it up.

1. Ensure your git executable knows how to talk to gitlab.cs.washington.edu
1. Pick your editor (this doc is written for using WebStorm)
1. Checkout the code base
...

### Ensure your git knows how to talk to gitlab
Gitlab.cs prefers that we use ssh keys and a shared username to clone the code. Read more below if you want to know more
 about what's going on.


1. Pick a local directory for your git repository (your copy of the source code) to live in
    * Get your terminal open to this directory
1. Head to the project at [https://gitlab.cs.washington.edu/csedresearch/csedresearch]
1. Grab the cloning url with ssh selected (as opposed to https), and git clone the repo:
    * ```
% git clone git@gitlab.cs.washington.edu:csedresearch/csedresearch.git
```
1. Now, when you run this command it should prompt you for a password. *You won't ever enter a password for that user,
    so hit CTL-C to cancel the clone command.*
1. A simpler command that should yield the same issue is:```
 % ssh -T git@gitlab.cs.washington.edu
```
1. What we need instead is a public/private pair of keys that will authenticate you instead. First, check to see if you
 have an ssh_key on your development box that you can use:
    * probably would be stored in ~/.ssh/id_rsa(.pub)
    * If you don't, what you need to do is generate a public/private keypair, and have git (over ssh) use that instead of password authentication.
    * Follow the instructions here [https://gitlab.cs.washington.edu/help/ssh/README] to create a keypair
        * When it prompted me for a keyfile name, I used 'id_rsa'
        * I haven't figured out how to make everything run smoothly if you don't use the filename 'id_rsa'
        * When it prompted me for a passphrase, I simply hit enter (It is impossible to retrieve, so I picked an easy one to remember).
            * github doesn't recommend this: [https://help.github.com/articles/generating-ssh-keys/]
1. Whew! Now that you have a keypair, give the gitlab server the public half of the keypair
    * Go to your profile page on gitlab: [https://gitlab.cs.washington.edu/profile]
    * And get to the part where you add ssh keys to your account: [https://gitlab.cs.washington.edu/profile/keys/new]
1. The name of my key on gitlab reflects the name of the key file, and the computer it is on. (macbook id_rsa)
1. In the key section, paste the entire output of
    *```
    % cat ~/.ssh/id_rsa.pub
    % # or whatever you named your public key
```
1. Your ssh client should be configured to pick up ssh keys in the id_rsa(.pub) files automatcally, so try to connect
   to gitlab again:
   *```
    % ssh -T git@gitlab.cs.washington.edu
```
1. If it didn't work, you should get prompted for git@gitlab's password again. Some debugging info will come out if you:
    *```
 % ssh -T git@gitlab.cs.washington.edu
```
    * look for ssh trying to do public key auth using id_rsa, or whatever you named your key.
1. If it gives you a welcome message with your name, awesome! You got it, dude!
1. If you want to clone the repo, that's fine. I cloned it, and then deleted it, because I want to use the source control
   through the IDE.

