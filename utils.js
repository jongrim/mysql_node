function isValidNumber(answer) {
  let num = Number.parseInt(answer);
  if (Number.isInteger(num) && !Number.isNaN(num)) {
    return true;
  }
}

function formatCurrency(num) {
  return `$${num}`;
}

module.exports.isValidNumber = isValidNumber;
module.exports.formatCurrency = formatCurrency;
