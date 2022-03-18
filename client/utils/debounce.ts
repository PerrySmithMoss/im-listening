export const debounce = (func: any, delay: number) => {
  let setTimoutInstance: any;
  return function () {
    const args = arguments;
    if (setTimoutInstance) clearTimeout(setTimoutInstance);
    setTimoutInstance = setTimeout(() => func.apply("", args), delay);
  };
};
