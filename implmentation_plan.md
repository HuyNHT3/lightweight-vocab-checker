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

## Phase 5.2: Basic Access Control (Security) [Completed]
- [x] Thiết lập file `js/config.js` lưu trữ passcode.
- [x] Xây dựng giao diện Login Overlay (frame nhập mã).
- [x] Thực hiện logic kiểm tra passcode và duy trì trạng thái đăng nhập trong session.

## Phase 6: Minor update

1.  **Thêm ý nghĩa**: tôi muốn ở màn hình trắc nghiệm ngoài việc hiển thị example, ở phía trên phải hiển thị ý nghĩa của từ đó.
2.  **add thêm icon speaker phục vụ việc đọc**: tôi muốn thêm một speaker để đọc toàn bộ example, speaker 2, mới, hiển thị sát, cuối example để khi click vào sẽ đọc toàn bộ câu, speaker icon cũ hãy sửa lại nằm sát chổ hiển thị IPA. (DONE)
3.  **Fix bug**: từ vựng có trong example không bị che trong một vài trường hợp. (DONE)
vi dụ: limit -> limited( không được che)
share -> shares (không được che) -> Giải pháp: Sử dụng strict word boundary \\\\b trong Regex kết hợp escape ký tự đặc biệt.

## Phase 7: Merge Topic for test (Chức năng gộp nhiều chủ đề kiểm tra)

### 1. Objective (Mục tiêu)
Phát triển tính năng cho phép người dùng lựa chọn và gộp cùng lúc nhiều bộ từ vựng (chủ đề) khác nhau thành một bài kiểm tra tổng hợp duy nhất. Hệ thống sẽ kết hợp toàn bộ danh sách từ của các chủ đề được chọn, xáo trộn ngẫu nhiên và cho phép kiểm tra với số lượng câu hỏi tùy biến, đồng thời hiển thị kết quả đầy đủ trên trang `result.html` hiện có.

---

### 2. User Flow & Core Requirements (Luồng người dùng & Yêu cầu cốt lõi)
1. **Chuyển đổi chế độ (Mode Switching):**
   - Trên màn hình `index.html`, cung cấp nút gạt/toggle hoặc nút bấm chuyển đổi giữa 2 chế độ:
     - **Chế độ đơn (Single Topic):** Mặc định, chọn 1 card chủ đề duy nhất.
     - **Chế độ gộp (Merge Topics):** Bật tính năng chọn nhiều chủ đề.
2. **Hiển thị Checkbox trên Card chủ đề:**
   - Khi ở Chế độ gộp:
     - Mỗi card chủ đề hiển thị một checkbox ở góc trên cùng bên trái.
     - Người dùng có thể click trực tiếp vào checkbox hoặc click vào toàn bộ card để chọn / bỏ chọn (toggle).
     - Card được chọn sẽ có hiệu ứng viền sáng (highlight) và trạng thái `checked`.
   - Cung cấp thêm tiện ích:
     - Hiển thị badge tóm tắt: `"Đã chọn: X chủ đề (Tổng Y từ)"`.
     - Nút tiện ích: **"Chọn tất cả" (Select All)** và **"Bỏ chọn tất cả" (Clear All)**.
3. **Bảo toàn trạng thái khi Tìm kiếm & Phân trang:**
   - Danh sách chủ đề đã chọn (`selectedTopicIds`) phải được quản lý ở State cấp trang (Set hoặc Array).
   - Khi người dùng gõ từ khóa tìm kiếm (`#topic-search`) hoặc chuyển trang (`#pagination`), trạng thái checkbox của các chủ đề đã tick phải được giữ nguyên.
4. **Tính toán số lượng câu hỏi linh hoạt:**
   - Khi danh sách chủ đề thay đổi, hệ thống tự động tính tổng số từ của tất cả các chủ đề đang chọn (`totalWords = sum(words_in_selected_topics)`).
   - Cập nhật thuộc tính của ô input `#word-count`:
     - `max = totalWords`
     - Giá trị mặc định: giữ nguyên giá trị người dùng nhập (nếu `<= totalWords`) hoặc tự động đặt thành `totalWords`.
