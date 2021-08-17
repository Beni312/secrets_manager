export class GetSecretStsCommand {
  username: string;
  createPolicy: boolean;
  attachPolicyToUser: boolean;
  policyName: string;
  resourceArn: string;
  secretName: string;
  sessionName: string;
}