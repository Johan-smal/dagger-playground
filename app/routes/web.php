<?php

use App\Jobs\ExampleJob;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    // Dispatch the ExampleJob to the queue
    ExampleJob::dispatch();
    Log::info('Home route accessed. ExampleJob dispatched.');

    return view('welcome');
});
