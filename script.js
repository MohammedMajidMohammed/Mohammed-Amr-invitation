document.addEventListener("DOMContentLoaded", () => {
    // ==========================================
    // Core Elements & State
    // ==========================================
    const envelopeContainer = document.getElementById("envelope-container");
    const envelope = document.getElementById("envelope");
    const waxSeal = document.getElementById("wax-seal");
    const mainContent = document.getElementById("main-content");
    const music = document.getElementById("bg-music");
    const musicToggleBtn = document.getElementById("music-toggle-btn");
    const whatsappShareBtn = document.getElementById("whatsapp-share-btn");
    const addToCalendarBtn = document.getElementById("add-to-calendar-btn");

    // Event Date: July 16, 2026, 4:00 PM (GMT+0300 / Cairo Local Time)
    const eventDate = new Date("July 16, 2026 16:00:00 GMT+0300").getTime();

    // Prevent body scrolling while envelope is closed
    document.body.style.overflow = "hidden";

    // ==========================================
    // 1. 3D Envelope Opening & Sound Sequence
    // ==========================================
    waxSeal.addEventListener("click", () => {
        // Trigger envelope open states (Wax seal hides, flap folds up, card slides out)
        envelope.classList.add("open");
        
        // Attempt background music play
        playMusic();

        // 1.6 seconds delay: Allow seal to vanish, flap to rotate, and letter card to emerge
        setTimeout(() => {
            envelopeContainer.classList.add("fade-out");
        }, 1600);

        // 2.4 seconds delay: Remove cover completely and fade-in scrollable invitation page
        setTimeout(() => {
            envelopeContainer.style.display = "none";
            document.body.style.overflow = "auto"; // Unlock scrolling
            
            // Reveal main content
            mainContent.classList.remove("hidden");
            setTimeout(() => {
                mainContent.classList.add("fade-in");
                // Initialize background particles and scroll-reveals
                initScrollAnimations();
                initPetalsCanvas();
            }, 50);
        }, 2400);
    });

    function playMusic() {
        music.play()
            .then(() => {
                musicToggleBtn.classList.add("playing");
            })
            .catch((err) => {
                console.log("Autoplay blocked. Sound will start when user interacts.", err);
                musicToggleBtn.classList.remove("playing");
            });
    }

    musicToggleBtn.addEventListener("click", () => {
        if (music.paused) {
            music.play();
            musicToggleBtn.classList.add("playing");
        } else {
            music.pause();
            musicToggleBtn.classList.remove("playing");
        }
    });

    let wasPlayingBeforeHide = false;

    function handleAudioPause() {
        if (!music.paused) {
            music.pause();
            musicToggleBtn.classList.remove("playing");
            wasPlayingBeforeHide = true;
        }
    }

    function handleAudioPlay() {
        if (wasPlayingBeforeHide && mainContent.classList.contains("fade-in")) {
            music.play()
                .then(() => {
                    musicToggleBtn.classList.add("playing");
                })
                .catch((err) => console.log("Failed to auto-resume music:", err));
        }
    }

    // Intelligently pause and play music on tab switch, lock, or app minimize (iOS/Android Safari robust solution)
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            handleAudioPause();
        } else {
            handleAudioPlay();
        }
    });

    window.addEventListener("pagehide", handleAudioPause);
    window.addEventListener("blur", handleAudioPause);
    window.addEventListener("focus", handleAudioPlay);

    // ==========================================
    // 2. Interactive Parallax Mouse Drift
    // ==========================================
    const leafTopRight = document.querySelector(".leaf-top-right");
    const leafBottomLeft = document.querySelector(".leaf-bottom-left");

    window.addEventListener("mousemove", (e) => {
        if (mainContent.classList.contains("fade-in")) {
            const mouseX = e.clientX / window.innerWidth - 0.5;
            const mouseY = e.clientY / window.innerHeight - 0.5;

            // Subtle drift in opposite direction
            const driftX = mouseX * -25;
            const driftY = mouseY * -25;

            leafTopRight.style.transform = `translate3d(${driftX}px, ${driftY}px, 0) rotate(${mouseX * 10}deg)`;
            leafBottomLeft.style.transform = `translate3d(${driftX}px, ${driftY}px, 0) rotate(${mouseX * 10}deg)`;
        }
    });

    // Mobile Device Orientation Support
    window.addEventListener("deviceorientation", (e) => {
        if (mainContent.classList.contains("fade-in") && e.gamma && e.beta) {
            const driftX = (e.gamma / 90) * -20;
            const driftY = ((e.beta - 45) / 90) * -20;

            leafTopRight.style.transform = `translate3d(${driftX}px, ${driftY}px, 0)`;
            leafBottomLeft.style.transform = `translate3d(${driftX}px, ${driftY}px, 0)`;
        }
    });

    // ==========================================
    // 3. Falling Gold Petals & Sparkles Canvas
    // ==========================================
    let canvas, ctx, animationId;
    const particles = [];
    const maxParticles = 40;

    function initPetalsCanvas() {
        canvas = document.getElementById("petals-canvas");
        ctx = canvas.getContext("2d");
        resizeCanvas();

        window.addEventListener("resize", resizeCanvas);

        class GoldParticle {
            constructor() {
                this.reset();
                this.y = Math.random() * canvas.height; // Initial scatter
            }

            reset() {
                this.x = Math.random() * canvas.width;
                this.y = -20;
                this.type = Math.random() > 0.45 ? 'petal' : 'sparkle';
                this.size = this.type === 'petal' ? Math.random() * 8 + 6 : Math.random() * 2 + 1.5;
                this.speedY = this.type === 'petal' ? Math.random() * 0.7 + 0.5 : Math.random() * 0.4 + 0.3;
                this.speedX = Math.random() * 0.5 - 0.25;
                this.rotation = Math.random() * 360;
                this.spinSpeed = Math.random() * 1.5 - 0.75;
                this.opacity = Math.random() * 0.4 + 0.25;
                this.color = Math.random() > 0.4 
                    ? `rgba(197, 160, 67, ${this.opacity})` // Classic Gold
                    : `rgba(246, 235, 208, ${this.opacity})`; // Champagne Gold
                
                this.sparkleDirection = Math.random() > 0.5 ? 1 : -1;
                this.sparkleSpeed = Math.random() * 0.02 + 0.01;
            }

            update() {
                this.y += this.speedY;
                this.x += this.speedX + Math.sin(this.y / 40) * 0.25;
                
                if (this.type === 'petal') {
                    this.rotation += this.spinSpeed;
                } else {
                    this.opacity += this.sparkleSpeed * this.sparkleDirection;
                    if (this.opacity >= 0.7 || this.opacity <= 0.1) {
                        this.sparkleDirection *= -1;
                    }
                }

                if (this.y > canvas.height + 20 || this.x < -20 || this.x > canvas.width + 20) {
                    this.reset();
                }
            }

            draw() {
                ctx.save();
                ctx.translate(this.x, this.y);
                
                if (this.type === 'petal') {
                    ctx.rotate((this.rotation * Math.PI) / 180);
                    ctx.beginPath();
                    ctx.fillStyle = this.color;
                    ctx.moveTo(0, -this.size);
                    ctx.quadraticCurveTo(this.size * 0.8, -this.size * 0.2, 0, this.size);
                    ctx.quadraticCurveTo(-this.size * 0.8, -this.size * 0.2, 0, -this.size);
                    ctx.fill();
                } else {
                    ctx.beginPath();
                    const glowGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size * 3);
                    glowGrad.addColorStop(0, `rgba(255, 255, 255, ${this.opacity})`);
                    glowGrad.addColorStop(0.3, this.color);
                    glowGrad.addColorStop(1, 'rgba(197, 160, 67, 0)');
                    ctx.fillStyle = glowGrad;
                    ctx.arc(0, 0, this.size * 3, 0, Math.PI * 2);
                    ctx.fill();
                }
                
                ctx.restore();
            }
        }

        for (let i = 0; i < maxParticles; i++) {
            particles.push(new GoldParticle());
        }

        animateParticles();
    }

    function resizeCanvas() {
        if (canvas) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        
        animationId = requestAnimationFrame(animateParticles);
    }

    // ==========================================
    // 4. Live Countdown Timer
    // ==========================================
    const daysEl = document.getElementById("days");
    const hoursEl = document.getElementById("hours");
    const minutesEl = document.getElementById("minutes");
    const secondsEl = document.getElementById("seconds");

    function updateCountdown() {
        const now = new Date().getTime();
        const difference = eventDate - now;

        if (difference <= 0) {
            document.getElementById("countdown").innerHTML = `
                <div class="countdown-started" style="font-family: 'Cairo', sans-serif; font-size: 1.25rem; font-weight: bold; color: var(--gold-primary); text-align: center; width: 100%; grid-column: span 4; padding: 10px;">
                    لقد بدأت مراسم الفرح والحمد لله! بارك الله لهما وجمع بينهما في خير
                </div>
            `;
            return;
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        daysEl.textContent = days < 10 ? "0" + days : days;
        hoursEl.textContent = hours < 10 ? "0" + hours : hours;
        minutesEl.textContent = minutes < 10 ? "0" + minutes : minutes;
        secondsEl.textContent = seconds < 10 ? "0" + seconds : seconds;
    }

    setInterval(updateCountdown, 1000);
    updateCountdown();

    // ==========================================
    // 5. Scroll Stagger Reveal Animations
    // ==========================================
    function initScrollAnimations() {
        const animatedElements = document.querySelectorAll(".animate-on-scroll");
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("appear");
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: "0px 0px -60px 0px"
        });

        animatedElements.forEach(el => observer.observe(el));
    }

    // ==========================================
    // 6. Add to Calendar (Google Calendar)
    // ==========================================
    addToCalendarBtn.addEventListener("click", () => {
        const title = encodeURIComponent("عقد قران محمد ومريم");
        const details = encodeURIComponent("نتشرف بدعوتكم لحضور حفل عقد قران محمد ومريم بقاعة Diamond Castle الإسكندرية.");
        const location = encodeURIComponent("قاعة Diamond Castle، الإسكندرية");
        
        const startDate = "20260716T130000Z";
        const endDate = "20260716T160000Z";

        const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}/${endDate}&details=${details}&location=${location}&sf=true&output=xml`;
        
        window.open(googleUrl, "_blank");
    });

    // ==========================================
    // 7. Share Invitation via WhatsApp
    // ==========================================
    whatsappShareBtn.addEventListener("click", () => {
        const text = encodeURIComponent(
`🕊️ *دعوة لعقد قران محمد & مريم* 🕊️

بمشيئة الله تعالى، نتشرف بدعوتكم لحضور حفل عقد قران:
💍 *محمد & مريم* 💍

🗓️ يوم الخميس الموافق ١٦ يوليو ٢٠٢٦
⏰ الساعة الرابعة عصراً
📍 قاعة Diamond Castle - الإسكندرية

حضوركم يتم فرحتنا ويسعد قلوبنا، لمزيد من التفاصيل يرجى زيارة الرابط التالي:
🔗 ${window.location.href}`
        );
        
        window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
    });
});
