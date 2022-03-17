// https://hirozak.space/posts/axios-token-configure
import axios from "axios";
import Cookies from "js-cookie"

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_ENDPOINT,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json"
  }
});

instance.interceptors.request.use(
  config => {
    config.headers!["Authorization"] = `Bearer ${Cookies.get('token')}`;
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

export default instance;