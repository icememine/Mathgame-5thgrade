# Toán 5 vui

Trò chơi luyện Toán lớp 5 kiểu Duolingo, bám theo **SGK Toán 5, tập một (Cánh Diều)**, **Chương I, bài 6–19**. Giao diện tiếng Việt, chạy hoàn toàn trên trình duyệt, không cần máy chủ.

## Chơi thử

Mở `index.html` bằng trình duyệt (bấm đúp là được), hoặc chạy một máy chủ tĩnh:

```sh
python3 -m http.server 8000   # rồi mở http://localhost:8000
```

Tiến độ (XP, sao, chuỗi ngày học) được lưu trong `localStorage` của trình duyệt trên máy đó.

## Nội dung

| Phần | Bài | Chủ đề |
|---|---|---|
| 1 · Tỉ số và các bài toán | 6–10 | Tỉ số, tìm hai số khi biết tổng/hiệu và tỉ số, quan hệ phụ thuộc, luyện tập |
| 2 · Hỗn số và số thập phân | 11–16 | Hỗn số, phân số thập phân, số thập phân (phần mười, phần trăm, phần nghìn), hàng của số thập phân |
| 3 · So sánh và làm tròn | 17–19 | Số thập phân bằng nhau, so sánh, làm tròn số thập phân |

Mỗi bài có 4–8 **bộ sinh câu hỏi**: mỗi lượt chơi đều ra số mới, nên học sinh không thể học thuộc đáp án. Mỗi câu có lời giải theo đúng cách trình bày của SGK và ghi nguồn (bài, trang).

Các dạng câu hỏi: chọn đáp án, đúng/sai, điền số (số thập phân, phân số, hỗn số), so sánh `> < =`, nối cặp, sắp xếp thứ tự. Có hình minh hoạ: sơ đồ đoạn thẳng, băng giấy, lưới 100 ô, hình tròn, tia số, thước đo, bảng số liệu.

## Cách chơi

- **Lộ trình học:** 14 bài, mỗi phần có một rương ôn tập, cuối chương có bài kiểm tra 12 câu. Mỗi bài 8 câu, 5 tim; câu sai sẽ được hỏi lại ở cuối lượt.
- **Luyện tự do:** câu hỏi liên tục cho từng bài hoặc trộn các bài đã học, không mất tim.
- **Nhiệm vụ hằng ngày, chuỗi ngày học, sao (1–3) cho mỗi bài.**
- **Hồ sơ:** thống kê, các bài “cần ôn lại”, bật/tắt âm thanh, mở khoá tất cả bài (cho phụ huynh, thầy cô).

## Cấu trúc mã

```
index.html        khung trang
css/style.css     giao diện (sáng/tối)
js/core.js        số học, định dạng số kiểu Việt Nam, đọc số bằng chữ, kiểm tra đáp án, hình SVG
js/lessons.js     nội dung: bộ sinh câu hỏi cho bài 6–19, phần ghi nhớ
js/app.js         màn hình, lộ trình, cơ chế bài học, lưu tiến độ
tests/            kiểm thử
```

Thêm bài mới: viết các hàm sinh câu hỏi trong `js/lessons.js` (dùng `sel`, `tf`, `cmp`, `inp`, `match`, `order`) rồi thêm một mục vào `LESSONS`.

## Kiểm thử

```sh
node tests/generators.test.js   # chạy mỗi bộ sinh câu hỏi 400 lần, kiểm tra đáp án và cách đọc số theo SGK
node tests/smoke.mjs [thư-mục-ảnh]   # chơi thử toàn bộ trong Chromium (cần gói playwright)
```
