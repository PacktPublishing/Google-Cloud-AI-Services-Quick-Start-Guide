# SmartExchange
**M**ongoDB _3.4_ - **E**xpress _4.1_ - **A**ngular _5.2_ - **N**ode _6.1_

The base template is created by [Davide Violante](https://github.com/DavideViolante) and customized by [Arvind Ravulavaru](https://github.com/arvindr21) for the book: Google Cloud AI Services Quickstart Guide.

This project uses the [MEAN stack](https://en.wikipedia.org/wiki/MEAN_(software_bundle)):
* [**M**ongoose.js](http://www.mongoosejs.com) ([MongoDB](https://www.mongodb.com)): database
* [**E**xpress.js](http://expressjs.com): backend framework
* [**A**ngular 2+](https://angular.io): frontend framework
* [**N**ode.js](https://nodejs.org): runtime environment

Other tools and technologies used:
* [Angular CLI](https://cli.angular.io): frontend scaffolding
* [Bootstrap](http://www.getbootstrap.com): layout and styles
* [Font Awesome](http://fontawesome.io): icons
* [JSON Web Token](https://jwt.io): user authentication
* [Bcrypt.js](https://github.com/dcodeIO/bcrypt.js): password encryption

## Prerequisites
1. Install [Node.js](https://nodejs.org) and [MongoDB](https://www.mongodb.com)
2. Install Angular CLI: `npm i -g @angular/cli`
3. Install [Git](https://git-scm.com/downloads)
4. _(optional) Install [Heroku tool belt](https://devcenter.heroku.com/articles/heroku-cli#download-and-install)_
5. From project root folder install all the dependencies: `npm i`

## Run
### Development mode
`npm run dev`: [concurrently](https://github.com/kimmobrunfeldt/concurrently) execute MongoDB, Angular build, TypeScript compiler and Express server.

A window will automatically open at [localhost:4200](http://localhost:4200). Angular and Express files are being watched. Any change automatically creates a new bundle, restart Express server and reload your browser.

### Angular CLI
You can use Angular CLI generate functions as you would do in any Angular project. Use
```bash
$ ng generate component home --module app
```
Refer [angular/angular-cli Wiki](https://github.com/angular/angular-cli/wiki/generate) for more information.

### Production mode
`npm run prod`: run the project with a production bundle and AOT compilation listening at [localhost:3000](http://localhost:3000) 

### Build project for deployment
1. Develop the app
2. `npm run build`
3. The output will be store in `dist` folder present at the root of the project.
4. This folder can now be deployed in an node env and to start the app, run `node server/app.js` from inside the `dist` folder.

## Deploy (Heroku)
### Create Project (one-time setup)
1. Download & install [Heroku tool belt](https://devcenter.heroku.com/articles/heroku-cli#download-and-install)
2. `heroku login`
3. From the root of the `SmartExchange` folder, run `heroku create smart-exchange-somename`
4. If the name is available, the app gets created, else, please pick a different name and try again.
5. Setup git - from inside the `SmartExchange` folder, run `git init`, `git add -A` and `git commit -am "Initial Commit"`
6. Add heroku as the remote `heroku git:remote -a smart-exchange-somename`

#### Deploy Code
1. To deploy code to Heroku, make the required changes and commit your files
2. Run `git push heroku master`
3. To open the app `heroku run`

## Running frontend unit tests
Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running frontend end-to-end tests
Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/). 
Before running the tests make sure you are serving the app via `npm start`.

## Running backend tests
Run `mongod` to run an instance of MongoDB, then run `npm run testbe` to execute the backend tests via [Mocha](https://mochajs.org/).

## Running TSLint
Run `ng lint` (frontend) and `npm run lintbe` (backend) to execute the linter via [TSLint](https://palantir.github.io/tslint/).

###### Boiler plate Author
[Davide Violante](https://github.com/DavideViolante)

###### SmartExchange App Author
[Arvind Ravulavaru](https://github.com/arvindr21)

### License : MIT