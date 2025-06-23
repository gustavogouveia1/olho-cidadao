<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            $table->string('unique_protocol')->unique();
            $table->text('description');
            $table->string('problem_type')->nullable();
            $table->string('location')->nullable();
            $table->string('status')->default('Pending Review');
            $table->timestamp('occurrence_date')->nullable();
            // $table->string('anexo_url')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};
