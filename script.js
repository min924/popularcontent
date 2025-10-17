document.addEventListener('DOMContentLoaded', () => {
    const WEB_APP_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE'; // ⚠️ Apps Script URL로 변경 필요
    const recordForm = document.getElementById('record-form');
    const recordsContainer = document.getElementById('records-container');
    const dateInput = document.getElementById('date');
    const exportButton = document.getElementById('export-excel');
    let recordsCache = [];

    // 오늘 날짜 기본값 설정
    dateInput.value = new Date().toISOString().split('T')[0];

    // 데이터 불러오기
    const loadRecords = async () => {
        try {
            const response = await fetch(WEB_APP_URL, { method: 'GET', redirect: 'follow' });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            recordsCache = await response.json();

            if (!Array.isArray(recordsCache)) {
                console.error("Error data received from Google Apps Script:", recordsCache);
                throw new Error('Google Apps Script에서 에러가 발생했습니다.');
            }

            recordsCache.sort((a, b) => new Date(b.Timestamp) - new Date(a.Timestamp));
            recordsContainer.innerHTML = '';
            recordsCache.forEach(addRecordToDOM);

        } catch (error) {
            console.error('Error loading records:', error);
            recordsContainer.innerHTML = `<p style="color: red;">데이터를 불러오는 데 실패했습니다.</p>`;
        }
    };

    // 기록을 DOM에 추가
    const addRecordToDOM = (record) => {
        const row = document.createElement('div');
        row.classList.add('record-row');
        row.innerHTML = `
            <div class="record-age">👤 ${record.ageGroup || '-'}</div>
            <div class="record-title" title="${record.title || ''}">🎬 ${record.title || '-'}</div>
            <div class="record-type">📺 ${record.contentType || '-'}</div>
            <div class="record-recommend">⭐ ${record.recommendation || '-'}</div>
            <div class="record-reason">💬 ${record.reason || '-'}</div>
            <div class="record-date">${record.Date ? new Date(record.Date).toLocaleDateString() : '-'}</div>
        `;
        recordsContainer.appendChild(row);
    };

    // 폼 제출 이벤트
    recordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitButton = e.target.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = '저장 중...';

        const formData = new FormData(recordForm);
        const data = {
            ageGroup: formData.get('ageGroup'),
            title: formData.get('title'),
            contentType: formData.get('contentType'),
            recommendation: formData.get('recommendation'),
            reason: formData.get('reason'),
            date: formData.get('date') || new Date().toISOString().split('T')[0]
        };

        try {
            await fetch(WEB_APP_URL, {
                method: 'POST',
                mode: 'no-cors',
                cache: 'no-cache',
                redirect: 'follow',
                body: JSON.stringify(data)
            });

            alert('성공적으로 기록되었습니다!');
            recordForm.reset();
            dateInput.value = new Date().toISOString().split('T')[0];
            loadRecords();

        } catch (error) {
            console.error('Error submitting record:', error);
            alert('기록 저장에 실패했습니다.');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = '기록하기';
        }
    });

    // 엑셀 내보내기
    exportButton.addEventListener('click', () => {
        if (recordsCache.length === 0) {
            alert('내보낼 데이터가 없습니다.');
            return;
        }

        const worksheet = XLSX.utils.json_to_sheet(recordsCache);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "콘텐츠 기록");

        const headers = Object.keys(recordsCache[0]);
        const header_styles = { font: { bold: true } };
        for (let i = 0; i < headers.length; i++) {
            const cell_ref = XLSX.utils.encode_cell({ c: i, r: 0 });
            if (worksheet[cell_ref]) worksheet[cell_ref].s = header_styles;
        }

        XLSX.writeFile(workbook, "content_records.xlsx");
    });

    loadRecords();
});
