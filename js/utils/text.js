(function (App) {
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

    function truncate(str, n = 20) {
      return (str.length > n) ? str.slice(0, n - 2) + '...' : str;
    }

  App.utils.text = {
    formatGradeFromYear,
    truncate,
  };
})(window.App);