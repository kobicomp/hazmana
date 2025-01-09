// configuration.js
class SchedulerConfiguration {
    constructor() {
        this.loadConfiguration();
    }

    defaultConfig = {
        formTitle: 'הזמנת תורים',
        googleSheetsLink: '',
        googleFormsLink: '',
        formFields: [
            { name: 'שם המזמין', id: 'entry.795013979', type: 'text' },
            { name: 'שעה', id: 'entry.1634119070', type: 'text' }
        ]
    };

    loadConfiguration() {
        const savedConfig = localStorage.getItem('schedulerConfig');
        this.currentConfig = savedConfig 
            ? JSON.parse(savedConfig) 
            : { ...this.defaultConfig };
    }

    saveConfiguration(config) {
        this.currentConfig = { ...this.currentConfig, ...config };
        localStorage.setItem('schedulerConfig', JSON.stringify(this.currentConfig));
    }

    generateSchedulerHTML() {
        const config = this.currentConfig;
        const formHtml = `
            <h1>${config.formTitle}</h1>
            <form id="booking-form">
                ${config.formFields.map(field => `
                    <div>
                        <label for="${field.id}">${field.name}</label>
                        <input type="${field.type}" id="${field.id}" name="${field.id}" required>
                    </div>
                `).join('')}
                <button type="submit">הזמן תור</button>
            </form>
        `;

        const blob = new Blob([formHtml], { type: 'text/html' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'scheduler.html';
        link.click();
    }
}

const schedulerConfig = new SchedulerConfiguration();

document.addEventListener('DOMContentLoaded', () => {
    // Attach event handlers to UI elements
});
