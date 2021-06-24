import React, { useState, useEffect } from "react";
import { Button } from "../Old/Button";
import signupStyles from "./signup.module.css";
import validation from "../../../utils/Validation";
import Image from "next/image";
import Link from "next/link";
import {
  GetCurrentUserDocument,
  GetCurrentUserQuery,
  useRegisterUserMutation,
} from "../../../graphql/generated/graphql";
import { toErrorMap } from "../../../utils/toErrorMap";
import { useRouter } from "next/dist/client/router";

interface SignUpProps {}

type Errors = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
};

export const SignUp: React.FC<SignUpProps> = ({}) => {
  const router = useRouter();
  const [formValues, setFormValues] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState({} as Errors);
  const [serverErrors, setServerErrors] = useState(
    {} as Record<string, string>
  );
  const [dataIsCorrect, setDataIsCorrect] = useState(false);
  const [serverDataIsCorrect, setServerDataIsCorrect] = useState(false);
  const [registerUser] = useRegisterUserMutation();
  const onFormChange = (event: any) => {
    setFormValues({
      ...formValues,
      [event.target.name]: event.target.value,
    });
  };

  const handleRegisterUser = async (event: any) => {
    console.log("Yo");
    event.preventDefault();
    setErrors(validation(formValues));
    if (dataIsCorrect === true) {
      const res = await registerUser({
        variables: {
          firstName: formValues.firstName,
          lastName: formValues.lastName,
          email: formValues.email,
          password: formValues.password,
          username: formValues.username,
        },
        update: (cache, { data }) => {
          cache.writeQuery<GetCurrentUserQuery>({
            query: GetCurrentUserDocument,
            data: {
              __typename: "Query",
              getCurrentUser: data?.registerUser.user as any,
            },
          });
        },
      });
      if (res.data?.registerUser.errors) {
        setServerDataIsCorrect(false);
        setServerErrors(toErrorMap(res.data.registerUser.errors));
        // } else if (res.data?.registerUser.user) {
        //   router.push("/");
      } else if (res.data?.registerUser.user) {
        setServerDataIsCorrect(true);
        router.push("/");
      }
    }
  };

  function checkIfErrors() {
    if (Object.keys(errors).length === 0 && dataIsCorrect) {
      setDataIsCorrect(true);
    } else if (Object.keys(serverErrors).length === 0 && serverDataIsCorrect) {
      setServerDataIsCorrect(true);
    }
  }

  useEffect(() => {
    if (Object.keys(errors).length === 0) {
      console.log("Client errors :", errors);
      setDataIsCorrect(true);
    } else if (Object.keys(serverErrors).length === 0) {
      console.log("Server errors: ", serverErrors);
      setServerDataIsCorrect(true);
    }
  }, [errors, serverErrors]);

  return (
    <section className={`${signupStyles.signupContainer}`}>
      <div className={`${signupStyles.heroImageContainer}`}>
        <img
          className={`${signupStyles.smartphoneHeroImage}`}
          src="/assets/register-hero_image.svg"
          alt="A smartphone in a user's hand."
          //   height={700}
          //   width={700}
        />
      </div>

      <div className="container">
        <div className="header">
          <h2 className={`${signupStyles.headerH2}`}>Sign up</h2>
          <div
            style={{
              display: "flex",
              alignContent: "center",
              paddingBottom: "10px",
            }}
          >
            <p className={`${signupStyles.headerP}`}>
              Already have an account?
            </p>
            <Link href="/login">
              <p
                className={`${signupStyles.headerP} ${signupStyles.headerSpan}`}
              >
                Log in
              </p>
            </Link>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button
              className={`${signupStyles.socialSignup} ${signupStyles.google}`}
            >
              Sign up with with Google
            </button>
            {/* <button
            className={`${signupStyles.socialSignup} ${signupStyles.facebook}`}
          >
            Sign up with Facebook
          </button> */}

            <button
              className={`${signupStyles.socialSignup} ${signupStyles.twitter}`}
            >
              Sign up with with Twitter
            </button>
          </div>
          <div style={{ margin: "20px 0px" }}>
            <p className={`${signupStyles.signUpOr}`}>
              <span className={`${signupStyles.signUpSpan}`}>or</span>
            </p>
          </div>
        </div>

        <div className="formContainer">
          <form className="signUpForm" id="signUpForm">
            <div className={`${signupStyles.formInputGrid}`}>
              <div className="form__control">
                {/* <label>First name</label> */}
                <input
                  className={`${signupStyles.formInput}`}
                  type="text"
                  placeholder="First name"
                  id="firstName"
                  name="firstName"
                  onChange={onFormChange}
                />
                <i className="fa fa-check-circle"></i>
                <i className="fa fa-exclamation-circle"></i>
                <small>
                  {errors.firstName && (
                    <p className={`${signupStyles.sigupErrors}`}>
                      {errors.firstName}
                    </p>
                  )}
                  {serverErrors.firstName && (
                    <p className={`${signupStyles.sigupErrors}`}>
                      {serverErrors.firstName}
                    </p>
                  )}
                </small>
              </div>
              <div className="form__control">
                {/* <label>Last name</label> */}
                <input
                  className={`${signupStyles.formInput}`}
                  type="text"
                  placeholder="Last name"
                  id="lastName"
                  name="lastName"
                  onChange={onFormChange}
                />
                <i className="fa fa-check-circle"></i>
                <i className="fa fa-exclamation-circle"></i>
                <small>
                  {errors.lastName && (
                    <p className={`${signupStyles.sigupErrors}`}>
                      {errors.lastName}
                    </p>
                  )}
                  {serverErrors.lastName && (
                    <p className={`${signupStyles.sigupErrors}`}>
                      {serverErrors.lastName}
                    </p>
                  )}
                </small>
              </div>
            </div>
            <div className="form__control">
              {/* <label>Email</label> */}
              <input
                className={`${signupStyles.formInput}`}
                type="email"
                placeholder="Email"
                id="email"
                name="email"
                onChange={onFormChange}
              />
              <i className="fa fa-check-circle"></i>
              <i className="fa fa-exclamation-circle"></i>
              <small>
                {errors.email && (
                  <p className={`${signupStyles.sigupErrors}`}>
                    {errors.email}
                  </p>
                )}
                {serverErrors.email && (
                  <p className={`${signupStyles.sigupErrors}`}>
                    {serverErrors.email}
                  </p>
                )}
              </small>
            </div>
            <div className={`${signupStyles.formInputGrid}`}>
              <div className="form__control">
                {/* <label>Username</label> */}
                <input
                  className={`${signupStyles.formInput}`}
                  type="text"
                  placeholder="Username"
                  id="username"
                  name="username"
                  onChange={onFormChange}
                />
                <i className="fa fa-check-circle"></i>
                <i className="fa fa-exclamation-circle"></i>
                <small>
                  {errors.username && (
                    <p className={`${signupStyles.sigupErrors}`}>
                      {errors.username}
                    </p>
                  )}
                  {serverErrors.username && (
                    <p className={`${signupStyles.sigupErrors}`}>
                      {serverErrors.username}
                    </p>
                  )}
                </small>
              </div>
              <div className="form__control">
                {/* <label>Password</label> */}
                <input
                  className={`${signupStyles.formInput}`}
                  type="password"
                  placeholder="Password"
                  id="password"
                  name="password"
                  onChange={onFormChange}
                />
                <i className="fa fa-check-circle"></i>
                <i className="fa fa-exclamation-circle"></i>
                <small>
                  {errors.password && (
                    <p className={`${signupStyles.sigupErrors}`}>
                      {errors.password}
                    </p>
                  )}
                  {serverErrors.password && (
                    <p className={`${signupStyles.sigupErrors}`}>
                      {serverErrors.password}
                    </p>
                  )}
                </small>
              </div>
            </div>
            <div style={{ display: "flex", textAlign: "center" }}>
              {/* <label className={`${signupStyles.checkboxContainer}`}> */}
              {/* One */}
              <p style={{ textAlign: "center", paddingRight: "5px" }}>
                <input
                  className={`${signupStyles.checkboxInput}`}
                  type="checkbox"
                  defaultChecked
                />
              </p>
              <span className={`${signupStyles.checkmark}`}></span>
              {/* </label> */}
              <p className={`${signupStyles.termsAndConditions}`}>
                I agree to the{" "}
                <span className={`${signupStyles.signupTC}`}>
                  Terms of Service
                </span>{" "}
                and{" "}
                <span className={`${signupStyles.signupTC}`}>
                  Privacy Policy
                </span>
              </p>
            </div>

            <button
              className={`${signupStyles.signupButton}`}
              onClick={async (e) => await handleRegisterUser(e)}
              // onClick={async (e) => {
              //   e.preventDefault()
              //   const resp = await registerUser({
              //     variables: {
              //       firstName: formValues.firstName,
              //       lastName: formValues.lastName,
              //       email: formValues.email,
              //       password: formValues.password,
              //       username: formValues.username,
              //     },
              //   });
              //   console.log(resp)
              //   // if(resp.data?.registerUser.errors) {
              //   //   setServerErrors(toErrorMap(resp.data.registerUser.errors))
              //   // }
              // }}
            >
              Sign up
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};
