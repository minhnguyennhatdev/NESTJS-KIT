const Exception = {
  EXISTED: (text: string) => `${text} existed!`,
  NOT_EXISTED: (text: string) => `${text} not existed!`,
  NOT_FOUND: (text: string) => `${text} not found!`,
  INVALID: (text: string) => `Invalid ${text}!`,
  INVALID_CREDENTIALS: 'Invalid credentials',
};

export default Exception;