5. **Khởi tạo và làm bài kiểm tra (`quiz.html`):**
   - Người dùng bấm nút **"Bắt đầu"**.
   - Kiểm tra validation: Nếu chưa chọn chủ đề nào, hiển thị thông báo yêu cầu chọn ít nhất 1 chủ đề.
   - Dữ liệu cấu hình được lưu vào `localStorage` qua `StorageService`.
   - `quiz-engine.js` fetch song song tất cả các file JSON của các chủ đề đã chọn, gộp các mảng từ lại, loại bỏ từ trùng lặp (nếu cần), xáo trộn ngẫu nhiên (Fisher-Yates) và lấy đúng số lượng câu hỏi yêu cầu.
6. **Thống kê & Báo cáo kết quả (`result.html`):**
   - Tận dụng 100% trang `result.html` hiện hành.
   - Bảng kết quả hiển thị chi tiết từng từ, trạng thái Đúng/Sai/Bỏ qua, hỗ trợ nghe âm thanh (TTS/Local audio) và in ấn kết quả bình thường.
   - Thêm thông tin tóm tắt tên các chủ đề đã gộp trong tiêu đề hoặc mô tả kết quả.

---

### 3. Data Architecture & Specifications (Kiến trúc dữ liệu)

#### 3.1. Cấu trúc lưu trữ cấu hình Quiz (`StorageService`)
Nâng cấp cấu trúc `vocabQuizConfig` trong `localStorage`:
```json
{
  "vocabSet": "letstalk2lesson12.json", 
  "vocabSets": [
    "letstalk2lesson12.json",
    "letstalk2lesson13.json"
  ],
  "topicTitles": [
    "Let's talk 2, Lesson 12",
    "Let's talk 2, Lesson 13"
  ],
  "isMerged": true,
  "wordCount": 45,
  "quizMode": "normal",
  "timestamp": "2026-11-13T14:30:00.000Z"
}
```
*Lưu ý:* Vẫn giữ trường `vocabSet` (trỏ đến chủ đề đầu tiên) để đảm bảo tính tương thích ngược tuyệt đối (backward compatibility).

#### 3.2. Cấu trúc lưu trữ kết quả (`vocabQuizHistory`)
```json
{
  "timestamp": "2026-11-13T14:45:00.000Z",
  "vocabSet": "Gộp 2 chủ đề: Lesson 12, Lesson 13",
  "totalQuestions": 45,
  "correctAnswers": 40,
  "details": [ ... ]
}
```

---

### 4. Technical Implementation Details (Chi tiết kỹ thuật từng Module)

#### 4.1. `index.html` & `css/style.css`
* **Giao diện điều khiển:**
  - Thêm một thanh công cụ phía trên danh sách chủ đề:
    - Toggle Switch: `[ Chế độ gộp chủ đề ]`
    - Nhóm nút thao tác nhanh: `[ Chọn tất cả ]` / `[ Bỏ chọn ]` (chỉ hiển thị khi bật chế độ gộp).
    - Bộ đếm thông tin: `"Đã chọn: <span id="selected-count">0</span> chủ đề (<span id="total-words-count">0</span> từ)"`.
* **CSS:**
  - Class `.topic-card.merge-mode`: Thêm padding phù hợp để không che nội dung.
  - Checkbox tùy biến `.topic-checkbox`:
    - Vị trí: `position: absolute; top: 12px; left: 12px; width: 20px; height: 20px; z-index: 2; cursor: pointer; accent-color: var(--accent);`.
  - Hiệu ứng viền sáng: Khi card có checkbox checked, áp dụng viền `border-color: var(--accent)` và background highlight tương tự card được chọn.
  - Styling thanh Toggle switch hiện đại, đồng bộ phong cách Dark Theme hiện tại.

#### 4.2. `js/index.js`
* **Quản lý State:**
  - `let isMergeMode = false;`
  - `let selectedTopicIds = new Set();` (sử dụng `Set` để kiểm tra nhanh và tránh trùng ID).
  - `const topicWordCountCache = new Map();` (lưu cache số từ của mỗi file json sau lần fetch đầu tiên để tránh fetch nhiều lần).
