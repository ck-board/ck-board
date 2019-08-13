import axios from 'axios';
import post from './post';

/* ACTION TYPES */
const LOGIN = 'LOGIN';
const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
const LOGIN_FAIL = 'LOGIN_FAIL';
const SIGNUP = 'SIGNUP';
const SIGNUP_SUCCESS = 'SIGNUP_SUCCESS';
const SIGNUP_FAIL = 'SIGNUP_FAIL';

/* ACTION CREATOR */
export const login = (email: string, password: string) => {
  return async (dispatch) => {
    try {
      dispatch({
        type: LOGIN,
      });
      const res = await axios.post('/auth/local/login', {
        email,
        password
      });

      dispatch({
        type: LOGIN_SUCCESS,
        payload: res.data,
      })
    } catch (e) {
      console.log(e);
      dispatch({ type: LOGIN_FAIL });
    }
  }
}

export const requestSignup = (email: string) => {
  return () => {
    // axios.post('/auth/local/register', {
    //   email
    // })
  }
};

export const signup = ({
  email,
  password,
  displayName,
  avatar = null
}) => {
  return async (dispatch) => {
    try {
      dispatch({
        type: SIGNUP,
      })

      const res = await axios.post('/auth/local/register', {
        email,
        password,
        displayName,
        avatar,
      })

      dispatch({
        type: SIGNUP_SUCCESS,
        payload: {
          email,
          displayName,
          userId: 1,
        },
      })
    } catch (e) {
      console.log(e);
      dispatch({
        type: SIGNUP_FAIL,
      })
    }
  }
}

export const initialize = () => {
  return async (dispatch) => {
    try {
      // const res = await axios.post('/auth/initialize');

      const res = {
        data: 'testTesttestTestTest1234123',
      }

      // save this data somewhere
      // ...
    } catch (e) {
      console.log(e)
    }
  }
};

const initialState = {
  user: null,
  isLoading: false,
}

/* REDUCER */
export default (state = initialState, action) => {
  switch (action.type) {
    case LOGIN:
      return {
        ...state,
        isLoading: true,
      };
    case LOGIN_SUCCESS:
      return {
        ...state,
        isLoading: false,
        user: action.payload,
      };
    case LOGIN_FAIL:
      return {
        ...state,
        isLoading: false,
      };
    case SIGNUP:
      return {
        ...state,
        isLoading: true,
      };
    case SIGNUP_SUCCESS:
      return {
        ...state,
        isLoading: false,
        user: action.payload,
      };
    case SIGNUP_FAIL:
      return {
        ...state,
        isLoading: false,
      }
    default:
      return state;
  }
}