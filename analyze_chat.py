import csv
import json
import os
from collections import Counter
from datetime import datetime

def analyze_chat_log(file_path):
    """
    Phân tích file chat_log.txt và xuất ra báo cáo thống kê.
    """
    # Xác định thư mục chứa file và tạo thư mục output
    base_dir = os.path.dirname(file_path)
    output_dir = os.path.join(base_dir, 'analysis')
    
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    # Cấu trúc dữ liệu thống kê
    stats = {
        "total_messages": 0,
        "user_stats": {},       # Lưu số tin nhắn và số từ của mỗi user
        "hourly_activity": Counter(), # Thống kê theo giờ trong ngày
        "daily_activity": Counter(),  # Thống kê theo ngày
    }

    print("Đang phân tích dữ liệu...")

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            # File sử dụng dấu chấm phẩy (;) làm phân cách
            reader = csv.reader(f, delimiter=';')
            
            # Bỏ qua dòng tiêu đề (Thời gian;Người gửi;Nội dung)
            header = next(reader, None)
            
            for row in reader:
                # Đảm bảo dòng có đủ 3 cột
                if len(row) < 3:
                    continue
                
                timestamp_str = row[0].strip()
                sender = row[1].strip()
                content = row[2].strip()
                
                # Parse thời gian
                try:
                    dt = datetime.strptime(timestamp_str, '%Y-%m-%d %H:%M:%S')
                except ValueError:
                    continue # Bỏ qua nếu lỗi định dạng ngày tháng

                stats["total_messages"] += 1
                
                # 1. Thống kê theo người gửi
                if sender not in stats["user_stats"]:
                    stats["user_stats"][sender] = {"msg_count": 0, "word_count": 0}
                
                stats["user_stats"][sender]["msg_count"] += 1
                stats["user_stats"][sender]["word_count"] += len(content.split())
                
                # 2. Thống kê theo giờ (0-23h)
                stats["hourly_activity"][dt.hour] += 1
                
                # 3. Thống kê theo ngày
                stats["daily_activity"][dt.strftime('%Y-%m-%d')] += 1

    except FileNotFoundError:
        print(f"Lỗi: Không tìm thấy file tại {file_path}")
        return
    except Exception as e:
        print(f"Có lỗi xảy ra: {e}")
        return

    # Sắp xếp dữ liệu để báo cáo
    sorted_users = sorted(stats["user_stats"].items(), key=lambda x: x[1]['msg_count'], reverse=True)
    sorted_hours = sorted(stats["hourly_activity"].items(), key=lambda x: x[1], reverse=True)
    sorted_days = sorted(stats["daily_activity"].items(), key=lambda x: x[1], reverse=True)

    # --- XUẤT FILE JSON ---
    json_output_path = os.path.join(output_dir, 'chat_statistics.json')
    output_data = {
        "summary": {
            "total_messages": stats["total_messages"],
            "total_users": len(stats["user_stats"])
        },
        "rankings": {
            "users_by_messages": sorted_users,
            "busiest_hours": sorted_hours,
            "busiest_days": sorted_days
        }
    }
    
    with open(json_output_path, 'w', encoding='utf-8') as json_file:
        json.dump(output_data, json_file, indent=4, ensure_ascii=False)

    # --- XUẤT FILE TXT (Báo cáo dễ đọc) ---
    txt_output_path = os.path.join(output_dir, 'chat_report.txt')
    with open(txt_output_path, 'w', encoding='utf-8') as txt_file:
        txt_file.write("=== BÁO CÁO PHÂN TÍCH HOẠT ĐỘNG CHAT ===\n\n")
        txt_file.write(f"Tổng số tin nhắn: {stats['total_messages']}\n")
        txt_file.write(f"Số thành viên tham gia: {len(stats['user_stats'])}\n\n")
        
        txt_file.write("1. THỐNG KÊ THÀNH VIÊN (Xếp theo số tin nhắn):\n")
        txt_file.write(f"{'Tên':<25} | {'Tin nhắn':<10} | {'Số từ':<10}\n")
        txt_file.write("-" * 50 + "\n")
        for user, data in sorted_users:
            txt_file.write(f"{user:<25} | {data['msg_count']:<10} | {data['word_count']:<10}\n")
        
        txt_file.write("\n2. TOP 5 KHUNG GIỜ HOẠT ĐỘNG SÔI NỔI NHẤT:\n")
        for hour, count in sorted_hours[:5]:
            txt_file.write(f"   - {hour}h: {count} tin nhắn\n")
            
        txt_file.write("\n3. TOP 5 NGÀY NHẮN TIN NHIỀU NHẤT:\n")
        for day, count in sorted_days[:5]:
            txt_file.write(f"   - {day}: {count} tin nhắn\n")

    print(f"Phân tích hoàn tất!")
    print(f"Kết quả đã được lưu tại thư mục: {output_dir}")
    print(f"- JSON: {os.path.basename(json_output_path)}")
    print(f"- TXT:  {os.path.basename(txt_output_path)}")

if __name__ == "__main__":
    # Đường dẫn tuyệt đối tới file log
    log_file = r"analysis\chat_log.txt"
    
    if os.path.exists(log_file):
        analyze_chat_log(log_file)
    else:
        # Thử tìm file ở thư mục hiện tại nếu đường dẫn tuyệt đối không đúng
        current_dir_file = "chat_log.txt"
        if os.path.exists(current_dir_file):
            analyze_chat_log(current_dir_file)
        else:
            print(f"Không tìm thấy file chat_log.txt tại {log_file} hoặc thư mục hiện tại.")