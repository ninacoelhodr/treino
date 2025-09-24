// Dados dos treinos
const treinoData = {
    "cronograma": {
        "frequencia": "3x na semana",
        "semanas": {
            "todas": {
                "segunda": "Treino 1",
                "terça": "Vôlei",
                "quarta": "Treino 2",
                "quinta": "Vôlei",
                "sexta": "Treino 3",
                "sábado": "Descanso ou Esporte",
                "domingo": "Descanso"
            }
        }
    },
    "treinos": {
        "treino_1": {
            "foco": "Pernas e Joelho (Força + Estabilidade)",
            "exercicios": [
                {"nome": "Agachamento no Smith", "series": 3, "reps": 12, "link": "https://www.youtube.com/watch?v=Iza8Z7MC7gc&feature=youtu.be"},
                {"nome": "Leg Press Unilateral", "series": 3, "reps": "12+12", "link": "https://www.youtube.com/watch?v=87y6SF8WsGw"},
                {"nome": "Cadeira Extensora Excêntrica", "series": 3, "reps": 8, "link": "https://www.youtube.com/watch?v=uGq0RxsrW6E&feature=youtu.be"},
                {"nome": "Cadeira Flexora", "series": 3, "reps": 12, "link": "https://www.youtube.com/watch?v=SK9J5q0Sdyg"},
                {"nome": "Abdutora Máquina", "series": 3, "reps": 15, "link": "https://www.youtube.com/watch?v=GSMqdSJmMe4&feature=youtu.be"},
                {"nome": "Adutora Máquina", "series": 3, "reps": 15, "link": "https://www.youtube.com/watch?v=NGa9KcCYDos&feature=youtu.be"},
                {"nome": "Glúteo Máquina 4 Apoios", "series": 3, "reps": "12+12", "link": "https://www.youtube.com/watch?v=PZUZogRrBc4"},
                {"nome": "Elevação Pélvica", "series": 3, "reps": 15, "link": "https://www.youtube.com/watch?v=dG_o-Q1gG6Y"},
                {"nome": "Panturrilha em Pé", "series": 4, "reps": 20, "link": "https://www.youtube.com/watch?v=FCiolLOSCLI&feature=youtu.be"}
            ]
        },
        "treino_2": {
            "foco": "Superiores + Core (Potência para o Jogo)",
            "exercicios": [
                {"nome": "Puxada Alta na Polia (Pegada Aberta)", "series": 4, "reps": 10, "link": "https://www.youtube.com/watch?v=vu8U5x9_Lnk"},
                {"nome": "Remada Curvada com Halteres", "series": 4, "reps": 10, "link": "https://www.youtube.com/watch?v=Eg3t1mJoMAg&feature=youtu.be"},
                {"nome": "Supino Reto (Barra ou Halteres)", "series": 4, "reps": 10, "link": "https://www.youtube.com/watch?v=64paVOO27LM&feature=youtu.be"},
                {"nome": "Desenvolvimento Militar com Halteres", "series": 3, "reps": 10, "link": "https://www.youtube.com/watch?v=gpqgVcDLgNs"},
                {"nome": "Elevação Lateral (Ombros)", "series": 3, "reps": 12, "link": "https://www.youtube.com/watch?v=2bpyydyKoOc&feature=youtu.be"},
                {"nome": "Tríceps na Polia (Corda)", "series": 3, "reps": 12, "link": "https://www.youtube.com/watch?v=zgWAgAEP5EE&feature=youtu.be"},
                {"nome": "Rosca Direta (Barra ou Halteres)", "series": 3, "reps": 12, "link": "https://www.youtube.com/watch?v=hA_p1ZDgfQc&feature=youtu.be"},
                {"nome": "Prancha com Deslocamento Lateral", "series": 3, "tempo": "30s", "link": "https://www.youtube.com/watch?v=2NjO5KrlVEM"},
                {"nome": "Abdômen Infra (Extensão de Pernas)", "series": 3, "reps": 15, "link": "https://www.youtube.com/watch?v=R0AAkoa4eeI&feature=youtu.be"}
            ]
        },
        "treino_3": {
            "foco": "Posterior + Explosão",
            "exercicios": [
                {"nome": "Stiff com Halteres", "series": 3, "reps": 10, "link": "https://www.youtube.com/watch?v=I5qhSagRH2U&feature=youtu.be"},
                {"nome": "Flexora Sentada", "series": 3, "reps": 12, "link": "https://www.youtube.com/watch?v=SK9J5q0Sdyg"},
                {"nome": "Elevação Pélvica com Barra", "series": 3, "reps": 15, "link": "https://www.youtube.com/watch?v=dG_o-Q1gG6Y"},
                {"nome": "Glúteo 4 Apoios (Máquina ou Polia)", "series": 3, "reps": "12+12", "link": "https://www.youtube.com/watch?v=PZUZogRrBc4"},
                {"nome": "Mesa Flexora Excêntrica", "series": 3, "reps": 8, "link": "https://www.youtube.com/watch?v=3pkykeBaZsw&feature=youtu.be"},
                {"nome": "Saltos Laterais sem Step (controle)", "series": 3, "reps": "12+12", "link": "https://www.instagram.com/reel/C9HvlW9PF5x/"},
                {"nome": "Agachamento com Salto Baixo (sem peso)", "series": 3, "reps": 8, "link": "https://www.youtube.com/watch?v=p6miSld2sGsxc"},
                {"nome": "Panturrilha Sentada", "series": 4, "reps": 20, "link": "https://www.youtube.com/watch?v=Mt7C0Bm5hpM&feature=youtu.be"}
            ]
        }
    }
};

