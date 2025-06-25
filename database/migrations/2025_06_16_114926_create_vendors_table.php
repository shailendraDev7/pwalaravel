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
        Schema::create('vendors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_type_id')->constrained('vendor_types')->restrictOnDelete();
            $table->string('name');
            $table->string('incharge_name')->nullable();
            $table->string('email')->unique();
            $table->string('password');
            $table->string('shop_name');
            $table->string('address');
            $table->string('owner_contact', 20)->unique();
            $table->string('incharge_contact', 20)->unique()->nullable();
            $table->string('citizedship_img', 100);
            $table->string('pp_img', 100);
            $table->string('registration_img', 100);
            $table->string('pan_img', 100);
            $table->string('cancel_cheque_img', 100);
            $table->string('bank_name', 100);
            $table->string('bank_branch', 100);
            $table->string('bank_ac_num', 100);
            $table->enum('ac_type', ['current', 'saving']);
            $table->decimal('commission_rate', 3, 2)->default(0.00);
            $table->decimal('rating', 3, 2)->default(0.00);
            $table->integer('branch_count')->default(1);
            $table->enum('status',['active','inactive']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vendors');
    }
};
