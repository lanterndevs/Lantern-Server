// Format Date() object to YYYY-MM-DD
function getFormattedDate (date) {
  let formattedDate = '';
  formattedDate = formattedDate + date.getFullYear().toString() + '-';
  formattedDate = formattedDate + (date.getMonth() + 1).toString().padStart(2, '0') + '-';
  formattedDate = formattedDate + date.getDate().toString().padStart(2, '0');
  return formattedDate;
}

function addYears (date, years) {
  date.setFullYear(date.getFullYear() + years);
  return date;
}

function copyDate (date) {
  return new Date(date.getTime());
}

module.exports = {
  getFormattedDate,
  addYears,
  copyDate
};