// Estado da aplicação
let currentWorkout = 'treino_1';
let currentExercise = null;
let completedExercises = new Set();
let exerciseWeights = {};

// Elementos DOM
const dayButtons = document.querySelectorAll('.day-btn');
const workoutTitle = document.getElementById('workout-title');
const workoutFocus = document.getElementById('workout-focus');
const totalExercises = document.getElementById('total-exercises');
const completedExercisesEl = document.getElementById('completed-exercises');
const exercisesList = document.getElementById('exercises-list');
const finishWorkoutBtn = document.getElementById('finish-workout');
const weightModal = document.getElementById('weight-modal');
const videoModal = document.getElementById('video-modal');
const weightValue = document.getElementById('weight-value');
const videoIframe = document.getElementById('video-iframe');
const videoTitle = document.getElementById('video-title');

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    loadWorkoutData();
    setupEventListeners();
    loadProgress();
    updateProgress();
});

// Carregar dados do treino
function loadWorkoutData() {
    const workout = treinoData.treinos[currentWorkout];
    workoutTitle.textContent = currentWorkout.replace('_', ' ').toUpperCase();
    workoutFocus.textContent = workout.foco;
    
    renderExercises(workout.exercicios);
    updateProgress();
}

// Renderizar exercícios
function renderExercises(exercicios) {
    exercisesList.innerHTML = '';
    
    exercicios.forEach((exercicio, index) => {
        const exerciseCard = createExerciseCard(exercicio, index);
        exercisesList.appendChild(exerciseCard);
    });
}

// Criar card do exercício
function createExerciseCard(exercicio, index) {
    const card = document.createElement('div');
    card.className = `exercise-card ${completedExercises.has(index) ? 'completed' : ''}`;
    card.dataset.index = index;
    
    const repsText = exercicio.tempo ? exercicio.tempo : `${exercicio.reps} reps`;
    const weightInfo = exerciseWeights[index] ? 
        `<div class="weight-display"><strong>Último peso: ${exerciseWeights[index]}kg</strong></div>` : '';
    
    card.innerHTML = `
        <div class="exercise-header">
            <div class="exercise-title">${exercicio.nome}</div>
            <div class="exercise-status">${completedExercises.has(index) ? '✅' : '⭕'}</div>
        </div>
        <div class="exercise-details">
            <div class="exercise-info">
                <div class="info-item">${exercicio.series} séries</div>
                <div class="info-item">${repsText}</div>
            </div>
            ${weightInfo}
            <div class="exercise-actions">
                <button class="btn btn-primary" onclick="toggleExercise(${index})">
                    ${completedExercises.has(index) ? '✅ Concluído' : '⭕ Marcar como feito'}
                </button>
                <button class="btn btn-secondary" onclick="openWeightModal(${index})">
                    📝 Registrar Peso
                </button>
                <button class="btn btn-video" onclick="openVideo('${exercicio.link}', '${exercicio.nome}')">
                    ▶️ Ver Vídeo
                </button>
            </div>
        </div>
    `;
    
    return card;
}

// Toggle exercício concluído
function toggleExercise(index) {
    if (completedExercises.has(index)) {
        completedExercises.delete(index);
    } else {
        completedExercises.add(index);
    }
    
    // Atualizar card
    const card = document.querySelector(`[data-index="${index}"]`);
    card.classList.toggle('completed');
    
    // Atualizar botão
    const button = card.querySelector('.btn-primary');
    button.innerHTML = completedExercises.has(index) ? '✅ Concluído' : '⭕ Marcar como feito';
    
    updateProgress();
    saveProgress();
}

// Abrir modal de peso
function openWeightModal(index) {
    currentExercise = index;
    weightValue.value = exerciseWeights[index] || '';
    weightModal.classList.add('show');
    weightValue.focus();
}

