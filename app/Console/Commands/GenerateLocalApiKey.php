<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Str;

class GenerateLocalApiKey extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'generate:local-api-key';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = "This action is for generate local API key, so you can use fetch data. If you're not generate this one, you the fetching data wouldn't work";

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $newKey = Str::random(32);

        file_put_contents(base_path('.env'), str_replace(
            'VITE_LOCAL_API_KEY=',
            'VITE_LOCAL_API_KEY='.$newKey,
            file_get_contents(base_path('.env'))
        ));

        $this->info('Local API key generated successfully!');
        $this->info('New Local API Key: ' . $newKey);
    }
}
