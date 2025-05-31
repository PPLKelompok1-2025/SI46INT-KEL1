<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Certificate of Completion</title>
    <style type="text/css">
        body {
            font-family: 'Helvetica', sans-serif;
            color: #333;
            text-align: center;
            background-color: #fff;
            margin: 0;
            padding: 0;
        }
        .certificate {
            width: 800px;
            height: 600px;
            margin: 0 auto;
            padding: 20px;
            border: 15px solid #4f46e5;
            position: relative;
            background-color: #fff;
        }
        .certificate-header {
            font-size: 36px;
            font-weight: bold;
            margin-top: 50px;
            margin-bottom: 20px;
            color: #4f46e5;
        }
        .certificate-title {
            font-size: 24px;
            margin-bottom: 40px;
        }
        .certificate-body {
            font-size: 20px;
            line-height: 1.5;
            margin-bottom: 40px;
            padding: 0 50px;
        }
        .student-name {
            font-size: 32px;
            font-weight: bold;
            color: #4f46e5;
            margin-bottom: 30px;
        }
        .course-name {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 20px;
        }
        .certificate-footer {
            margin-top: 50px;
            display: flex;
            justify-content: space-between;
            padding: 0 100px;
        }
        .signature-line {
            width: 200px;
            border-top: 1px solid #333;
            margin-top: 10px;
            text-align: center;
            font-size: 16px;
        }
        .certificate-number {
            position: absolute;
            bottom: 20px;
            right: 20px;
            font-size: 12px;
            color: #666;
        }
        .issue-date {
            position: absolute;
            bottom: 20px;
            left: 20px;
            font-size: 12px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="certificate">
        <div class="certificate-header">Certificate of Completion</div>
        <div class="certificate-title">This is to certify that</div>
        <div class="student-name">{{ $user->name }}</div>
        <div class="certificate-body">
            has successfully completed the course:
        </div>
        <div class="course-name">{{ $course->title }}</div>

        <div class="certificate-footer">
            <div>
                <div class="signature-line">{{ $instructor->name }}</div>
                <div>Instructor</div>
            </div>
            <div>
                <div class="signature-line">Coursepedia</div>
                <div>Platform</div>
            </div>
        </div>

        <div class="certificate-number">Certificate #: {{ $certificate->certificate_number }}</div>
        <div class="issue-date">Issued on: {{ $issueDate }}</div>
    </div>
</body>
</html>