* **Render Logic:**
  - Cập nhật hàm `renderCards()`:
    - Nếu `isMergeMode === true`: chèn checkbox vào góc trên bên trái của mỗi card. Gán trạng thái `checked = selectedTopicIds.has(topic.id)`.
    - Lắng nghe sự kiện `click` và `change` trên card / checkbox:
      - Toggle ID trong `selectedTopicIds`.
      - Cập nhật giao diện card (thêm/bỏ class `.selected`).
      - Gọi hàm cập nhật tổng số từ `updateMergedWordCount()`.
    - Nếu `isMergeMode === false`: giữ nguyên hành vi click chọn duy nhất 1 card.
* **Hàm `updateMergedWordCount()`:**
  - Lặp qua các ID trong `selectedTopicIds`, nếu chưa có trong cache thì fetch file để lấy `words.length`.
  - Tính tổng số từ khả dụng `totalAvailableWords`.
  - Cập nhật `#word-count`: `max = totalAvailableWords`, tự điều chỉnh `value = Math.min(value, totalAvailableWords)` hoặc gợi ý toàn bộ.
  - Cập nhật hiển thị badge số lượng đã chọn.
* **Hàm khởi động Quiz (`startBtn.click`):**
  - Kiểm tra điều kiện:
    - Nếu `isMergeMode`: yêu cầu `selectedTopicIds.size > 0`. Nếu rỗng, hiển thị cảnh báo: *"Vui lòng chọn ít nhất một chủ đề để gộp!"*.
    - Nếu không ở Merge Mode: yêu cầu có `selectedTopicId`.
  - Đóng gói config và gọi `StorageService.saveQuizConfig(config)`.
  - Chuyển hướng tới `quiz.html`.

#### 4.3. `js/storage-service.js`
* Bổ sung / chuẩn hóa các phương thức lưu config:
  - Cho phép lưu mảng `vocabSets`, mảng tiêu đề `topicTitles`, và cờ `isMerged`.

#### 4.4. `js/quiz-engine.js`
* Cập nhật hàm `loadQuizData()`:
  - Kiểm tra xem config có `isMerged === true` hoặc `Array.isArray(config.vocabSets)` hay không.
  - **Trường hợp Gộp (Merged Mode):**
    - Sử dụng `Promise.all(config.vocabSets.map(filename => VocabService.fetchVocabSet(filename)))` để tải toàn bộ các file JSON đồng thời.
    - Gộp tất cả các mảng `words` từ các response:
      ```javascript
      let allWords = [];
      vocabSetsData.forEach((set, index) => {
          const topicName = config.topicTitles ? config.topicTitles[index] : `Chủ đề ${index + 1}`;
          set.words.forEach(w => {
              allWords.push({ ...w, sourceTopic: topicName });
          });
      });
      ```
    - Khử trùng lặp (Deduplication): Loại bỏ các từ trùng lặp dựa trên thuộc tính `word.toLowerCase().trim()`.
    - Xáo trộn toàn bộ ngân hàng câu hỏi bằng thuật toán Fisher-Yates (`shuffleArray`).
    - Cắt mảng lấy số lượng câu hỏi theo `totalQuestions = config.wordCount`.
  - **Trường hợp Đơn lẻ (Single Mode):**
    - Giữ nguyên luồng xử lý hiện tại để đảm bảo tính ổn định.

#### 4.5. `js/result-renderer.js`
* Kiểm tra `latestResult.vocabSet`:
  - Nếu là bài test gộp, hiển thị nhãn `"Chủ đề: Gộp [X] chủ đề: ..."` để người dùng nắm rõ ngữ cảnh bài kiểm tra.
  - Toàn bộ cơ chế render chi tiết câu hỏi, âm thanh TTS, in ấn giữ nguyên hoạt động bình thường.

---

