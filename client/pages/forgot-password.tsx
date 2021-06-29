import React, { useState } from "react";
import { withApollo } from "../lib/withApollo";
import signupStyles from "../stories/components/SignUp/signup.module.css";
import { useForgotPasswordMutation } from "../graphql/generated/graphql";

const forgotPassword: React.FC<{}> = ({}) => {
  const [complete, setComplete] = useState(false);
  const [formValues, setFormValues] = useState({
    email: "",
  });
  const onFormChange = (event: any) => {
    setFormValues({
      ...formValues,
      [event.target.name]: event.target.value,
    });
  };
  const [forgotPassword] = useForgotPasswordMutation();

  const handleForgotPassword = async (event: any) => {
    event.preventDefault();
    await forgotPassword({
      variables: { email: formValues.email },
    });
    setComplete(true);
  };

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
          <h2 className={`${signupStyles.headerH2}`}>Forgot Password</h2>
          <div
            style={{
              display: "flex",
              alignContent: "center",
              paddingBottom: "10px",
            }}
          >
            <p className={`${signupStyles.headerP}`}>
              Please enter your email below.
            </p>
          </div>
        </div>

        {/* </div> */}
        {complete ? (
          <div>
            <p className={`${signupStyles.signupSuccess}`}>
              A password reset link has been sent to the email provided.
            </p>
          </div>
        ) : (
          <div className="formContainer">
            <form className="signUpForm" id="signUpForm">
              <div className="form__control">
                {/* <label>Password</label> */}
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
              </div>
              <button
                className={`${signupStyles.signupButton}`}
                onClick={async (e) => await handleForgotPassword(e)}
              >
                Forgot password
              </button>
            </form>
          </div>
        )}
      </div>
    </section>
  );
};

export default withApollo({ ssr: false })(forgotPassword);
