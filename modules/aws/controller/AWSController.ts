import { controller, httpPost, requestBody } from 'inversify-express-utils';
import { inject } from 'inversify';
import { IAMService } from '../service/IAMService';
import { SecretsManagerService } from '../service/SecretsManagerService';
import { GetSecretCommand } from '../model/command/GetSecretCommand';
import { GetSecretStsCommand } from '../model/command/GetSecretStsCommand';
import { CreatePolicyCommand } from '../model/command/CreatePolicyCommand';
import { AttachPolicyToUserCommand } from '../model/command/AttachPolicyToUserCommand';
import { CreateUserCommand } from '../model/command/CreateUserCommand';
import { CreateAccessKeyCommand } from '../model/command/CreateAccessKeyCommand';

@controller('/aws')
export class AWSController {

  @inject(IAMService.name)
  private iamService: IAMService;

  @inject(SecretsManagerService.name)
  private secretsManagerService: SecretsManagerService;

  @httpPost('/create-policy')
  createPolicy(@requestBody() command: CreatePolicyCommand) {
    return this.iamService.createPolicy(command.policyName, command.resourceArn);
  }

  @httpPost('/create-user')
  createUser(@requestBody() command: CreateUserCommand) {
    return this.iamService.createIamUser(command.username);
  }

  @httpPost('/attach-policy-to-user')
  async attachPolicyToUser(@requestBody() command: AttachPolicyToUserCommand) {
    const policy = await this.iamService.createPolicy(command.policyName, command.resourceArn);
    await this.iamService.attachPolicyToUser(command.username, policy.Policy!.Arn!);
  }

  @httpPost('/create-access-key')
  async createAccessKey(@requestBody() command: CreateAccessKeyCommand) {
    return this.iamService.createAccessKey(command.username);
  }

  @httpPost('/get-secret')
  async getSecret(@requestBody() command: GetSecretCommand) {
    try {
      return this.secretsManagerService.getSecret(command.secretName);
    } catch(err) {
      return new Error(err.toString());
    }
  }

  @httpPost('/get-secret-sts')
  async getSecretSts(@requestBody() command: GetSecretStsCommand) {
    if (command.createPolicy) {
      await this.iamService.createPolicy(command.policyName, command.resourceArn);
    }
    if (command.attachPolicyToUser) {
      await this.iamService.attachPolicyToUser(command.username, command.resourceArn);
    }
    const creds = await this.iamService.assumeRoleSts(command.resourceArn, command.sessionName);
    return this.secretsManagerService.getSecret(command.secretName, creds);
  }
}