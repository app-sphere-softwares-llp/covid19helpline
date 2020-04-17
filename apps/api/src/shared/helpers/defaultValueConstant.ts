// default query filter
export const DEFAULT_QUERY_FILTER = {
  isDeleted: false
};

// default paginated items count
export const DEFAULT_PAGINATED_ITEMS_COUNT = 10;

// default date format
export const DEFAULT_DATE_FORMAT = 'DD-MM-YYYY HH:mm:SS';

// default decimal places
export const DEFAULT_DECIMAL_PLACES = 2;

// max file upload size in mb
export const MAX_FILE_UPLOAD_SIZE = 5;

// max profile pic upload size in mb
export const MAX_PROFILE_PIC_UPLOAD_SIZE = 2;

// default otp expiry in seconds
export const DEFAULT_OTP_EXPIRY = 10800;

// max transaction retry timeout in seconds
export const MAX_TRANSACTION_RETRY_TIMEOUT = 120000;

// default email address for sending email
export const DEFAULT_EMAIL_ADDRESS = 'support@assign.work';

// default path for storing templates
export const DEFAULT_TEMPLATE_PATH = 'shared/templates/';

// default sms sending options
export const DEFAULT_SMS_SENDING_OPTIONS = {
  sender: 'SOCKET',
  route: 4
};

// default pass validity in hours
export const DEFAULT_PASS_VALIDITY = 2;

export const ALLOWED_MIME_TYPES_FOR_ATTACHMENT = ['application/pdf', 'image/'];
