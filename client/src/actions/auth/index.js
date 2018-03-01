import * as types from './types';

export const registerRedirectUrl = (url) => {
  return {
    type: types.REGISTER_REDIRECT_URL,
    payload: url
  };
};

export const registerRedirectMessage = (msg) => {
  return {
    type: types.REGISTER_REDIRECT_MESSAGE,
    payload: msg
  };
};

export const clearRedirectUrl = () => {
  return {
    type: types.CLEAR_REDIRECT_URL
  };
};

export const setUserForRegistration = (userInfo) => {
  return {
    type: types.SET_USER_FOR_REGISTER,
    payload: userInfo
  };
};

export const resetAuthState = () => {
  return {
    type: types.RESET_AUTH_STATE
  };
};