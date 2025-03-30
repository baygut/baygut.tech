export const formatPhone = (phone: string) => {
  const countryCode = phone.slice(0, 3);
  const areaCode = phone.slice(3, 6);
  const firstPart = phone.slice(6, 9);
  const secondPart = phone.slice(9, 11);
  const thirdPart = phone.slice(11, 13);
  return `${countryCode} ${areaCode} ${firstPart} ${secondPart} ${thirdPart}`;
};
