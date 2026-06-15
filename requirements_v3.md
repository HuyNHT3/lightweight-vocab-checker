# Vocabulary Quiz Website - Requirements (v3 - Security Compliant)

## 1. Overview

### Mục tiêu
Website tĩnh giúp sinh viên luyện từ vựng bằng cách nhập đáp án dựa trên gợi ý.

- Công nghệ: HTML, CSS, JavaScript (vanilla), JSON
- Deploy: GitHub Pages

---

## 2. Architecture

```
/root
 ├── index.html
 ├── quiz.html
 ├── result.html
 ├── /data
 ├── /js
 ├── /css
 └── /assets
```

---

## 3. Data Structure (JSON)

```json
{
  "topic": "IELTS Vocabulary",
  "description": "Academic words",
  "words": [
    {
      "word": "analyze",
      "type": "verb",
      "ipa": "/ˈænəˌlaɪz/",
      "meaning": "to examine something carefully",
      "example": "The scientist will analyze the data carefully.",
      "audio": "/assets/audio/analyze.mp3"
    }
  ]
}
```

---

## 4. Functional Requirements

### 4.1 Vocabulary Set
- Load danh sách JSON từ `/data`
- Chọn bộ từ → nhập số câu → chọn mode

### 4.2 Quiz Screen

#### Hiển thị
- Progress
- IPA
- Example (mask từ)
- Input

#### Mask logic
```js
const regex = new RegExp(`\b${word}\b`, "gi");
example.replace(regex, "****");
```

#### Answer rules
- Case insensitive
- Trim whitespace
- Exact spelling required
- Empty input = sai

### 4.3 Behavior
- Random N câu
- Skip allowed
- Retry unlimited
- Enter = submit

### 4.4 Result

Hiển thị đầy đủ:
- Word (UPPERCASE)
- IPA
- Meaning
- Example
- Audio button

---

## 5. Trick Mode

- Timer = số câu × 30s
- Countdown hiển thị

### Anti-cheat
- visibilitychange
- blur

### Vi phạm
- 3 warning
- Lần 4 → auto submit

---

## 6. Audio

- Chỉ hiển thị ở Result
- Local file only
- Fail → "Audio not available"

---

## 7. History

- localStorage
- max 10 records

---

## 8. Flow

Select Set → Enter Count → Choose Mode → Quiz → Result

---

## 9. Input UX

- Enter submit
- Last question → confirm popup

---

## 10. Deployment

- JSON, JS, CSS, audio đều nằm trong repo
- Fetch local path only

---

## 11. Security & Compliance (NEW - CRITICAL)

### 11.1 No External Dependency

- Không sử dụng:
  - CDN (Bootstrap, Tailwind, etc.)
  - Google Fonts
  - Third-party API
- Tất cả resource phải là local

### 11.2 Data Safety

- Không sử dụng code nội bộ công ty
- Không dùng API nội bộ
- Không chứa:
  - endpoint nội bộ
  - token / password
  - config thực tế

### 11.3 Naming Convention

- Tên biến và function phải generic

✅ Ví dụ:
- QuizApp
- VocabService

❌ Không dùng:
- tên liên quan project công ty

### 11.4 Repository Policy

- Repo có thể public nếu:
  - code tự viết
  - không chứa business logic nội bộ

### 11.5 Risk Awareness

- GitHub KHÔNG scan logic code để detect copy
- Tuy nhiên công ty có thể scan nội bộ
- Rủi ro chính là data leakage

---

## 12. MVP

- Load JSON
- Quiz
- Answer check
- Result
- Timer

---

## 13. Notes

- Mask dùng word boundary
- Anti-cheat basic only
- Audio phải local để tránh CORS/security issue
