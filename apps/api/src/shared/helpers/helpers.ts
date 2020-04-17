import * as path from "path";
import * as moment from "moment";

import {
  ALLOWED_MIME_TYPES_FOR_ATTACHMENT,
  DEFAULT_OTP_EXPIRY
} from "./defaultValueConstant";
import { BadRequestException } from "@nestjs/common";
import { Types } from "mongoose";
import { EmailSubjectEnum } from "@covid19-helpline/models";
import { emailSubjectTemplateMapper } from "@covid19-helpline/models";

/**
 * path resolver helper function
 * @param pathToResolve
 */
export const resolvePathHelper = (pathToResolve) => {
  return path.resolve(path.join(__dirname, pathToResolve));
};

/**
 * get email template path using email subject
 * @param subject
 */
export const getEmailTemplateFromEmailSubject = (subject: EmailSubjectEnum) => {
  const mapper = emailSubjectTemplateMapper();
  return mapper.get(subject);
};

/**
 * return's new utc date
 */
export const generateUtcDate = (): Date => {
  return moment.utc().toDate();
};

/**
 * generate random alphanumeric code up to given digit
 * @param digit
 */
export const generateRandomCode = (digit: number = 6) => {
  return Math.random().toString(36).substring(2, digit + 2);
};

/**
 * throw new bad request exception
 * @param msg
 * @constructor
 */
export const BadRequest = (msg: string) => {
  throw new BadRequestException(msg);
};

/**
 * converts a normal id to objectId
 * @param id
 */
export const toObjectId = (id: string | number): Types.ObjectId => {
  return new Types.ObjectId(id);
};

/**
 * check whether otp expired or not
 * @param date
 */
export const isOTPExpired = (date: Date): boolean => {
  return moment.utc(date).add(DEFAULT_OTP_EXPIRY, "s").isBefore(moment.utc());
};

/**
 * check whether given mobile no is valid
 * @param mobileNo
 */
export const isValidMobileNo = (mobileNo: string) => {
  return /^\d{10}$/.test(mobileNo);
};

/**
 * addhaar no validator
 * @param aadhaarNo
 */
export const aadhaarNoValidator = (aadhaarNo: string = "") => {
  return /^\d{4}\d{4}\d{4}$/g.test(aadhaarNo);
};

/**
 * check valid attachment mime type
 */
export const isValidAttachmentMimeType = (mimeType: string) => {
  return ALLOWED_MIME_TYPES_FOR_ATTACHMENT.some(allowedType => {
    return mimeType.includes(allowedType);
  });
};
