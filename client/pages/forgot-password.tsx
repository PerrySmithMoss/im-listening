import React, { useState } from "react";
import { withApollo } from "../lib/withApollo";
import signupStyles from "../components/SignUp/signup.module.css";
import { useForgotPasswordMutation } from "../graphql/generated/graphql";
import { Meta } from "../components/Home/Meta";
import { Navbar } from "../components/Navbar/Navbar";

const forgotPassword: React.FC<{}> = ({}) => {
  const [complete, setComplete] = useState(false);
  const [forgotPasswordRes, setForgotPasswordRes] = useState<any>(null);
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
    const forgotPasswordRes = await forgotPassword({
      variables: { email: formValues.email },
    });
    setForgotPasswordRes(forgotPasswordRes);
    setComplete(true);
  };

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
        <div
          className={`${signupStyles.heroImageContainer} hidden llg:block`}
        >
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
            <h2 className={`text-4xl xss:text-5xl md:text-6xl font-bold`}>
              Forgot Password
            </h2>
            <div
              style={{
                display: "flex",
                alignContent: "center",
                paddingBottom: "10px",
              }}
            >
              <p className={`text-base xss:text-lg`}>
                Please enter your email below.
              </p>
            </div>
          </div>

          <div className="formContainer">
            <form className="signUpForm" id="signUpForm">
              <div className="form__control">
                {/* <label>Password</label> */}
                <input
                  className={`${signupStyles.formInput} text-black`}
                  type="email"
                  placeholder="Email"
                  id="email"
                  name="email"
                  onChange={onFormChange}
                />
                <i className="fa fa-check-circle"></i>
                <i className="fa fa-exclamation-circle"></i>
              </div>
              {complete ? (
                <div>
                  {forgotPasswordRes.data.forgotPassword === false ? (
                    <p className={`text-red-500`}>
                      Could not find user with specified email. Please use a valid
                      user email.
                    </p>
                  ) : (
                    <p className={`${signupStyles.signupSuccess}`}>
                      A password reset link has been sent to the email provided.
                    </p>
                  )}
                </div>
              ) : null}
              <button
                className={`mt-5 bg-brand-orange hover:bg-brand-orange_hover w-full py-3 rounded text-white`}
                onClick={async (e) => await handleForgotPassword(e)}
              >
                Forgot password
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

export default withApollo({ ssr: false })(forgotPassword);
