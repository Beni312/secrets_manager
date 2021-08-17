import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import * as helmet from 'helmet';
import * as http from 'http';
import * as fetch from 'node-fetch';
import * as AWS from 'aws-sdk';

import 'reflect-metadata';
import './modules/aws/controller/AWSController';

import { Container } from 'inversify';
import { InversifyExpressServer } from 'inversify-express-utils';
import { IAMService } from './modules/aws/service/IAMService';
import { SecretsManagerService } from './modules/aws/service/SecretsManagerService';

export class Server {

  private static inversifyServer: InversifyExpressServer;
  public static container: Container;

  public static async initializeApp(): Promise<http.Server> {
    try {
      global['fetch'] = fetch;
      AWS.config.update({ region: process.env.COGNITO_REGION, 'accessKeyId': process.env.COGNITO_ACCESS_KEY, 'secretAccessKey': process.env.COGNITO_SECRET_ACCESS_KEY });


      Server.container = Server.initInversifyContainer();
      await Server.initInversify();
      const app = Server.inversifyServer.build();
      return app.listen(process.env.EXPRESS_PORT);

    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  private static initInversifyContainer(): Container {
    const container = new Container();
    container.bind<IAMService>(IAMService.name).to(IAMService);
    container.bind<SecretsManagerService>(SecretsManagerService.name).to(SecretsManagerService);

    return container;
  }

  private static async initInversify() {
    Server.inversifyServer = new InversifyExpressServer(Server.container, null, {rootPath: '/api'}, null);
    Server.inversifyServer.setConfig(async (app: express.Application) => {
      Server.configureApp(app);
    });
  }

  private static configureApp(app) {
    app.set('port', 3000);
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json());
    app.use(cookieParser());
    app.use(helmet());
    app.use(helmet.hsts({
      maxAge: 31536000,
      includeSubDomains: true
    }));
  }
}
