const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";

    const pad = (n) => n.toString().padStart(2, '0');

    const hh = pad(date.getHours());
    const mm = pad(date.getMinutes());
    const dd = pad(date.getDate());
    const MM = pad(date.getMonth() + 1);
    const yy = date.getFullYear().toString().slice(-0);

    return `${hh}:${mm} ${dd}/${MM}/${yy}`;
};


export { formatDate };