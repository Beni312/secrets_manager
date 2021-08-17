import { injectable } from 'inversify';
import * as AWS from 'aws-sdk';
import { GetRoleResponse } from 'aws-sdk/clients/iam';

@injectable()
export class ConfigureRoleArn {
  async getRole(roleName: string) {
    // const iam = new AWS.IAM({ apiVersion: '2010-05-08' });
    const iam = new AWS.IAM();
    let role: GetRoleResponse | null = null;

    const getRoleParams = {
      RoleName: roleName
    };

    try {
      console.log('Getting role ' + getRoleParams.RoleName + '...');
      // @ts-ignore
      role = await iam.getRole(getRoleParams);
      console.log(role);
    } catch (err) {
      // console.error(err, err.stack)
      return;
    }

    console.log(role);

    // if (role) {
    //   helper.modifyFiles(['./config/' + configFilename],
    //     [
    //       {
    //         regexp: /YOUR_ROLE_ARN/g,
    //         replacement: role.Role.Arn
    //       }
    //     ]);
    // }
  }
}