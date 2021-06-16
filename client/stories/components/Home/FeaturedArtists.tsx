import React from "react";
import "./featured-artists.css";
const Jcole = require("../../assets/jcole.jpg") as string;
const Beyonce = require("../../assets/beyonce.jpg") as string;
const Drake = require("../../assets/drake.jpg") as string;

interface FeaturedArtistsProps {}

export const FeaturedArtists: React.FC<FeaturedArtistsProps> = ({}) => {
  return (
    <section className="featured-artists_wrapper">
      <div className="card-v1">
        <a href="">
          <h2 className="card-heading_v1"> Featured Artists</h2>
        </a>
        <div className="artists-grid">
          <div className="artists-item">
            <a href="">
              <img
                className="artist-image"
                src={Jcole}
                alt="Two people dancing to music"
              />
            </a>
            <a href="">
              <p className="artist-name">J.Cole</p>
            </a>
          </div>
          <div className="artists-item">
            <a href="">
              <img
                className="artist-image"
                src={Beyonce}
                alt="Two people dancing to music"
              />
            </a>
            <a href="">
              <p className="artist-name">Beyonce</p>
            </a>
          </div>
          <div className="artists-item">
            <a href="">
              <img
                className="artist-image"
                src={Drake}
                alt="Two people dancing to music"
              />
            </a>
            <a href="">
              <p className="artist-name">Drake</p>
            </a>
          </div>
        </div>
      </div>
      <div className="card-v2">
        <a href="">
          <h2 className="card-heading_v2"> Top songs from January</h2>
        </a>
      </div>
      <div className="card-v3">
        <a href="">
          <h4 className="card-heading_v3 "> New Releases today</h4>
        </a>
      </div>
      <div className="card-v2">
        <a href="">
          <h4 className="card-heading_v2"> Explore your taste</h4>
        </a>
      </div>
      <div className="card-v3">
        <a href="">
          <h4 className="card-heading_v3"> Stuck on repeat</h4>
        </a>
      </div>
    </section>
  );
};
