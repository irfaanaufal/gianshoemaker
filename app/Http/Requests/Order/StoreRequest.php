<?php

namespace App\Http\Requests\Order;

use Illuminate\Foundation\Http\FormRequest;

class StoreRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'trx' => ['required'],
            'user_id' => ['required'],
            'user_address_id' => ['required'],
            'status' => ['required', 'in:pending,processing,delivered,complete'],
            'payment_status' => ['required', 'in:paid,unpaid'],
        ];
    }
}
