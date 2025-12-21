    function toPersianDigits(input) {
        const map = { '0':'۰','1':'۱','2':'۲','3':'۳','4':'۴','5':'۵','6':'۶','7':'۷','8':'۸','9':'۹','10':'۱۰' };
        return String(input).replace(/\d/g, d => map[d]);
      }
    // Countdown Timer
    function updateCountdown() {
      const weddingDate = new Date('feb 04, 2026 19:30:00').getTime();
      const now = new Date().getTime();
      const diff = weddingDate - now;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      const pd = (n) => toPersianDigits(String(n).padStart(2, '0'));
      if (diff < 0) {
        clearInterval(countdownInterval);
        document.getElementById('timer').innerHTML = "مراسم شروع شده است!";
        return;
      }
      document.getElementById('timer').innerHTML =
        `<div>${pd(days)}<span>روز</span></div>
         <div>${pd(hours)}<span>ساعت</span></div>
         <div>${pd(minutes)}<span>دقیقه</span></div>
         <div>${pd(seconds)}<span>ثانیه</span></div>`;
    }
    const countdownInterval = setInterval(updateCountdown, 1000);
    updateCountdown();
    // Smooth scrolling for anchor links (if any)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
          behavior: 'smooth'
        });
      });
    });
    
    // RSVP Form Functionality
    document.querySelector('.guests-slider').addEventListener('input', function() {
      const value = this.value;
      document.querySelector('.guests-count').textContent = toPersianDigits(value) + ': تعداد انتخاب شده';
    });

        // Handle radio button changes to show/hide guest count section
    document.querySelectorAll('input[name="attendance"]').forEach(radio => {
      radio.addEventListener('change', function() {
        const guestsSection = document.querySelector('.guests-section');
        if (this.value === 'not-attending') {
          guestsSection.style.display = 'none';
        } else {
          guestsSection.style.display = 'block';
        }
      });
    });
    
    // Initialize on page load
    if (document.querySelector('input[name="attendance"]:checked').value === 'not-attending') {
      document.querySelector('.guests-section').style.display = 'none';
    }
    
    document.querySelector('.rsvp-form').addEventListener('submit', async function (e) {
      e.preventDefault();

      const data = {
        attendance: document.querySelector('input[name="attendance"]:checked').value,
        guests: document.querySelector('.guests-section').style.display === 'none'
          ? 0
          : document.querySelector('.guests-slider').value,
        full_name: document.querySelector('input[name="full_name"]').value.trim(),
        message: document.querySelector('textarea[name="message"]').value.trim()
      };

      const res = await fetch('http://localhost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        alert('اطلاعات شما با موفقیت ارسال شد. متشکریم!');
        this.reset();
        document.querySelector('.guests-section').style.display = 'block';
      } else {
        alert('خطا در ارسال اطلاعات');
      }

      // Reset the display of guests section if needed
      document.querySelector('.guests-section').style.display = 'block';
      document.querySelector('input[name="attendance"][value="attending"]').checked = true;
    });