// Salvar peso
function saveWeight() {
    const weight = parseFloat(weightValue.value);
    if (weight && weight > 0) {
        exerciseWeights[currentExercise] = weight;
        
        // Atualizar card
        const card = document.querySelector(`[data-index="${currentExercise}"]`);
        const weightDisplay = card.querySelector('.weight-display');
        
        if (weightDisplay) {
            weightDisplay.innerHTML = `<strong>Último peso: ${weight}kg</strong>`;
        } else {
            const details = card.querySelector('.exercise-details');
            const newWeightDisplay = document.createElement('div');
            newWeightDisplay.className = 'weight-display';
            newWeightDisplay.innerHTML = `<strong>Último peso: ${weight}kg</strong>`;
            details.insertBefore(newWeightDisplay, details.querySelector('.exercise-actions'));
        }
        
        closeWeightModal();
        saveProgress();
    }
}

// Fechar modal de peso
function closeWeightModal() {
    weightModal.classList.remove('show');
    currentExercise = null;
}

// Abrir vídeo
function openVideo(link, title) {
    videoTitle.textContent = title;
    
    // Converter link do YouTube para embed
    let embedLink = link;
    if (link.includes('youtube.com/watch')) {
        const videoId = link.split('v=')[1].split('&')[0];
        embedLink = `https://www.youtube.com/embed/${videoId}`;
    } else if (link.includes('youtu.be/')) {
        const videoId = link.split('youtu.be/')[1].split('?')[0];
        embedLink = `https://www.youtube.com/embed/${videoId}`;
    } else if (link.includes('instagram.com')) {
        // Para Instagram, mostrar link original
        embedLink = link;
    }
    
    videoIframe.src = embedLink;
    videoModal.classList.add('show');
}

// Fechar vídeo
function closeVideo() {
    videoModal.classList.remove('show');
    videoIframe.src = '';
}

// Atualizar progresso
function updateProgress() {
    const total = treinoData.treinos[currentWorkout].exercicios.length;
    const completed = completedExercises.size;
    
    totalExercises.textContent = `${completed}/${total}`;
    completedExercisesEl.textContent = completed;
    
    // Mostrar botão de finalizar se todos os exercícios estão concluídos
    if (completed === total && total > 0) {
        finishWorkoutBtn.style.display = 'block';
    } else {
        finishWorkoutBtn.style.display = 'none';
    }
}

// Finalizar treino
function finishWorkout() {
    if (confirm('Parabéns! Você concluiu o treino! 🎉\n\nDeseja salvar o progresso e limpar para o próximo treino?')) {
        // Salvar histórico
        saveWorkoutHistory();
        
        // Limpar progresso atual
        completedExercises.clear();
        exerciseWeights = {};
        
        // Recarregar treino
        loadWorkoutData();
        
        alert('Treino finalizado! Progresso salvo. 💪');
    }
}

// Salvar histórico do treino
function saveWorkoutHistory() {
    const history = JSON.parse(localStorage.getItem('workoutHistory') || '[]');
    const workoutRecord = {
        date: new Date().toISOString(),
        workout: currentWorkout,
        completedExercises: Array.from(completedExercises),
        weights: exerciseWeights
    };
    
    history.push(workoutRecord);
    localStorage.setItem('workoutHistory', JSON.stringify(history));
}

// Salvar progresso
function saveProgress() {
    const progress = {
        currentWorkout,
        completedExercises: Array.from(completedExercises),
        exerciseWeights
    };
    localStorage.setItem('workoutProgress', JSON.stringify(progress));
}

// Carregar progresso
function loadProgress() {
    const saved = localStorage.getItem('workoutProgress');
    if (saved) {
        const progress = JSON.parse(saved);
        if (progress.currentWorkout === currentWorkout) {
            completedExercises = new Set(progress.completedExercises);
            exerciseWeights = progress.exerciseWeights || {};
        }
    }
}

// Event Listeners
function setupEventListeners() {
    // Botões de dia
    dayButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const day = this.dataset.day;
            const workoutMap = {
                'segunda': 'treino_1',
                'quarta': 'treino_2',
                'sexta': 'treino_3'
            };
            
            if (workoutMap[day]) {
                // Atualizar botões ativos
                dayButtons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                // Mudar treino
                currentWorkout = workoutMap[day];
                completedExercises.clear();
                exerciseWeights = {};
                loadWorkoutData();
                saveProgress();
            }
        });
    });
    
    // Modal de peso
    document.getElementById('save-weight').addEventListener('click', saveWeight);
    document.getElementById('cancel-weight').addEventListener('click', closeWeightModal);
    document.getElementById('weight-value').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') saveWeight();
    });
    
    // Modal de vídeo
    document.getElementById('close-video').addEventListener('click', closeVideo);
    
    // Finalizar treino
    finishWorkoutBtn.addEventListener('click', finishWorkout);
    
    // Fechar modais clicando fora
    weightModal.addEventListener('click', function(e) {
        if (e.target === this) closeWeightModal();
    });
    
    videoModal.addEventListener('click', function(e) {
        if (e.target === this) closeVideo();
    });
}

// Service Worker para PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('SW registered: ', registration);
            })
            .catch(function(registrationError) {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
