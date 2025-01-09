// configuration.js
class SchedulerConfiguration {
    constructor() {
        this.loadConfiguration();
    }

    // מאפיינים בסיסיים
    defaultConfig = {
        formTitle: 'הזמנת תורים',
        googleSheetsLink: '',
        googleFormsLink: '',
        availableDates: [],
        timeSlots: {
            startTime: '16:00',
            endTime: '20:00',
            slotDuration: 15
        },
        formFields: [
            { name: 'שם מלא', id: 'name', type: 'text' },
            { name: 'טלפון', id: 'phone', type: 'tel' }
        ]
    };

    // טעינת תצורה מאחסון מקומי
    loadConfiguration() {
        const savedConfig = localStorage.getItem('schedulerConfig');
        this.currentConfig = savedConfig 
            ? JSON.parse(savedConfig) 
            : { ...this.defaultConfig };
    }

    // שמירת תצורה באחסון מקומי
    saveConfiguration(config) {
        this.currentConfig = { ...this.currentConfig, ...config };
        localStorage.setItem('schedulerConfig', JSON.stringify(this.currentConfig));
    }

    // בדיקת תקינות תצורה
    validateConfiguration(config) {
        const errors = [];

        if (!config.googleSheetsLink) {
            errors.push('חסר קישור Google Sheets');
        }

        if (!config.googleFormsLink) {
            errors.push('חסר קישור Google Forms');
        }

        if (config.timeSlots.startTime >= config.timeSlots.endTime) {
            errors.push('שעת ההתחלה חייבת להיות לפני שעת הסיום');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    // יצוא תצורה לקובץ
    exportConfiguration() {
        const configBlob = new Blob([JSON.stringify(this.currentConfig, null, 2)], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(configBlob);
        link.download = 'scheduler_config.json';
        link.click();
    }

    // יבוא תצורה מקובץ
    importConfiguration(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedConfig = JSON.parse(e.target.result);
                const validationResult = this.validateConfiguration(importedConfig);
                
                if (validationResult.isValid) {
                    this.saveConfiguration(importedConfig);
                    alert('התצורה יובאה בהצלחה');
                    this.loadConfiguration();
                } else {
                    alert('שגיאה בייבוא התצורה:\n' + validationResult.errors.join('\n'));
                }
            } catch (error) {
                alert('שגיאה בקריאת קובץ התצורה');
            }
        };
        reader.readAsText(file);
    }

    // יצירת דף הזמנות
    generateSchedulerHTML() {
        // יצירת דף HTML דינמי על בסיס התצורה הנוכחית
        const htmlTemplate = `<!DOCTYPE html>
<html dir="rtl">
<head>
    <meta charset="UTF-8">
    <title>${this.currentConfig.formTitle}</title>
    <style>
        /* הוספת סגנונות בסיסיים */
        body { font-family: Arial, sans-serif; direction: rtl; }
    </style>
</head>
<body>
    <h1>${this.currentConfig.formTitle}</h1>
    <!-- יצירת טופס דינמי בהתאם להגדרות -->
    <form id="booking-form">
        ${this.currentConfig.formFields.map(field => `
            <div>
                <label for="${field.id}">${field.name}</label>
                <input type="${field.type}" id="${field.id}" name="${field.id}" required>
            </div>
        `).join('')}
        <button type="submit">הזמן תור</button>
    </form>

    <script>
        // הגדרת תצורה
        const SCHEDULER_CONFIG = ${JSON.stringify(this.currentConfig)};
    </script>
</body>
</html>`;

        const blob = new Blob([htmlTemplate], { type: 'text/html' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'scheduler.html';
        link.click();
    }
}

// יצירת אובייקט תצורה גלובלי
const schedulerConfig = new SchedulerConfiguration();

// תיאום אירועים עם ממשק המשתמש
document.addEventListener('DOMContentLoaded', () => {
    const formTitleInput = document.getElementById('form-title');
    const googleSheetsInput = document.getElementById('google-sheets-link');
    const googleFormsInput = document.getElementById('google-forms-link');
    const startTimeInput = document.getElementById('start-time');
    const endTimeInput = document.getElementById('end-time');
    const slotDurationInput = document.getElementById('slot-duration');
    const addDateBtn = document.getElementById('add-date-btn');
    const datesContainer = document.getElementById('dates-container');
    const saveConfigBtn = document.getElementById('save-config-btn');
    const exportConfigBtn = document.getElementById('export-config-btn');
    const generateSchedulerBtn = document.getElementById('generate-scheduler-btn');
    const addFieldBtn = document.getElementById('add-field-btn');
    const formFieldsContainer = document.getElementById('form-fields-container');

    // מילוי נתונים קיימים מהתצורה
    formTitleInput.value = schedulerConfig.currentConfig.formTitle;
    googleSheetsInput.value = schedulerConfig.currentConfig.googleSheetsLink;
    googleFormsInput.value = schedulerConfig.currentConfig.googleFormsLink;
    startTimeInput.value = schedulerConfig.currentConfig.timeSlots.startTime;
    endTimeInput.value = schedulerConfig.currentConfig.timeSlots.endTime;
    slotDurationInput.value = schedulerConfig.currentConfig.timeSlots.slotDuration;

    // הוספת תאריכים
    addDateBtn.addEventListener('click', () => {
        const dateInput = document.createElement('input');
        dateInput.type = 'date';
        dateInput.classList.add('available-date');
        
        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'X';
        removeBtn.addEventListener('click', () => {
            datesContainer.removeChild(dateInput);
            dateInput.remove();
            removeBtn.remove();
        });

        datesContainer.appendChild(dateInput);
        datesContainer.appendChild(removeBtn);
    });

    // הוספת שדות טופס
    addFieldBtn.addEventListener('click', () => {
        const fieldWrapper = document.createElement('div');
        fieldWrapper.classList.add('form-field');

        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.placeholder = 'שם השדה';

        const idInput = document.createElement('input');
        idInput.type = 'text';
        idInput.placeholder = 'מזהה השדה';

        const typeSelect = document.createElement('select');
        ['text', 'tel', 'email', 'number'].forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type;
            typeSelect.appendChild(option);
        });

        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'X';
        removeBtn.addEventListener('click', () => {
            formFieldsContainer.removeChild(fieldWrapper);
        });

        fieldWrapper.appendChild(nameInput);
        fieldWrapper.appendChild(idInput);
        fieldWrapper.appendChild(typeSelect);
        fieldWrapper.appendChild(removeBtn);

        formFieldsContainer.appendChild(fieldWrapper);
    });

    // שמירת תצורה
    saveConfigBtn.addEventListener('click', () => {
        const config = {
            formTitle: formTitleInput.value,
            googleSheetsLink: googleSheetsInput.value,
            googleFormsLink: googleFormsInput.value,
            timeSlots: {
                startTime: startTimeInput.value,
                endTime: endTimeInput.value,
                slotDuration: parseInt(slotDurationInput.value)
            },
            availableDates: Array.from(document.querySelectorAll('.available-date'))
                .map(input => input.value)
                .filter(date => date),
            formFields: Array.from(document.querySelectorAll('.form-field')).map(field => ({
                name: field.querySelector('input[type="text"]:first-child').value,
                id: field.querySelector('input[type="text"]:nth-child(2)').value,
                type: field.querySelector('select').value
            }))
        };

        const validation = schedulerConfig.validateConfiguration(config);
        if (validation.isValid) {
            schedulerConfig.saveConfiguration(config);
            alert('התצורה נשמרה בהצלחה');
        } else {
            alert('שגיאה בשמירת התצורה:\n' + validation.errors.join('\n'));
        }
    });

    // יצוא תצורה
    exportConfigBtn.addEventListener('click', () => {
        schedulerConfig.exportConfiguration();
    });

    // יצירת דף הזמנות
    generateSchedulerBtn.addEventListener('click', () => {
        schedulerConfig.generateSchedulerHTML();
    });
});
