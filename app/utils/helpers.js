export const addSpaces = (numberString) => {
  return numberString.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};