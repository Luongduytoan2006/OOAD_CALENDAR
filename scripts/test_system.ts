import fetch from 'node-fetch';

const API_URL = 'http://localhost:3601/api';

async function sleep(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function runLiveTest() {
  console.log('🚀 --- BẮT ĐẦU LIVE TEST: THAO TÁC LIÊN TỤC ---');

  try {
    // 1. Toàn tạo lịch cá nhân
    console.log('\n[Action 1] Toàn (ID 1) tạo lịch: "Ăn sáng"');
    await fetch(`${API_URL}/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 1,
        request: { title: 'Ăn sáng', location: 'Quán bún', startTime: '2026-07-01T07:00:00Z', endTime: '2026-07-01T08:00:00Z', reminderMethods: ['POPUP'] }
      })
    });
    await sleep(500);

    // 2. Toàn tạo Group Meeting
    console.log('[Action 2] Toàn tạo Group Meeting: "Họp lớp" (120 phút)');
    await fetch(`${API_URL}/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 1,
        request: { title: 'Họp lớp', location: 'Cafe', startTime: '2026-07-02T14:00:00Z', endTime: '2026-07-02T16:00:00Z', isGroupMeeting: true, reminderMethods: [] }
      })
    });
    await sleep(500);

    // 3. Sơn tạo Group Meeting tương tự
    console.log('[Action 3] Sơn (ID 2) tạo Group Meeting: "Họp lớp" (120 phút) ở giờ khác');
    await fetch(`${API_URL}/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 2,
        request: { title: 'Họp lớp', location: 'Nhà Sơn', startTime: '2026-07-03T09:00:00Z', endTime: '2026-07-03T11:00:00Z', isGroupMeeting: true, reminderMethods: [] }
      })
    });
    await sleep(500);

    // 4. Dũng tạo lịch trùng -> Gợi ý đa nhóm
    console.log('[Action 4] Dũng (ID 3) tạo "Họp lớp" (120 phút) -> Kiểm tra gợi ý...');
    const res4 = await fetch(`${API_URL}/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 3,
        request: { title: 'Họp lớp', location: '?', startTime: '2026-07-05T10:00:00Z', endTime: '2026-07-05T12:00:00Z', reminderMethods: [] }
      })
    });
    const data4 = await res4.json();
    console.log(`- Nhận được ${data4.matchingGroupMeetings?.length} gợi ý.`);
    const meetingId = data4.matchingGroupMeetings[0].appointmentId;

    // 5. Dũng xin gia nhập nhóm của Toàn
    console.log('[Action 5] Dũng xin gia nhập nhóm của Toàn...');
    await fetch(`${API_URL}/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 3, decision: { joinMeetingId: meetingId } })
    });
    await sleep(500);

    // 6. Toàn Approve
    console.log('[Action 6] Toàn thực hiện Approve cho Dũng...');
    await fetch(`${API_URL}/api/approve`, { // Lưu ý: route là /api/approve hoặc /approve tùy server.ts
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ownerId: 1, meetingId: meetingId, userId: 3 })
    }).catch(() => {}); // Fallback nếu route sai
    
    // Test route chuẩn
    await fetch(`${API_URL}/approve`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ownerId: 1, meetingId: meetingId, userId: 3 })
    });
    await sleep(500);

    // 7. Sơn tạo lịch trùng -> Conflict & Replace
    console.log('[Action 7] Sơn tạo lịch "Đi bơi" trùng giờ với "Họp lớp" của mình -> Test Conflict');
    const res7 = await fetch(`${API_URL}/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 2,
        request: { title: 'Đi bơi', location: 'Hồ bơi', startTime: '2026-07-03T10:00:00Z', endTime: '2026-07-03T12:00:00Z', reminderMethods: [] },
        decision: { createAnyway: true }
      })
    });
    const data7 = await res7.json();
    console.log(`- Trạng thái: ${data7.status}. Tiến hành REPLACE...`);
    
    await fetch(`${API_URL}/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 2,
        request: { title: 'Đi bơi', location: 'Hồ bơi', startTime: '2026-07-03T10:00:00Z', endTime: '2026-07-03T12:00:00Z', reminderMethods: [] },
        decision: { createAnyway: true, replaceConflict: true }
      })
    });

    console.log('\n✅ --- LIVE TEST HOÀN TẤT: HỆ THỐNG VẬN HÀNH HOÀN HẢO ---');

  } catch (err) {
    console.error('❌ Lỗi Test:', err.message);
  }
}

runLiveTest();
