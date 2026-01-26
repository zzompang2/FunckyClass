(function (App) {
  
  const timetableStart = 13; // 몇시부터 시간표 그릴지
  const timetableEnd = 23;   // 몇시까지 시간표 그릴지

  function getPositionOfTimebox(_start, _end) {
    const regex = /\d{2}:\d{2}/;
    if (!regex.test(_start) || !regex.test(_end))
      return [];

    const start = _start.split(":").map(data => Number(data));
    const end = _end.split(":").map(data => Number(data));
    const startMinute = start[0]*60 + start[1];
    const endMinute = end[0]*60 + end[1];

    const gapMin = (timetableEnd - timetableStart) * 60;
    const classStartPosition = (startMinute - timetableStart * 60) * 100 / gapMin;
    const classLength = (endMinute - startMinute) * 100 / gapMin;

    return [classStartPosition, classLength];
  }

  function renderMenu(area) {
    const html = `
    <div id="dashboard">
      <div class="timetable-bg">
        <div id="timetable-time-col" class="timetable-time-ctn">
          <div style="height: 17px;"></div>
        </div>
        <div class="timetable-col">
          <div class="timetable-day">월</div>
          <div id="timetable-ctn-1" class="timetable-ctn"></div>
        </div>
        <div class="timetable-col">
          <div class="timetable-day">화</div>
          <div id="timetable-ctn-2" class="timetable-ctn"></div>
        </div>
        <div class="timetable-col">
          <div class="timetable-day">수</div>
          <div id="timetable-ctn-3" class="timetable-ctn"></div>
        </div>
        <div class="timetable-col">
          <div class="timetable-day">목</div>
          <div id="timetable-ctn-4" class="timetable-ctn"></div>
        </div>
        <div class="timetable-col">
          <div class="timetable-day">금</div>
          <div id="timetable-ctn-5" class="timetable-ctn"></div>
        </div>
      </div>
    </div>
    `
    area.innerHTML = html;

    const timetableTimeCol = document.getElementById("timetable-time-col");
    const ctnList = [
      document.getElementById("timetable-ctn-1"),
      document.getElementById("timetable-ctn-2"),
      document.getElementById("timetable-ctn-3"),
      document.getElementById("timetable-ctn-4"),
      document.getElementById("timetable-ctn-5")
    ];

    let timetableTimeHtml = `
      <div class="timetable-time-number-rap">
        <div class="timetable-time-number">${timetableStart % 12}</div>
      </div>
    `;
    let timetableLineHtml = `<div class="timetable-day-line"></div>`;
    for (let i=timetableStart; i<timetableEnd; i++) {
      timetableTimeHtml += `
        <div class="timetable-time-gap"></div>
        <div class="timetable-time-number-rap">
          <div class="timetable-time-number">${i % 12 + 1}</div>
        </div>
      `;
      timetableLineHtml += `
        <div class="timetable-time-gap"></div>
        <div class="timetable-day-dashline"></div>
        <div class="timetable-time-gap"></div>
        <div class="timetable-day-line"></div>
      `;
    }

    timetableTimeCol.innerHTML += timetableTimeHtml;
    ctnList.forEach(ctn => {
      ctn.innerHTML = timetableLineHtml;
    })

    // 수업 표시하기
    const colorPalete = [
      "#651d1dff",
      "#206010ff",
      "#134567ff",
      "#785613ff",
      "#571765ff",
      "#196249ff"
    ];
    const data = App.db.getAllSchedules();

    data.forEach(({id, day, start_time, end_time, name, subject}) => {
      const [ top, height ] = getPositionOfTimebox(start_time, end_time);

      const classBox = document.createElement("div");
      classBox.className = "timetable-classbox";
      classBox.innerText = `${name}\n${subject}\n${start_time} ~ ${end_time}`;

      classBox.style.top = `${top}%`;
      classBox.style.height = `${height}%`;
      classBox.style.backgroundColor = colorPalete[id % colorPalete.length];
      classBox.addEventListener('click', () => {
        App.service.group.selectGroup(id, name);
      });

      ctnList[day - 1].append(classBox);
    });
    
    const today = new Date().getDay(); // 0~6

    // area.innerHTML = html;
  }

  App.ui.timetable = {
    renderMenu,
  };
})(window.App);