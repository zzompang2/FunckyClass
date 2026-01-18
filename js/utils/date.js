/** 
 * date.js
 * 
 * 
 */

(function (App) {
  function dayToText(day) {
    return "일월화수목금토"[day];
  }

  /**
   * 태어난 년도를 학년으로 변경한다.
   * @param {number} year 
   * @returns {string} 학년
   */
  function formatGradeFromYear(year) {
    const nowYear = new Date().getFullYear();
    const age = nowYear - year + 1;

    if (8 <= age && age < 14)
      return `초${age - 7} (${age})`;
    else if (14 <= age && age < 17)
      return `중${age - 13} (${age})`;
    else if (17 <= age && age <20)
      return `고${age - 16} (${age})`;
    else
      return `${age}세`;
  }

  /**
   * YYYY-MM-DD 형태의 날짜 문자열을 MM/DD(week) 형태로 반환.
   * @param {string} dateStr 
   * @returns 
   */
  function formatDateKorean(dateStr) {
    if (!dateStr) return "";

    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;

    const thisYear = new Date().getFullYear();
    let year = d.getFullYear();
    if (thisYear == year) {
      year = "";
    } else {
      year = year % 100 + "/";
    }
    const month = ("0" + (d.getMonth() + 1)).slice(-2);
    const day = ("0" + d.getDate()).slice(-2);
    const week = "일월화수목금토"[d.getDay()];

    return `${year}${month}/${day}(${week})`;
  }

  /**
   * 오늘 날짜를 문자열 형태로 반환.
   * @returns {string} 오늘 날짜로 "YYYY-MM-DD"
   */
  function getTodayDate() {
    let date = new Date();
    
    let year = date.getFullYear();
    let month = ("0" + (date.getMonth() + 1)).slice(-2); // 월은 0부터 시작하므로 +1
    let day = ("0" + date.getDate()).slice(-2);
    return year + "-" + month + "-" + day;
  }

  App.utils.date = {
    dayToText,
    formatGradeFromYear,
    formatDateKorean,
    getTodayDate,
  };
})(window.App);