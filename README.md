# MAS Piano Songs Validator

![](https://img.shields.io/github/license/niktekusho/mas-piano-validator.svg) [![](https://img.shields.io/npm/v/mas-piano-validator.svg)](https://www.npmjs.com/package/mas-piano-validator) [![Build Status](https://travis-ci.org/niktekusho/mas-piano-validator.svg?branch=master)](https://travis-ci.org/niktekusho/mas-piano-validator) [![](https://img.shields.io/node/v/mas-piano-validator.svg)](https://www.npmjs.com/package/mas-piano-validator) [![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo) [![Maintainability](https://api.codeclimate.com/v1/badges/744538fb7227c1a86bea/maintainability)](https://codeclimate.com/github/niktekusho/mas-piano-validator/maintainability) [![](https://img.shields.io/bundlephobia/minzip/mas-piano-validator.svg)](https://bundlephobia.com/result?p=mas-piano-validator)

This repository contains the core library to validate the piano files used in the DDLC Mod ["Monika After Story"](https://github.com/Monika-After-Story/MonikaModDev).

The [Credits file](./CREDITS.md) clearly states who is the author of every song example you can find in this repository.

You can find the corresponding CLI application [here](https://github.com/niktekusho/mas-piano-validator-cli).

## Introduction

In MAS you can play the piano to Monika and, depending on **how** the songs are *described*, she reacts to the song played.

The mod recognizes all piano songs by parsing JSON formatted files.

This library allows you to validate the *structure* of the songs you are working on.

**This project does not aim to check for the actual correctness of the song you are authoring.** 

## Installation

**Note:** to use this library, you have to have installed [Node.js](https://nodejs.org/) and a console you can run commands into. The **minimum required version** of Node.js is: [8 - codename "Carbon"](https://github.com/nodejs/Release#release-schedule).

In your console, run the following command:

```sh
$ npm install mas-piano-validator
```

You can also use `yarn` (like we do in this project):

```sh
$ yarn add mas-piano-validator
```

## Usage

The library exports a single function you can use to validate your object.

It is **critical** that you pass in an *already* parsed JSON object. This may change in the future, but for the moment the library expects *you to parse the JSON*.

### Simple example

```js
const validate = require('mas-piano-validator');

const validMASPiano = {
    "name": "Song name",
    "verse_list": [0],
    "pnm_list": [
        {
            "text": "One",
            "style": "monika_credits_text",
            "notes": [
                "D5",
                "C5SH",
                "B4",
                "F4SH"
            ]
        },
        {
            "text": "Two",
            "style": "monika_credits_text",
            "notes": [
                "D5",
                "A4",
                "D5",
                "A4"
            ]
        }
    ]
};

const result = validate(validMASPiano);

console.log(result.ok); // true
console.log(result.errors); // []
```

### Example with multiple input (`all` API)

```js
const validate = require('mas-piano-validator');

const validMASPiano = {
	"name": "Song name",
	"verse_list": [0],
	"pnm_list": [
		{
			"text": "One",
			"style": "monika_credits_text",
			"notes": [
				"D5",
				"C5SH",
				"B4",
				"F4SH"
			]
		},
		{
			"text": "Two",
			"style": "monika_credits_text",
			"notes": [
				"D5",
				"A4",
				"D5",
				"A4"
			]
		}
	]
};

const container = new validate.ValidationInputContainer();
container.add(validMASPiano, 'test1').add(validMASPiano, 'test2');

const results = validate.all(container);
console.log(results.ok); // true
console.log(results.summary); // All files are valid Monika After Story piano songs.
```

### Parse existing file

```js
const fs = require('fs');
const {promisify} = require('util');

const validate = require('mas-piano-validator'); 

// We are going to use the promisified version of the fs.readFile function 
const readFile = promisify(fs.readFile);

const someFilePath = '...';

async function main() {
    const fileContent = await readFile(someFilePath, {encoding: 'utf8'});
    // Optional object, useful when you want to keep track of validation results
    const meta = {
        src: someFilePath
    };
    // Here you should handle the error in case the file is not a valid JSON file
    try {
        console.log(validate(fileContent, meta).ok); // true or false depending on the file...
    }
}

```

For other usage examples you can take a look at:

-  the [test.js](./test.js) file;
-  the [CLI application](https://github.com/niktekusho/mas-piano-validator-cli).

### Accessing the schema file

If you want you can access the JSON Schema document used in this library for JSON validation.

The simplest way of accessing it is using `require`:

```js
const pianoSchema = require('mas-piano-validator/schema/piano.schema.json')
```

## Related

-   [CLI application](https://github.com/niktekusho/mas-piano-validator-cli).


