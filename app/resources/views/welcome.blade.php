<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Laravel</title>
    <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css"
    >
    <meta name="color-scheme" content="light dark">
</head>
<body>
    <main class="container">
      <h1>Hello world!</h1>
      <p>
        This is a simple Laravel application running on Dagger.
        The application is served by an Caddy server and the PHP application is running in a Docker container.
        The application is configured to use AWS services for service discovery and API Gateway.
    </main>
</body>
</html>