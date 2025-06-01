<?php

namespace App\Http\Services;

use Exception;

class MidtransService
{
    public function create_order($data)
    {
        // Set your Merchant Server Key
        \Midtrans\Config::$serverKey = config('midtrans.server_key');
        // Set to Development/Sandbox Environment (default). Set to true for Production Environment (accept real transaction).
        \Midtrans\Config::$isProduction = config('midtrans.is_production');
        // Set sanitization on (default)
        \Midtrans\Config::$isSanitized = true;
        // Set 3DS transaction for credit card to true
        \Midtrans\Config::$is3ds = true;

        $transaction_details = [
            'order_id' => $data['order_id'],
            'gross_amount' => $data['gross_amount'],
        ];

        $customer_details = [
            'first_name' => $data['first_name'],
            'address' => $data['address'],
            'email' => $data['email'],
        ];

        $item_details = [
            [
                'id' => $data['treatment_id'],
                'price' => $data['gross_amount'],
                'quantity' => 1,
                'name' => "Treatment for {$data['treatment']}",
            ],
        ];

        $charge = [
            'payment_type' => 'gopay', // Contoh: Gopay
            'transaction_details' => $transaction_details,
            'customer_details' => $customer_details,
            'item_details' => $item_details,
        ];

        try {
            $snapToken = \Midtrans\Snap::getSnapToken($charge);
            return $snapToken;
        } catch (Exception $ex) {
            return response()->json(['error' => 'Failed to create Midtrans order', 'details' => $ex->getMessage()]);
        }
    }
}
