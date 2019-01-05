# MAS Piano Songs Validator

[![Build Status](https://travis-ci.org/niktekusho/mas-piano-validator.svg?branch=master)](https://travis-ci.org/niktekusho/mas-piano-validator)

This repository contains the core library to validate the piano files used in the DDLC Mod ["Monika After Story"](https://github.com/Monika-After-Story/MonikaModDev).

## Introduction

In MAS you can play the piano to Monika and, depending on **how** the songs are *described*, she reacts to the song played.

The mod recognizes all piano songs by parsing JSON formatted files.

This library and CLI application allow you to validate the *structure* of the songs you are working on.

**This project does not aim to check for the actual correctness of the song you are authoring.** 

## Installation

### Requirements
To use this application and library, you have to have installed [Node.js](https://nodejs.org/) and a console you can run commands into.

Node.js comes bundled with `npm`, a package manager used to manage software written in JavaScript, which serves as the installation medium for this software.

The **minimum required version** of Node.js is: [8 - codename "Carbon"](https://github.com/nodejs/Release#release-schedule).

You can check this requirement by running the following commands:

```sh
$ node -v
v8.15.0
$ npm -v
6.5.0
```

The critical part here is immediately after the character 'v' returned by the first command: `8` means we are using the minimum required version of Node.js. Any number higher than that works fine.

### Application

In your console, run the following command:

```sh
$ npm install -g mas-piano-validator
```

After the installation, you can check the application by running the command:

```sh
$ mas-piano-validator
```

### Library

First, you must have a Node.js project including a `package.json` file.

In your console, run the following command:

```sh
$ npm install mas-piano-validator
```

## Usage

### Application

By running one of the following commands:

```sh
$ mas-piano-validator
$ mas-piano-validator -h
$ mas-piano-validator --help
```

you can read this specific document explaining the usage of the application.

### Library

TODO

## Related

TODO


