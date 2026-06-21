const $ = (selector) => document.querySelector(selector);
  const pad = (n) => String(n).padStart(2, "0");

  const state = {
    calendar: "jalali",
    is24: true
  };

  const els = {
    ticks: $("#ticks"),
    hour: $("#hourHand"),
    minute: $("#minuteHand"),
    second: $("#secondHand"),
    hh: $("#hh"),
    mm: $("#mm"),
    ss: $("#ss"),
    ampm: $("#ampm"),
    timezone: $("#timezone"),
    weekday: $("#weekday"),
    dateGrid: $("#dateGrid"),
    weekType: $("#weekType"),
    calendarName: $("#calendarName"),
    dayOfYear: $("#dayOfYear"),
    calendarBtn: $("#calendarBtn"),
    formatBtn: $("#formatBtn"),
    themeBtn: $("#themeBtn"),
    todayLabel: $("#todayLabel")
  };

  function normalizeDigits(value) {
    const fa = "۰۱۲۳۴۵۶۷۸۹";
    const ar = "٠١٢٣٤٥٦٧٨٩";
    return String(value).replace(/[۰-۹٠-٩]/g, (d) => {
      const faIndex = fa.indexOf(d);
      return faIndex > -1 ? faIndex : ar.indexOf(d);
    });
  }

  function buildTicks() {
    const cx = 100;
    const cy = 100;
  
    for (let i = 0; i < 60; i++) {
      const angle = (i * 6 - 90) * Math.PI / 180;
      const major = i % 5 === 0;
      const inner = major ? 82 : 86;
      const outer = 91;
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    
      line.setAttribute("x1", cx + Math.cos(angle) * inner);
      line.setAttribute("y1", cy + Math.sin(angle) * inner);
      line.setAttribute("x2", cx + Math.cos(angle) * outer);
      line.setAttribute("y2", cy + Math.sin(angle) * outer);
      line.setAttribute("class", major ? "tick major" : "tick");
      line.setAttribute("stroke-width", major ? "1.35" : ".62");
      els.ticks.appendChild(line);
    }
  }

  function getPersianDateParts(date) {
    const formatter = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
      weekday: "long",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    });
  
    const parts = formatter.formatToParts(date).reduce((acc, part) => {
      acc[part.type] = part.value;
      return acc;
    }, {});
  
    return {
      year: Number(normalizeDigits(parts.year)),
      month: Number(normalizeDigits(parts.month)),
      day: Number(normalizeDigits(parts.day)),
      weekday: parts.weekday
    };
  }

  function gregorianDayOfYear(date) {
    const start = new Date(date.getFullYear(), 0, 1);
    return Math.floor((date - start) / 86400000) + 1;
  }

  function jalaliDayOfYear(month, day) {
    const monthDays = [31,31,31,31,31,31,30,30,30,30,30,29];
    return monthDays.slice(0, month - 1).reduce((a, b) => a + b, 0) + day;
  }

  function renderDate() {
    const now = new Date();
    let year;
    let month;
    let day;
    let weekday;
    let dayNumber;
    let calendarLabel;
    let todayLabel;
    let cellLabels;
  
    if (state.calendar === "jalali") {
      const p = getPersianDateParts(now);
      year = p.year;
      month = p.month;
      day = p.day;
      weekday = p.weekday;
      dayNumber = jalaliDayOfYear(month, day);
      calendarLabel = "شمسی";
      todayLabel = "امروز";
      cellLabels = ["قرن", "سال", "ماه", "روز"];
      document.documentElement.lang = "fa";
      document.documentElement.dir = "rtl";
    } else {
      year = now.getFullYear();
      month = now.getMonth() + 1;
      day = now.getDate();
      weekday = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(now);
      dayNumber = gregorianDayOfYear(now);
      calendarLabel = "Gregorian";
      todayLabel = "Today";
      cellLabels = ["century", "year", "month", "day"];
      document.documentElement.lang = "en";
      document.documentElement.dir = "ltr";
    }
  
    const century = Math.floor(year / 100);
    const yy = year - century * 100;
    const values = [century, pad(yy), pad(month), pad(day)];
  
    els.weekday.textContent = weekday;
    els.todayLabel.textContent = todayLabel;
    els.dateGrid.innerHTML = values.map((value, index) => {
      return `<div class="date-cell" data-label="${cellLabels[index]}">${value}</div>`;
    }).join("");
  
    const week = Math.ceil(dayNumber / 7);
    const oddEven = week % 2 === 0
      ? (state.calendar === "jalali" ? "زوج" : "Even")
      : (state.calendar === "jalali" ? "فرد" : "Odd");
  
    els.weekType.textContent = oddEven;
    els.calendarName.textContent = calendarLabel;
    els.dayOfYear.textContent = String(dayNumber).padStart(3, "0");
    els.calendarBtn.textContent = state.calendar === "jalali" ? "تقویم: شمسی" : "Calendar: Gregorian";
  }

  function updateClock() {
    const now = new Date();
    const ms = now.getMilliseconds();
    const seconds = now.getSeconds() + ms / 1000;
    const minutes = now.getMinutes() + seconds / 60;
    const hours24 = now.getHours();
    const hours = (hours24 % 12) + minutes / 60;
  
    const secondDeg = seconds * 6;
    const minuteDeg = minutes * 6;
    const hourDeg = hours * 30;
  
    els.second.style.transform = `rotate(${secondDeg}deg)`;
    els.minute.style.transform = `rotate(${minuteDeg}deg)`;
    els.hour.style.transform = `rotate(${hourDeg}deg)`;
  
    let displayHour = hours24;
    let suffix = "24H";
  
    if (!state.is24) {
      suffix = hours24 >= 12 ? "PM" : "AM";
      displayHour = hours24 % 12 || 12;
    }
  
    els.hh.textContent = pad(displayHour);
    els.mm.textContent = pad(now.getMinutes());
    els.ss.textContent = pad(now.getSeconds());
    els.ampm.textContent = suffix;
  
    const passed = (hours24 * 3600) + (now.getMinutes() * 60) + now.getSeconds();
    const percent = (passed / 86400) * 100;
  
    requestAnimationFrame(updateClock);
  }

  function makeParticles() {
    const holder = $("#particles");
    const count = window.innerWidth < 700 ? 28 : 54;
  
    for (let i = 0; i < count; i++) {
      const p = document.createElement("span");
      p.className = "particle";
      p.style.left = `${Math.random() * 100}%`;
      p.style.animationDuration = `${8 + Math.random() * 16}s`;
      p.style.animationDelay = `${Math.random() * -18}s`;
      p.style.opacity = `${0.16 + Math.random() * 0.5}`;
      p.style.transform = `scale(${0.6 + Math.random() * 1.6})`;
      holder.appendChild(p);
    }
  }

  function setTimezoneLabel() {
    try {
      els.timezone.textContent = Intl.DateTimeFormat().resolvedOptions().timeZone || "Local";
    } catch {
      els.timezone.textContent = "Local";
    }
  }

  els.calendarBtn.addEventListener("click", () => {
    state.calendar = state.calendar === "jalali" ? "gregorian" : "jalali";
    renderDate();
  });

  els.formatBtn.addEventListener("click", () => {
    state.is24 = !state.is24;
    els.formatBtn.textContent = state.is24
      ? (state.calendar === "jalali" ? "۲۴ ساعته" : "24 hour")
      : (state.calendar === "jalali" ? "۱۲ ساعته" : "12 hour");
  });

  els.themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("light");
  });

  window.addEventListener("pointermove", (event) => {
    document.body.style.setProperty("--mx", `${event.clientX}px`);
    document.body.style.setProperty("--my", `${event.clientY}px`);
  });

  buildTicks();
  makeParticles();
  setTimezoneLabel();
  renderDate();
  updateClock();

  setInterval(renderDate, 60 * 1000);