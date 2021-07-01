import { NextPage } from "next";
import signupStyles from "../../stories/components/SignUp/signup.module.css";
import React, { useState, useEffect } from "react";
import validation from "../../utils/Validation";

import { useRouter } from "next/dist/client/router";
import {
  GetCurrentUserDocument,
  GetCurrentUserQuery,
  useChangePasswordMutation,
} from "../../graphql/generated/graphql";
import { toErrorMap } from "../../utils/toErrorMap";
import { withApollo } from "../../lib/withApollo";
import Link from "next/link";

type Errors = {
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  password?: string;
};

const ChangePassword: NextPage = () => {
  const router = useRouter();
  console.log(router.query)
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
  const [tokenError, setTokenError] = useState("");
  const [changePassword] = useChangePasswordMutation();
  const onFormChange = (event: any) => {
    setFormValues({
      ...formValues,
      [event.target.name]: event.target.value,
    });
  };

  const handleResetPassword = async (event: any) => {
    event.preventDefault();
    setErrors(validation(formValues));
    if (dataIsCorrect === true) {
      const res = await changePassword({
        variables: {
          token: typeof router.query.token === "string" ? router.query.token : "",
          password: formValues.password,
        },
        update: (cache, { data }) => {
          cache.writeQuery<GetCurrentUserQuery>({
            query: GetCurrentUserDocument,
            data: {
              __typename: "Query",
              getCurrentUser: data?.changePassword.user,
            },
          });
        },
      });
      if (res.data?.changePassword.errors) {
        setServerDataIsCorrect(false);
        const errorMap = toErrorMap(res.data.changePassword.errors);
        if ("token" in errorMap) {
          setTokenError(errorMap.token);
        }
        setServerErrors(errorMap);
        // } else if (res.data?.registerUser.user) {
        //   router.push("/");
      } else if (res.data?.changePassword.user) {
        setServerDataIsCorrect(true);
        router.push("/");
      }
    }
  };

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
          <h2 className={`${signupStyles.headerH2}`}>Reset Password</h2>
          <div
            style={{
              display: "flex",
              alignContent: "center",
              paddingBottom: "10px",
            }}
          >
            <p className={`${signupStyles.headerP}`}>
              Please enter your new password below.
            </p>
          </div>
        </div>

        <div className="formContainer">
          <form className="signUpForm" id="signUpForm">
            <div className="form__control">
              {/* <label>Password</label> */}
              <input
                className={`${signupStyles.formInput}`}
                type="password"
                placeholder="New Password"
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
            {/* </div> */}
            {tokenError ? (
              <div>
                <p className={`${signupStyles.sigupErrors}`}>{tokenError}</p>
                <p>
                  Forget the password again? Reset{" "}
                  <Link href="/forgot-password">
                    <a>here</a>
                  </Link>
                </p>
              </div>
            ) : null}

            <button
              className={`${signupStyles.signupButton}`}
              onClick={async (e) => await handleResetPassword(e)}
            >
              Reset
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

// ChangePassword.getInitialProps = ({ query }) => {
//   return {
//     token: query.token as string,
//   };
// };

export default withApollo({ ssr: false })(ChangePassword);
