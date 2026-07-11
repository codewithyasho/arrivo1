/*
   script.js
   arrivo Smart Parking Web Logic
   Manages mobile responsiveness, animations, tab switcher, stat counting, and form handling.
*/

document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       1. Mobile Navigation Menu Drawer
       ========================================================================== */
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const navMenu = document.getElementById('navMenu');
    const navOverlay = document.getElementById('navOverlay');
    const navLinks = document.querySelectorAll('.nav-link');

    // Toggle Mobile Drawer
    function toggleMobileMenu() {
        hamburgerBtn.classList.toggle('active');
        navMenu.classList.toggle('active');
        navOverlay.classList.toggle('active');

        // Prevent body scroll when menu is open
        if (navMenu.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }

    // Close Mobile Drawer
    function closeMobileMenu() {
        hamburgerBtn.classList.remove('active');
        navMenu.classList.remove('active');
        navOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    hamburgerBtn.addEventListener('click', toggleMobileMenu);
    navOverlay.addEventListener('click', closeMobileMenu);

    // Close menu when a link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });


    /* ==========================================================================
       2. How It Works - Interactive Tab Switcher
       ========================================================================== */
    const tabDriversBtn = document.getElementById('tabDriversBtn');
    const tabOwnersBtn = document.getElementById('tabOwnersBtn');
    const driversContent = document.getElementById('driversContent');
    const ownersContent = document.getElementById('ownersContent');

    function switchTab(target) {
        if (target === 'drivers') {
            tabDriversBtn.classList.add('active');
            tabOwnersBtn.classList.remove('active');

            // Animate tab content change
            ownersContent.classList.remove('active');
            driversContent.classList.add('active');
        } else {
            tabOwnersBtn.classList.add('active');
            tabDriversBtn.classList.remove('active');

            driversContent.classList.remove('active');
            ownersContent.classList.add('active');
        }
    }

    tabDriversBtn.addEventListener('click', () => switchTab('drivers'));
    tabOwnersBtn.addEventListener('click', () => switchTab('owners'));


    /* ==========================================================================
       3. CTA Flow & Form Dropdown Autofill
       ========================================================================== */
    const bookDemoTriggers = document.querySelectorAll('.btn-book-demo-trigger');
    const subjectSelect = document.getElementById('userSubject');
    const contactSection = document.getElementById('contact');

    bookDemoTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            // Check if there is a subject parameter in data attribute
            const targetSubject = trigger.getAttribute('data-subject');
            if (targetSubject && subjectSelect) {
                // Map logical categories to select options
                if (targetSubject === 'Find Parking Query') {
                    subjectSelect.value = 'General Query';
                } else if (targetSubject === 'List Parking Space Query') {
                    subjectSelect.value = 'List Your Parking';
                } else {
                    // Try direct assignment for solutions (e.g. Smart City Parking Solution)
                    const optionExists = Array.from(subjectSelect.options).some(option => option.value === targetSubject);
                    if (optionExists) {
                        subjectSelect.value = targetSubject;
                    } else {
                        subjectSelect.value = 'Book a Demo';
                    }
                }
            } else if (subjectSelect) {
                // Default to booking a demo if no custom subject parameter is set
                subjectSelect.value = 'Book a Demo';
            }

            // If it's a solutions card link or hero button, smooth scroll to contact section
            if (trigger.getAttribute('href') === '#contact' || trigger.classList.contains('solution-link')) {
                e.preventDefault();
                contactSection.scrollIntoView({ behavior: 'smooth' });

                // Highlight the form header briefly
                const formCard = document.querySelector('.contact-form-card');
                formCard.style.transform = 'scale(1.02)';
                formCard.style.boxShadow = '0 0 30px rgba(95, 168, 26, 0.3)';
                setTimeout(() => {
                    formCard.style.transform = '';
                    formCard.style.boxShadow = '';
                }, 800);
            }
        });
    });


    /* ==========================================================================
       4. Scroll Animation System (Intersection Observer)
       ========================================================================== */
    const fadeInUpElements = document.querySelectorAll('.fade-in-up');

    const fadeInUpObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Unobserve once animation is triggered
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    fadeInUpElements.forEach(el => {
        fadeInUpObserver.observe(el);
    });


    /* ==========================================================================
       5. Stats Counter Animation
       ========================================================================== */
    const statNumbers = document.querySelectorAll('.stat-number');
    const statsContainer = document.querySelector('.stats-container');
    let hasCounted = false;

    function startCounting() {
        statNumbers.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-target'), 10);
            const duration = 2000; // 2 seconds counting speed
            const startTime = performance.now();

            function updateCount(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);

                // Ease out cubic progress curve
                const easeProgress = 1 - Math.pow(1 - progress, 3);

                const currentValue = Math.floor(easeProgress * target);
                stat.textContent = currentValue;

                if (progress < 1) {
                    requestAnimationFrame(updateCount);
                } else {
                    stat.textContent = target; // Ensure exact final value
                }
            }

            requestAnimationFrame(updateCount);
        });
    }

    if (statsContainer && statNumbers.length > 0) {
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !hasCounted) {
                    hasCounted = true;
                    startCounting();
                    statsObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.5
        });

        statsObserver.observe(statsContainer);
    }


    /* ==========================================================================
       6. Form Validation & Interaction
       ========================================================================== */
    const leadForm = document.getElementById('leadForm');
    const submitBtn = document.getElementById('submitBtn');
    const formSuccessOverlay = document.getElementById('formSuccess');
    const resetFormBtn = document.getElementById('resetFormBtn');

    // Input elements
    const nameInput = document.getElementById('userName');
    const emailInput = document.getElementById('userEmail');
    const phoneInput = document.getElementById('userPhone');

    // Helper functions for validating fields
    function validateEmail(email) {
        const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return re.test(String(email).toLowerCase());
    }

    function validatePhone(phone) {
        // Strip non-digits and check if length is 10 digits
        const stripped = phone.replace(/\D/g, '');
        return stripped.length >= 10 && stripped.length <= 13;
    }

    function checkField(input, validationFn, errorId) {
        const group = input.closest('.form-group');
        const isValid = validationFn(input.value.trim());

        if (!isValid) {
            group.classList.add('has-error');
            return false;
        } else {
            group.classList.remove('has-error');
            return true;
        }
    }

    // Dynamic field check on input focus loss (blur)
    nameInput.addEventListener('blur', () => {
        checkField(nameInput, (val) => val.length > 0, 'nameError');
    });

    emailInput.addEventListener('blur', () => {
        checkField(emailInput, validateEmail, 'emailError');
    });

    phoneInput.addEventListener('blur', () => {
        checkField(phoneInput, validatePhone, 'phoneError');
    });

    // Reset error class on keystroke
    [nameInput, emailInput, phoneInput].forEach(input => {
        input.addEventListener('input', () => {
            input.closest('.form-group').classList.remove('has-error');
        });
    });

    // Form Submit Event Handler
    leadForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Perform final check of all inputs
        const isNameValid = checkField(nameInput, (val) => val.length > 0, 'nameError');
        const isEmailValid = checkField(emailInput, validateEmail, 'emailError');
        const isPhoneValid = checkField(phoneInput, validatePhone, 'phoneError');

        if (isNameValid && isEmailValid && isPhoneValid) {
            // Form is fully valid, start submit animation
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;

            const name = nameInput.value.trim();
            const email = emailInput.value.trim();
            const phone = phoneInput.value.trim();
            const subject = subjectSelect.value;
            const message = document.getElementById('userMessage').value.trim();

            // Construct formatted WhatsApp message
            const formattedMessage = `*New Request - arrivo website*\n` +
                `---------------------------------\n` +
                `*Name:* ${name}\n` +
                `*Email:* ${email}\n` +
                `*Phone:* ${phone}\n` +
                `*Type:* ${subject}\n` +
                `*Message:* ${message ? message : 'N/A'}`;

            const whatsappUrl = `https://wa.me/919112935999?text=${encodeURIComponent(formattedMessage)}`;

            // Open WhatsApp link immediately in a new tab (prevents browser popup blockers)
            window.open(whatsappUrl, '_blank');

            // Prepare payload
            const formData = {
                name,
                email,
                phone,
                subject,
                message,
                timestamp: new Date().toISOString()
            };

            // Simulate local storage receipt and UI latency
            setTimeout(() => {
                // Save lead local storage to simulate server receipt
                const leads = JSON.parse(localStorage.getItem('arrivo_leads') || '[]');
                leads.push(formData);
                localStorage.setItem('arrivo_leads', JSON.stringify(leads));

                // Submit complete, remove loader
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;

                // Show visual success overlay
                formSuccessOverlay.classList.add('active');
            }, 1000);
        }
    });

    // Reset Form and overlay
    resetFormBtn.addEventListener('click', () => {
        leadForm.reset();
        formSuccessOverlay.classList.remove('active');
    });

});
