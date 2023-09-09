const REGEX_URL = /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)$/;
const REGEX_EMAIL = /^\S+@\S+\.\S+$/;

module.exports = {
  REGEX_URL,
  REGEX_EMAIL,
};
