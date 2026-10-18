const API_URL = 'http://localhost:3000/api/timetable';

const form = document.getElementById('timetableForm');
const recordId = document.getElementById('recordId');
const message = document.getElementById('message');
const timetableBody = document.getElementById('timetableBody');
const saveButton = document.getElementById('saveButton');
const cancelButton = document.getElementById('cancelButton');
const refreshButton = document.getElementById('refreshButton');

// Display a message to the user
function showMessage(text, isError = false) {
    message.textContent = text;
    message.style.color = isError ? '#b91c1c' : '#166534';
}

// Send a request to the API and read its response
async function requestAPI(url, options = {}) {
    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
    }

    return data;
}

// Load and display all timetable records
async function loadTimetable() {
    try {
        const records = await requestAPI(API_URL);
        timetableBody.replaceChildren();

        for (const record of records) {
            const row = document.createElement('tr');

            const values = [
                record.id,
                record.course_code,
                record.course_name,
                record.day_of_week,
                record.start_time,
                record.end_time,
                record.room || '',
                record.learning_goal || ''
            ];

            for (const value of values) {
                const cell = document.createElement('td');
                cell.textContent = value;
                row.appendChild(cell);
            }

            const actions = document.createElement('td');

            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.type = 'button';
            editButton.addEventListener('click', () => editRecord(record));

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.type = 'button';
            deleteButton.style.backgroundColor = '#b91c1c';
            deleteButton.addEventListener('click', () => deleteRecord(record.id));

            actions.append(editButton, deleteButton);
            row.appendChild(actions);
            timetableBody.appendChild(row);
        }

        showMessage(`Loaded ${records.length} timetable records.`);
    } catch (error) {
        showMessage(`Could not load timetable: ${error.message}`, true);
    }
}

// Add a new record or update an existing one
form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const record = {
        course_code: document.getElementById('course_code').value.trim(),
        course_name: document.getElementById('course_name').value.trim(),
        day_of_week: document.getElementById('day_of_week').value,
        start_time: document.getElementById('start_time').value,
        end_time: document.getElementById('end_time').value,
        room: document.getElementById('room').value.trim(),
        learning_goal: document.getElementById('learning_goal').value.trim()
    };

    const isEditing = recordId.value !== '';
    const url = isEditing ? `${API_URL}/${recordId.value}` : API_URL;
    const method = isEditing ? 'PUT' : 'POST';

    try {
        await requestAPI(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(record)
        });

        showMessage(isEditing ? 'Timetable entry updated!' : 'Timetable entry added!');
        resetForm();
        await loadTimetable();
    } catch (error) {
        showMessage(`Could not save entry: ${error.message}`, true);
    }
});

// Fill the form with an existing record
function editRecord(record) {
    recordId.value = record.id;

    document.getElementById('course_code').value = record.course_code;
    document.getElementById('course_name').value = record.course_name;
    document.getElementById('day_of_week').value = record.day_of_week;
    document.getElementById('start_time').value = record.start_time;
    document.getElementById('end_time').value = record.end_time;
    document.getElementById('room').value = record.room || '';
    document.getElementById('learning_goal').value = record.learning_goal || '';

    saveButton.textContent = 'Update Timetable Entry';
    cancelButton.hidden = false;
    showMessage(`Editing timetable record ${record.id}.`);
    form.scrollIntoView({ behavior: 'smooth' });
}

// Clear the form and leave editing mode
function resetForm() {
    form.reset();
    recordId.value = '';
    saveButton.textContent = 'Save Timetable Entry';
    cancelButton.hidden = true;
}

// Delete a record after confirmation
async function deleteRecord(id) {
    if (!confirm(`Are you sure you want to delete timetable record ${id}?`)) {
        return;
    }

    try {
        await requestAPI(`${API_URL}/${id}`, { method: 'DELETE' });
        showMessage('Timetable entry deleted successfully.');
        await loadTimetable();
    } catch (error) {
        showMessage(`Could not delete entry: ${error.message}`, true);
    }
}

// Button events
cancelButton.addEventListener('click', () => {
    resetForm();
    showMessage('Edit cancelled.');
});

refreshButton.addEventListener('click', loadTimetable);

// Load records when the page opens
loadTimetable();