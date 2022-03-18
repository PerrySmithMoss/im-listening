import { useLocalStorageValue } from "@mantine/hooks";
import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { spotifyAPI } from "../lib/spotify";

export function useSpotify() {
  const [token, setToken] = useLocalStorageValue({
    key: "il-spotify-token",
    defaultValue: "",
  });
  // const [token, setToken] = useState("")

  useEffect(() => {
    if (token === "") {
      const fetchSpotifyToken = async () => {
        console.log("Fetching new token...");
        // const token = spotifyAPI.getAccessToken()

        const res = await fetch("https://accounts.spotify.com/api/token", {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization:
              "Basic " +
              btoa(
                process.env.NEXT_PUBLIC_CLIENT_ID +
                  ":" +
                  process.env.NEXT_PUBLIC_CLIENT_SECRET
              ),
          },
          method: "POST",
          body: "grant_type=client_credentials",
        });
        const data = await res.json();
        setToken(data.access_token);
        spotifyAPI.setAccessToken(data.access_token);
        // return data.access_token;
      };
      fetchSpotifyToken();
      // setInterval(fetchSpotifyToken, 1000 * 59 * 59);
    }

    // const initFetchToken = async () => {
    //   console.log("Fetching token")
    //   const res = await fetch("https://accounts.spotify.com/api/token", {
    //     headers: {
    //       "Content-Type": "application/x-www-form-urlencoded",
    //       Authorization:
    //         "Basic " +
    //         btoa(
    //           process.env.NEXT_PUBLIC_CLIENT_ID +
    //             ":" +
    //             process.env.NEXT_PUBLIC_CLIENT_SECRET
    //         ),
    //     },
    //     method: "POST",
    //     body: "grant_type=client_credentials",
    //   });
    //   const data = await res.json();
    //   setToken(data.access_token);
    //   spotifyAPI.setAccessToken(data.access_token);
    // }
    // initFetchToken()
    
    // const timer = setInterval(initFetchToken, 1000 * 60 * 59)  

    // return () => clearInterval(timer);
  }, []);

  return spotifyAPI;
}
