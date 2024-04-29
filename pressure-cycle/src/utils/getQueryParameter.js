const getQueryParameter = (parameter) => {
  const queryString = window.location.search;
  const searchParams = new URLSearchParams(queryString);
  return searchParams.get(parameter);
};

export default getQueryParameter;
