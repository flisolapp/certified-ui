# Certified UI

This project was generated using [Angular
CLI](https://github.com/angular/angular-cli) version 21.2.1.

## About

Certified UI is an Angular 21 application for FLISoL certification
validation and retrieval.\
It provides a page where a person can verify the validity of a
certificate and retrieve certification information.

------------------------------------------------------------------------

## Requirements

Before creating or running the project, ensure the following tools are
installed:

-   NVM (Node Version Manager)
-   Node.js **24.14.0**
-   npm

------------------------------------------------------------------------

## Using the correct Node.js version

Install and use the recommended Node.js version:

``` bash
nvm install 24.14.0
nvm use 24.14.0
```

------------------------------------------------------------------------

## Installing Angular CLI

``` bash
npm install -g @angular/cli
```

------------------------------------------------------------------------

## Creating the project

### Linux / macOS

``` bash
npx @angular/cli@latest new certified-ui \
  --style=scss \
  --routing \
  --standalone \
  --zoneless \
  --ssr=false \
  --ai-config=none \
  --skip-git \
  --interactive=false
```

### Windows

``` bash
npx @angular/cli@latest new certified-ui ^
  --style=scss ^
  --routing ^
  --standalone ^
  --zoneless ^
  --ssr=false ^
  --ai-config=none ^
  --skip-git ^
  --interactive=false
```

------------------------------------------------------------------------

## Installing dependencies

Main dependencies:

``` bash
npm install @angular/material @ngx-translate/core @ngx-translate/http-loader
```

Development dependencies:

``` bash
npm install --save-dev show-packages @vitest/coverage-v8
```

Inspect installed packages:

``` bash
npx show-packages
```

------------------------------------------------------------------------

## Generating environments

``` bash
ng generate environments
```

------------------------------------------------------------------------

## Development server

To start a local development server:

``` bash
ng serve
```

Open your browser at:

    http://localhost:4200/

The application automatically reloads when source files change.

------------------------------------------------------------------------

## Code scaffolding

Generate new components:

``` bash
ng generate component component-name
```

See all available schematics:

``` bash
ng generate --help
```

------------------------------------------------------------------------

## Building

``` bash
ng build
```

The compiled output will be stored in the `dist/` directory.

------------------------------------------------------------------------

## Running unit tests

Run unit tests using **Vitest**:

``` bash
ng test
```

------------------------------------------------------------------------

## Running end-to-end tests

``` bash
ng e2e
```

Angular CLI does not include an e2e framework by default. You can
integrate Cypress, Playwright, or another tool.

------------------------------------------------------------------------

## Additional Resources

For more details about Angular CLI:

https://angular.dev/tools/cli

------------------------------------------------------------------------

## License

MIT License

Copyright (c) 2026

Permission is hereby granted, free of charge, to any person obtaining a
copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
