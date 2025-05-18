document.addEventListener('DOMContentLoaded', () => {
    const examForm = document.getElementById('examForm');
    const examNameInput = document.getElementById('examName');
    const examDateInput = document.getElementById('examDate');
    const examTimeInput = document.getElementById('examTime');
    const addExamFeedback = document.getElementById('addExamFeedback');
    const viewScheduleBtn = document.getElementById('viewScheduleBtn');

    const examListDiv = document.getElementById('examList');
    const examTableContainer = document.getElementById('examTableContainer');
    const toggleScheduleViewBtn = document.getElementById('toggleScheduleViewBtn');
    const addMoreExamsBtn = document.getElementById('addMoreExamsBtn');
    const clearScheduleBtn = document.getElementById('clearScheduleBtn');

    const inputStateDiv = document.getElementById('input-state');
    const scheduleStateDiv = document.getElementById('schedule-state');

    let exams = JSON.parse(localStorage.getItem('exams')) || [];
    let isTableView = false;
    let feedbackTimeout;

    function saveExams() {
        localStorage.setItem('exams', JSON.stringify(exams));
    }

    function formatDate(dateString) {
        const date = new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString(undefined, {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    }

    function formatTime(timeString) {
        const [hours, minutes] = timeString.split(':');
        const date = new Date();
        date.setHours(hours, minutes);
        return date.toLocaleTimeString(undefined, {
            hour: 'numeric', minute: '2-digit', hour12: true
        });
    }

    function getSortedExams() {
        return [...exams].sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.time}`);
            const dateB = new Date(`${b.date}T${b.time}`);
            return dateA - dateB;
        });
    }

    function renderCardView() {
        examListDiv.innerHTML = '';
        const sortedExams = getSortedExams();

        if (sortedExams.length === 0) {
            examListDiv.innerHTML = '<p class="no-exams">No exams scheduled yet. Add one!</p>';
            return;
        }

        sortedExams.forEach((exam, index) => {
            const examItem = document.createElement('div');
            examItem.classList.add('exam-item');
            examItem.style.animationDelay = `${index * 0.05}s`;

            const detailsDiv = document.createElement('div');
            detailsDiv.classList.add('exam-details');

            const nameEl = document.createElement('h3');
            nameEl.textContent = exam.name;

            const dateEl = document.createElement('p');
            dateEl.textContent = `Date: ${formatDate(exam.date)}`;

            const timeEl = document.createElement('p');
            timeEl.textContent = `Time: ${formatTime(exam.time)}`;

            detailsDiv.appendChild(nameEl);
            detailsDiv.appendChild(dateEl);
            detailsDiv.appendChild(timeEl);

            const actionsDiv = document.createElement('div');
            actionsDiv.classList.add('exam-actions');
            
            const deleteBtn = document.createElement('button');
            deleteBtn.innerHTML = '×';
            deleteBtn.setAttribute('aria-label', 'Delete exam');
            deleteBtn.onclick = () => deleteExam(exam.id);

            actionsDiv.appendChild(deleteBtn);
            
            examItem.appendChild(detailsDiv);
            examItem.appendChild(actionsDiv);
            examListDiv.appendChild(examItem);
        });
    }

    function renderTableView() {
        examTableContainer.innerHTML = '';
        const sortedExams = getSortedExams();

        if (sortedExams.length === 0) {
            examTableContainer.innerHTML = '<p class="no-exams">No exams to display in table.</p>';
            return;
        }

        const table = document.createElement('table');
        table.classList.add('styled-table');

        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th>Exam Name</th>
                <th>Date</th>
                <th>Time</th>
                <th>Actions</th>
            </tr>
        `;
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        sortedExams.forEach(exam => {
            const row = tbody.insertRow();
            row.insertCell().textContent = exam.name;
            row.insertCell().textContent = formatDate(exam.date);
            row.insertCell().textContent = formatTime(exam.time);
            
            const actionCell = row.insertCell();
            actionCell.classList.add('action-cell');
            const deleteBtn = document.createElement('button');
            deleteBtn.innerHTML = '×';
            deleteBtn.setAttribute('aria-label', 'Delete exam');
            deleteBtn.onclick = () => deleteExam(exam.id);
            actionCell.appendChild(deleteBtn);
        });
        table.appendChild(tbody);
        examTableContainer.appendChild(table);
    }

    function updateScheduleView() {
        if (isTableView) {
            examListDiv.style.display = 'none';
            renderTableView();
            examTableContainer.style.display = 'block';
            toggleScheduleViewBtn.textContent = 'View as Cards';
        } else {
            examTableContainer.style.display = 'none';
            renderCardView();
            examListDiv.style.display = 'block';
            toggleScheduleViewBtn.textContent = 'View as Table';
        }
    }

    function switchToInputState() {
        scheduleStateDiv.classList.remove('active-state');
        inputStateDiv.classList.add('active-state');
        examNameInput.focus();
    }

    function switchToScheduleState() {
        inputStateDiv.classList.remove('active-state');
        scheduleStateDiv.classList.add('active-state');
        updateScheduleView();
    }
    
    function showFeedbackMessage(message) {
        addExamFeedback.textContent = message;
        addExamFeedback.classList.add('show');
        
        clearTimeout(feedbackTimeout);
        feedbackTimeout = setTimeout(() => {
            addExamFeedback.classList.remove('show');
        }, 3000);
    }

    function handleFormSubmit(event) {
        event.preventDefault();
        const name = examNameInput.value.trim();
        const date = examDateInput.value;
        const time = examTimeInput.value;

        if (name && date && time) {
            const newExam = {
                id: Date.now(),
                name: name,
                date: date,
                time: time
            };
            exams.push(newExam);
            saveExams();
            examForm.reset();
            examNameInput.focus();
            showFeedbackMessage(`Exam "${name}" added successfully!`);
        }
    }
    
    function deleteExam(id) {
        exams = exams.filter(exam => exam.id !== id);
        saveExams();
        updateScheduleView();
        if (exams.length === 0) {
            showFeedbackMessage('All exams cleared. Add a new one!');
            setTimeout(() => {
                if(scheduleStateDiv.classList.contains('active-state')){
                     switchToInputState();
                }
            }, 1500);
        }
    }

    function clearAllExams() {
        if (exams.length === 0) {
            showFeedbackMessage('Schedule is already empty.');
            return;
        }
        if (confirm('Are you sure you want to clear ALL exams? This action cannot be undone.')) {
            exams = [];
            saveExams();
            updateScheduleView();
            showFeedbackMessage('All exams have been cleared.');
             setTimeout(() => {
                if(scheduleStateDiv.classList.contains('active-state')){
                     switchToInputState();
                }
            }, 1500);
        }
    }

    examForm.addEventListener('submit', handleFormSubmit);
    
    viewScheduleBtn.addEventListener('click', () => {
        if (exams.length === 0) {
            showFeedbackMessage('No exams to show. Add an exam first.');
        } else {
            switchToScheduleState();
        }
    });

    addMoreExamsBtn.addEventListener('click', switchToInputState);
    clearScheduleBtn.addEventListener('click', clearAllExams);

    toggleScheduleViewBtn.addEventListener('click', () => {
        isTableView = !isTableView;
        updateScheduleView();
    });

    if (exams.length > 0) {
        switchToScheduleState();
    } else {
        switchToInputState();
    }
});