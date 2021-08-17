import * as AWS from 'aws-sdk';
import {
  AttachUserPolicyRequest,
  CreateAccessKeyResponse,
  CreatePolicyRequest,
  CreatePolicyResponse,
  CreateUserRequest
} from 'aws-sdk/clients/iam';
import { injectable } from 'inversify';
import { AwsCredentials } from 'aws-sdk/clients/gamelift';
import { CreateUserResponse } from 'aws-sdk/clients/mq';

@injectable()
export class IAMService {

  // assumeRoleSts(roleArn: string, roleSessionName: string) {
  //   return new Promise(async (resolve, reject) => {
  //     const roleToAssume = {
  //       RoleArn: 'arn:aws:iam::123456789012:role/RoleName',
  //       RoleSessionName: 'session1',
  //       DurationSeconds: 900,
  //     };
  //     const sts = new AWS.STS({apiVersion: process.env.AWS_API_VERSION});
  //
  //     const data = sts.assumeRole(roleToAssume);
  //     const creds = {
  //       accessKeyId: data.Credentials!.AccessKeyId,
  //       secretAccessKey: data.Credentials!.SecretAccessKey,
  //       sessionToken: data.Credentials!.SessionToken
  //     };
  //
  //     const stsParams = {credentials: creds};
  //     // Create STS service object
  //     const stsCreds = new AWS.STS(stsParams);
  //
  //     stsCreds.getCallerIdentity({});
  //
  //   });
  //
  // }

  // assumeRoleSts(roleArn: string, roleSessionName: string) {
  //   return new Promise(async (resolve, reject) => {
  //     const roleToAssume = {
  //       RoleArn: roleArn,
  //       RoleSessionName: roleSessionName,
  //       DurationSeconds: 900
  //     };
  //     let roleCreds;
  //
  //     const sts = new AWS.STS({apiVersion: '2011-06-15'});
  //
  //     sts.assumeRole(roleToAssume, function (err, data) {
  //       if (err) console.log(err, err.stack);
  //       else {
  //         roleCreds = {
  //           accessKeyId: data.Credentials!.AccessKeyId,
  //           secretAccessKey: data.Credentials!.SecretAccessKey,
  //           sessionToken: data.Credentials!.SessionToken
  //         };
  //         stsGetCallerIdentity(roleCreds);
  //       }
  //     });
  //
  //     function stsGetCallerIdentity(creds) {
  //       const stsParams = {credentials: creds};
  //       // Create STS service object
  //       const sts = new AWS.STS(stsParams);
  //
  //       sts.getCallerIdentity({}, function (err, data) {
  //         if (err) {
  //           console.log(err, err.stack);
  //           reject(err);
  //         } else {
  //           // console.log(data.Arn);
  //           console.log(data);
  //           resolve(data.Arn)
  //         }
  //       });
  //     }
  //   });
  // }

  assumeRoleSts(roleArn: string, roleSessionName: string): Promise<AwsCredentials> {
    return new Promise(async (resolve, reject) => {
      const roleToAssume = {
        RoleArn: roleArn,
        RoleSessionName: roleSessionName,
        DurationSeconds: 900
      };
      const sts = new AWS.STS({apiVersion: process.env.AWS_API_VERSION});

      sts.assumeRole(roleToAssume, function (err, data) {
        if (err) {
          console.log(err, err.stack);
          reject(err);
        }
        else {
          resolve({
            AccessKeyId: data.Credentials!.AccessKeyId,
            SecretAccessKey: data.Credentials!.SecretAccessKey,
            SessionToken: data.Credentials!.SessionToken
          });
        }
      });
    });
  }

  attachPolicyToUser(username: string, policyArn: string) {
    return new Promise(async (resolve, reject) => {
      const iam = new AWS.IAM();
      // const user = iam.getUser({UserName: username});

      const params: AttachUserPolicyRequest = {
        PolicyArn: policyArn,
        UserName: username
      };
      try {
        await iam.attachUserPolicy(params);
        resolve();
      } catch(err) {
        console.log(err);
        reject(err);
      }

    });
  }

  createIamUser(username: string): CreateUserResponse {
    return new Promise(async (resolve, reject) => {
      const iam = new AWS.IAM();
      const params: CreateUserRequest = {
        UserName: username
      };
      try {
        iam.createUser(params, (err, data) => {
          resolve(data);
        });
      } catch (err) {
        console.log(err);
        reject(err);
      }
    });
  }

  createAccessKey(username: string): Promise<CreateAccessKeyResponse> {
    return new Promise(async (resolve, reject) => {
      const iam = this.getIamInstance();
      try {
        await iam.createAccessKey({UserName: username}, (err, data) => {
          resolve(data);
        });
      } catch(err) {
        console.log(err);
        reject(err);
      }
    });
  }


  createPolicy(policyName: string, resourceArn: string): Promise<CreatePolicyResponse> {
    return new Promise((resolve, reject) => {
      const iam = this.getIamInstance();

      const myManagedPolicy = {
        "Version": "2012-10-17",
        "Statement": [
          {
            "Effect": "Allow",
            "Action": "sts:AssumeRole",
            "Resource": resourceArn
          }
        ]
      };

      const params: CreatePolicyRequest = {
        PolicyDocument: JSON.stringify(myManagedPolicy),
        PolicyName: policyName,
      };

      iam.createPolicy(params, function(err, data) {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          console.log(data);
          resolve(data);
        }
      });
    });
  }

  getRole(roleName: string) {
    return new Promise(async (resolve, reject) => {
      const iam = this.getIamInstance();

      const getRoleParams = {
        RoleName: roleName
      };

      try {
        const role = await iam.getRole(getRoleParams);
        console.log(role);
        resolve(role);
      } catch (err) {
        // console.error(err, err.stack)
        // return;
        reject(err);
      }
    });
  }

  getIamPolicy(policyArn: string) {
    return new Promise((resolve, reject) => {
      const iam = this.getIamInstance();

      const params = {
        PolicyArn: policyArn
      };

      iam.getPolicy(params, function (err, data) {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          console.log(data);
          resolve(data.Policy);
        }
      });
    });
  }

  createGroup(groupName: string) {
    return new Promise((resolve, reject) => {
      const iam = this.getIamInstance();

      const params = {
        GroupName: groupName
      };

      iam.createGroup(params, (err, data) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          console.log(data);
          resolve(data);
        }
      });
    });
  }

  getIamInstance() {
    return new AWS.IAM({apiVersion: process.env.AWS_API_VERSION});
  }
}