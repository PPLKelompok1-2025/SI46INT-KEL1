<?php

namespace Tests\Browser\Student;

use Laravel\Dusk\Browser;
use App\Models\User;
use App\Models\Transaction;
use Tests\DuskTestCase;

class TransactionHistoryTest extends DuskTestCase
{
    /**
     * PBI 9 – TC_PBI09_POS_001: view transaction history with entries
     */
    public function test_student_can_view_transaction_history()
    {
        $student = User::factory()->create(['role' => 'student']);
        Transaction::factory()->count(3)->create([
            'user_id' => $student->id,
            'status'  => 'completed',
        ]);

        $this->browse(function (Browser $browser) use ($student) {
            $browser->loginAs($student)
                    ->visit('/student/transactions')
                    ->assertSee('Transaction History')
                    ->assertSee('Order ID')
                    ->assertSee('$'); // currency formatting
        });

        Transaction::where('user_id', $student->id)->delete();
        $student->delete();
    }

    /**
     * PBI 9 – TC_PBI09_NEG_001: view transaction history empty
     */
    public function test_student_with_no_transactions_sees_empty_message()
    {
        $student = User::factory()->create(['role' => 'student']);

        $this->browse(function (Browser $browser) use ($student) {
            $browser->loginAs($student)
                    ->visit('/student/transactions')
                    ->assertSee('No transactions yet')
                    ->press('Browse Courses')
                    ->pause(1000)
                    ->assertPathIs('/courses');
        });

        $student->delete();
    }
}