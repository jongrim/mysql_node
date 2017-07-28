function isValidNumber(answer) {
  let num = Number.parseInt(answer);
  if (Number.isInteger(num) && !Number.isNaN(num)) {
    return true;
  }
}

module.exports.isValidNumber = isValidNumber;
