import json
import os
from datetime import datetime

# Cấu hình đường dẫn
# Bạn hãy tạo thư mục này và bỏ các file .json (message_1.json, ...) vào đây
INPUT_FOLDER = 'analysis/log_chat_raw' 
OUTPUT_FILE = 'analysis/chat_log.txt'

def fix_encoding(text):
    """
    Sửa lỗi font tiếng Việt khi export từ Facebook.
    Facebook thường encode tiếng Việt dưới dạng Latin1 thay vì UTF-8.
    """
    if text is None:
        return ""
    try:
        return text.encode('latin1').decode('utf-8')
    except (UnicodeEncodeError, UnicodeDecodeError):
        return text

def process_messages():
    # Kiểm tra thư mục input
    if not os.path.exists(INPUT_FOLDER):
        os.makedirs(INPUT_FOLDER)
        print(f"⚠️ Đã tạo thư mục '{INPUT_FOLDER}'.")
        print(f"👉 Vui lòng copy các file .json (ví dụ: message_1.json) vào thư mục '{INPUT_FOLDER}' rồi chạy lại script.")
        return

    # Lấy danh sách file json
    files = [f for f in os.listdir(INPUT_FOLDER) if f.endswith('.json')]
    if not files:
        print(f"⚠️ Không tìm thấy file .json nào trong thư mục '{INPUT_FOLDER}'.")
        return

    print(f"📂 Tìm thấy {len(files)} file. Đang xử lý...")
    
    all_messages = []

    for filename in files:
        filepath = os.path.join(INPUT_FOLDER, filename)
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Facebook JSON chứa danh sách tin nhắn trong key 'messages'
            msgs = data.get('messages', [])
            
            for msg in msgs:
                # 1. Xử lý thời gian (timestamp_ms)
                ts = msg.get('timestamp_ms', 0)
                dt = datetime.fromtimestamp(ts / 1000.0)
                time_str = dt.strftime('%Y-%m-%d %H:%M:%S')
                
                # 2. Xử lý tên người gửi
                sender = fix_encoding(msg.get('sender_name', 'Unknown'))
                
                # 3. Xử lý nội dung
                content = msg.get('content')
                
                if content:
                    content = fix_encoding(content)
                    
                    # --- LỌC TIN NHẮN HỆ THỐNG ---
                    ignored_phrases = [
                        "đã bày tỏ cảm xúc",
                        "đã đặt biệt danh",
                        "đã đã đặt biệt danh",
                        "đã thay đổi ảnh nhóm",
                        "đã tham gia cuộc gọi",
                        "đã bắt đầu cuộc gọi",
                        "đã kết thúc cuộc gọi",
                        "đã thêm",
                        "đã rời khỏi",
                        "đã đặt tên nhóm",
                        "đã ghim",
                        "đã bỏ ghim"
                    ]
                    
                    if any(phrase in content.lower() for phrase in ignored_phrases):
                        continue
                else:
                    # Nếu không có text, kiểm tra các loại khác
                    if 'photos' in msg:
                        content = "[Hình ảnh]"
                    elif 'sticker' in msg:
                        content = "[Sticker]"
                    elif 'files' in msg:
                        content = "[File]"
                    elif 'videos' in msg:
                        content = "[Video]"
                    elif 'audio_files' in msg:
                        content = "[Audio]"
                    else:
                        continue
                    continue

                # Xóa ký tự xuống dòng để đảm bảo format 1 dòng 1 tin nhắn
                content = content.replace('\n', ' ').replace('\r', '')
                
                # Lưu vào danh sách tạm
                all_messages.append({
                    'timestamp': ts,
                    'line': f"{time_str};{sender};{content}"
                })
                
        except Exception as e:
            print(f"❌ Lỗi khi đọc file {filename}: {e}")

    # Sắp xếp tin nhắn theo thời gian tăng dần (Cũ -> Mới)
    print("🔄 Đang sắp xếp tin nhắn...")
    all_messages.sort(key=lambda x: x['timestamp'])

    # Ghi ra file kết quả
    print(f"💾 Đang ghi vào {OUTPUT_FILE}...")
    try:
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            # Ghi header
            f.write("Thời gian;Người gửi;Nội dung\n")
            
            for item in all_messages:
                f.write(item['line'] + "\n")
        
        print(f"✅ Hoàn tất! Tổng cộng {len(all_messages)} tin nhắn đã được lưu.")
        
    except Exception as e:
        print(f"❌ Lỗi khi ghi file: {e}")

if __name__ == "__main__":
    process_messages()
