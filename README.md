# CSED Research Project


### Overview
Leveraging the Center for Games back-end, this project is for visualizing programming practice problems and how to solve them.

## Setup

#### Prerequisites
1. git
1. ssh
1. IDE (I'm using WebStorm: [https://www.jetbrains.com/webstorm/] -- you can get a 1-year trial with a .edu email)

#### Overview of setup procedure
Alright, you thought this was going to be easy. :P Don't worry, it's not too bad.

This doc walks you through how to checkout the code, running into the walls I ran into while trying to set it up.

1. Ensure your git executable knows how to talk to gitlab.cs.washington.edu
1. Pick your editor (this doc is written for using WebStorm)
1. Checkout the code base
1. Make a simple commit
1. Setup the web server (apache)
...

### Ensure your git knows how to talk to gitlab
Gitlab.cs prefers that we use ssh keys and a shared username to clone the code. Read more below if you want to know more
 about what's going on.


1. Pick a local directory for your git repository (your copy of the source code) to live in
    * Get your terminal open to this directory
1. Head to the project at [https://gitlab.cs.washington.edu/csedresearch/csedresearch]
1. Grab the cloning url with ssh selected (as opposed to https), and git clone the repo:
    * ```% git clone git@gitlab.cs.washington.edu:csedresearch/csedresearch.git```
1. Now, when you run this command it should prompt you for a password. *You won't ever enter a password for that user, so hit CTL-C to cancel the clone command.*
1. A simpler command that should yield the same issue is:```% ssh -T git@gitlab.cs.washington.edu```
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
   *``` % ssh -T git@gitlab.cs.washington.edu ```
1. If it didn't work, you should get prompted for git@gitlab's password again. Some debugging info will come out if you:
    *``` % ssh -T git@gitlab.cs.washington.edu ```
    * look for ssh trying to do public key auth using id_rsa, or whatever you named your key.
1. If it gives you a welcome message with your name, awesome! You got it, dude!
1. If you want to clone the repo, that's fine. I cloned it, and then deleted it, because I want to use the source control
   through the IDE.


### WebStorm:

1. Download and install WebStorm [https://www.jetbrains.com/webstorm/]
1. Fire it up. When it asks what project to open, 'Check out a project using version control'
    * use 'git' not 'GitHub'
    * repo: git@gitlab.cs.washington.edu:csedresearch/csedresearch.git
    * parent dir and dir -- wherever you want the code on your file system
1. Create a new file with your name in it in the 'myfirstcommit' folder.
1. Write whatever you want in said file.
1. Use the VCS menu, or right-clicks, or the command line to 'git add' the file you created.
    * This 'stages' the file to be committed; in git parlance, it adds the file(s) to the index.
    * You generally don't 'git add' files until you are also ready to 'git commit' the files that you've added
1. Use the VCS menu, or right-clicks, or the command line to 'git commit' the staged files, (the index).
    * Include a short description of the purpose of your change
    * Once you commit on your local repo, this is a point that you can roll back to.
    * WebStorm won't fill out the author box, but gitlab is smart enough to know who you are from your ssh key
1. Use the VCS menu, or the command-line, to 'git push' your changes to the upstream 'origin' repository
    * Your commit doesn't get shared with anyone until you push it back up to gitlab.
    * (This isn't strictly true, but close enough. Someone can 'git pull' from your local repo if you set it up, but
      that's outside the scope.)
1. Assuming no errors, woo hoo! Check out your commit on the gitlab project page.


### Web Server!

#### Install it
1. Now that you have the code, we need to get a webserver set up to serve up the files.
1. If you are on a Mac, this is likely already done for you.
    * Since we are building a JS heavy application, we just need the webserver -- no need to track down MySQL/PHP, etc.
1. On Windows, the easiest thing to do would be to acquire an WAMP stack.
    * Or you can follow the apache docs for install here: http://httpd.apache.org/docs/2.2/platform/windows.html
    * WAMP stands for Windows: Apache, MySQL, PHP
    * Apache is the web server -- it's the program that listens for browsers to connect to it, finds web pages or runs server-side code, and sends the response back
    * MySQL is a database program, for fast, query-able access to large data sets. We don't need it for this project, but it comes bundled.
    * PHP is a server-side scripting language. Like MySQL, I don't think we'll need it for this project.
    * Either of these should work:
        * http://www.wampserver.com/en/
        * https://bitnami.com/stack/wamp
1. Linux -- use your package manage to get apache
    * maybe on ubuntu: ```% apt-get install apache2```?

#### Test it out
1. Start your server
1. Navigate to http://localhost/, and you should see a page
1. There are a buncha ways that you can hook your webserver up to the code base; I'mma just show you the one I like.
    * Find the root folder that Apache is serving out of
        * On a Mac, this is /Library/WebServer/Documents/
        * On Linux, this is probably /var/www/html/
    * Make a symbolic link from that directory to the public folder of the project:
        *```
% cd /Library/WebServer/Documents
% sudo ln -s <path_to_project_root>/public csed
```
1. Now navigate your browser to http://localhost/csed, and you should see the landing page! Boom, baby.
    * It should also say that d3 is working.