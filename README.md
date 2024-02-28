## FabricJS
[Stencil editor]

## Features
[feature highlights]

## Usage
[step by step instructions]

## Demo project
[link to sandbox]

## Issues, suggestions and feature requests
[link to GitHub issues]

## Development and contribution

1. Install NPM package dependencies by using: `npm install`. If you use NPM v7.x.x, which can be checked by executing `npm -v`, execute: `npm install --legacy-peer-deps`.
1. Run `npm start` to watch for code changes. On every change:
    - the widget will be bundled;
    - the bundle will be included in a `dist` folder in the root directory of the project;
    - the bundle will be included in the `deployment` and `widgets` folder of the Mendix test project.

If you run into error "Module level directives cause errors when bundled, 'use client' was ignored"

Add to nodeModules/@mendix/pluggable-widgets-tools/configs/rollup.config.js

On line 294 add or at the start of the onwarn function:
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
            return
        }

See https://forum.mendix.com/link/space/widgets/questions/128609 for additional details

[specify contribution]
