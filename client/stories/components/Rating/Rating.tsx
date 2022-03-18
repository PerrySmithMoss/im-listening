import { faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Rating from "react-rating";

interface RatingProps {
  chosenSongRating: number | undefined;
  setChosenSongRating: React.Dispatch<React.SetStateAction<number | undefined>>;
}

export const RatingComp: React.FC<RatingProps> = ({ setChosenSongRating }) => {
  const handleRatingChange = (rating: number) => {
    setChosenSongRating(rating);
  };

  return (
    <Rating
      onChange={(rate) => handleRatingChange(rate)}
      fractions={2}
      placeholderRating={3.5}
      emptySymbol={
        <FontAwesomeIcon
          size="2x"
          color="gray"
          icon={faStar}
        />
      }
      placeholderSymbol={
        <FontAwesomeIcon
          size="2x"
          color="gray"
          icon={faStar}
        />
      }
      fullSymbol={
        <FontAwesomeIcon
          size="2x"
          color="yellow"
          icon={faStar}
        />
      }
    />
  );
};
