(function (App) {
  const LEVEL = {
    DEBUG: 0, // 값 추적, 흐름 확인
    INFO: 1,  // 정상 동작 기록
    WARN: 2,  // 이상하지만 계속 가능
    ERROR: 3, // 즉시 확인 필요
    OFF: 99
  };

  let currentLevel = LEVEL.DEBUG; // 개발 중

  function log(level, ...args) {
    if (level < currentLevel) return;

    const prefix = Object.keys(LEVEL).find(k => LEVEL[k] === level);
    console.log(`[${prefix}]`, ...args);
  }

  App.utils.logger = {
    LEVEL,
    setLevel(level) {
      currentLevel = level;
    },
    debug: (...a) => log(LEVEL.DEBUG, ...a),
    info:  (...a) => log(LEVEL.INFO, ...a),
    warn:  (...a) => log(LEVEL.WARN, ...a),
    error: (...a) => log(LEVEL.ERROR, ...a),
  };
})(window.App);
