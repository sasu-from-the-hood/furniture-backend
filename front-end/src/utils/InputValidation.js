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
    // Extract only digits
    let numericValue = value.match(/[0-9]/g)
      ? value.match(/[0-9]/g).join("")
      : "";

    // Auto-add '0' if it doesn't start with it
    if (numericValue && !numericValue.startsWith("0")) {
      numericValue = "0" + numericValue;
    }

    // Fix second digit if needed
    if (
      numericValue.length >= 2 &&
      numericValue[0] === "0" &&
      numericValue[1] !== "9" &&
      numericValue[1] !== "7"
    ) {
      numericValue = "0" + "9" + numericValue.substring(2);
    }

    // Limit to 10 digits
    numericValue = numericValue.substring(0, 10);

    // ✅ Return as-is during typing
    return numericValue;
  }

  // Handle other types
  const getRex = regx[type];
  let result = value.match(getRex) ? value.match(getRex).join('') : "";
  
  // Apply character limit if line parameter is greater than 0
  if (line > 0 && result.length > line) {
    result = result.substring(0, line);
  }
  
  return result;
}

export default InputValidation;
