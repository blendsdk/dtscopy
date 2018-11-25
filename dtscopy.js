#!/usr/bin/env node

require('colors');
var fs = require('fs');
var path = require('path');
var glob = require('glob');
var mkdirp = require('mkdirp');
var package = require('./package.json');

var ArgumentParser = require('argparse').ArgumentParser;

var parser = new ArgumentParser({
    version: package.version,
    addHelp: true,
    description: 'dtcopy example'
});

parser.addArgument(['-l', '--log'], {
    help: 'Show extended log information.',
    defaultValue: false
});

parser.addArgument(['-s', '--source'], {
    help: 'Source folder to find the declaration files.',
    required: true
});

parser.addArgument(['-d', '--destination'], {
    help: 'Destination folder to copy the declaration files.',
    required: true
});

const ensureDestFolder = function() {
    try {
        if (!fs.lstatSync(args.source).isDirectory()) {
            throw new Error('Provided source is to a directory!');
        }
        if (!fs.existsSync(args.destination)) {
            dest = mkdirp.sync(args.destination);
            logMessage(('Created destination folder: ' + dest).green);
        }
        return true;
    } catch (e) {
        logMessage(e.toString().red);
        return false;
    }
};

const logMessage = function(message) {
    if (args.log !== false) {
        console.log(message);
    }
};

const ensureSourceFolder = function(sourceFolder) {
    return fs.existsSync(sourceFolder) && fs.lstatSync(sourceFolder).isDirectory();
};

var args = parser.parseArgs();

if (ensureSourceFolder(args.source) && ensureDestFolder(args.description)) {
    logMessage(('Looking for *.d.ts files in: ' + args.source).green);
    var files = glob.sync(path.join(args.source, '**', '*.d.ts'));
    logMessage((files.length + ' ' + (files.length === 1 ? 'file' : 'files') + ' found.').green);
    var fullSource = path.resolve(args.source);
    files.forEach(function(file) {
        var fName = path.basename(file);
        var fullName = path.resolve(file);
        var destFolder = path.join(path.resolve(args.destination), fullName.replace(fullSource, '').replace(fName, ''));
        if (!fs.existsSync(destFolder)) {
            mkdirp.sync(destFolder);
        }
        var fullDest = path.join(destFolder, fName);
        logMessage(('Copying: ' + fullName + ' -> ' + fullDest).cyan);
        fs.copyFileSync(fullName, fullDest);
    });
}
