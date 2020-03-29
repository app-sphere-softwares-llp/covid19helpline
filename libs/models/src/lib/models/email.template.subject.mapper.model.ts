import { EmailTemplatePathEnum, EmailSubjectEnum } from '../enums';

/**
 * email subject template mapper
 */
export const emailSubjectTemplateMapper = () => {
  const mapper = new Map<string, string>();

  /**
   * user
   */
  // reset password
  mapper.set(EmailSubjectEnum.resetPassword, EmailTemplatePathEnum.resetPassword);

  return mapper;
};