### 5. Edge Cases & Exception Handling (Xử lý các tình huống biên)
| STT | Tình huống | Cách xử lý |
| :---: | :--- | :--- |
| 1 | Người dùng không chọn card nào rồi bấm "Bắt đầu" | Hiển thị alert/toast cảnh báo yêu cầu chọn ít nhất 1 chủ đề, không chuyển trang. |
| 2 | Chọn các chủ đề ở nhiều trang phân trang khác nhau | State `selectedTopicIds` được lưu độc lập với `currentPage`, khi quay lại trang cũ checkbox vẫn ở trạng thái checked. |
| 3 | Tìm kiếm chủ đề -> tick chọn -> xóa ô tìm kiếm | Thẻ đã chọn vẫn giữ nguyên trong `selectedTopicIds` và tổng số từ không bị giảm. |
| 4 | Nhập số lượng câu hỏi lớn hơn tổng số từ gộp | Ô input tự động clamp về giá trị tối đa `max = totalAvailableWords`. |
| 5 | Một trong các file JSON bị lỗi nạp hoặc 404 | Bắt `try/catch` trong `Promise.allSettled` hoặc `Promise.all`, cảnh báo cụ thể file gặp sự cố và bỏ qua hoặc yêu cầu thử lại. |
| 6 | Trùng từ giữa các chủ đề khác nhau | Tự động deduplicate theo từ vựng viết thường để tránh câu hỏi trùng lặp trong cùng 1 bài test. |
| 7 | Bật/Tắt chế độ Merge qua lại | Khi tắt Merge Mode, chuyển về trạng thái chọn đơn của card đầu tiên, ẩn các checkbox để tránh nhầm lẫn UX. |

---

### 6. Development Checklist (Danh sách công việc triển khai)
- [x] **Task 7.1: UI & Styling (Giao diện & CSS)**
  - [x] Thiết kế Toggle switch chuyển đổi chế độ Single / Merge trên `index.html`.
  - [x] Thêm khu vực hiển thị số lượng chủ đề & từ đã chọn.
  - [x] Thêm nút "Chọn tất cả" và "Bỏ chọn tất cả".
  - [x] Thêm CSS cho checkbox góc trên bên trái card và hiệu ứng active khi chọn.
- [x] **Task 7.2: Logic chọn chủ đề tại `js/index.js`**
  - [x] Khởi tạo state `isMergeMode`, `selectedTopicIds`, `topicWordCountCache`.
  - [x] Cập nhật hàm `renderCards()` để render checkbox khi `isMergeMode = true`.
  - [x] Xử lý sự kiện click card / checkbox để toggle chọn nhiều.
  - [x] Viết hàm tính toán và cập nhật số từ tối đa (`updateMergedWordCount`).
  - [x] Đảm bảo giữ nguyên các lựa chọn khi tìm kiếm hoặc chuyển trang.
  - [x] Xử lý validation khi bấm nút "Bắt đầu" và lưu config mới.
- [x] **Task 7.3: Cập nhật `js/storage-service.js`**
  - [x] Hỗ trợ lưu trữ và lấy cấu hình bài quiz với mảng `vocabSets`.
- [x] **Task 7.4: Nâng cấp Động cơ Quiz `js/quiz-engine.js`**
  - [x] Hỗ trợ `Promise.all` tải song song nhiều bộ từ vựng.
  - [x] Triển khai gộp mảng từ và loại bỏ trùng lặp (deduplication).
  - [x] Trộn câu hỏi và lấy đúng số lượng theo cấu hình.
- [x] **Task 7.5: Kiểm thử và tinh chỉnh kết quả `js/result-renderer.js`**
  - [x] Kiểm tra hiển thị thông tin bài quiz gộp trên trang kết quả.
  - [x] Xác nhận tính năng nghe âm thanh và in kết quả hoạt động tốt với bài thi gộp.
- [x] **Task 7.6: Kiểm thử toàn diện (QA & Edge Cases)**
  - [x] Kiểm thử chuyển trang, tìm kiếm, chọn tất cả, bỏ chọn.
  - [x] Kiểm thử Trick mode (hạn giờ + anti-cheat) trên bài thi gộp chủ đề.

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
