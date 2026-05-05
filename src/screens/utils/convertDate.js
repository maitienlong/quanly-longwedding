const formatDate = (dateString) => {
    const date = new Date(dateString);

    const pad = (n) => n.toString().padStart(2, '0');

    const hh = pad(date.getHours());
    const mm = pad(date.getMinutes());
    const dd = pad(date.getDate());
    const MM = pad(date.getMonth() + 1);
    const yy = date.getFullYear().toString().slice(-0);

    return `${mm}:${hh} - ${dd}/${MM}/${yy}`;
};


export { formatDate };