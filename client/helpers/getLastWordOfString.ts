export const getLastWordOfString = (string: string) => {
  const words = string.trim().split(" ");
  const lastWord = words[words.length - 1];
  if (lastWord === "hop") {
    return "hip hop";
  } else {
    return lastWord;
  }
};
