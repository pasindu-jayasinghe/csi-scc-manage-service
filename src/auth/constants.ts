export const jwtConstants = {
  secret: process.env.JWT_KEY || 'secretKeydsn2020',
  JWT_expiresIn: process.env.JWT_expiresIn || '900s',
};

export enum LoginRole {
  MASTER_ADMIN = "MASTER_ADMIN",
  CSI_ADMIN = "CSI_ADMIN",
  ORG_ADMIN = "ORG_ADMIN",
  ORG_USER = "ORG_USER",
  AUDITOR = "AUDITOR",
  DEO = "DEO"
}