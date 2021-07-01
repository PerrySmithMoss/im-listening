import React, { useState, useEffect } from "react";
import shareMusicModalStyles from "./shareMusicModal.module.css";
import signupStyles from "../SignUp/signup.module.css";
import { useRouter } from "next/dist/client/router";
import { useDebounce } from "../../../hooks/useDebounce";
import { useCreatePostMutation } from "../../../graphql/generated/graphql";

interface ShareMusicModalProps {
  setIsShareMusicModalOpen: (value: boolean) => void;
  isShareMusicModalOpen: boolean;
}

type Errors = {
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  password?: string;
};

export const ShareMusicModal: React.FC<ShareMusicModalProps> = ({
  setIsShareMusicModalOpen,
  isShareMusicModalOpen,
}) => {
  // Find song by name API
  // https://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=process.env.LAST_FM_API_KEY&artist=radiohead&track=creep&format=json

  const router = useRouter();
  const [formValues, setFormValues] = useState({
    title: "",
    content: "",
    rating: "",
  });
  const [errors, setErrors] = useState({} as Errors);
  const [serverErrors, setServerErrors] = useState(
    {} as Record<string, string>
  );
  const [dataIsCorrect, setDataIsCorrect] = useState(false);
  const [serverDataIsCorrect, setServerDataIsCorrect] = useState(false);
  const [isSongNames, setIsSongNames] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [album, setAlbum] = useState({} as any);
  const [songName, setSongName] = useState("");
  const [artistName, setArtistName] = useState("");
  const isEmpty = !album || Object.keys(album === 0);
  const [createPost] = useCreatePostMutation();
  const onFormChange = (event: any) => {
    setFormValues({
      ...formValues,
      [event.target.name]: event.target.value,
    });
  };

  const onArtistNameInputChange = (e: any) => {
    e.preventDefault();
    if (e.target.value.trim() === "") setIsSongNames(false);

    setArtistName(e.target.value);
  };

  const onSongNameInputChange = (e: any) => {
    e.preventDefault();
    if (e.target.value.trim() === "") setIsSongNames(false);

    setSongName(e.target.value);
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

  const prepareSearchQuery = (
    artistName: string | number,
    songName: string | number
  ) => {
    // const url = `http://api.tvmaze.com/search/shows?q=${query}`;
    const url = `https://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=${process.env.LAST_FM_API_KEY}&artist=${artistName}&track=${songName}&format=json`;

    return encodeURI(url);
  };

  const searchTvShow = async () => {
    if (!songName || songName.trim() === "") return;

    setLoading(true);
    setIsSongNames(false);

    const artistNameReplace = artistName.replace(/ /g, "+");
    const songNameReplace = songName.replace(/ /g, "+");

    const URL = prepareSearchQuery(artistNameReplace, songNameReplace);

    const response = await fetch(URL)
      .then((res) => res.json())
      .catch((err: any) => {
        console.log("Error: ", err);
      });

    if (response) {
      console.log("Response: ", response);
      if (response.track && response.track.album) {
        setIsSongNames(true);
        console.log("We have a song!");
      }

      setAlbum(response.track);
    }

    setLoading(false);
  };

  useDebounce(songName, 1000, searchTvShow);

  const handleShareMusic = async (event: any) => {
    event.preventDefault();
    // setErrors(validation(formValues));
    if (dataIsCorrect === true) {
      const res = await createPost({
        variables: {
          artistName: artistName,
          albumName: songName,
          title: formValues.title,
          content: formValues.content,
          rating: parseInt(formValues.rating)
        },
        // update: (cache, { data }) => {
        //   cache.writeQuery<GetCurrentUserQuery>({
        //     query: GetCurrentUserDocument,
        //     data: {
        //       __typename: "Query",
        //       getCurrentUser: data?.registerUser.user as any,
        //     },
        //   });
        // },
      });
      if (res.errors) {
        console.log(res.errors)
        setServerDataIsCorrect(false);
        // setServerErrors(toErrorMap(res.data.registerUser.errors));
        // } else if (res.data?.registerUser.user) {
        //   router.push("/");
      } else {
        setServerDataIsCorrect(true);
        router.push("/");
      }
    }
  };
  return (
    <>
      {isShareMusicModalOpen ? (
        <div className={`${shareMusicModalStyles.shareMusicModal}`}>
          <div className={`${shareMusicModalStyles.shareMusicModalContent}`}>
            <span
              onClick={() => setIsShareMusicModalOpen(false)}
              className={`${shareMusicModalStyles.shareMusicModalClose}`}
            >
              &times;
            </span>
            <h2>Share what music you're listening to</h2>
            <hr />
            <div className="formContainer">
              <form className="signUpForm" id="signUpForm">
                <div className="form__control">
                  {/* <label>Email</label> */}
                  <input
                    className={`${signupStyles.formInput}`}
                    type="text"
                    placeholder="Enter artist name"
                    id="artistName"
                    name="artistName"
                    value={artistName}
                    onChange={onArtistNameInputChange}
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
                <div className="form__control">
                  {/* <label>First name</label> */}
                  <input
                    className={`${signupStyles.formInput}`}
                    type="text"
                    placeholder="Enter song name"
                    id="songName"
                    name="songName"
                    value={songName}
                    onChange={onSongNameInputChange}
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
                {!isLoading && isSongNames && (
                  <div>
                    <img
                      src={album.album.image[2]["#text"]}
                      alt="Album cover image"
                    />
                    {album.album.artist} - {album.album.title}
                  </div>
                )}
                <hr />
                <div className="form__control">
                  {/* <label>First name</label> */}
                  <input
                    className={`${signupStyles.formInput}`}
                    type="text"
                    placeholder="Title"
                    id="title"
                    name="title"
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
                    placeholder="Content"
                    id="content"
                    name="content"
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
                <div className="form__control">
                  {/* <label>Username</label> */}
                  <input
                    className={`${signupStyles.formInput}`}
                    type="number"
                    placeholder="Rating"
                    id="rating"
                    name="rating"
                    onChange={onFormChange}
                    min="0"
                    max="10"
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

                <button
                  className={`${signupStyles.cancelButton} `}
                  onClick={() => setIsShareMusicModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className={`${signupStyles.signupButton}`}
                  onClick={async (e) => await handleShareMusic(e)}
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
                  Share
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        false
      )}{" "}
    </>
  );
};
