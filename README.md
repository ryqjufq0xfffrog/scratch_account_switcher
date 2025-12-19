# Scratch account switcher

This extension for Chrome & Firefox enables you to switch between multiple Scratch accounts easily. 
![screenshot image showing a context menu](/screenshot0.png "screenshot")
Adds some entries to the account menu of Scratch. (See the screenshot above.)

# Building
First, install `web-ext`. Recommended way is to use npm:
```
npm i --global web-ext
```
Then run 
```
make firefox
```
to generate zip file.

# Testing

run
```
make test
```
to launch firefox session for debugging.
