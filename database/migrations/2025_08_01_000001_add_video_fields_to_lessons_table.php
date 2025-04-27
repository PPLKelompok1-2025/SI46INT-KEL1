<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('lessons', function (Blueprint $table) {
            $table->string('video_path')->nullable()->after('video_url');
            $table->string('video_disk')->nullable()->after('video_path');
            $table->string('encryption_key')->nullable()->after('video_disk');
        });
    }

    public function down()
    {
        Schema::table('lessons', function (Blueprint $table) {
            $table->dropColumn(['video_path', 'video_disk', 'encryption_key']);
        });
    }
};