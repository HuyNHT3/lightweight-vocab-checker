/**
 * Logic điều khiển con trỏ custom bám theo chuột
 */
document.addEventListener('mousemove', (e) => {
    const cursor = document.getElementById('custom-cursor-container');
    if (cursor) {
        // Sử dụng style trực tiếp để đảm bảo độ mượt tối đa
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    }
});