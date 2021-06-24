import React from "react";

type Values = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
};

const Validation = ( values : Values) => {
  let errors = {} as Values;

  if (!values.firstName) {
    errors.firstName = "First name is required.";
  }
  if (!values.lastName) {
    errors.lastName = "Last name is required.";
  }

  if (!values.username) {
    errors.username = "Last name is required.";
  }

  if (!values.email) {
    errors.email = "Email is required";
  } else if (!/\$+@\S+\.\S+/.test(values.email)) {
    errors.email = "Email is invalid";
  }

  if (!values.password) {
    errors.password = "Password is required";
  } else if (values.password.length < 8) {
    errors.password = "Password must be greater than 8 characters";
  }
  return errors;
};

export default Validation;
