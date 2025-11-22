import Dexie from 'dexie';

export const db = new Dexie('technician');
db.version(1).stores({
     tickets: '&id_ticket, ticket_tittle, ticket_description, status_name, priority_name, cust_name, cust_latitude, cust_longtitude, cust_phone, assignee_id, created_datetime, ticket_locked, ticket_priority_lock, ticket_check_in, status_color, priority_color, id_priority, id_ticket_status' // Primary key and indexed props
    ,metadata : 'key'
    ,timelines: '++id, id_ticket, id_user, lat, lng, timestamp'
    ,ticketLocked: '&id_ticket, ID'
    ,detailticket : '&id_ticket, payload'
    ,report : '&id_ticket, url, data, timestamp'
    ,checkin : '&id_ticket, url, data, timestamp'
    ,unlock : '&id_ticket, url, data, timestamp'
});

