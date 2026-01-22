const csvData = `
    về,1477
    hk,1406
    lại,1
    tongtai,1062
    toi,938
    để,910
    nt,821
    má,790
    sao,780
    mn,765
    còn,759
    xong,753
    anti,745
    quá,730
    hong,719
    danh,717
    biệt,692
    nhma,670
    học,658
    thấy,645
    ụa,641
    đổi,638
    ròi,627
    ai,622
    dị,621
    ra,617
    dừng,599
    điiii,576
    ông,575
    mấy,557
    phải,545
    hả,541
    nên,530
    nào,524
    cấm,507
    oi,504
    mới,501
    với,499
    nè,481
    luôn,475
    bị,459
    tới,458
    hết,440
    sẽ,440
    nói,433
    như,427
    lên,423
    ủa,421
    thầy,418
    đang,405
    hay,402
    cx,393
    đúng,393
    chắc,393
    qua,390
    tổng,383
    chứ,380
    ơi,378
    kiểu,372
    thoi,365
    tài,365
    vô,364
    trong,357
    đc,350
    giờ,348
    ng,347
    qa,344
    hok,343
    mai,342
    ổng,341
    coi,332
    nữa,324
    lắm,324
    bà,324
    hơn,319
    khong,314
    môn,309
    thi,307
    tại,307
    dô,306
    th,305
    mk,304
    tính,302
    cần,300
    ngtuyen,293
    chỉ,288
    gr,286
    từ,283
    cả,282
    thêm,278
    nếu,276
    lớp,275
    nhiều,270
    ngày,270
    ta,269
    đề,268
    đồ,267
    sau,266
    không,256
    biết,253
    nghĩ,252
    chx,250
    nhớ,248
    nhà,248
    đọc,244
    file,243
    câu,239
    dẫy,239
    vs,238
    hỏi,236
    ýe,235
    tn,235
    biet,232
    gòi,232
    lần,231
    khó,229
    thiệt,228
    muốn,228
    nghe,226
    đầu,222
    vậy,220
    thử,220
    một,219
    vẫn,217
    khi,216
    khác,215
    tự,215
    gửi,214
    code,213
    thể,210
    chơi,209
    omg,207
    đoàn,207
    thôi,207
    xao,206
    chung,206
    sợ,204
    dữ,204
    bài,203
    nhóm,203
    đủ,202
    cô,200
    đặt,195
    lý,194
    chạy,194
    ms,193
    ôn,191
    đứa,191
    điểm,191
    khom,190
    bt,190
    đây,189
    hiểu,187
    nma,187
    ảnh,186
    tưởng,186
    nx,185
    theo,185
    báo,184
    dậy,184
    quên,182
    oop,182
    sáng,182
    vì,182
    ấy,180
    nay,178
    dc,178
    trước,177
    tụi,177
    nhỏ,176
    dễ,174
    ok,174
    bên,173
    lấy,173
    nghĩa,170
    lúc,170
    kia,167
    triêm,167
    hình,167
    dou,165
    kêu,165
    nhau,165
    bữa,164
    định,164
    hồi,163
    dì,162
    troi,162
    luon,161
    tr,159
    nãy,158
    gọi,158
    năm,158
    viết,157
    người,157
    ae,155
    dùng,152
    dừng lại,581
    lại điiii,576
    điiii đã,575
    này là,555
    của hk,517
    là của,505
    nt đổi,495
    danh này,494
    hk cấm,494
    cấm nt,494
    anti biệt,492
    đổi đã,490
    ý là,303
    tổng tài,279
    anti hk,242
    hk đã,196
    nt anti,192
    đã đặt,149
    có thể,145
    đặt biệt,140
    cái đó,139
    ko có,136
    gr này,128
    danh của,127
    mấy cái,126
    troi oi,119
    là cái,119
    là tui,117
    cái này,108
    có 1,101
    đồ án,95
    báo cáo,95
    hình như,84
    tui cũng,83
    cả nhà,82
    tui thấy,81
    ấy là,79
    1 cái,78
    của tui,77
    tui đi,73
    tui là,72
    cho tui,71
    nghĩa đoàn,70
    hong có,70
    ê tui,69
    bạn đã,69
    tui có,68
    thì tui,68
    có cái,67
    à à,66
    cuộc gọi,66
    ê mà,65
    chúng ta,65
    đó là,63
    tham gia,63
    tui làm,62
    triêm đoàn,59
    có j,59
    của mình,59
    tụi mk,59
    quỳnh anh,59
    nó sẽ,59
    kh có,59
    đã tham,59
    gia cuộc,59
    tui nghĩ,58
    mấy đứa,57
    ông triêm,57
    là sao,57
    tui ko,56
    là nó,56
    nó là,56
    làm cái,55
    tr oi,55
    đi học,55
    cái j,55
    cái nào,54
    có gì,54
    ngọc tuyền,53
    thể là,53
    nên là,53
    khó lói,52
    cái gr,52
    cái gì,52
    mà tui,51
    hà đăng,51
    để tui,51
    thì phải,51
    đi chơi,51
    ghim một,51
    một tin,51
    thì nó,50
    cỡ đó,50
    là 1,50
    ê nha,50
    làm gì,49
    luôn á,49
    tui cx,49
    tai sao,49
    sao lai,49
    lai anti,49
    hk the,49
    the mn,49
    google com,49
    cho nó,49
    mn đã,49
    còn lại,48
    lê ngọc,48
    cũng có,48
    đăng khôi,48
    thư ký,48
    là có,48
    cô ấy,48
    có ai,48
    1 lần,47
    đi ngủ,46
    á hả,46
    mà nó,46
    2 cái,46
    nó có,46
    chúng toi,45
    anh ấy,45
    ôn thi,44
    đã gửi,43
    chưa có,43
    có khi,43
    j đó,43
    của cô,43
    gì đó,42
    chx có,42
    của anh,42
    nghĩ là,42
    cái file,42
    mình là,42
    đã đã,42
    a2 tui,42
    nghiên cứu,41
    gửi một,41
    một file,41
    file đính,41
    đính kèm,41
    chủ tịch,41
    đâu có,41
    cũng đc,41
    lấy gốc,40
    mai quỳnh,40
    mọi người,40
    đi ăn,40
`; 


const quotes = [
    "Đây là tính năng, không phải lỗi.",
    "Hôm nay code chạy, ngày mai chưa biết.",
    "Thức đêm mới biết đêm dài, làm đồ án mới biết mình... sai ngành.",
    "Thi xong buồn vì làm bài không được, nhưng nhìn sang cả khoa cũng thế... tự nhiên thấy vui.",
    "Nay OT nha.",
    "Chắc đề thi không có phần này đâu.",
    "Code chạy trên máy tui mà?",
    "Ngủ là cách debug hiệu quả nhất.",
    "Deadline là nguồn cảm hứng bất tận.",
    "kệ đi, đại đại đi."
];