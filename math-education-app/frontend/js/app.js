document.addEventListener('DOMContentLoaded', function() {
    const exerciseContainer = document.getElementById('exercise-container');
    const nextExerciseBtn = document.getElementById('next-exercise');
    const resultsContainer = document.getElementById('results-container');
    let currentExercise = null;

    function loadExercise() {
        fetch('http://localhost:5000/api/ejercicio')
            .then(response => response.json())
            .then(data => {
                currentExercise = data;
                renderExercise(data);
            })
            .catch(() => {
                exerciseContainer.innerHTML = '<p>Error al cargar el ejercicio.</p>';
            });
    }

    function renderExercise(exercise) {
        exerciseContainer.innerHTML = `
            <form id="exercise-form">
                <p>${exercise.pregunta}</p>
                ${exercise.opciones.map((op, i) => `
                    <label>
                        <input type="radio" name="answer" value="${op}" required> ${op}
                    </label>
                `).join('<br>')}
                <br>
                <button type="submit">Responder</button>
            </form>
            <div id="result-display"></div>
        `;

        document.getElementById('exercise-form').addEventListener('submit', function(event) {
            event.preventDefault();
            const userAnswer = parseInt(document.querySelector('input[name="answer"]:checked').value);
            const resultDisplay = document.getElementById('result-display');
            if (userAnswer === exercise.respuesta) {
                resultDisplay.textContent = '¡Correcto! ¡Bien hecho!';
                resultDisplay.style.color = 'green';
                resultsContainer.innerHTML += '<p>✔️ Ejercicio correcto</p>';
            } else {
                resultDisplay.textContent = '¡Ups! Intenta de nuevo.';
                resultDisplay.style.color = 'red';
                resultsContainer.innerHTML += '<p>❌ Ejercicio incorrecto</p>';
            }
        });
    }

    nextExerciseBtn.addEventListener('click', loadExercise);

    // Cargar el primer ejercicio al iniciar
    loadExercise();
});