import { capitalizeFirstLetter, removeSpecialCharacters } from '@commons/utils';

export const Exception = {
  EXISTED: (text: string) => generateError(`${text} existed`),
  NOT_EXISTED: (text: string) => generateError(`${text} not existed`),
  NOT_FOUND: (text: string) => generateError(`${text} not found`),
  INVALID: (text: string) => generateError(`invalid ${text}`),
  UNAVAILABLE: (text: string) => generateError(`${text} unavailable`),
};

const generateError = (message: string) => ({
  message: capitalizeFirstLetter(message.toLowerCase()),
  code: removeSpecialCharacters(message).replace(/ /g, '_').toUpperCase(), // 'Invalid user id!' => 'INVALID_USER_ID'
});

export const EXCEPTION = {
  // common
  BALANCE_NOT_ENOUGH: {
    code: 'BALANCE_NOT_ENOUGH',
    message: 'Balance not enough',
  },

  // loan
  UNSUPPORTED_ASSET_PAIR: {
    code: 'UNSUPPORTED_ASSET_PAIR',
    message: 'We do not support this loan coin and collateral coin pair',
  },
  COLLATERAL_MAX_AMOUNT_EXCEEDED: {
    code: 'COLLATERAL_MAX_AMOUNT_EXCEEDED',
    message: 'Collateral max amount exceeded',
  },
  LOAN_MAX_AMOUNT_EXCEEDED: {
    code: 'LOAN_MAX_AMOUNT_EXCEEDED',
    message: 'Loan max amount exceeded',
  },
  LOAN_MIN_AMOUNT_NOT_REACHED: {
    code: 'LOAN_MIN_AMOUNT_NOT_REACHED',
    message: 'Loan min amount not reached',
  },
  ORDER_IS_ACCRUING_INTEREST: {
    code: 'ORDER_IS_ACCRUING_INTEREST',
    message: 'Order is accruing interest',
  },
  HIGH_LTV_AFTER_MODIFY: {
    code: 'HIGH_LTV_AFTER_MODIFY',
    message: 'High LTV after modify',
  },
  ONLY_REPAY_BY_LOAN: {
    code: 'ONLY_REPAY_BY_LOAN_ASSET',
    message: 'Order can only repaid by loan asset',
  },
};
