const regx = {
  "letter": /[a-zA-Z ]/g,  // Updated to include space
  "number": /[0-9]/g,
  "lowercase": /[a-z]/g,
  "uppercase": /[A-Z]/g,
  "phone": /[0-9]/g,
  "id": /[0-9/0-9]/g
}

const InputValidation = (value, type, line = 0) => {
  // Special handling for phone numbers
  if (type === "phone") {
    // First, filter out non-numeric characters
    const numericValue = value.match(/[0-9]/g) ? value.match(/[0-9]/g).join('') : "";

    // If the number doesn't start with 0, add it
    if (numericValue && !numericValue.startsWith('0')) {
      return '0' + numericValue;
    }

    // If the second digit exists and is not 9 or 7, replace it with 9
    if (numericValue.length >= 2 && numericValue[0] === '0' && numericValue[1] !== '9' && numericValue[1] !== '7') {
      return '0' + '9' + numericValue.substring(2);
    }

    // Limit to 10 digits (0 + 9/7 + 8 more digits)
    if (numericValue.length > 10) {
      return numericValue.substring(0, 10);
    }

    return numericValue;
  }

  // For other types, use the regular expression
  const getRex = regx[type];
  let result = value.match(getRex) ? value.match(getRex).join('') : "";
  
  // Apply character limit if line parameter is greater than 0
  if (line > 0 && result.length > line) {
    result = result.substring(0, line);
  }
  
  return result;
}

export default InputValidation;
