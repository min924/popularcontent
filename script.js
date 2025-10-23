document.addEventListener('DOMContentLoaded', () => {
    const recordForm = document.getElementById('record-form');
    const dateInput = document.getElementById('date');

    // 오늘 날짜 기본값 설정
    if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }

    // Netlify Forms용 제출 이벤트
    recordForm.addEventListener('submit', () => {
        const submitButton = recordForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = '제출 중...';

        // 2초 뒤 버튼 원복 (Netlify는 페이지 새로고침 후 데이터 저장)
        setTimeout(() => {
            submitButton.disabled = false;
            submitButton.textContent = '기록하기';
        }, 2000);
    });
});
