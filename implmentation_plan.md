# Implementation Plan - Vocabulary Quiz Website

This document outlines the step-by-step execution strategy for building the lightweight vocabulary checker, ensuring compliance with security and architectural guidelines.

## Phase 1: Project Foundation & Static Structure

1.  **Directory Setup**: Create the local folder structure.
    - `/data`: For JSON vocabulary sets.
    - `/js`: For modular JavaScript logic.
    - `/css`: For custom styling (no external frameworks).
    - `/assets/audio`: For local `.mp3` files.
2.  **HTML Scaffolding**: Create the three primary pages.
    - `index.html`: Selection screen (Set, Count, Mode).
    - `quiz.html`: The active quiz interface.
    - `result.html`: Post-quiz summary and audio playback.
3.  **Base Styling**: Create `css/style.css` with a responsive layout. Use standard system fonts (Arial, Helvetica, sans-serif) to avoid external Google Fonts dependencies.

## Phase 2: Data & Core Services

1.  **Mock Data**: Create a sample `data/default.json` following the specified schema to test fetching logic.
2.  **VocabService (`js/vocab-service.js`)**:
    - Implement `fetch` calls to local JSON files.
    - Handle error states if a file is missing or invalid.
3.  **StorageService (`js/storage-service.js`)**:
    - Wrapper for `localStorage` to save/retrieve quiz history (max 10 records).
    - Logic to pass quiz configuration (mode, word count) between pages.

## Phase 3: Quiz Engine Development

1.  **Quiz Logic (`js/quiz-engine.js`)**:
    - **Initialization**: Randomize $N$ words from the selected set.
    - **Masking**: Implement the Regex logic: `new RegExp('\\b' + word + '\\b', "gi")` to mask examples.
    - **Answer Validation**: Implement trim, case-insensitivity, and exact spelling checks.
2.  **Input UX**:
    - Map "Enter" key to the submit action.
    - Implement "Skip" functionality.
    - Add a confirmation popup for the final question.

## Phase 4: Trick Mode & Anti-Cheat

1.  **Timer Module**:
    - Calculate `totalTime = count * 30s`.
    - Implement a countdown that triggers auto-submit on expiration.
2.  **Anti-Cheat Implementation**:
    - Add event listeners for `visibilitychange` and `window.blur`.
    - Track warning counts in a local state variable.
    - Implement auto-submit logic upon the 4th violation.

## Phase 5: Results & Audio (pendding implementation )

1.  **Result Rendering**:
    - Map the session results to the UI in `result.html`.
    - Ensure words are displayed in `UPPERCASE`.
2.  **Audio Integration**:
    - Use the HTML5 `<audio>` element.
    - Point `src` to local `/assets/audio/` paths.
    - Implement `onerror` handling to display "Audio not available" if the local file is missing.
sử dụng kết quả của phase 5.1 tích hợn vào speaker
# Phase 5.1: Text-to-Speech Integration (mở rộng từ 5.)

## 1. Objective
Tích hợp tính năng chuyển đổi văn bản thành giọng nói (Text-to-Speech) vào ứng dụng để hỗ trợ người dùng luyện nghe và cải thiện kỹ năng phát âm mà không cần sử dụng dịch vụ bên thứ ba hay backend.

## 2. Functional Requirements
*   **Core Technology:** Sử dụng Web Speech API có sẵn trên trình duyệt.
*   **Key Features:**
    *   **Playback:** Kích hoạt phát âm nội dung văn bản thông qua tương tác người dùng (Click).
    *   **Language Support:** Ưu tiên hỗ trợ giọng đọc `en-US` hoặc các tùy chọn giọng phù hợp.
    *   **Control:** Điều khiển được các thông số `rate` (tốc độ) và `pitch` (âm độ).
    *   **Interrupt:** Hỗ trợ tính năng dừng phát âm ngay lập tức (Stop/Cancel).

## 3. Technical Constraints
*   **Zero-Dependency:** Không sử dụng thư viện bên thứ ba (npm/external scripts).
*   **Client-side Only:** Tính năng hoạt động hoàn toàn trên trình duyệt, không yêu cầu API Key hay Server-side.
*   **Compatibility:** Hỗ trợ tốt trên các trình duyệt modern (Chrome, Edge, Firefox, Safari).
*   **Performance:** Ưu tiên độ trễ thấp thông qua `SpeechSynthesisUtterance` interface.

## 4. User Flow
1.  **Input:** Người dùng chọn hoặc nhập văn bản.
2.  **Trigger:** Nhấn nút **Play**.
3.  **Process:** Trình duyệt xử lý giọng đọc từ hệ thống/trình duyệt.
4.  **Audio Output:** Phát âm thanh trực tiếp tới thiết bị người dùng.
5.  **Stop:** Nhấn nút **Stop** để ngắt quá trình đọc nếu cần.

## 5. Implementation Notes
*   **User Interaction Policy:** Đảm bảo hàm `speak()` được gọi sau hành động của người dùng để tuân thủ chính sách tự động phát âm của trình duyệt.
*   **Async Loading:** Sử dụng sự kiện `onvoiceschanged` để đảm bảo danh sách giọng đọc được nạp đầy đủ trước khi thực hiện các thiết lập tùy chỉnh (nếu có).

## 6. Development Checklist
- [x] Nghiên cứu và thử nghiệm Web Speech API qua Browser Console.
- [x] Xây dựng hàm `speak()` và `stop()` cơ bản.
- [x] Thiết kế giao diện (UI) nút Play/Stop.
- [x] Kiểm tra tính tương thích và xử lý lỗi trên các trình duyệt mục tiêu.

## Phase 7: Basic Access Control (Security)
- [x] Thiết lập file `js/config.js` lưu trữ passcode.
- [x] Xây dựng giao diện Login Overlay (frame nhập mã).
- [x] Thực hiện logic kiểm tra passcode và duy trì trạng thái đăng nhập trong session.

## Phase 6: Compliance & Final Review

1.  **Dependency Audit**: Verify no URLs point to external CDNs or APIs in HTML/CSS/JS.
2.  **Naming Convention Check**: Ensure all functions and variables are generic (e.g., `checkAnswer`, `startTimer`).
3.  **Data Scrubbing**: Confirm no internal company terminology or mock internal endpoints remain in the code.

## Milestones

- **M1**: Basic page navigation and JSON loading working.
- **M2**: Quiz engine functional with word masking.
- **M3**: Trick Mode (Timer + Anti-cheat) integrated.
- **M4**: Results page with audio and history storage.
- **M5**: Security audit and GitHub Pages deployment.

## Risk Mitigation

| Risk | Mitigation |
| :--- | :--- |
| CORS Issues | Ensure all fetches are relative paths; test using a local live server. |
| Local Audio Missing | Use the `onerror` event to gracefully degrade the UI. |
| Data Leakage | Perform a final grep/search for internal keywords before any public push. |
```

This plan ensures that you build the application incrementally, starting with the core data flow and ending with the specialized security and "Trick Mode" features. Let me know if you would like to start implementing any specific module!

<!--
[PROMPT_SUGGESTION]Generate the HTML structure for index.html and quiz.html following the requirements.[/PROMPT_SUGGESTION]
[PROMPT_SUGGESTION]Create the JavaScript logic for the word masking and quiz engine.[/PROMPT_SUGGESTION]
