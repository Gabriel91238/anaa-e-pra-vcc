const musica = document.getElementById('musica');

function toggleMusica() {
    if (musica.paused) {
        if (musica.currentTime === 0) musica.currentTime = 60;
        musica.play();
        document.getElementById('btnMusica').innerText = "🎵 Som: ON";
    } else {
        musica.pause();
        document.getElementById('btnMusica').innerText = "🎵 Som: OFF";
    }
}

function proximaPagina() {
    document.getElementById('pagina1').style.display = 'none';
    document.getElementById('pagina2').style.display = 'block';
    startParticles();
    habilitarArrastar();
}

function habilitarArrastar() {
    const fotos = document.querySelectorAll('.foto-mural');
    fotos.forEach(foto => {
        let isDragging = false;
        let x, y;
        const start = (e) => {
            isDragging = true;
            const ev = e.touches ? e.touches[0] : e;
            x = ev.clientX - foto.offsetLeft;
            y = ev.clientY - foto.offsetTop;
            foto.style.zIndex = 1000;
        };
        const move = (e) => {
            if (!isDragging) return;
            const ev = e.touches ? e.touches[0] : e;
            foto.style.left = (ev.clientX - x) + 'px';
            foto.style.top = (ev.clientY - y) + 'px';
        };
        foto.addEventListener('mousedown', start);
        foto.addEventListener('touchstart', start);
        document.addEventListener('mousemove', move);
        document.addEventListener('touchmove', move);
        document.addEventListener('mouseup', () => isDragging = false);
        document.addEventListener('touchend', () => isDragging = false);
    });
}

function startParticles() {
    const canvas = document.getElementById('heartCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let particles = [];
    let mouse = { x: canvas.width / 2, y: canvas.height / 2 };

    const upd = (e) => {
        const ev = e.touches ? e.touches[0] : e;
        mouse.x = ev.clientX; mouse.y = ev.clientY;
    };
    window.addEventListener('mousemove', upd);
    window.addEventListener('touchmove', upd);

    // --- MÁGICA 1: MAPEANDO O TEXTO EM PARTÍCULAS (BRANCO) ---
    // A gente desenha o texto invisível para saber onde colocar as partículas
    ctx.fillStyle = "white";
    const textFontSize = window.innerWidth < 600 ? 25 : 45;
    ctx.font = `bold ${textFontSize}px Arial`;
    ctx.textAlign = "center";
    
    // POSIÇÃO: Colocamos o texto invisible um pouco acima do centro do coração
    ctx.fillText("EU TE AMO, ANA", canvas.width / 2, canvas.height / 2 - 120); 
    
    // Pega os dados dos pixels do texto
    const textImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpa o canvas

    // Cria partículas onde o texto invisível estava
    for (let y = 0; y < canvas.height; y += 4) { // Menor espaçamento para mais densidade
        for (let x = 0; x < canvas.width; x += 4) {
            // Se o pixel for opaco (faz parte do texto)
            if (textImageData.data[(y * canvas.width + x) * 4 + 3] > 128) {
                particles.push(new Particle(x, y, '#ffffff')); // Partículas BRANCAS para o texto
            }
        }
    }

    // --- MÁGICA 2: MAPEANDO O CORAÇÃO EM PARTÍCULAS (VERMELHO) ---
    const heartSize = window.innerWidth < 600 ? 12 : 18;
    for (let i = 0; i < 1500; i++) {
        const t = Math.random() * Math.PI * 2;
        const tx = heartSize * 16 * Math.pow(Math.sin(t), 3);
        const ty = -heartSize * (13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
        // POSIÇÃO: O coração fica centralizado, logo abaixo de onde o texto se forma
        particles.push(new Particle(tx + canvas.width/2, ty + canvas.height/2 + 30, '#ff1744')); // Vermelho vibrante
    }

    // Classe de Partícula Inteligente
    function Particle(tx, ty, color) {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.targetX = tx;
        this.targetY = ty;
        this.
color = color;
        this.vx = 0;
        this.vy = 0;

        this.update = function() {
            // Atração para o formato final (texto ou coração)
            let dx = this.targetX - this.x;
            let dy = this.targetY - this.y;
            this.vx += dx * 0.015;
            this.vy += dy * 0.015;

            // Interação com o Mouse (Repulsão)
            let mDx = mouse.x - this.x;
            let mDy = mouse.y - this.y;
            let dist = Math.sqrt(mDx*mDx + mDy*mDy);
            if (dist < 80) { // Maior área de interação no celular
                this.vx -= mDx * 0.2;
                this.vy -= mDy * 0.2;
            }

            // Resistência e movimento
            this.vx *= 0.85;
            this.vy *= 0.85;
            this.x += this.vx;
            this.y += this.vy;
        };

        this.draw = function() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            // Partículas ligeiramente maiores e com transparência para o rastro
            ctx.arc(this.x, this.y, 1.3, 0, Math.PI * 2);
            ctx.fill();
        };
    }

    // Loop de Animação
    function animate() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)'; // Fundo preto semi-transparente para rastro
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animate);
    }
    animate();
}
