import { injectable } from 'inversify';
import * as AWS from 'aws-sdk';
import { AwsCredentials } from 'aws-sdk/clients/gamelift';

@injectable()
export class SecretsManagerService {

  client: AWS.SecretsManager;

  constructor() {
    this.initAwsSecretsManager();
  }

  initAwsSecretsManager() {
    this.client = new AWS.SecretsManager({
      region: process.env.COGNITO_REGION
      // credentials: new Credentials({accessKeyId: process.env.COGNITO_ACCESS_KEY, secretAccessKey: process.env.COGNITO_SECRET_ACCESS_KEY, sessionToken: })
    });
  }

  getSecret(secretName: string, creds?: AwsCredentials) {
    let client;
    if (creds) {
      client = new AWS.SecretsManager({
        region: process.env.COGNITO_REGION,
        credentials: {
          accessKeyId: creds.AccessKeyId!,
          secretAccessKey: creds.SecretAccessKey!,
          sessionToken: creds.SessionToken!
        }
      });
    } else{
      client = this.client;
    }
    return new Promise(((resolve, reject) => {
      client.getSecretValue({SecretId: secretName}, function(err, data) {
        if (err) {
          console.log(err);
          if (err.code === 'DecryptionFailureException')
            reject(err);
          else if (err.code === 'InternalServiceErrorException')
            reject(err);
          else if (err.code === 'InvalidParameterException')
            reject(err);
          else if (err.code === 'InvalidRequestException')
            reject(err);
          else if (err.code === 'ResourceNotFoundException')
            reject(err);
          else
            reject(err);
        }
        else {
          if ('SecretString' in data) {
            resolve(data.SecretString);
          } else {
            // @ts-ignore
            const buff = new Buffer(data.SecretBinary, 'base64');
            // decodedBinarySecret = buff.toString('ascii');
            resolve(buff.toString('ascii'));
          }
        }
      });
    }));

  }
}