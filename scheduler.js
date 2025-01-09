// scheduler.js
class BookingManager {
    constructor(config) {
        this.config = config;
        this.bookings = [];
        this.initializeBookingsTable();
    }

    initializeBookingsTable() {
        this.bookingsTable = document.getElementById('bookings-table');
        this.bookingsTableBody = this.bookingsTable.getElementsByTagName('tbody')[0];
    }

    async loadBookingsFromSheets() {
        try {
            const response = await fetch(this.config.googleSheetsLink, {
                method: 'GET',
                headers: {
                    'Cache-Control': 'no-cache'
                }
            });

            if (!response.ok) {
                throw new Error('שגיאה בטעינת הנתונים');
            }

            const data = await response.text();
            this.parseBookings(data);
        } catch (error) {
            console.error('שגיאה בטעינת הזמנות:', error);
            alert('לא ניתן לטעון את ההזמנות');
        }
    }

    parseBookings(csvData) {
        const rows = csvData.split('\n');
        const headers = rows[0].split(',');

        this.bookings = rows.slice(1).map(row => {
            const values = row.split(',');
            const booking = {};
            
            headers.forEach((header, index) => {
                booking[header.trim()] = values[index]?.trim();
            });

            return booking;
        }).filter(booking => Object.keys(booking).length > 0);

        this.updateBookingsTable();
    }

    updateBookingsTable() {
        this.bookingsTableBody.innerHTML = '';

        this.bookings.forEach(booking => {
            const row = document.createElement('tr');
            
            const nameCell = document.createElement('td');
            nameCell.textContent = booking['שם המזמין'] || 'לא ידוע';
            row.appendChild(nameCell);

            const timeCell = document.createElement('td');
            timeCell.textContent = booking['שעה'] || 'לא ידוע';
            row.appendChild(timeCell);

            this.bookingsTableBody.appendChild(row);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const config = schedulerConfig.currentConfig;
    const bookingManager = new BookingManager(config);

    if (config.googleSheetsLink) {
        bookingManager.loadBookingsFromSheets();
    }
});
