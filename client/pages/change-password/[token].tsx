import { NextPage } from "next";
import signupStyles from "../../components/SignUp/signup.module.css";
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
import { Meta } from "../../components/Home/Meta";
import { Navbar } from "../../components/Navbar/Navbar";

type Errors = {
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  password?: string;
};

const ChangePassword: NextPage = () => {
  const router = useRouter();
  // console.log(router.query)
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
          token:
            typeof router.query.token === "string" ? router.query.token : "",
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
      setDataIsCorrect(true);
    } else if (Object.keys(serverErrors).length === 0) {
      setServerDataIsCorrect(true);
    }
  }, [errors, serverErrors]);

  return (
    <>
      <Meta
        title={"Forgot password | I'm Listening"}
        keywords={
          "music, social media, social, share music, music, register, signup"
        }
        description={"Share what you're listening to. Sign up now."}
      />
      <Navbar
        primary={true}
        onLogin={() => {}}
        onLogout={() => {}}
        onCreateAccount={() => {}}
        songAudio={false}
      />
      <section className={`${signupStyles.signupContainer}`}>
        <div className={`${signupStyles.heroImageContainer} hidden llg:block`}>
          <img
            className={`${signupStyles.smartphoneHeroImage}`}
            src="/assets/register-hero_image.svg"
            alt="A smartphone in a user's hand."
            //   height={700}
            //   width={700}
          />
        </div>

        <div className="px-4 sm:px-8 ">
          <div className="header">
            <h2 className={`text-4xl xss:text-5xl md:text-6xl font-bold`}>Reset Password</h2>
            <div
              style={{
                display: "flex",
                alignContent: "center",
                paddingBottom: "10px",
              }}
            >
              <p className={`text-base xss:text-lg`}>
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
                className={`mt-5 bg-brand-orange hover:bg-brand-orange_hover w-full py-3 rounded text-white`}
                onClick={async (e) => await handleResetPassword(e)}
              >
                Reset
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

export default withApollo({ ssr: false })(ChangePassword);
