import React from "react";

type Values = {
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  password?: string;
};

const Validation = (values: Values) => {
  let errors = {} as Values;
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  if (!values.firstName) {
    errors.firstName = "First name is required.";
  }
  if (!values.lastName) {
    errors.lastName = "Last name is required.";
  }

  if (!values.username) {
    errors.username = "Username is required.";
  }

  if (!values.email) {
    errors.email = "Email is required";
  } else if (re.test(values.email) === false) {
    errors.email = "Email is invalid";
  }

  if (!values.password) {
    errors.password = "Password is required";
  } else if (values.password.length < 8) {
    errors.password = "Password must be 8 characters or greater.";
  }
  return errors;
};

export default Validation;
