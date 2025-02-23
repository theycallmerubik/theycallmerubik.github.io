// Global declarations for clock hands and flag (which toggles between Gregorian and Jalali dates)
let hs, hts, hm, htm, hh, hth, flag;

// Function to display the Gregorian date and other details
function showGregorianDate() {
    const today = new Date();
    
    // Display formatted Gregorian date (century, year, month, day)
    document.getElementById('date').innerText = 
        `${parseInt(today.getFullYear() / 100)} 
        ${(today.getFullYear() - parseInt(today.getFullYear() / 100) * 100) < 10 ? "0" + (today.getFullYear() - parseInt(today.getFullYear() / 100) * 100) : (today.getFullYear() - parseInt(today.getFullYear() / 100) * 100)} 
        \n ${(today.getMonth() + 1) < 10 ? "0" + (today.getMonth() + 1) : (today.getMonth() + 1)} 
        \n ${today.getDate() < 10 ? "0" + today.getDate() : today.getDate()}`;

    // Display the weekday (adjusting for Persian calendar, Saturday as 0)
    const daysOfWeek = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const dayIndex = today.getDay();
    const persianDayIndex = (dayIndex + 1) % 7;  // Adjust day index for Persian calendar
    document.getElementById('weekday').textContent = daysOfWeek[persianDayIndex];

    // Display whether the current week is even or odd
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    const weekNumber = Math.ceil(((today - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
    const weekType = (weekNumber % 2 === 0) ? 'Even' : 'Odd';
    document.getElementById('week-type').textContent = `${weekType}`;
    
    flag = false;  // Set flag to false for Gregorian date
}

// Function to display the Jalali (Persian) date and other details
function showJalaliDate() {
    const today = new Date();
    
    // Convert Gregorian date to Jalali (using date-fns-jalali)
    const shamsiDate = jalaali.toJalaali(today.getFullYear(), today.getMonth() + 1, today.getDate());
    
    // Display formatted Jalali date (century, year, month, day)
    document.getElementById('date').innerText = 
        `${parseInt(shamsiDate.jy / 100)} 
        ${(shamsiDate.jy - parseInt(shamsiDate.jy / 100) * 100) < 10 ? "0" + (shamsiDate.jy - parseInt(shamsiDate.jy / 100) * 100) : (shamsiDate.jy - parseInt(shamsiDate.jy / 100) * 100)} 
        \n ${shamsiDate.jm < 10 ? "0" + shamsiDate.jm : shamsiDate.jm} 
        \n ${shamsiDate.jd < 10 ? "0" + shamsiDate.jd : shamsiDate.jd}`;

    // Display the weekday in Jalali format
    const daysOfWeek = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'];
    const dayIndex = today.getDay();
    const persianDayIndex = (dayIndex + 1) % 7;
    document.getElementById('weekday').textContent = daysOfWeek[persianDayIndex];

    // Display whether the current week is even or odd (in Persian)
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    const weekNumber = Math.ceil(((today - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
    const weekType = (weekNumber % 2 === 0) ? 'زوج' : 'فرد';
    document.getElementById('week-type').textContent = `${weekType}`;
    
    flag = true;  // Set flag to true for Jalali date
}

// Call function to initially display the Jalali date
showJalaliDate();

// Event listener for swapping between Gregorian and Jalali dates
document.querySelector('.swap').addEventListener('click', () => {
    document.querySelector('.swap img').classList.toggle('rotate');  // Add rotation animation

    if (flag) {
        showGregorianDate();  // Show Gregorian date
    } else {
        showJalaliDate();     // Show Jalali date
    }

    // Reverse the rotation animation after 1 second
    setTimeout(() => {
        document.querySelector('.swap img').classList.toggle('rotate');
    }, 1000);
});

// Linear interpolation function for smooth clock hand movement
function lerp(o, t, p) {
    return o + (t - o) * p;
}

// Variables for time calculations
var last = new Date();  // Last time update
var lastSecond = 0;     // Last second tracked
var delta = 0;          // Time difference for animations
var sDeg = 0;           // Degrees for second hand rotation
var mDeg = 0;           // Degrees for minute hand rotation

// Update the second hand position
function seconds(s, ms) {
    var target = s / 60 * 360;
    if (target === 0 && sDeg > 300) {
        sDeg = -6;
    }
    sDeg = lerp(sDeg, target, delta * 24);  // Smooth transition using lerp
    hs.transform('R ' + sDeg + ',71,71');   // Rotate second hand
    hts.transform('R ' + (sDeg * -1) + ',71,71');  // Text rotation for symmetry
}

// Update the minute hand position
function minutes(m, s) {
    var target = m / 60 * 360;
    if (target === 0 && mDeg > 300) {
        mDeg = -6;
    }
    mDeg = lerp(mDeg, target, delta * 24);  // Smooth transition using lerp
    hm.transform('T0,0 R ' + mDeg + ',71,71');  // Rotate minute hand
    htm.transform('T0,0 R ' + (mDeg * -1) + ',71,71');  // Text rotation for symmetry
}

// Update the hour hand position
function hours(h, m) {
    var deg = (h + (m / 60)) / 12 * 360;  // Calculate hour hand degrees
    hh.transform('T0,0 R ' + deg + ',71,71');  // Rotate hour hand
    hth.transform('T0,0 R ' + (deg * -1) + ',71,71');  // Text rotation for symmetry
}

// Update the displayed time (digital clock display)
function updateTimes(s, m, h) {
    function pad(num) {
        return num.toString().padStart(2, '0');  // Pad single digits with leading zero
    }
    document.querySelectorAll('.displayS').forEach(el => el.innerHTML = pad(s));  // Update seconds display
    document.querySelectorAll('.displayM').forEach(el => el.innerHTML = pad(m));  // Update minutes display
    document.querySelectorAll('.displayH').forEach(el => el.innerHTML = pad(h));  // Update hours display
}

// Animation loop for updating the clock continuously
function draw() {
    var now = new Date();
    delta = (now.getTime() - last.getTime()) / 1000;  // Calculate time delta
    last = now;

    var h = now.getHours();      // Current hours
    var m = now.getMinutes();    // Current minutes
    var s = now.getSeconds();    // Current seconds
    var ms = now.getMilliseconds();  // Current milliseconds

    seconds(s, ms);  // Update second hand
    minutes(m, s);   // Update minute hand
    hours(h, m);     // Update hour hand

    // Update digital clock only if second has changed
    if (s !== lastSecond) {
        updateTimes(s, m, h);
    }
    lastSecond = s;  // Store current second
    window.requestAnimationFrame(draw);  // Request next frame for smooth animation
}

// Initialize Snap SVG elements when window loads
window.onload = function () {
    var c = Snap('#clock');  // Initialize Snap SVG
    hs = c.select('#handS');  // Select second hand element
    hts = c.select('#handTextS');  // Select second hand text
    hm = c.select('#handM');  // Select minute hand
    htm = c.select('#handTextM');  // Select minute hand text
    hh = c.select('#handH');  // Select hour hand
    hth = c.select('#handTextH');  // Select hour hand text

    // Ensure all elements are present before starting the clock
    if (hs && hm && hh) {
        draw();  // Start the animation loop
    } else {
        console.log('Not all elements could be found.');
    }
};

document.querySelector('.mode button').addEventListener('click', (e) => {
    if (e.target.style.transform === 'translateX(0px)') {
        // Move button to the right and update to dark mode
        e.target.style.transform = 'translateX(25px)';
        document.querySelector('.swap img').src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAAAXNSR0IArs4c6QAAAlZJREFUSEvFljtoFVEQhr8ovlAUjUW6mNhoxMZOtIiSNAkiJqQJvhoFUbAQLGwUIYIgWighhISANhYKIipWURAhFqI2YiFaiUJQE7HwgY/zwxwY474XbhYu3HN3z3xn/pn59zYxT1fTPHGpC14CrAHel02gDngRcBc4BzxsFDhCu4EdjQJ7qBJtCFjQW0CPk/Y+cAl4APwsKnnZGp8Ogc+kBJ+2el8GfuUdoAh4FTBrgZZaQ+3MCPwI2AN8zILngZcBCjQFHLNAGqE7QJet+4PUOtxJYIP9Nmn3/6TB88DnLaD27weuJcBjcy0GJoBBe0ZlOVsFvNqMQRm+BjYD31ygmPmQGyeV4inQYY0mc/maBM/KeB9wFZBcW4EnCQEEXwu8c/ck/Q1bD7jv/2zPAo+GgIeAl8CmvC519yX5J2A5MAwcLZuxGqgXeAxsLwHWo5J7S/jcBnZXBb8CNjYSHKX+bbL5xso6R22p97rxOQKMOFpLWOvzPOEEfWECbtrvKtW9slJrFD4A8me5UDvwxYKsC7V7Zi8ID/fjJAvV4aTYf1eegVwATtiu68AB4Acg8FvgMyD7jPA4gtqiiRirYiDas8KCrrcAajQZhkZMnatrJhhIZ/DnF7a+EhysNdzfldUIeRlrr+SSIWxzgSTfAreem/lKV5ZEfhGwNi4Msh4PMp8CmlMyuejKkjt9RcExkEZFLwV17mEXfdxqmvo2mnuSsuC4vy28rd7YQn5+0Dw9N9P4QF1wJajgdcD6C1Q607oZyyi+l5XX16FqxoVrWdVAagPSAvwFVCZuH5z6n/YAAAAASUVORK5CYII=";
        
        document.querySelector('body').classList.remove('Dark-mode');
    } else {
        // Move button to the left and update to light mode
        e.target.style.transform = 'translateX(0px)';
        document.querySelector('.swap img').src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAAAXNSR0IArs4c6QAAAw1JREFUSEvFlU9IFHEUx79vdna3MJOsw97SxN9zXbqEl6hDhl2SiJQu0b+LQRR0CDp0UQKFIOpQREQR2KVDQURGpwokKFAqYXRmNvMgUSBWGyG1u/1++ZOZGBbddUZZBxb2N7/f+37ee7/33hDW6KE14mJF4Gw2mywUCvWtra1fwgYQGTwyMhKvra0dklIOpNPpV1UB+1AA+6SU7VUBB6E6yqqAPehjAPsDqX1uGMa1XC73sq2trbDclIe6Y8dxeueF+5YQn1FKDTDzdSL6W8mBiuDJycm6pqamnBaamppal8/nhwDsLSM8LKU8lE6nZ8vBy4Knp6fXz83NDQN4w8xntZBuISnlUwAdek1E3QDqlFIXALR4sBdCiA4iUkvBy4Jd173sCWr748x8vxTuF5dlWYlYLHaPiI54sF5mvhQaPDY2timZTOrBkATwMZFIbG9sbPztC/mRSyn7/XbyrmIUQCuAQrFYrM9kMr8Wgy8ZseM4xwAMAlBEtFMI8bZUwINvYebP/p7rut1KqYd6rZQ63NLSsvC/9CkHvg2gB8A4M2cqVam/r1NumuY3ADUAbjLzmbBgXUCd89PpNTPvXi5Yn7Nte5SIdsz/ngghDkYF28ycribYT7VMJBI1wcIq58SKU23b9lEiWmgfIjothLgVuMdUPB5PCSHelzrhum6XUuqR976TmZ+FSrVlWfWmaX4FEAcwaxjGtubm5p9aZGJiosEwjHdE1B6El7TTzLyzKSKSocD6sOM4VwCc9wwfFIvFE5lMJu+Bp4joux6fPjzQgtqkh5nvhB4g2sCyrA2maep0NnkCtlKqPxaLjUsp9aDQzw8Ae5j5g+fsDQBbmflAuVqo+JGwLCtlmqYeArsCQjp9hr8ujTybzW70ryVSxL6RUirmuu45ABcBbF5C7Coz+9dSsfsqRhxU0K1iGEa7YRhdAE4F9u4KIXrKfY1KPQkF9o1t224kok/eelAIcTIMdKFFK+ZkkQMBcCToSsF9USL9X5BRItaDoqGh4U/Y9AZZkVIdxdlVKa7VAP8DzB1JLrnb510AAAAASUVORK5CYII=";
        
        document.querySelector('body').classList.add('Dark-mode');
    }
});
