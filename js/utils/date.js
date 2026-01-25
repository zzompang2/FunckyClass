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
    const week = dayToText(d.getDay());

    return `${year}${month}/${day}(${week})`;
  }

  /**
   * 오늘 날짜를 문자열 형태로 반환.
   * @returns {string} 오늘 날짜로 "YYYY-MM-DD"
   */
  function getTodayDate(after = 0) {
    let date = new Date();
    date.setDate(date.getDate() + after);
    
    let year = date.getFullYear();
    let month = ("0" + (date.getMonth() + 1)).slice(-2); // 월은 0부터 시작하므로 +1
    let day = ("0" + date.getDate()).slice(-2);
    return year + "-" + month + "-" + day;
  }

  function formatSchedules(schedules) {
    return schedules.map(s => `${dayToText(s.day)} ${s.start_time}~${s.end_time}`).join('\n');
  }

  function toDate(str) {
    return new Date(str.replace(" ", "T"))
  }

  const isEarlier = (targetDate, refDate) =>
    toDate(targetDate) < toDate(refDate);

  App.utils.date = {
    dayToText,
    formatDateKorean,
    getTodayDate,
    formatSchedules,
    isEarlier,
  };
})(window.App);