<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Метод не поддерживается'], JSON_UNESCAPED_UNICODE);
    exit;
}

if (!empty($_POST['website'])) {
    echo json_encode(['ok' => true]);
    exit;
}

$name = trim((string)($_POST['name'] ?? ''));
$phone = trim((string)($_POST['phone'] ?? ''));
$email = trim((string)($_POST['email'] ?? ''));
$comment = trim((string)($_POST['comment'] ?? ''));
$consent = (string)($_POST['consent'] ?? '');

$digits = preg_replace('/\D+/', '', $phone);

if (mb_strlen($name) < 2 || mb_strlen($name) > 80) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'error' => 'Проверьте имя'], JSON_UNESCAPED_UNICODE);
    exit;
}
if (strlen($digits) < 10 || strlen($digits) > 15) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'error' => 'Проверьте телефон'], JSON_UNESCAPED_UNICODE);
    exit;
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 120) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'error' => 'Проверьте почту'], JSON_UNESCAPED_UNICODE);
    exit;
}
if (mb_strlen($comment) > 2000) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'error' => 'Комментарий слишком длинный'], JSON_UNESCAPED_UNICODE);
    exit;
}
if ($consent !== '1') {
    http_response_code(422);
    echo json_encode(['ok' => false, 'error' => 'Нужно согласие на обработку персональных данных'], JSON_UNESCAPED_UNICODE);
    exit;
}

$clean = static function (string $value): string {
    return trim(str_replace(["\r", "\n"], ' ', $value));
};

$to = 'hotel_izumrud@mail.ru';
$subject = 'Заявка с сайта гостиницы «Изумруд»';
$body = "Имя: " . $clean($name) . "\n"
    . "Телефон: " . $clean($phone) . "\n"
    . "Почта: " . $clean($email) . "\n"
    . "Комментарий: " . ($comment === '' ? '—' : $comment) . "\n"
    . "Согласие на обработку ПДн: да\n"
    . "Страница: " . $clean((string)($_SERVER['HTTP_REFERER'] ?? '')) . "\n";

$headers = [
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'From: Гостиница Изумруд <hotel_izumrud@mail.ru>',
    'Reply-To: ' . $clean($email),
];

$sent = mail($to, '=?UTF-8?B?' . base64_encode($subject) . '?=', $body, implode("\r\n", $headers));

if (!$sent) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Почта на хостинге не отправила письмо'], JSON_UNESCAPED_UNICODE);
    exit;
}

echo json_encode(['ok' => true]);
