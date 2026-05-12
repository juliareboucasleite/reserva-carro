<?php

function isPortOpen(string $host, int $port): bool
{
    $connection = @stream_socket_client(
        sprintf('tcp://%s:%d', $host, $port),
        $errno,
        $errstr,
        0.2
    );

    if ($connection === false) {
        return false;
    }

    fclose($connection);

    return true;
}

function findWindowsPidByPort(int $port): ?int
{
    if (PHP_OS_FAMILY !== 'Windows') {
        return null;
    }

    $command = sprintf(
        'powershell.exe -NoLogo -NoProfile -Command "(Get-NetTCPConnection -LocalPort %d -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty OwningProcess)"',
        $port
    );

    exec($command, $output, $exitCode);

    if ($exitCode !== 0) {
        return null;
    }

    $pid = trim(implode('', $output));

    return ctype_digit($pid) ? (int) $pid : null;
}

function portMessage(int $port): string
{
    $pid = findWindowsPidByPort($port);

    if ($pid === null) {
        return sprintf('[dev] Port %d is already in use.', $port);
    }

    return sprintf('[dev] Port %d is already in use by PID %d.', $port, $pid);
}

$serverRunning = isPortOpen('127.0.0.1', 8000);
$viteRunning = isPortOpen('127.0.0.1', 5173);

if ($serverRunning && $viteRunning) {
    fwrite(STDOUT, "[dev] Laravel and Vite already appear to be running.\n");
    fwrite(STDOUT, "[dev] Laravel: http://127.0.0.1:8000\n");
    fwrite(STDOUT, "[dev] Vite:    http://127.0.0.1:5173\n");
    exit(0);
}

if ($serverRunning) {
    fwrite(STDERR, portMessage(8000) . PHP_EOL);
    fwrite(STDERR, "[dev] Stop the existing Laravel server or use Apache/Laragon without `composer dev`.\n");
    exit(1);
}

if ($viteRunning) {
    fwrite(STDERR, portMessage(5173) . PHP_EOL);
    fwrite(STDERR, "[dev] Stop the existing Vite process before running `composer dev` again.\n");
    exit(1);
}

$commands = [
    'php artisan serve',
    'php artisan queue:listen --tries=1 --timeout=0',
];

$names = [
    'server',
    'queue',
];

$colors = [
    '#93c5fd',
    '#c4b5fd',
];

if (function_exists('pcntl_fork')) {
    $commands[] = 'php artisan pail --timeout=0';
    $names[] = 'logs';
    $colors[] = '#fb7185';
} else {
    fwrite(STDOUT, "[dev] Skipping Laravel Pail because the pcntl extension is not available.\n");
}

$commands[] = 'npm run dev';
$names[] = 'vite';
$colors[] = '#fdba74';

$parts = [
    'npx',
    'concurrently',
    '-c',
    escapeshellarg(implode(',', $colors)),
];

foreach ($commands as $command) {
    $parts[] = escapeshellarg($command);
}

$parts[] = '--names=' . escapeshellarg(implode(',', $names));
$parts[] = '--kill-others';

$command = implode(' ', $parts);

passthru($command, $exitCode);

exit($exitCode);
