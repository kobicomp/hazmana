// scheduler.js
class BookingManager {
    constructor(config) {
        this.config = config;
        this.bookings = [];
        this.initializeBookingsTable();
    }

    // טעינת הזמנות מגוגל שיטס
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

    // ניתוח נתוני הזמנות מ-CSV
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

    // עדכון טבלת הזמנות
    updateBookingsTable() {
        const bookingsList = document.getElementById('bookings-list');
        bookingsList.innerHTML = '';

        this.bookings.forEach((booking, index) => {
            const row = document.createElement('tr');
            
            // הצגת עמודות בהתאם לשדות הקיימים
            const columns = ['תאריך', 'שעה', 'שם'];
            columns.forEach(column => {
                const cell = document.createElement('td');
                cell.textContent = booking[column] || 'לא ידוע';
                row.appendChild(cell);
            });

            // עמודת פעולות
            const actionsCell = document.createElement('td');
            
            // כפתור מחיקה
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'מחק';
            deleteBtn.addEventListener('click', () => this.deleteBooking(index));
            actionsCell.appendChild(deleteBtn);

            // כפתור עריכה
            const editBtn = document.createElement('button');
            editBtn.textContent = 'ערוך';
            editBtn.addEventListener('click', () => this.editBooking(index));
            actionsCell.appendChild(editBtn);

            row.appendChild(actionsCell);
            bookingsList.appendChild(row);
        });
    }

    // מחיקת הזמנה
    deleteBooking(index) {
        const confirmDelete = confirm('האם אתה בטוח שברצונך למחוק הזמנה זו?');
        if (confirmDelete) {
            this.bookings.splice(index, 1);
            this.updateBookingsTable();
            this.syncBookingsToSheets();
        }
    }

    // עריכת הזמנה
    editBooking(index) {
        const booking = this.bookings[index];
        const editModal = this.createEditModal(booking, index);
        document.body.appendChild(editModal);
    }

    // יצירת מודל לעריכת הזמנה
    createEditModal(booking, index) {
        const modal = document.createElement('div');
        modal.classList.add('modal');
        modal.innerHTML = `
            <div class="modal-content">
                <h2>ערוך הזמנה</h2>
                ${Object.keys(booking).map(key => `
                    <div>
                        <label>${key}</label>
                        <input type="text" name="${key}" value="${booking[key]}" />
                    </div>
                `).join('')}
                <div class="modal-actions">
                    <button id="save-edit">שמור</button>
                    <button id="cancel-edit">בטל</button>
                </div>
            </div>
        `;

        // כפתור ביטול
        modal.querySelector('#cancel-edit').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        // כפתור שמירה
        modal.querySelector('#save-edit').addEventListener('click', () => {
            const updatedBooking = {};
            modal.querySelectorAll('input').forEach(input => {
                updatedBooking[input.name] = input.value;
            });

            this.bookings[index] = updatedBooking;
            this.updateBookingsTable();
            this.syncBookingsToSheets();
            document.body.removeChild(modal);
        });

        return modal;
    }

    // סנכרון הזמנות לגוגל שיטס
    async syncBookingsToSheets() {
        try {
            // הערה: יישום מלא של סנכרון לגוגל שיטס ידרוש טיפול ב-CORS ואימות
            console.log('סנכרון הזמנות:', this.bookings);
            alert('פעולת הסנכרון תומשך בשלב מאוחר יותר');
        } catch (error) {
            console.error('שגיאה בסנכרון הזמנות:', error);
            alert('שגיאה בסנכרון ההזמנות');
        }
    }
}

// הכנת מנהל הזמנות לאחר טעינת העמוד
document.addEventListener('DOMContentLoaded', () => {
    const config = schedulerConfig.currentConfig;
    const bookingManager = new BookingManager(config);

    // טעינת הזמנות
    if (config.googleSheetsLink) {
        bookingManager.loadBookingsFromSheets();
    }
});
