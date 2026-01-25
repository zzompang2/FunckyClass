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

  function formatDisplayValue(key, value, defaultValue = '') {
    const def = App.db.getColumnDef(key);

    if (!value)
      return defaultValue || '';
    if (def.source.column === 'date')
      return App.utils.date.formatDateKorean(value);
    if (def.source.column === 'schedules')
      return App.utils.date.formatSchedules(value);
    if (def.source.editor === 'select')
      return def.source.options.find(opt => opt.value === value).label;
    return value;
  }

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      alert("텍스트가 복사되었습니다!");
    } catch (err) {
      console.error("복사 실패:", err);
    }
  }

  App.utils.text = {
    formatGradeFromYear,
    truncate,
    formatDisplayValue,
    copyToClipboard,
  };
})(window.App);