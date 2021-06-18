import React from "react";
import styles from "./featuredArtists.module.css";
// const Jcole = require("../../assets/jcole.jpg") as string;
// const Beyonce = require("../../assets/beyonce.jpg") as string;
// const Drake = require("../../assets/drake.jpg") as string;

interface FeaturedArtistsProps {}

export const FeaturedArtists: React.FC<FeaturedArtistsProps> = ({}) => {
  return (
    <section className={styles.featuredArtistsWrapper}>
      <div className={`${styles.cardV1}`}>
        <a href="#" className={`${styles.featuredArtistsA}`}>
          <h2 className={`${styles.cardHeadingV1}`}> Featured Artists</h2>
        </a>
        <div className={`${styles.artistsGrid}`}>
          <div className={`${styles.artistsItem}`}>
            <a href="#" className={`${styles.featuredArtistsA}`}>
              <img
                className={`${styles.artistImage}`}
                src="/assets/jcole.jpg"
                alt="Two people dancing to music"
              />
            </a>
            <a href="#" className={`${styles.featuredArtistsA}`}>
              <p className={`${styles.artistName}`}>J.Cole</p>
            </a>
          </div>
          <div className={`${styles.artistsItem}`}>
            <a href="#" className={`${styles.featuredArtistsA}`}>
              <img
                className={`${styles.artistImage}`}
                src="/assets/beyonce.jpg"
                alt="Two people dancing to music"
              />
            </a>
            <a href="#" className={`${styles.featuredArtistsA}`}>
              <p className={`${styles.artistName}`}>Beyonce</p>
            </a>
          </div>
          <div className={`${styles.artistsItem}`}>
            <a href="#" className={`${styles.featuredArtistsA}`}>
              <img
                className={`${styles.artistImage}`}
                src="/assets/drake.jpg"
                alt="Two people dancing to music"
              />
            </a>
            <a href="#" className={`${styles.featuredArtistsA}`}>
              <p className={`${styles.artistName}`}>Drake</p>
            </a>
          </div>
        </div>
      </div>
      <div className={`${styles.cardV2}`}>
        <a href="#" className={`${styles.featuredArtistsA}`}>
          <h2 className={`${styles.cardHeadingV2}`}> Top songs from January</h2>
        </a>
      </div>
      <div className={`${styles.cardV3}`}>
        <a href="#" className={`${styles.featuredArtistsA}`}>
          <h4 className={`${styles.cardHeadingV2}`}> New Releases today</h4>
        </a>
      </div>
      <div className={`${styles.cardV2}`}>
        <a href="#" className={`${styles.featuredArtistsA}`}>
          <h4 className={`${styles.cardHeadingV2}`}> Explore your taste</h4>
        </a>
      </div>
      <div className={`${styles.cardV3}`}>
        <a href="#" className={`${styles.featuredArtistsA}`}>
          <h4 className={`${styles.cardHeadingV3}`}> Stuck on repeat</h4>
        </a>
      </div>
    </section>
  );
};
