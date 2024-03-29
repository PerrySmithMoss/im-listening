import React, { useState, useEffect } from "react";
import signupStyles from "./signup.module.css";
import validation from "../../utils/Validation";
import Link from "next/link";
import {
  GetCurrentUserDocument,
  GetCurrentUserQuery,
  useRegisterUserMutation,
} from "../../graphql/generated/graphql";
import { toErrorMap } from "../../utils/toErrorMap";
import { useRouter } from "next/dist/client/router";

interface SignUpProps {}

type Errors = {
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  password?: string;
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
    <div className="hidden largeMd:block">
        <svg
          width="600"
          height="818"
          viewBox="0 0 691 818"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M530 654.6C526.1 694.2 454.5 721.2 359 723.5C358.9 723.5 358.7 723.5 358.6 723.5C335.8 724 311.6 723.2 286.6 720.8C235.8 715.9 189.4 705.2 152 691C136.8 685.3 123.2 679 111.3 672.3C77.7 653.3 58.5 631.1 60.6 609C65 563.9 157.2 535.2 272.6 540.6C282.9 541.1 293.4 541.8 304 542.9C355.8 547.9 403.1 559 440.8 573.5C497.5 595.2 532.9 625 530 654.6Z"
            fill="#1C2628"
            stroke="#1C2628"
            strokeWidth="2.13"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M553.1 623.9C565.3 638.9 566.5 652 565.8 668.8C563.5 722.8 490.2 734.5 449.3 746.6"
            stroke="#1C2628"
            strokeWidth="2.13"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M145 520.5C86 530.4 15.1 569.1 36.6 639.5"
            stroke="#1C2628"
            strokeWidth="2.13"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M406.9 669.7C410 665.4 409.5 668.2 405.9 669C393 671.9 380.1 675.3 367.3 678.7C351.1 683 337.3 693.5 322.4 701.1"
            stroke="#1C2628"
            strokeWidth="2.13"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M486.1 518.3C545.5 455 392.5 157.9 297.7 215.1C264.9 230.4 251.5 256.3 238.4 286.8C206.6 403.5 67.2 364.5 63 490.5C55.1 674.4 422.5 653.6 486.1 518.3Z"
            fill="#F3A13B"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M142.5 302.7C164.3 299.2 185.1 297 179.1 328C178.3 332.2 172.3 358.4 151.2 361.3C108.4 368.2 99.4999 308.6 142.5 302.7Z"
            fill="#F3A13B"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M207.1 295.9C197.9 302.4 180.4 293.4 186.2 281.3C190.7 256 240.3 284.5 207.1 295.9Z"
            fill="#F3A13B"
          />
          <path
            d="M215.6 439.8C218.7 447.1 221.9 455.1 219.9 462.8C218.3 469.2 213.4 474.3 208.5 478.7C206 480.9 203.4 483.2 200.2 484.1C197 485.1 193.1 484.5 191 481.9C188.7 479.1 189.3 474.8 191 471.6C192.3 469.1 194.5 466.9 197.2 466.1C201.9 464.7 206.9 468.2 208.8 472.7C210.7 477.2 210.2 482.3 209.2 487.1C205.1 506.7 194 523.9 183.1 540.7"
            stroke="#1C2628"
            strokeWidth="2.13"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M158.5 417.1C170.1 418.5 184.7 399.4 167.6 397.5C162.3 399.4 151.4 414.7 156.7 416.7"
            fill="#FAF6EB"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M273.3 288.3C260.8 290.9 255.8 302.2 261.9 314C263.6 317.3 273.6 331.7 282.6 330.1C286.9 329.3 300.6 331.2 297.9 298.5C296.2 285.7 290 284.9 273.3 288.3Z"
            fill="#F45B49"
            stroke="#1C2628"
            strokeWidth="2.13"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M462.7 477.7C447.6 528.3 371.6 644.7 366.2 664L365.4 660.7C348.3 666.7 250.2 667.6 218.1 636.7C214.9 633.6 212.4 630.3 210.6 626.5L237.2 560.3C235.6 562.6 219.9 548.7 238.2 510.3C243.2 499.8 253.6 471.4 253.6 471.4C254.4 467.1 256.7 450.4 259.5 430C259.1 429.3 259 428.9 259 428.9C250.2 422.9 217.2 425.3 209.7 399.5C208.6 395.6 208 391 208.2 385.6C208.4 379.6 212.1 376.8 216.3 375.6C220.4 374.4 225 374.6 227.3 374.8C239.7 375.5 251.8 380.1 263.3 384.9C264.1 385.2 264.8 385.6 265.6 385.9C269.5 357.8 273.2 333.4 274.4 332.1C276.4 329.9 278.3 327.7 280.2 325.6C286.2 319 292.3 314 302.6 317.8C309.3 320.2 315.8 322.8 322 325.8C335.1 332.1 347 340.1 356.5 352C365.9 363.7 374.4 376.3 380.8 389.8C386.6 402 390.4 415.3 392.8 428.5C394.5 437.5 395.7 446.9 395.1 456.1C395 458.4 394.7 460.6 394.3 462.9C392.5 473 390 482.9 387.2 492.7L462.7 477.7Z"
            fill="#F45B49"
            stroke="#1C2628"
            strokeWidth="2.13"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M218.1 636.7C214.9 633.6 212.4 630.3 210.6 626.5L237.2 560.3C235.6 562.6 219.9 548.7 238.2 510.3C243.2 499.8 253.6 471.4 253.6 471.4C254.4 467.1 256.7 450.4 259.5 430C259.1 429.3 259 428.9 259 428.9C250.2 422.9 217.2 425.3 209.7 399.5C217 400.8 224.8 403.2 233.1 405.7C249.7 410.7 259.7 413.7 265 423C271.2 433.8 263.5 439.8 268.6 465.3C270.1 473 271.6 476.2 273.5 487.5C275.7 500.5 276.7 507.1 274.8 512C270 524.1 255.9 525.3 256.1 532.9C256.2 537.4 261.2 539.2 266.3 544C266.3 544 279.9 556.6 281 579.5C282.4 608.4 244.2 641.8 218.1 636.7Z"
            fill="#FAF6EB"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M395.2 456.2C388.7 461.7 381.6 466 373.9 468.4C353 475 331.4 466.7 312.9 459.5C298.3 453.8 280.7 447.1 276.2 432.2C273.7 423.9 276.9 418.7 272.1 412.6C266.6 405.8 259.3 408.4 246.3 402.8C233.5 397.3 226 388.4 223.2 385C221 382.4 218.6 379.1 216.4 375.5C220.5 374.3 225.1 374.5 227.4 374.7C239.8 375.4 251.9 380 263.4 384.8C264.2 385.1 264.9 385.5 265.7 385.8C269.6 357.7 273.3 333.3 274.5 332C276.5 329.8 278.4 327.6 280.3 325.5C293.7 324.6 308 324.7 322.2 325.7C335.3 332 347.2 340 356.7 351.9C366.1 363.6 374.6 376.2 381 389.7C386.8 401.9 390.6 415.2 393 428.4C394.6 437.6 395.9 447 395.2 456.2Z"
            fill="#1C2628"
            stroke="#1C2628"
            strokeWidth="2.13"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M237.6 634.7C241.7 631 245.7 627.1 249.4 623C218.3 604.2 218 589 218 589L152 690.9C184.2 703.1 223.1 712.7 265.6 718.3C258.7 700.3 248.1 683.2 234.6 668.7C226.6 658.7 229.6 642.7 237.6 634.7Z"
            fill="#FAF6EB"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M278.9 637.6C266.8 632.6 257.2 627.7 249.4 623C245.8 627.1 241.8 631 237.6 634.7C229.6 642.7 226.6 658.7 234.6 668.7C248.2 683.2 258.8 700.3 265.6 718.3C272.5 719.2 279.5 720 286.6 720.7C311.5 723.1 335.7 724 358.6 723.4C358.7 723.4 358.9 723.4 359 723.4L387.1 644.7C387.1 644.8 351 667.4 278.9 637.6Z"
            fill="#FB564C"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M400.4 422C403.2 414.5 399.2 402.7 397 395.2C384.7 354 349.9 333.3 315 313.1C302.9 306.1 296.1 304.9 285.2 324.7C279.4 335.2 275.6 361 283.5 368.2C307 389.3 336.1 405.9 352.1 432.5C354.5 436.5 366.7 472.5 366.7 472.5C366.7 472.5 374.5 463.4 384.1 455.1C392.1 448.1 394.4 447.6 395.6 445.9L400.4 422Z"
            fill="#F7AA9A"
          />
          <path
            d="M507.3 265.8C504.4 264.3 503.2 260.8 504.7 257.8L504.9 257.5C506.4 254.6 509.9 253.4 512.9 254.9C515.8 256.4 517 259.9 515.5 262.9L515.3 263.2C513.7 266.2 510.2 267.3 507.3 265.8ZM511.7 257.3C510.1 256.5 508.2 257.1 507.3 258.7L507.1 259C506.3 260.6 506.9 262.5 508.5 263.4C510.1 264.2 512 263.6 512.9 262L513.1 261.7C513.9 260 513.3 258.1 511.7 257.3Z"
            fill="#1C2628"
            stroke="#1C2628"
            strokeWidth="2.13"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M501 278.1C498.1 276.6 496.9 273.1 498.4 270.1L498.6 269.8C500.1 266.9 503.6 265.7 506.6 267.2C509.6 268.7 510.7 272.2 509.2 275.2L509 275.5C507.4 278.5 503.9 279.6 501 278.1ZM505.3 269.6C503.7 268.8 501.8 269.4 500.9 271L500.7 271.3C499.9 272.9 500.5 274.8 502.1 275.7C503.7 276.6 505.6 275.9 506.5 274.3L506.7 274C507.6 272.3 507 270.4 505.3 269.6Z"
            fill="#1C2628"
            stroke="#1C2628"
            strokeWidth="2.13"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M511.9 250.8C507.6 248.6 506 243.3 508.1 239.1L515.4 225C517.6 220.7 522.8 219.1 527.1 221.2C531.4 223.4 533 228.7 530.9 232.9L523.6 247C521.4 251.3 516.1 253 511.9 250.8ZM525.9 223.6C522.9 222.1 519.3 223.2 517.8 226.2L510.5 240.3C509 243.3 510.1 246.9 513.1 248.4C516.1 249.9 519.7 248.8 521.2 245.8L528.5 231.7C530 228.7 528.9 225.1 525.9 223.6Z"
            fill="#1C2628"
            stroke="#1C2628"
            strokeWidth="2.13"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M562.2 166.9L413 456.6C408.5 465.4 397.7 468.8 388.9 464.3L258.4 397.1C249.6 392.6 246.2 381.8 250.7 373L335.3 208.6C338.3 208.4 341.3 208.2 344.4 208L258 375.9C255.4 381 257.4 387.3 262.5 390L392 456.6C393.5 457.4 395.1 457.8 396.8 457.8C400.7 457.8 404.3 455.6 406.1 452.1L554.7 163.5C555.2 162.5 555.5 161.5 555.7 160.5C555.8 160.5 555.9 160.4 556 160.4C558.8 159.2 561.5 157.9 564.2 156.7C564.5 160 563.9 163.6 562.2 166.9Z"
            fill="#1C2628"
            stroke="#1C2628"
            strokeWidth="2.13"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M555.6 160.5C555.4 161.5 555.1 162.5 554.6 163.5L406.1 452.1C404.3 455.6 400.7 457.8 396.8 457.8C395.1 457.8 393.5 457.4 392 456.6L262.5 390C257.4 387.4 255.4 381.1 258 375.9L344.4 208.1C364.5 206.7 386.4 204.2 409.3 200.5C466.7 191.1 519 176.4 555.6 160.5Z"
            fill="#FAF6EB"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M472.7 102.4C472.7 102.4 469.9 107.9 469.7 112.5C469.7 112.8 469.7 113 469.7 113.3C469.8 117.5 472.4 121.2 476.1 123.1L485.7 128C488.4 129.4 491.5 129.7 494.3 128.8C495.5 128.4 496.7 127.9 497.8 127.2C501.7 124.6 504.3 119.2 504.3 119.2L472.7 102.4Z"
            fill="#1C2628"
            stroke="#1C2628"
            strokeWidth="2.13"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M481.5 407.2C482.5 412.6 471.9 460.6 458.3 490.3L308.6 518.7C308.6 518.7 312.5 504 320.6 487.7C327.8 473.2 338.2 457.5 352.1 449.7C393.1 426.7 424.4 437.6 424.4 437.6C424.4 437.6 426.4 419.8 439.1 397.2C439.1 397.2 439.2 393.4 439.8 387.7C441 376.3 444.2 357.7 452.7 349.2C470.9 331 485.3 334.6 484.3 337.4C485.1 341.2 482.4 404.5 481.5 407.2Z"
            fill="#F45B49"
            stroke="#1C2628"
            strokeWidth="2.13"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M249.5 314.9C236.8 317.6 231.7 329 237.9 341.1C239.6 344.4 249.8 359.2 259 357.5C263.3 356.7 277.3 358.6 274.6 325.3C272.8 312.3 266.4 311.4 249.5 314.9Z"
            fill="#F45B49"
            stroke="#1C2628"
            strokeWidth="2.13"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M358.6 723.5C335.8 724 311.6 723.2 286.6 720.8C235.8 715.9 189.4 705.2 152 691"
            stroke="#1C2628"
            strokeWidth="2.13"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M220.3 596C220.3 596 224.8 610.5 249.4 623C274 635.5 299.5 652.4 335.4 652.4"
            stroke="#1C2628"
            strokeWidth="2.13"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M470.6 340.8C470.6 340.8 466.9 363.4 470.6 367C474.3 370.7 479.7 370.7 479.7 370.7"
            stroke="#1C2628"
            strokeWidth="2.13"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M425.5 454.8C410.7 461.8 403.2 450.1 384.1 455.1C360.6 461.4 358.6 482.8 338.4 487.9C333.7 489.1 327.8 489.5 320.5 487.7C327.7 473.2 338.1 457.5 352 449.7C393 426.7 424.3 437.6 424.3 437.6C424.3 437.6 426.3 419.8 439 397.2C439 397.2 439.1 393.4 439.7 387.7C444.1 394 447.2 401.2 448.1 409C450 426.7 440.8 447.5 425.5 454.8Z"
            fill="#FAF6EB"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M295.5 530.8C294.2 522.8 311.7 513.7 326.4 506.1C358.9 489.3 394 483.3 398.8 482.5C418.7 479.3 431.9 479.5 444.1 468.3C451.5 461.6 460 448.9 462.6 449.8C466.8 451.3 464 478.4 455.9 495.6C437.3 535.3 377.6 542.2 366.8 543.5C335.6 547.4 297.3 542.1 295.5 530.8Z"
            fill="#FB564C"
          />
          <path
            d="M538.1 300.7L507.9 320.8"
            stroke="#1C2628"
            strokeWidth="2.13"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M539.9 332.1L508.5 335.7"
            stroke="#1C2628"
            strokeWidth="2.13"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M506.1 351.1L535.1 382.5"
            stroke="#1C2628"
            strokeWidth="2.13"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M507.3 383.1L521.5 400.3"
            stroke="#1C2628"
            strokeWidth="2.13"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M221.3 645.4C217.7 653.8 215.3 663.4 218.4 671.9C220.7 678.4 225.9 683.4 230.3 688.8C234.7 694.2 238.5 700.8 237.4 707.7"
            stroke="#1C2628"
            strokeWidth="2.13"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M237.1 684.4C240 690.4 246.2 694.2 248.9 700.2C250.2 703.1 250.6 706.4 250.6 709.6"
            stroke="#1C2628"
            strokeWidth="2.13"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M268.8 574.5C268.8 579.1 268.8 583.8 268 588.4C267.2 593 265.5 597.5 262.4 600.9C259.1 604.6 254.5 606.9 250.1 609.1"
            stroke="#1C2628"
            strokeWidth="2.13"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M272.4 597.3C271.1 601.3 268.4 604.9 264.9 607.3"
            stroke="#1C2628"
            strokeWidth="2.13"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M246.2 342.2C245.7 337.8 245.2 333.2 246.9 329.2C248.6 325.2 253.4 322 257.5 323.8"
            stroke="#1C2628"
            strokeWidth="2.13"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M443.7 477C422.6 512.1 402.6 548 383.8 584.4"
            stroke="#1C2628"
            strokeWidth="2.13"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M415.7 547.5L375.7 624.4"
            stroke="#1C2628"
            strokeWidth="2.13"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M465.5 427C459.2 453.9 460.9 472.6 437.2 509.9"
            stroke="#1C2628"
            strokeWidth="2.13"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M608.5 119.7C607 131.2 590.6 144.1 564.1 156.6C561.5 157.8 558.7 159.1 555.9 160.3C555.8 160.3 555.7 160.4 555.6 160.4C519 176.3 466.6 191.1 409.3 200.4C386.4 204.1 364.5 206.6 344.4 208C341.3 208.2 338.3 208.4 335.3 208.6C311 209.9 289.5 209.6 271.9 207.6C240 204.1 221.3 195.3 223 182C224.7 168.8 246.4 153.5 280.4 139.3C308.9 127.4 346 116.2 387.3 107.7C390.6 107 393.8 106.4 397.1 105.7C405.3 104.1 413.7 102.6 422.2 101.2C431.4 99.6998 440.4 98.3998 449.1 97.2998C453.9 96.6998 458.6 96.1998 463.2 95.6998C495.1 92.2998 523.7 91.3998 547 92.8998C586.5 95.4998 610.4 104.8 608.5 119.7Z"
            fill="#1C2628"
            stroke="#1C2628"
            strokeWidth="2.13"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M343 188.1C340 188.3 337.1 188.5 334.2 188.6C325 189.1 316.1 189.4 307.8 189.4C295.4 189.4 284.1 188.8 274.1 187.7"
            stroke="#FAF6EB"
            strokeWidth="2.13"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M555.5 138.6C553 139.8 550.5 140.9 547.9 142.1L547.4 142.3"
            stroke="#FAF6EB"
            strokeWidth="2.13"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M288.1 157.8C315.9 146.2 352.5 135.4 391.3 127.3C394.5 126.7 397.6 126 400.9 125.4C408.9 123.9 417.1 122.4 425.4 121C434.2 119.6 443 118.3 451.7 117.2C456.1 116.6 460.4 116.1 464.5 115.7L465.5 115.6C486.5 113.4 506.1 112.2 524 112.2C531.7 112.2 539.1 112.4 545.9 112.8"
            stroke="#FAF6EB"
            strokeWidth="2.13"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M586.1 75.7998C637.3 79.0998 668.4 91.0998 665.8 110.4C663.9 125.3 642.5 142.1 608.2 158.3C604.8 159.9 601.2 161.5 597.6 163.1C597.5 163.2 597.4 163.2 597.3 163.2"
            stroke="#1C2628"
            strokeWidth="2.13"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M229.2 224.6C187.8 220 163.5 208.6 165.7 191.4C167.9 174.2 196.1 154.4 240.1 136C277.1 120.5 325.3 106.1 378.8 94.9996C383 94.0996 387.3 93.2996 391.5 92.3996C402.2 90.2996 413.1 88.3996 424.1 86.5996C436 84.6996 447.7 82.9996 459.1 81.5996"
            stroke="#1C2628"
            strokeWidth="2.13"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M527.1 757.7C471 772.6 414.6 792.5 356.6 789"
            stroke="#1C2628"
            strokeWidth="2.13"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M415.4 309.9C441.081 309.9 461.9 289.081 461.9 263.4C461.9 237.719 441.081 216.9 415.4 216.9C389.719 216.9 368.9 237.719 368.9 263.4C368.9 289.081 389.719 309.9 415.4 309.9Z"
            fill="#F3A13B"
          />
          <path
            d="M384.3 247C393.3 229.8 414.6 223.2 431.7 232.3"
            stroke="#1C2628"
            strokeWidth="2.13"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M392.9 251.5C399.4 239.1 414.8 234.3 427.2 240.9"
            stroke="#1C2628"
            strokeWidth="2.13"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M415.4 269.7C418.879 269.7 421.7 266.879 421.7 263.4C421.7 259.921 418.879 257.1 415.4 257.1C411.921 257.1 409.1 259.921 409.1 263.4C409.1 266.879 411.921 269.7 415.4 269.7Z"
            stroke="#1C2628"
            strokeWidth="2.13"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M418.2 297L405.6 321"
            stroke="#1C2628"
            strokeWidth="2.13"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M418.2 297C416.2 296 415.5 293.5 416.5 291.6L418.6 287.7C419.6 285.7 422.1 285 424 286C426 287 426.7 289.5 425.7 291.4L423.6 295.3C422.6 297.3 420.1 298 418.2 297Z"
            stroke="#1C2628"
            strokeWidth="2.13"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M336.5 322L407.8 358.3"
            stroke="#1C2628"
            strokeWidth="2.13"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M366 357.6L410.1 380.2"
            stroke="#1C2628"
            strokeWidth="2.13"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M317.2 332.7L366 357.6"
            stroke="black"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M129.7 482.9C125.1 481.2 120.1 481.3 116 482.8C113.6 483.6 111.5 484.8 109.8 486.2C109.5 485.1 109.3 484 109 482.9C108.5 480.8 108 478.6 107.6 476.4C109.5 474.4 111.2 472.2 112.7 469.8C116.5 464.3 119.1 457.7 119.4 450.9C119.6 444.2 119.5 437.3 116.9 431.5C116.3 430 115.6 429 114.4 427C114 426.3 113.2 424.9 112.2 423.9C111.2 422.8 109.4 422.1 107.6 422.4C104 423.2 102.5 425.5 101.5 427.2C101 428.1 100.7 428.9 100.4 429.9C100.2 430.4 100.1 430.7 99.9999 431.1L99.8999 431.4C99.7999 431.7 99.7999 431.7 99.7999 431.8L99.6999 432.4C98.9999 435.9 99.3999 439.1 99.7999 442.1C100.2 445.1 100.6 448 100.9 450.9C101.3 455.5 102 460 102.9 464.5C101.5 466.5 99.9999 468.5 98.3999 470.3L95.3999 473.7C94.3999 474.8 93.3999 476.1 92.2999 477.4C88.1999 482.6 84.9999 488.5 83.2999 495.1C81.4999 501.6 82.1999 509.3 85.8999 515.1C89.4999 521 95.2999 524.7 101.1 526.5C106.8 528.2 112.6 528.6 118.1 527.8C118.8 530.6 119.5 533.4 120.1 536C122.3 542.9 120.3 549.4 116.1 551.8C113 553.5 109.8 552.9 107.7 551.8C107.9 551.8 108.1 551.8 108.4 551.8C111.7 551.7 114.2 548.9 114 545.6C113.9 542.3 111.1 539.8 107.8 540C104.5 540.1 102 542.9 102.2 546.2C102.2 546.5 102.3 546.7 102.3 547C102.5 548.2 103.1 549.3 103.9 550.1C104.1 550.4 104.3 550.6 104.6 550.9C105.7 552 107.2 553.1 109.3 553.7C111.4 554.3 114 554.4 116.8 553.3C119.5 552.2 122 549.6 123 546.2C123.5 544.5 123.8 542.7 123.6 540.8C123.4 538.8 123 537.1 122.6 535.3C122 532.7 121.3 530 120.6 527.2C125.5 526.2 130 524.2 134 521.5C138.4 518.2 141.7 513.4 142.7 508.1C143.8 502.8 142.8 497.3 140.5 492.8C138.4 488.3 134.4 484.6 129.7 482.9ZM105 437.8C105.7 435.4 106.9 428.8 110.6 429.7C112.9 430.3 113.5 433.4 113.6 435.4C113.9 440.1 113 445 111 449.3C109.1 453.5 107.1 457.4 104.8 461.3C104.3 457.8 103.9 454.3 103.6 450.7C103.4 446.4 103.9 442 105 437.8ZM102.9 521.9C98.0999 519.8 93.7999 516.4 91.5999 511.9C89.3999 507.5 89.3999 502.3 91.1999 497.4C92.9999 492.5 96.3999 488 100.1 484C101 483 101.9 482 103.1 480.9L104.7 479.4C105.1 479 105.4 478.7 105.8 478.3C106.2 480 106.6 481.7 106.9 483.4C107.2 484.9 107.6 486.3 107.9 487.8C104.6 491.1 102.7 495.1 102.1 498.6C101.1 504.5 102.7 509 104 511.6C104.6 512.9 105.3 513.9 105.7 514.5C106.1 515.1 106.4 515.4 106.4 515.4C106.4 515.4 105.9 513.9 105.4 511.1C105 508.4 104.6 504.2 106.3 499.7C107 497.9 108 496 109.5 494.3C111 500.4 112.5 506.4 114 511.9C115.1 516.2 116.2 520.4 117.3 524.3C112.4 524.7 107.3 523.9 102.9 521.9ZM139.7 507.7C139.4 512.2 136.8 516.6 132.7 519.4C129.1 521.9 124.7 523.5 120 524.1C118.9 520 117.7 515.8 116.4 511.3C114.7 505.4 113 499.1 111.3 492.5C113.1 490.9 115.3 489.6 117.9 488.9C123.8 487.3 131.2 489.2 136 495.7C138.4 499 140 503.3 139.7 507.7Z"
            fill="#1C2628"
            stroke="#1C2628"
            strokeWidth="2.13"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M307.2 382.4L292.4 357.4L321.4 357L307.2 382.4Z"
            fill="#1C2628"
            stroke="#1C2628"
            strokeWidth="2.13"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M371.1 418.2L400.2 417.9L385.3 392.9L371.1 418.2Z"
            fill="#1C2628"
            stroke="#1C2628"
            strokeWidth="2.13"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M344.618 370.106L330.376 395.481L337.788 399.641L352.03 374.266L344.618 370.106Z"
            fill="#1C2628"
            stroke="#1C2628"
            strokeWidth="2.1299"
            strokeMiterlimit="3.9998"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M357.285 377.193L343.044 402.568L350.456 406.728L364.697 381.353L357.285 377.193Z"
            fill="#1C2628"
            stroke="#1C2628"
            strokeWidth="2.1299"
            strokeMiterlimit="3.9998"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div className="px-4 sm:px-8 ">
        <div>
          <h2 className={`text-4xl xss:text-5xl md:text-6xl font-bold`}>Sign up</h2>
          <div className=" flex content-center items-center pt-3 pb-4">
            <p className={`text-base xss:text-lg`}>Already have an account</p>
            <Link href="/login">
              <p
                className={`${signupStyles.headerP} ${signupStyles.headerSpan} text-lg`}
              >
                Log in
              </p>
            </Link>
          </div>
          {/* <div className="flex justify-between space-x-4">
            <button
              className={`w-full py-2.5 rounded border bg-white text-white inline-flex justify-center items-center`}
            >
              <div>
                <svg
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                    <path
                      fill="#4285F4"
                      d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"
                    />
                    <path
                      fill="#34A853"
                      d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"
                    />
                    <path
                      fill="#EA4335"
                      d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"
                    />
                  </g>
                </svg>
              </div>
              <div className="ml-2 text-black">Log in with Google</div>
            </button>

            <button
              className={`w-full py-2.5 rounded bg-[#4267B2] text-white justify-center inline-flex items-center`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="white"
                viewBox="0 0 24 24"
              >
                <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
              </svg>
              <div className="ml-2 text-white">Log in with Facebook</div>
            </button>
          </div> */}
          {/* <div className="mt-7 pb-6">
            <p className={`${signupStyles.signUpOr}`}>
              <span className={`${signupStyles.signUpSpan} text-lg`}>or</span>
            </p>
          </div> */}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-4">
          <div>
            <input
              className={`${signupStyles.formInput} text-black`}
              type="text"
              placeholder="First name"
              id="firstName"
              name="firstName"
              onChange={onFormChange}
            />
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
          <div>
            <input
              className={`${signupStyles.formInput} text-black`}
              type="text"
              placeholder="Last name"
              id="lastName"
              name="lastName"
              onChange={onFormChange}
            />
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
        <div className="">
          {/* <label>Email</label> */}
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
          <small>
            {errors.email && (
              <p className={`${signupStyles.sigupErrors}`}>{errors.email}</p>
            )}
            {serverErrors.email && (
              <p className={`${signupStyles.sigupErrors}`}>
                {serverErrors.email}
              </p>
            )}
          </small>
        </div>
        <div className="grid-cols-1 md:grid-cols-2 md:gap-4">
          <div>
            {/* <label>Username</label> */}
            <input
              className={`${signupStyles.formInput} text-black`}
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
          <div>
            <input
              className={`${signupStyles.formInput} text-black`}
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
            <span className={`${signupStyles.signupTC}`}>Terms of Service</span>{" "}
            and{" "}
            <span className={`${signupStyles.signupTC}`}>Privacy Policy</span>
          </p>
        </div>
        <button
          className={`mt-5 bg-brand-orange hover:bg-brand-orange_hover w-full py-3 rounded text-white`}
          onClick={async (e) => await handleRegisterUser(e)}
        >
          Sign up
        </button>
      </div>
    </section>
  );
};
