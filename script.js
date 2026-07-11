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

    /* ==========================================================================
       7. Solutions Detail Modal Interaction
       ========================================================================== */
    const solutionsData = {
        'smart-cities': {
            title: 'Smart Cities',
            sub: 'On-street & off-street parking digitisation',
            desc: 'We help municipal corporations monitor parking utilization in real time, enforce regulations efficiently, and reduce traffic congestion in commercial zones using sensor-less camera vision.',
            image: 'images/solutions_smart_city.jpg',
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="10" width="10" height="12" rx="1"></rect><rect x="12" y="2" width="10" height="20" rx="1"></rect><line x1="6" y1="14" x2="8" y2="14"></line><line x1="6" y1="18" x2="8" y2="18"></line><line x1="16" y1="6" x2="18" y2="6"></line><line x1="16" y1="10" x2="18" y2="10"></line><line x1="16" y1="14" x2="18" y2="14"></line><line x1="16" y1="18" x2="18" y2="18"></line></svg>`,
            selectValue: 'Smart City Parking Solution',
            features: [
                { title: 'On-Street Digitisation', desc: 'No sensor drilling required; overhead cameras cover multiple bays simultaneously.' },
                { title: 'App-Based Enforcement', desc: 'Real-time alerts streams to wardens for illegal parking or overtime parking.' },
                { title: 'Dynamic Pricing Tariffs', desc: 'Adjust parking rates dynamically based on occupancy logs to balance high-traffic zones.' },
                { title: 'Citizen Discovery Portal', desc: 'Direct mapping showing vacant spaces, pricing, and distance metrics to drivers.' }
            ]
        },
        'airports': {
            title: 'Airports',
            sub: 'High-throughput, high-availability parking systems',
            desc: 'Integrate native FASTag scans and ANPR barrier gates to ensure high throughput, zero queue times at airport entries, and secure valet analytics.',
            image: 'images/solutions_airport.jpg',
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L14 19v-5.5l7 2.5z"></path></svg>`,
            selectValue: 'Airport Parking Solution',
            features: [
                { title: 'FASTag Entry/Exit Scan', desc: 'Scans tag transponders automatically on arrival/departure, processing payments seamlessly.' },
                { title: 'ANPR Gate Recognition', desc: 'Logs vehicle license plate details on gate entry to settle claims and prevent thefts.' },
                { title: 'Valet Queue Analytics', desc: 'Tracks valet car delivery times using computer vision camera sensors.' },
                { title: 'Multi-Level Guidance', desc: 'Directs drivers to open spaces in Short-Term, Long-Term, and VIP lots dynamically.' }
            ]
        },
        'ports-logistics': {
            title: 'Ports & Logistics',
            sub: 'Heavy carrier staging & staging lot automation',
            desc: 'Monitor wait queues, capture dwell-time indicators, automate staging lot entry, and simplify security compliance logs for high-throughput logistics hubs.',
            image: 'images/solutions_logistics.jpg',
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="3"></circle><line x1="12" y1="8" x2="12" y2="22"></line><line x1="9" y1="11" x2="15" y2="11"></line><path d="M5 12h2a5 5 0 0 0 10 0h2"></path></svg>`,
            selectValue: 'Port & Logistics Parking Solution',
            features: [
                { title: 'Truck Queue Detection', desc: 'Overhead cameras monitor logistics gates and trigger warnings on queue build-ups.' },
                { title: 'Carrier Dwell Logging', desc: 'Tracks exact entry/exit timestamps to analyze carrier loading delays.' },
                { title: 'FASTag Access Gateways', desc: 'Enables cashless barrier gates for commercial trucks to expedite flow.' },
                { title: 'Safety Audit Records', desc: 'Captures and stores photos/videos of vehicle loads for security clearance compliance.' }
            ]
        },
        'malls-retail': {
            title: 'Malls & Retail',
            sub: 'Camera-based slot occupancy & peak hour congestion logs',
            desc: 'Provide mall visitors with visual guides to open spots, monitor slot utilization dynamically, and integrate cashless checkouts with retail loyalty programs.',
            image: 'images/solutions_mall.jpg',
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>`,
            selectValue: 'Mall & Commercial Parking Solution',
            features: [
                { title: 'LED Bay Occupancy Guide', desc: 'Green/red overhead lights alert drivers to open slots, reducing search loops.' },
                { title: 'Peak Hour Analytics', desc: 'Identifies customer stay-durations and peak weekend rush periods.' },
                { title: 'FASTag & QR Checkout', desc: 'Enables swift, cashless checkouts using auto FASTag or custom ticket QR scans.' },
                { title: 'Loyalty Parking Validations', desc: 'Integrates with retail stores to validate parking fees against purchase receipts.' }
            ]
        },
        'residential-institutional': {
            title: 'Residential & Institutional',
            sub: 'Visitor logs, staff automation, and shared spaces',
            desc: 'Secure entry gates for staff and residents, manage visitor clearances from a mobile app, and monetize vacant bays during working hours.',
            image: 'images/solutions_residential.jpg',
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`,
            selectValue: 'Residential & Institutional Parking Solution',
            features: [
                { title: 'Automated Resident Gates', desc: 'ANPR camera sweeps recognize residents and open barriers without physical remotes.' },
                { title: 'App Guest Pre-Approval', desc: 'Residents register guest slots, sending entry QR passes straight to visitors.' },
                { title: 'Reserved Slot Alerts', desc: 'Triggers instant alerts on ground enforcement apps for unauthorized parking in private bays.' },
                { title: 'Vacant Slot Sharing', desc: 'Allows owners to list unused slots for monetization during working hours.' }
            ]
        }
    };

    const solutionModal = document.getElementById('solutionModal');
    const modalBody = document.getElementById('modalBody');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    const learnMoreTriggers = document.querySelectorAll('.learn-more-trigger');

    function openModal(solutionKey) {
        const data = solutionsData[solutionKey];
        if (!data) return;

        // Construct HTML structure dynamically
        let featuresHtml = '';
        data.features.forEach((feature, idx) => {
            featuresHtml += `
                <li class="modal-feature-item">
                    <div class="modal-feature-bullet">${idx + 1}</div>
                    <div class="modal-feature-text">
                        <h4>${feature.title}</h4>
                        <p>${feature.desc}</p>
                    </div>
                </li>
            `;
        });

        modalBody.innerHTML = `
            <img src="${data.image}" alt="${data.title}" class="modal-header-img">
            <div class="modal-title-box">
                <div class="modal-icon-box">${data.icon}</div>
                <h2>${data.title}</h2>
            </div>
            <div class="modal-sub">${data.sub}</div>
            <p class="modal-desc-text">${data.desc}</p>
            
            <ul class="modal-features-list">
                ${featuresHtml}
            </ul>
            
            <div class="modal-actions">
                <button class="btn btn-primary modal-cta-btn" data-subject="${data.selectValue}">Request Quote &rarr;</button>
                <button class="btn btn-outline modal-cancel-btn">Close Details</button>
            </div>
        `;

        solutionModal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Lock main scroll
    }

    function closeModal() {
        solutionModal.classList.remove('active');
        document.body.style.overflow = ''; // Unlock main scroll
    }

    // Open modal on trigger click
    learnMoreTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const solutionKey = trigger.getAttribute('data-solution');
            openModal(solutionKey);
        });
    });

    // Close modal clicks
    modalCloseBtn.addEventListener('click', closeModal);
    solutionModal.addEventListener('click', (e) => {
        if (e.target === solutionModal) {
            closeModal();
        }
    });

    // Close / submit links inside modal body (Event Delegation)
    modalBody.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-cancel-btn')) {
            closeModal();
        } else if (e.target.classList.contains('modal-cta-btn')) {
            const subject = e.target.getAttribute('data-subject');
            closeModal();
            
            // Smooth scroll to contact and auto-select
            if (subjectSelect) {
                subjectSelect.value = subject;
            }
            contactSection.scrollIntoView({ behavior: 'smooth' });
            
            // Focus card animation
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
