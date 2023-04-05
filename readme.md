# backend

> Busket's backend

## About

This project uses [Feathers](http://feathersjs.com). An open source framework for building APIs and real-time applications.

## Getting Started

1. Make sure you have [NodeJS](https://nodejs.org/) and [yarn](https://yarnpkg.com/) installed.
2. Install your dependencies

    ```
    cd path/to/backend
    yarn
    ```

3. Start your app

    ```
    yarn  compile # Compile TypeScript source
    yarn migrate # Run migrations to set up the database
    yarn start
    ```

## Dev Server
Run `yarn dev` to start a dev-server with hot reload

## Testing

Run `yarn test` and all your tests in the `test/` directory will be run.

## Scaffolding

This app comes with a powerful command line interface for Feathers. Here are a few things it can do:

```
$ npx feathers help                           # Show all commands
$ npx feathers generate service               # Generate a new Service
```

## Help

For more information on all the things you can do with Feathers visit [feathersjs.com](https://feathersjs.com/api/).
